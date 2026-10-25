// ============================================================
// PRODUCT MODEL — MVC Model Layer
// Manages Product schema, Offers, Bids, and stock updates
// ============================================================

const { products } = require('../config/seedData');

class ProductModel {
    constructor() {
        this.collection = products;
    }

    // Find products matching query filters
    async find(filters = {}) {
        let results = [...this.collection];

        if (filters.category) {
            results = results.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
        }
        if (filters.listingType) {
            results = results.filter(p => p.listingType === filters.listingType);
        }
        if (filters.sellerId) {
            results = results.filter(p => p.sellerId === filters.sellerId);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }

        return results;
    }

    // Find product by ID
    async findById(id) {
        return this.collection.find(p => p.id === id) || null;
    }

    // Increment product views
    async incrementViews(id) {
        const product = await this.findById(id);
        if (product) {
            product.views = (product.views || 0) + 1;
        }
        return product;
    }

    // Create a new product
    async create(data) {
        const {
            name, category, price, condition, listingType,
            location, description, sellerId, sellerName,
            sellerPhone, stock, image
        } = data;

        const newProduct = {
            id: 'prod_' + Date.now(),
            name,
            category,
            price: Number(price),
            originalPrice: Math.round(Number(price) * 1.3),
            condition: condition || 'Good',
            listingType: listingType || 'fixed',
            stock: Number(stock) || 1,
            currentBid: listingType === 'bidding' ? Number(price) : null,
            sellerId,
            sellerName,
            sellerPhone: sellerPhone || null,
            sellerRating: 4.8,
            trustScore: 90,
            location,
            description,
            image: image || null,
            rating: 5.0,
            bids: [],
            offers: [],
            dateAdded: new Date().toISOString().split('T')[0],
            views: 0
        };

        this.collection.push(newProduct);
        return newProduct;
    }

    // Update product by ID
    async findByIdAndUpdate(id, updates = {}) {
        const index = this.collection.findIndex(p => p.id === id);
        if (index === -1) return null;

        const allowedFields = ['name', 'category', 'price', 'condition', 'listingType', 'stock', 'location', 'description', 'image', 'rating'];
        const cleanUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) cleanUpdates[field] = updates[field];
        });

        this.collection[index] = { ...this.collection[index], ...cleanUpdates };
        return this.collection[index];
    }

    // Delete product by ID
    async findByIdAndDelete(id) {
        const index = this.collection.findIndex(p => p.id === id);
        if (index === -1) return null;

        const deleted = this.collection.splice(index, 1)[0];
        return deleted;
    }

    // Adjust stock (positive or negative)
    async adjustStock(id, delta) {
        const product = await this.findById(id);
        if (product && product.stock !== undefined) {
            product.stock += delta;
        }
        return product;
    }

    // ============================================================
    // OFFERS SUB-OPERATIONS
    // ============================================================

    async getOffers(productId) {
        const product = await this.findById(productId);
        return product ? product.offers : null;
    }

    async addOffer(productId, offerData) {
        const product = await this.findById(productId);
        if (!product) return null;

        const newOffer = {
            offerId: 'off_' + Date.now(),
            buyerId: offerData.buyerId,
            buyerName: offerData.buyerName,
            buyerPhone: offerData.buyerPhone || null,
            amount: Number(offerData.amount),
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        };

        product.offers.push(newOffer);
        return newOffer;
    }

    async updateOfferStatus(productId, offerId, status) {
        const product = await this.findById(productId);
        if (!product) return { error: 'PRODUCT_NOT_FOUND' };

        const offer = product.offers.find(o => o.offerId === offerId);
        if (!offer) return { error: 'OFFER_NOT_FOUND' };

        offer.status = status;
        return { offer };
    }

    async deleteOffer(productId, offerId) {
        const product = await this.findById(productId);
        if (!product) return { error: 'PRODUCT_NOT_FOUND' };

        const index = product.offers.findIndex(o => o.offerId === offerId);
        if (index === -1) return { error: 'OFFER_NOT_FOUND' };

        const deleted = product.offers.splice(index, 1)[0];
        return { deleted };
    }

    // ============================================================
    // BIDS SUB-OPERATIONS
    // ============================================================

    async getBids(productId) {
        const product = await this.findById(productId);
        return product ? product.bids : null;
    }

    async placeBid(productId, bidData) {
        const product = await this.findById(productId);
        if (!product) return { error: 'PRODUCT_NOT_FOUND' };

        const newBid = {
            bidderId: bidData.bidderId,
            bidderName: bidData.bidderName,
            amount: Number(bidData.amount),
            date: new Date().toISOString().split('T')[0]
        };

        product.bids.push(newBid);
        product.currentBid = Number(bidData.amount);

        return { newBid, currentBid: product.currentBid };
    }
}

module.exports = new ProductModel();
