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

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.post('/', createProduct);

router.put('/:id', updateProduct);

router.delete('/:id', deleteProduct);

router.get('/:id/offers', getProductOffers);

router.post('/:id/offers', createOffer);

router.patch('/:id/offers/:offerId', updateOfferStatus);

router.delete('/:id/offers/:offerId', deleteOffer);

router.get('/:id/bids', getProductBids);

router.post('/:id/bids', placeBid);

module.exports = router;
