// ============================================================
// ORDERS CONTROLLER — MVC Controller Layer
// Handles HTTP Requests and delegates to OrderModel & ProductModel
// ============================================================

const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');

// GET /api/orders — Get all orders
// Query params: ?buyerId=usr_buyer_1, ?sellerId=usr_seller_1, ?status=Confirmed
const getAllOrders = async (req, res) => {
    try {
        const { buyerId, sellerId, status } = req.query;
        const orders = await OrderModel.find({ buyerId, sellerId, status });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/orders/:id — Get single order
const getOrderById = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/orders — Create new order
const createOrder = async (req, res) => {
    try {
        const { productId, quantity, buyerId, buyerName, buyerPhone, paymentMethod } = req.body;

        if (!productId || !buyerId || !buyerName) {
            return res.status(400).json({ success: false, message: 'Required fields: productId, buyerId, buyerName' });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${productId}' not found` });
        }

        const qty = Number(quantity) || 1;
        if (product.stock !== undefined && product.stock < qty) {
            return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${product.stock}, Requested: ${qty}` });
        }

        const newOrder = await OrderModel.create({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: qty,
            sellerId: product.sellerId,
            sellerName: product.sellerName,
            sellerPhone: product.sellerPhone,
            buyerId,
            buyerName,
            buyerPhone,
            paymentMethod
        });

        // Deduct stock via product model
        await ProductModel.adjustStock(product.id, -qty);

        res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/orders/:id — Update order status or payment
const updateOrder = async (req, res) => {
    try {
        const allowedStatuses = ['Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'];
        const { status } = req.body;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
        }

        const updated = await OrderModel.findByIdAndUpdate(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
        }

        res.status(200).json({ success: true, message: 'Order updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/orders/:id — Cancel and delete order
const deleteOrder = async (req, res) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: `Order with id '${req.params.id}' not found` });
        }

        if (order.status === 'Completed') {
            return res.status(400).json({ success: false, message: 'Cannot delete a completed order' });
        }

        // Restore stock via ProductModel
        await ProductModel.adjustStock(order.productId, order.quantity);

        const deleted = await OrderModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: `Order '${deleted.id}' cancelled and deleted`, data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder };
