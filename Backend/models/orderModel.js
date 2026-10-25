// ============================================================
// ORDER MODEL — MVC Model Layer
// Manages Order schema and operations
// ============================================================

const { orders } = require('../config/seedData');

class OrderModel {
    constructor() {
        this.collection = orders;
    }

    // Find orders with optional filters
    async find(filters = {}) {
        let results = [...this.collection];

        if (filters.buyerId) {
            results = results.filter(o => o.buyerId === filters.buyerId);
        }
        if (filters.sellerId) {
            results = results.filter(o => o.sellerId === filters.sellerId);
        }
        if (filters.status) {
            results = results.filter(o => o.status.toLowerCase() === filters.status.toLowerCase());
        }

        return results;
    }

    // Find order by ID
    async findById(id) {
        return this.collection.find(o => o.id === id) || null;
    }

    // Create a new order
    async create(orderData) {
        const {
            productId, productName, price, quantity,
            sellerId, sellerName, sellerPhone,
            buyerId, buyerName, buyerPhone, paymentMethod
        } = orderData;

        const qty = Number(quantity) || 1;

        const newOrder = {
            id: 'ord_' + Date.now(),
            productId,
            productName,
            price,
            quantity: qty,
            totalAmount: price * qty,
            sellerId,
            sellerName,
            sellerPhone: sellerPhone || null,
            buyerId,
            buyerName,
            buyerPhone: buyerPhone || null,
            orderDate: new Date().toISOString().split('T')[0],
            status: 'Confirmed',
            paymentMethod: paymentMethod || 'Campus Cash on Handover',
            rated: false
        };

        this.collection.unshift(newOrder);
        return newOrder;
    }

    // Update order by ID
    async findByIdAndUpdate(id, updates = {}) {
        const index = this.collection.findIndex(o => o.id === id);
        if (index === -1) return null;

        const allowedFields = ['status', 'rated', 'ratingGiven'];
        const cleanUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) cleanUpdates[field] = updates[field];
        });

        this.collection[index] = { ...this.collection[index], ...cleanUpdates };
        return this.collection[index];
    }

    // Delete order by ID
    async findByIdAndDelete(id) {
        const index = this.collection.findIndex(o => o.id === id);
        if (index === -1) return null;

        const deleted = this.collection.splice(index, 1)[0];
        return deleted;
    }
}

module.exports = new OrderModel();
