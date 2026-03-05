// File: product-service/models/reviewModel.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: Number, required: true }, 
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  admin_reply: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

reviewSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; } });

const Review = mongoose.model('Review', reviewSchema);

// Helper tính điểm
const refreshProductAggregates = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: '$product_id', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    const Product = mongoose.model('Product');
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: stats[0].avgRating,
            review_count: stats[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, { rating: 0, review_count: 0 });
    }
};

exports.getReviewsByProduct = async (productId) => {
    return await Review.find({ product_id: productId }).sort({ created_at: -1 });
};

exports.createReview = async (productId, payload) => {
    const review = await Review.create({
        product_id: productId,
        user_id: payload.user_id,
        rating: payload.rating,
        comment: payload.comment
    });
    await refreshProductAggregates(productId);
    return review;
};

exports.deleteReview = async (reviewId) => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return false;
    const review = await Review.findByIdAndDelete(reviewId);
    if (review) {
        await refreshProductAggregates(review.product_id);
        return true;
    }
    return false;
};

exports.replyToReview = async (reviewId, reply) => {
    return await Review.findByIdAndUpdate(reviewId, { admin_reply: reply }, { new: true });
};

exports.getAllReviews = async () => {
    // Populate để lấy tên sản phẩm
    const reviews = await Review.find().populate('product_id', 'name').sort({ created_at: -1 });
    return reviews.map(r => {
        const doc = r.toObject();
        doc.id = doc._id;
        doc.product_name = doc.product_id?.name; // Map tên sản phẩm
        delete doc._id;
        return doc;
    });
};