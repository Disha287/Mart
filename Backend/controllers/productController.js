const ProductModel = require('../models/productModel');

const getAllProducts = async (req, res) => {
    try {
        const { category, listingType, sellerId, search } = req.query;
        const products = await ProductModel.find({ category, listingType, sellerId, search });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        await ProductModel.incrementViews(req.params.id);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, category, price, condition, listingType, location, description, sellerId, sellerName, sellerPhone, stock, image } = req.body;

        if (!name || !category || !price || !sellerId || !sellerName || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: name, category, price, sellerId, sellerName, location, description'
            });
        }

        const newProduct = await ProductModel.create({
            name, category, price, condition, listingType, location,
            description, sellerId, sellerName, sellerPhone, stock, image
        });

        res.status(201).json({ success: true, message: 'Product listing created successfully', data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updated = await ProductModel.findByIdAndUpdate(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, message: 'Product updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const deleted = await ProductModel.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        res.status(200).json({ success: true, message: `Product '${deleted.name}' deleted successfully`, data: deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductOffers = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        const offers = await ProductModel.getOffers(req.params.id);
        res.status(200).json({
            success: true,
            productId: product.id,
            productName: product.name,
            count: offers.length,
            data: offers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createOffer = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }

        const { buyerId, buyerName, buyerPhone, amount } = req.body;
        if (!buyerId || !buyerName || !amount) {
            return res.status(400).json({ success: false, message: 'Required fields: buyerId, buyerName, amount' });
        }
        if (Number(amount) >= product.price) {
            return res.status(400).json({ success: false, message: `Offer amount (₹${amount}) must be less than the listed price (₹${product.price})` });
        }

        const newOffer = await ProductModel.addOffer(req.params.id, { buyerId, buyerName, buyerPhone, amount });
        res.status(201).json({ success: true, message: 'Offer submitted successfully', data: newOffer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateOfferStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
            return res.status(400).json({ success: false, message: "status must be 'Accepted', 'Rejected', or 'Pending'" });
        }

        const result = await ProductModel.updateOfferStatus(req.params.id, req.params.offerId, status);
        if (result.error === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        if (result.error === 'OFFER_NOT_FOUND') {
            return res.status(404).json({ success: false, message: `Offer with id '${req.params.offerId}' not found` });
        }

        res.status(200).json({ success: true, message: `Offer status updated to '${status}'`, data: result.offer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const result = await ProductModel.deleteOffer(req.params.id, req.params.offerId);
        if (result.error === 'PRODUCT_NOT_FOUND') {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        if (result.error === 'OFFER_NOT_FOUND') {
            return res.status(404).json({ success: false, message: `Offer with id '${req.params.offerId}' not found` });
        }

        res.status(200).json({ success: true, message: 'Offer cancelled successfully', data: result.deleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductBids = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        if (product.listingType !== 'bidding') {
            return res.status(400).json({ success: false, message: 'This product is not an auction listing' });
        }

        const bids = await ProductModel.getBids(req.params.id);
        res.status(200).json({
            success: true,
            productId: product.id,
            productName: product.name,
            currentBid: product.currentBid,
            count: bids.length,
            data: bids
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const placeBid = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
        }
        if (product.listingType !== 'bidding') {
            return res.status(400).json({ success: false, message: 'This product is not an auction listing' });
        }

        const { bidderId, bidderName, amount } = req.body;
        if (!bidderId || !bidderName || !amount) {
            return res.status(400).json({ success: false, message: 'Required fields: bidderId, bidderName, amount' });
        }
        if (Number(amount) <= (product.currentBid || product.price)) {
            return res.status(400).json({
                success: false,
                message: `Bid amount (₹${amount}) must exceed current bid (₹${product.currentBid || product.price})`
            });
        }

        const result = await ProductModel.placeBid(req.params.id, { bidderId, bidderName, amount });
        res.status(201).json({
            success: true,
            message: 'Bid placed successfully',
            data: result.newBid,
            currentBid: result.currentBid
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductOffers,
    createOffer,
    updateOfferStatus,
    deleteOffer,
    getProductBids,
    placeBid
};
