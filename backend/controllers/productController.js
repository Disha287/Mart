// ============================================================
// PRODUCTS CONTROLLER — CRUD Operations
// ============================================================

const { products } = require('../data/seedData');

// GET /api/products — Get all products
// Query params: ?category=Academic, ?listingType=bidding, ?sellerId=usr_seller_1
const getAllProducts = (req, res) => {
    let result = [...products];

    if (req.query.category) {
        result = result.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
    }
    if (req.query.listingType) {
        result = result.filter(p => p.listingType === req.query.listingType);
    }
    if (req.query.sellerId) {
        result = result.filter(p => p.sellerId === req.query.sellerId);
    }
    if (req.query.search) {
        const q = req.query.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.status(200).json({
        success: true,
        count: result.length,
        data: result
    });
};

// GET /api/products/:id — Get single product
const getProductById = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }
    // Increment views
    product.views = (product.views || 0) + 1;
    res.status(200).json({ success: true, data: product });
};

// POST /api/products — Create new product listing
const createProduct = (req, res) => {
    const { name, category, price, condition, listingType, location, description, sellerId, sellerName, sellerPhone, stock } = req.body;

    if (!name || !category || !price || !sellerId || !sellerName || !location || !description) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: name, category, price, sellerId, sellerName, location, description'
        });
    }

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
        image: req.body.image || null,
        rating: 5.0,
        bids: [],
        offers: [],
        dateAdded: new Date().toISOString().split('T')[0],
        views: 0
    };

    products.push(newProduct);
    res.status(201).json({ success: true, message: 'Product listing created successfully', data: newProduct });
};

// PUT /api/products/:id — Update product
const updateProduct = (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }

    const allowedFields = ['name', 'category', 'price', 'condition', 'listingType', 'stock', 'location', 'description', 'image', 'rating'];
    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    products[index] = { ...products[index], ...updates };
    res.status(200).json({ success: true, message: 'Product updated successfully', data: products[index] });
};

// DELETE /api/products/:id — Delete product
const deleteProduct = (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }

    const deleted = products.splice(index, 1)[0];
    res.status(200).json({ success: true, message: `Product '${deleted.name}' deleted successfully`, data: deleted });
};

// ============================================================
// NESTED: OFFERS on a Product
// ============================================================

// GET /api/products/:id/offers — Get all offers on a product
const getProductOffers = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }
    res.status(200).json({
        success: true,
        productId: product.id,
        productName: product.name,
        count: product.offers.length,
        data: product.offers
    });
};

// POST /api/products/:id/offers — Submit an offer on a product
const createOffer = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
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

    const newOffer = {
        offerId: 'off_' + Date.now(),
        buyerId,
        buyerName,
        buyerPhone: buyerPhone || null,
        amount: Number(amount),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
    };

    product.offers.push(newOffer);
    res.status(201).json({ success: true, message: 'Offer submitted successfully', data: newOffer });
};

// PATCH /api/products/:id/offers/:offerId — Update offer status (Accept/Reject)
const updateOfferStatus = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }

    const offer = product.offers.find(o => o.offerId === req.params.offerId);
    if (!offer) {
        return res.status(404).json({ success: false, message: `Offer with id '${req.params.offerId}' not found` });
    }

    const { status } = req.body;
    if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ success: false, message: "status must be 'Accepted', 'Rejected', or 'Pending'" });
    }

    offer.status = status;
    res.status(200).json({ success: true, message: `Offer status updated to '${status}'`, data: offer });
};

// DELETE /api/products/:id/offers/:offerId — Cancel/delete an offer
const deleteOffer = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }

    const offerIndex = product.offers.findIndex(o => o.offerId === req.params.offerId);
    if (offerIndex === -1) {
        return res.status(404).json({ success: false, message: `Offer with id '${req.params.offerId}' not found` });
    }

    const deleted = product.offers.splice(offerIndex, 1)[0];
    res.status(200).json({ success: true, message: 'Offer cancelled successfully', data: deleted });
};

// ============================================================
// NESTED: BIDS on a Product
// ============================================================

// GET /api/products/:id/bids — Get all bids
const getProductBids = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, message: `Product with id '${req.params.id}' not found` });
    }
    if (product.listingType !== 'bidding') {
        return res.status(400).json({ success: false, message: 'This product is not an auction listing' });
    }
    res.status(200).json({
        success: true,
        productId: product.id,
        productName: product.name,
        currentBid: product.currentBid,
        count: product.bids.length,
        data: product.bids
    });
};

// POST /api/products/:id/bids — Place a bid
const placeBid = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
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

    const newBid = {
        bidderId,
        bidderName,
        amount: Number(amount),
        date: new Date().toISOString().split('T')[0]
    };

    product.bids.push(newBid);
    product.currentBid = Number(amount);

    res.status(201).json({ success: true, message: 'Bid placed successfully', data: newBid, currentBid: product.currentBid });
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
