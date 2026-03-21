// controllers/wishlistController.js
const WishlistModel = require('../models/wishlistModel');

exports.getMyWishlist = async (req, res) => {
    try {
        const currentUserId = req.headers['x-user-id'] || req.query.user_id;
        if (!currentUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const data = await WishlistModel.getList(currentUserId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const currentUserId = req.headers['x-user-id'];
        const {  product_id } = req.body;
        if (!currentUserId || !product_id) return res.status(400).json({ success: false, message: 'Missing info' });

        const data = await WishlistModel.add(currentUserId, product_id);
        res.status(201).json({ success: true, message: 'Added to wishlist', data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const currentUserId = req.headers['x-user-id'];
        const {  product_id } = req.body;
        if (!currentUserId || !product_id) return res.status(400).json({ success: false, message: 'Missing info' });
        await WishlistModel.remove(currentUserId, product_id);
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

