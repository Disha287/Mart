// ============================================================
// ORDERS CONTROLLER — CRUD Operations
// ============================================================

const { orders, products } = require('../data/seedData');

// GET /api/orders — Get all orders
// Query params: ?buyerId=usr_buyer_1, ?sellerId=usr_seller_1, ?status=Confirmed
const getAllOrders = (req, res) => {
    let result = [...orders];

    if (req.query.buyerId) {
        result = result.filter(o => o.buyerId === req.query.buyerId);
    }
    if (req.query.sellerId) {
        result = result.filter(o => o.sellerId === req.query.sellerId);
    }
    if (req.query.status) {
        result = result.filter(o => o.status.toLowerCase() === req.query.status.toLowerCase());
    }

    res.status(200).json({
        success: true,
        count: result.length,
        data: result
    });
};

// GET /api/orders/:id — Get single order
const getOrderById = (req, res) => {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
        return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
    }
    res.status(200).json({ success: true, data: order });
};

// POST /api/orders — Create new order
const createOrder = (req, res) => {
    const { productId, quantity, buyerId, buyerName, buyerPhone, paymentMethod } = req.body;

    if (!productId || !buyerId || !buyerName) {
        return res.status(400).json({ success: false, message: 'Required fields: productId, buyerId, buyerName' });
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${productId}' not found` });
    }

    const qty = Number(quantity) || 1;
    if (product.stock !== undefined && product.stock < qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.stock}, Requested: ${qty}` });
    }

    const newOrder = {
        id: 'ord_' + Date.now(),
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        totalAmount: product.price * qty,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        sellerPhone: product.sellerPhone,
        buyerId,
        buyerName,
        buyerPhone: buyerPhone || null,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        paymentMethod: paymentMethod || 'Campus Cash on Handover',
        rated: false
    };

    // Reduce stock
    if (product.stock !== undefined) {
        product.stock -= qty;
    }

    orders.unshift(newOrder);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
};

// PUT /api/orders/:id — Update order status or payment
const updateOrder = (req, res) => {
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
    }

    const allowedStatuses = ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'];
    const { status, rated, ratingGiven } = req.body;

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
    }

    if (status) orders[index].status = status;
    if (rated !== undefined) orders[index].rated = rated;
    if (ratingGiven !== undefined) orders[index].ratingGiven = ratingGiven;

    res.status(200).json({ success: true, message: 'Order updated successfully', data: orders[index] });
};

// DELETE /api/orders/:id — Cancel and delete order
const deleteOrder = (req, res) => {
    const index = orders.findIndex(o => o.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
    }

    const order = orders[index];
    if (order.status === 'Completed') {
        return res.status(400).json({ success: false, message: 'Cannot delete a completed order' });
    }

    // Restore stock on cancellation
    const product = products.find(p => p.id === order.productId);
    if (product && product.stock !== undefined) {
        product.stock += order.quantity;
    }

    const deleted = orders.splice(index, 1)[0];
    res.status(200).json({ success: true, message: `Order '${deleted.id}' cancelled and deleted`, data: deleted });
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };
