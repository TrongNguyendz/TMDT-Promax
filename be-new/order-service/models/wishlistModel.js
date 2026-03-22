const mongoose = require('mongoose');

// Định nghĩa Schema
const WishlistSchema = new mongoose.Schema({
    user_id: { type: String, required: true }, 
    product_id: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

// index unique để 1 user không tim 1 sản phẩm 2 lần
WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

WishlistSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = {
    getList: async (userId) => {
        return await Wishlist.find({ user_id: userId }).sort({ created_at: -1 });
    },

    add: async (userId, productId) => {
        try {
            const item = await Wishlist.findOneAndUpdate(
                { user_id: userId, product_id: productId },
                { user_id: userId, product_id: productId },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            return item;
        } catch (error) {
            throw error;
        }
    },

    remove: async (userId, productId) => {
        const result = await Wishlist.deleteOne({ user_id: userId, product_id: productId });
        return result.deletedCount > 0;
    }
};