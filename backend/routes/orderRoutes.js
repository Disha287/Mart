const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');

// ============================================================
// ORDERS — Base CRUD
// ============================================================

// @route   GET /api/orders
// @desc    Get all orders (optional ?buyerId=xxx&sellerId=xxx&status=Confirmed)
router.get('/', getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get a single order by ID
router.get('/:id', getOrderById);

// @route   POST /api/orders
// @desc    Place a new order
// @body    { productId, quantity?, buyerId, buyerName, buyerPhone?, paymentMethod? }
router.post('/', createOrder);

// @route   PUT /api/orders/:id
// @desc    Update order status or rating
// @body    { status?, rated?, ratingGiven? }
router.put('/:id', updateOrder);

// @route   DELETE /api/orders/:id
// @desc    Cancel and delete an order (restores product stock)
router.delete('/:id', deleteOrder);

module.exports = router;
