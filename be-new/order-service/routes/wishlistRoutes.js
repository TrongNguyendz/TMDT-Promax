const express = require('express');

const router = express.Router();
const controller = require('../controllers/wishlistController');

router.get('/', controller.getMyWishlist);
router.post('/', controller.addToWishlist);
router.delete('/:userId/:productId', controller.removeFromWishlist);

module.exports = router;

