const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    offerId: { type: String, required: true },
    buyerId: String,
    buyerName: String,
    buyerPhone: String,
    amount: Number,
    status: { type: String, default: "Pending" },
    date: String
}, { _id: false });

const bidSchema = new mongoose.Schema({
    bidderId: String,
    bidderName: String,
    amount: Number,
    date: String
}, { _id: false });

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    condition: { type: String, default: "Good" },
    listingType: { type: String, default: "fixed" },
    stock: { type: Number, default: 1 },
    currentBid: { type: Number, default: null },
    sellerId: String,
    sellerName: String,
    sellerPhone: String,
    sellerRating: Number,
    trustScore: Number,
    location: String,
    description: String,
    image: { type: String, default: null },
    rating: Number,
    bids: { type: [bidSchema], default: [] },
    offers: { type: [offerSchema], default: [] },
    dateAdded: String,
    views: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const { products: seedProducts } = require("../config/seedData");

let isProductSeeded = false;
async function ensureSeeded() {
    if (isProductSeeded || mongoose.connection.readyState !== 1) return;
    try {
        const count = await Product.countDocuments();
        if (count === 0 && seedProducts && seedProducts.length > 0) {
            await Product.insertMany(seedProducts);
            console.log(`[ProductModel] Seeded ${seedProducts.length} demo products into MongoDB.`);
        }
        isProductSeeded = true;
    } catch (e) {
        console.error('[ProductModel Seed Error]:', e.message);
    }
}

const ProductModel = {
    async find(filters = {}) {
        if (mongoose.connection.readyState !== 1) {
            let results = [...seedProducts];
            if (filters.category) {
                results = results.filter(p => p.category && p.category.toLowerCase() === filters.category.toLowerCase());
            }
            if (filters.listingType) {
                results = results.filter(p => p.listingType === filters.listingType);
            }
            if (filters.sellerId) {
                results = results.filter(p => p.sellerId === filters.sellerId);
            }
            if (filters.search) {
                const term = filters.search.toLowerCase();
                results = results.filter(p => (p.name && p.name.toLowerCase().includes(term)) || (p.description && p.description.toLowerCase().includes(term)));
            }
            return results;
        }

        try {
            await ensureSeeded();
            const query = {};

            if (filters.category) {
                query.category = new RegExp(
                    "^" + escapeRegex(filters.category) + "$", "i"
                );
            }
            if (filters.listingType) query.listingType = filters.listingType;
            if (filters.sellerId) query.sellerId = filters.sellerId;

            if (filters.search) {
                const term = escapeRegex(filters.search);
                query.$or = [
                    { name: { $regex: term, $options: "i" } },
                    { description: { $regex: term, $options: "i" } }
                ];
            }

            return await Product.find(query).sort({ createdAt: -1 }).lean();
        } catch (err) {
            console.warn('[ProductModel.find] DB query error, falling back to seed products:', err.message);
            return seedProducts;
        }
    },

    async findById(id) {
        if (mongoose.connection.readyState !== 1) {
            return seedProducts.find(p => p.id === id) || null;
        }
        try {
            await ensureSeeded();
            return await Product.findOne({ id }).lean();
        } catch (err) {
            return seedProducts.find(p => p.id === id) || null;
        }
    },

    async incrementViews(id) {
        return Product.findOneAndUpdate(
            { id },
            { $inc: { views: 1 } },
            { new: true }
        ).lean();
    },

    async create(data) {
        const {
            name, category, price, condition, listingType,
            location, description, sellerId, sellerName,
            sellerPhone, stock, image
        } = data;

        return Product.create({
            id: "prod_" + Date.now(),
            name,
            category,
            price: Number(price),
            originalPrice: Math.round(Number(price) * 1.3),
            condition: condition || "Good",
            listingType: listingType || "fixed",
            stock: Number(stock) || 1,
            currentBid: listingType === "bidding" ? Number(price) : null,
            sellerId,
            sellerName,
            sellerPhone: sellerPhone || null,
            sellerRating: 4.8,
            trustScore: 90,
            location,
            description,
            image: image || null,
            rating: 5,
            bids: [],
            offers: [],
            dateAdded: new Date().toISOString().split("T")[0],
            views: 0
        });
    },

    async findByIdAndUpdate(id, updates = {}) {
        const allowed = [
            "name", "category", "price", "condition", "listingType",
            "stock", "location", "description", "image", "rating"
        ];
        const clean = {};

        for (const field of allowed) {
            if (updates[field] !== undefined) clean[field] = updates[field];
        }

        return Product.findOneAndUpdate(
            { id },
            { $set: clean },
            { new: true, runValidators: true }
        ).lean();
    },

    async findByIdAndDelete(id) {
        return Product.findOneAndDelete({ id }).lean();
    },

    async adjustStock(id, delta) {
        return Product.findOneAndUpdate(
            { id },
            { $inc: { stock: delta } },
            { new: true }
        ).lean();
    },

    async getOffers(productId) {
        const product = await Product.findOne({ id: productId }).select("offers").lean();
        return product ? product.offers : null;
    },

    async addOffer(productId, data) {
        const offer = {
            offerId: "off_" + Date.now(),
            buyerId: data.buyerId,
            buyerName: data.buyerName,
            buyerPhone: data.buyerPhone || null,
            amount: Number(data.amount),
            status: "Pending",
            date: new Date().toISOString().split("T")[0]
        };

        const product = await Product.findOneAndUpdate(
            { id: productId },
            { $push: { offers: offer } },
            { new: true, runValidators: true }
        );

        if (!product) return null;
        return product.offers.find(o => o.offerId === offer.offerId);
    },

    async updateOfferStatus(productId, offerId, status) {
        const product = await Product.findOne({ id: productId });

        if (!product) return { error: "PRODUCT_NOT_FOUND" };

        const offer = product.offers.find(o => o.offerId === offerId);
        if (!offer) return { error: "OFFER_NOT_FOUND" };

        offer.status = status;
        await product.save();

        return { offer: offer.toObject() };
    },

    async deleteOffer(productId, offerId) {
        const product = await Product.findOne({ id: productId });

        if (!product) return { error: "PRODUCT_NOT_FOUND" };

        const index = product.offers.findIndex(o => o.offerId === offerId);
        if (index === -1) return { error: "OFFER_NOT_FOUND" };

        const deleted = product.offers[index].toObject();
        product.offers.splice(index, 1);
        await product.save();

        return { deleted };
    },

    async getBids(productId) {
        const product = await Product.findOne({ id: productId }).select("bids").lean();
        return product ? product.bids : null;
    },

    async placeBid(productId, data) {
        const bid = {
            bidderId: data.bidderId,
            bidderName: data.bidderName,
            amount: Number(data.amount),
            date: new Date().toISOString().split("T")[0]
        };

        const product = await Product.findOneAndUpdate(
            { id: productId },
            {
                $push: { bids: bid },
                $set: { currentBid: Number(data.amount) }
            },
            { new: true, runValidators: true }
        );

        if (!product) return { error: "PRODUCT_NOT_FOUND" };

        return {
            newBid: product.bids[product.bids.length - 1].toObject(),
            currentBid: product.currentBid
        };
    }
};

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = ProductModel;
