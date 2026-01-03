import Product from '../models/Product.js';

/**
 * Calculates order totals, validates stock, and applies discounts.
 * @param {Array} items - List of items with productId and quantity.
 * @param {Object} user - The user object to check for points/discount eligibility.
 * @param {boolean} applyDiscount - Whether the user requested to apply points for a discount.
 * @returns {Promise<Object>} Object containing calculated totals, order items, and updates.
 */
export const calculateOrderDetails = async (items, user, applyDiscount) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        const error = new Error("Order must contain at least one item.");
        error.statusCode = 400;
        throw error;
    }

    // Normalize items to have productId and quantity
    const normalizedItems = items.map(item => ({
        productId: item.productId || item._id, // Handle both formats (order vs payment controller)
        quantity: parseInt(item.quantity, 10)
    }));

    // Validate quantities
    const invalidQuantityItem = normalizedItems.find(item => isNaN(item.quantity) || item.quantity <= 0);
    if (invalidQuantityItem) {
        const error = new Error("Invalid item quantity. Quantity must be a positive integer.");
        error.statusCode = 400;
        throw error;
    }

    // Fetch products
    const productIds = normalizedItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let itemsTotal = 0;
    const orderItems = [];
    const productUpdates = [];

    for (const item of normalizedItems) {
        const product = productMap.get(item.productId);

        if (!product) {
            const error = new Error(`Product with ID ${item.productId} not found.`);
            error.statusCode = 404;
            throw error;
        }

        if (product.stock < item.quantity) {
            const error = new Error(`Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            error.statusCode = 400;
            throw error;
        }

        const lineTotal = product.price * item.quantity;
        itemsTotal += lineTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            imageUrl: product.imageUrl
        });

        productUpdates.push({
            updateOne: {
                filter: { _id: product._id },
                update: { $inc: { stock: -item.quantity } }
            }
        });
    }

    const deliveryFee = 50;
    let finalAmount = itemsTotal + deliveryFee;
    let discountAppliedFlag = false;
    let pointsToDeduct = 0;

    if (applyDiscount && user.groceryPoints >= 150) {
        // Hardcoded 25% discount ensures backend integrity and prevents client-side tampering
        const discountAmount = itemsTotal * 0.25;
        finalAmount -= discountAmount;
        discountAppliedFlag = true;
        pointsToDeduct = 150;
    }

    return {
        orderItems,
        itemsTotal,
        deliveryFee,
        finalAmount,
        discountApplied: discountAppliedFlag,
        pointsToDeduct,
        productUpdates
    };
};
