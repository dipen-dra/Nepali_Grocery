import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

const ESEWA_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_SCD = 'EPAYTEST';
const ESEWA_SECRET = '8gBm/:&EnhH.1/q';

import { getLocalIpAddress } from '../utils/network.js';

// Dynamically determine frontend URL based on environment or local IP
const LOCAL_IP = getLocalIpAddress();
// Assuming Frontend runs on port 5173 by default
const BASE_FRONTEND_URL = process.env.FRONTEND_URL || `http://${LOCAL_IP}:5173`;

const FRONTEND_SUCCESS_URL = `${BASE_FRONTEND_URL}/payment-success`;
const FRONTEND_FAILURE_URL = `${BASE_FRONTEND_URL}/checkout`;

import { calculateOrderDetails } from '../utils/orderHelper.js';

export const initiateEsewaPayment = async (req, res) => {
    try {
        const { cartItems, phone, address, applyDiscount } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({ message: 'Invalid request. User not found.' });
        }

        const {
            orderItems,
            itemsTotal,
            finalAmount,
            discountApplied
        } = await calculateOrderDetails(cartItems, user, applyDiscount);

        // eSewa specific fields (fixed at 0 as per previous logic for now)
        const deliveryFee = 50;
        const serviceCharge = 0;
        const taxAmount = 0;
        // Re-cal culating finalAmount for eSewa breakdown consistency if needed, 
        // but helper returns finalAmount = itemsTotal + deliveryFee - discount.
        // The eSewa signature needs explicit breakdown.
        // helper finalAmount includes deliveryFee and discount.
        // let's verify if helper's finalAmount matches itemsTotal + deliveryFee + service + tax - discount
        // helper: itemsTotal + 50 - discount. 
        // eSewa logic: itemsTotal + 50 + 0 + 0 - discount. matches.

        const transaction_uuid = `hg-${uuidv4()}`;

        const newOrder = new Order({
            customer: user._id,
            items: orderItems,
            amount: finalAmount,
            address: address,
            phone: phone,
            status: 'Pending Payment',
            paymentMethod: 'eSewa',
            transactionId: transaction_uuid,
            discountApplied: discountApplied,
        });
        await newOrder.save();

        const signatureBaseString = `total_amount=${finalAmount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_SCD}`;

        const hmac = crypto.createHmac('sha256', ESEWA_SECRET);
        hmac.update(signatureBaseString);
        const signature = hmac.digest('base64');

        const esewaData = {
            amount: itemsTotal.toString(),
            tax_amount: taxAmount.toString(),
            product_service_charge: serviceCharge.toString(),
            product_delivery_charge: deliveryFee.toString(),
            total_amount: finalAmount.toString(),
            transaction_uuid: transaction_uuid,
            product_code: ESEWA_SCD,
            signature: signature,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            success_url: `${process.env.BACKEND_URL || 'http://192.168.1.78:8081'}/api/payment/esewa/verify`,
            failure_url: `${FRONTEND_FAILURE_URL}?payment=failure`,
        };

        res.json({ ...esewaData, esewaUrl: ESEWA_URL });

    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error('Error in initiateEsewaPayment:', error);
        res.status(500).json({ message: 'Server Error while initiating payment' });
    }
};

export const verifyEsewaPayment = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data) {
            return res.redirect(`${FRONTEND_FAILURE_URL}?payment=failure&message=${encodeURIComponent('No data received from eSewa.')}`);
        }

        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

        if (decodedData.status !== 'COMPLETE') {
            await Order.findOneAndDelete({ transactionId: decodedData.transaction_uuid });
            const message = encodeURIComponent(`Payment was not completed: ${decodedData.status}`);
            return res.redirect(`${FRONTEND_FAILURE_URL}?payment=failure&message=${message}`);
        }

        const verificationUrl = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=${ESEWA_SCD}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`;
        const response = await fetch(verificationUrl);
        const verificationResponse = await response.json();

        if (verificationResponse.status === 'COMPLETE') {
            const order = await Order.findOne({ transactionId: verificationResponse.transaction_uuid }).populate('items');

            if (!order) {
                return res.redirect(`${FRONTEND_FAILURE_URL}?payment=failure&message=${encodeURIComponent('Order not found for this transaction.')}`);
            }

            if (order.status === 'Pending Payment') {
                const user = await User.findById(order.customer);
                let pointsToAward = 0;
                let messageParts = ['Payment successful! Your order has been placed.'];

                if (order.discountApplied) {
                    user.groceryPoints -= 150;
                    messageParts.push('A 25% discount was applied.');
                }

                const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                console.log(`[eSewa] Order ${order._id} paid. Items subtotal: ₹${itemsTotal}.`);

                if (itemsTotal >= 2000) {
                    pointsToAward = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
                    user.groceryPoints += pointsToAward;
                    order.pointsAwarded = pointsToAward;
                    messageParts.push(`You earned ${pointsToAward} Grocery Points.`);
                    console.log(`[eSewa] Awarded ${pointsToAward} points to ${user.email}. New total: ${user.groceryPoints}`);
                }

                await user.save();
                order.status = 'Pending';
                await order.save();

                const productUpdates = order.items.map(item => ({
                    updateOne: {
                        filter: { _id: item.product },
                        update: { $inc: { stock: -item.quantity } }
                    }
                }));
                await Product.bulkWrite(productUpdates);

                return res.redirect(`${FRONTEND_SUCCESS_URL}?message=${encodeURIComponent(messageParts.join(' '))}`);
            }

            return res.redirect(`${process.env.FRONTEND_URL || 'http://192.168.1.78:5173'}/dashboard/orders`);
        } else {
            await Order.findOneAndDelete({ transactionId: decodedData.transaction_uuid });
            return res.redirect(`${FRONTEND_FAILURE_URL}?payment=failure&message=${encodeURIComponent('Transaction verification failed.')}`);
        }

    } catch (error) {
        console.error('Error in verifyEsewaPayment:', error);
        return res.redirect(`${FRONTEND_FAILURE_URL}?payment=failure&message=${encodeURIComponent('An internal server error occurred during verification.')}`);
    }
};