const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');

// ============================================================
// PRODUCTS — Base CRUD
// ============================================================

// @route   GET /api/products
// @desc    Get all products (optional ?category=Academic&listingType=fixed&sellerId=xxx&search=xxx)
router.get('/', getAllProducts);

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create a new product listing
// @body    { name, category, price, condition, listingType, stock, sellerId, sellerName, sellerPhone, location, description, image? }
router.post('/', createProduct);

// @route   PUT /api/products/:id
// @desc    Update product fields (price, stock, description, etc.)
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product listing
router.delete('/:id', deleteProduct);

// ============================================================
// NESTED: OFFERS on a Product
// ============================================================

// @route   GET /api/products/:id/offers
// @desc    Get all offers on this product (seller view)
router.get('/:id/offers', getProductOffers);

// @route   POST /api/products/:id/offers
// @desc    Submit a price negotiation offer (buyer action)
// @body    { buyerId, buyerName, buyerPhone?, amount }
router.post('/:id/offers', createOffer);

// @route   PATCH /api/products/:id/offers/:offerId
// @desc    Accept or reject an offer (seller action)
// @body    { status: 'Accepted' | 'Rejected' | 'Pending' }
router.patch('/:id/offers/:offerId', updateOfferStatus);

// @route   DELETE /api/products/:id/offers/:offerId
// @desc    Cancel/delete an offer (buyer action)
router.delete('/:id/offers/:offerId', deleteOffer);

// ============================================================
// NESTED: BIDS on a Product (Auction listings only)
// ============================================================

// @route   GET /api/products/:id/bids
// @desc    Get all bids on this auction product
router.get('/:id/bids', getProductBids);

// @route   POST /api/products/:id/bids
// @desc    Place a bid on an auction listing
// @body    { bidderId, bidderName, amount }
router.post('/:id/bids', placeBid);

module.exports = router;
