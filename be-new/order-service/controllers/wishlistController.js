const WishlistModel = require('../models/wishlistModel');


exports.getMyWishlist = async (req, res) => {
    try {
        // userId lấy từ Token (thông qua Gateway Auth Middleware) hoặc query param
        const userId = req.query.user_id || req.body.user_id; 
        if (!userId) return res.status(400).json({ success: false, message: 'Missing user_id' });

        const data = await WishlistModel.getList(userId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        if (!user_id || !product_id) return res.status(400).json({ success: false, message: 'Missing info' });

        const data = await WishlistModel.add(user_id, product_id);
        res.status(201).json({ success: true, message: 'Added to wishlist', data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await WishlistModel.remove(userId, productId);
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

