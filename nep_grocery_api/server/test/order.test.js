import request from 'supertest';
import mongoose from 'mongoose';
import { app, server } from '../server.js'; 
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js'; 

let userToken;
let adminToken;
let normalUserId;
let adminUserId;
let testProductId;
let testCategoryId;

const testUserEmail = 'orderuser@example.com';
const testUserPassword = 'OrderUser123!';
const testAdminEmail = 'orderadmin@example.com';
const testAdminPassword = 'OrderAdmin123!';

beforeAll(async () => {
    
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail] } });
    await Category.deleteMany({ name: 'TestCategoryForOrders' });

    // Register and login normal user
    await request(app)
        .post('/api/auth/register')
        .send({ fullName: 'Order User', email: testUserEmail, password: testUserPassword });

    const userLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUserEmail, password: testUserPassword });
    userToken = userLoginRes.body.token;
    normalUserId = userLoginRes.body.data._id;

    // Register and login admin user
    await request(app)
        .post('/api/auth/register')
        .send({ fullName: 'Order Admin', email: testAdminEmail, password: testAdminPassword });

    const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testAdminEmail, password: testAdminPassword });
    adminToken = adminLoginRes.body.token;
    adminUserId = adminLoginRes.body.data._id;

    // Set admin role for the registered admin user
    await User.findByIdAndUpdate(adminUserId, { role: 'admin' });

    // Create a test category for products
    const categoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'TestCategoryForOrders' });
    testCategoryId = categoryRes.body._id;

    // Create a test product
    const productRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            name: 'Test Product For Orders',
            category: testCategoryId,
            price: 100,
            stock: 50,
            imageUrl: 'http://example.com/product.jpg'
        });
    testProductId = productRes.body._id;

    console.log('--- beforeAll (Order Tests): Setup complete ---');
});

afterAll(async () => {
    // Clean up test data
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({ email: { $in: [testUserEmail, testAdminEmail] } });
    await Category.deleteMany({ name: 'TestCategoryForOrders' });

    // Close Mongoose connection
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('--- afterAll (Order Tests): MongoDB connection closed cleanly ---');
    }

    // Explicitly close the HTTP server
    if (server && server.listening) {
        await new Promise(resolve => server.close(resolve));
        console.log('--- afterAll (Order Tests): Express server closed cleanly ---');
    }
    console.log('--- afterAll (Order Tests): Cleanup complete ---');
});

describe('Order API Tests', () => {
    let orderIdForUpdate; // To store an order ID for update tests
    let orderIdForAdminGet;
    let orderIdForCancel;
    let orderIdForDiscountRefund;
    let orderIdForAlreadyCancelled;

    // Create Order (User)
    it('should allow a normal user to create a new COD order', async () => {
        const initialUserPoints = (await User.findById(normalUserId)).groceryPoints;

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [{ productId: testProductId, quantity: 2 }],
                address: '123 Test Street',
                phone: '9876543210',
                applyDiscount: false, // No discount initially
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Order placed successfully!');
        expect(res.body.order.customer.toString()).toBe(normalUserId.toString());
        expect(res.body.order.items.length).toBe(1);
        expect(res.body.order.amount).toBe(2 * 100 + 50); // 2 products * 100 + 50 delivery fee
        expect(res.body.order.status).toBe('Pending');
        expect(res.body.order.paymentMethod).toBe('COD');
        expect(res.body.order.discountApplied).toBe(false);
        expect(res.body.order.pointsAwarded).toBe(0);

        const updatedUser = res.body.updatedUser;
        expect(updatedUser.groceryPoints).toBe(initialUserPoints); // Points should not change for COD creation without discount

        orderIdForUpdate = res.body.order._id; // Store for update tests
        orderIdForAdminGet = res.body.order._id;
    });

    it('should return 400 if cart is empty when creating an order', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [],
                address: '123 Test Street',
                phone: '9876543210'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Your cart is empty.');
    });

    it('should return 400 if product stock is insufficient', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [{ productId: testProductId, quantity: 1000 }], // Requesting more than stock
                address: '123 Test Street',
                phone: '9876543210'
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Not enough stock/i);
    });

    it('should apply discount and deduct points if applyDiscount is true and user has enough points', async () => {
        // Ensure user has enough points
        await User.findByIdAndUpdate(normalUserId, { groceryPoints: 150 });
        const initialUserPoints = (await User.findById(normalUserId)).groceryPoints;

        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [{ productId: testProductId, quantity: 4 }], // Total 400, 25% is 100
                address: 'Discount Street',
                phone: '9876543211',
                applyDiscount: true,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/25% discount was applied/);
        expect(res.body.order.discountApplied).toBe(true);
        // Calculate expected amount: (4 * 100) * 0.75 + 50 = 300 + 50 = 350
        expect(res.body.order.amount).toBe(350);

        const userAfterOrder = await User.findById(normalUserId);
        expect(userAfterOrder.groceryPoints).toBe(initialUserPoints - 150);
        orderIdForDiscountRefund = res.body.order._id; // Store for refund test
    });


    // Get My Orders (User)
    it('should get logged in user\'s orders', async () => {
        // Create another order for the user
        await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [{ productId: testProductId, quantity: 1 }],
                address: 'Another Order Address',
                phone: '9876543219'
            });

        const res = await request(app)
            .get('/api/orders/myorders')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.orders)).toBe(true);
        expect(res.body.orders.length).toBeGreaterThanOrEqual(2); 
        res.body.orders.forEach(order => {
            expect(order.customer.toString()).toBe(normalUserId.toString());
            expect(order.status).not.toBe('Pending Payment'); 
        });
    });

    // Get Payment History (User)
    it('should get logged in user\'s payment history', async () => {
        
        await Order.findByIdAndUpdate(orderIdForUpdate, { status: 'Delivered', paymentMethod: 'COD' });

        const res = await request(app)
            .get('/api/orders/payment-history')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.history)).toBe(true);
        expect(res.body.history.length).toBeGreaterThanOrEqual(2); 
        res.body.history.forEach(order => {
            expect(order.customer.toString()).toBe(normalUserId.toString());
        });
    });

    
    it('should get all orders for admin', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.orders)).toBe(true);
        expect(res.body.orders.length).toBeGreaterThanOrEqual(2); 
        res.body.orders.forEach(order => {
            expect(order.status).not.toBe('Pending Payment');
            expect(order).toHaveProperty('customer'); 
        });
    });

    it('should not allow normal user to get all orders (403 Forbidden)', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Access denied: Admin privileges are required.');
    });

    
    it('should get a single order by ID for admin', async () => {
        const res = await request(app)
            .get(`/api/orders/${orderIdForAdminGet}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.order._id.toString()).toBe(orderIdForAdminGet.toString());
        expect(res.body.order).toHaveProperty('customer'); 
    });

    it('should return 404 if order not found by ID for admin', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/orders/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Order not found');
    });

    
    it('should allow admin to update order status to Shipped', async () => {
        
        const newOrderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ items: [{ productId: testProductId, quantity: 1 }], address: 'Update Status Address', phone: '9876543218' });
        orderIdForCancel = newOrderRes.body.order._id; 

        const res = await request(app)
            .put(`/api/orders/${orderIdForUpdate}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Shipped' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.order.status).toBe('Shipped');
        const updatedOrder = await Order.findById(orderIdForUpdate);
        expect(updatedOrder.status).toBe('Shipped');
    });

    it('should award grocery points when order status changes from Shipped to Delivered (COD)', async () => {
        
        await User.findByIdAndUpdate(normalUserId, { groceryPoints: 50 });
        const userBeforeDelivery = await User.findById(normalUserId);
        const initialPoints = userBeforeDelivery.groceryPoints;

        
        const qualifyingProduct = await Product.create({
            name: 'High Value Product',
            category: testCategoryId,
            price: 1000, 
            stock: 10,
            imageUrl: 'http://example.com/high-value-product.jpg' 
        });

        const highValueOrderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ items: [{ productId: qualifyingProduct._id, quantity: 2 }], address: 'High Value Address', phone: '9876543200' }); 

        const highValueOrderId = highValueOrderRes.body.order._id;

        
        const res = await request(app)
            .put(`/api/orders/${highValueOrderId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Delivered' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.order.status).toBe('Delivered');

        const userAfterDelivery = await User.findById(normalUserId);
        expect(userAfterDelivery.groceryPoints).toBeGreaterThan(initialPoints);
        expect(res.body.order.pointsAwarded).toBeGreaterThan(0); 
    });


    it('should refund loyalty points and restock products when order status changes to Cancelled', async () => {
       
        const initialPoints = (await User.findById(normalUserId)).groceryPoints; 
        await User.findByIdAndUpdate(normalUserId, { groceryPoints: initialPoints + 150 }); 

        const productStockBeforeOrder = (await Product.findById(testProductId)).stock;

        const discountedOrderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                items: [{ productId: testProductId, quantity: 3 }],
                address: 'Cancellation Address',
                phone: '9876543217',
                applyDiscount: true,
            });
        orderIdForAlreadyCancelled = discountedOrderRes.body.order._id;

        
        const userAfterDiscount = await User.findById(normalUserId);
        expect(userAfterDiscount.groceryPoints).toBe(initialPoints); 

        
        const productStockAfterOrder = (await Product.findById(testProductId)).stock;
        expect(productStockAfterOrder).toBe(productStockBeforeOrder - 3);

        
        const res = await request(app)
            .put(`/api/orders/${orderIdForAlreadyCancelled}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Cancelled' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.order.status).toBe('Cancelled');

        
        const userAfterCancellation = await User.findById(normalUserId);
        expect(userAfterCancellation.groceryPoints).toBe(initialPoints + 150); 

        
        const productStockAfterCancellation = (await Product.findById(testProductId)).stock;
        expect(productStockAfterCancellation).toBe(productStockBeforeOrder);
    });

    it('should not allow normal user to update order status (403 Forbidden)', async () => {
        const res = await request(app)
            .put(`/api/orders/${orderIdForUpdate}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ status: 'Delivered' });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Access denied: Admin privileges are required.');
    });

    it('should return 404 if order to update is not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/orders/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'Delivered' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Order not found');
    });
});