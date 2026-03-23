const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho 1 câu trả lời
const replySchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    user_name: { type: String, required: true }, // Lưu tên người trả lời
    role: { type: String, required: true },      // 'admin', 'staff', 'user'
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user_id: { type: String, required: true },
  user_name: { type: String, required: true }, // Đã có (Lưu tên người đánh giá)
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  
  // THAY ĐỔI LỚN NHẤT: Chuyển từ String sang Mảng các câu trả lời
  replies:[replySchema] 
  
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

reviewSchema.set('toJSON', { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret._id; } });
const Review = mongoose.model('Review', reviewSchema);

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
exports.deleteReview = async (reviewId) => {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) return false;
    const review = await Review.findByIdAndDelete(reviewId);
    if (review) {
        await refreshProductAggregates(review.product_id);
        return true;
    }
    return false;
};
exports.createReview = async (productId, payload) => {
    const review = await Review.create({
        product_id: productId,
        user_id: payload.user_id,
        user_name: payload.user_name || "Người dùng ẩn danh", // Backend tự lấy từ Payload
        rating: payload.rating,
        comment: payload.comment,
        replies:[] // Khởi tạo mảng rỗng
    });
    await refreshProductAggregates(productId);
    return review;
};

exports.addReplyToReview = async (reviewId, replyData) => {
    return await Review.findByIdAndUpdate(
        reviewId, 
        { $push: { replies: replyData } }, 
        { new: true }
    );
};

// Hàm getAllReviews sửa lại (bỏ logic lọc admin_reply cũ vì cấu trúc đã đổi)
exports.getAllReviews = async (filters = {}) => {
    const query = {};
    if (filters.userId) query.user_id = filters.userId;
    if (filters.productId) query.product_id = filters.productId;
    if (filters.rating) query.rating = Number(filters.rating);
    if (filters.search) query.$or =[{ comment: { $regex: filters.search, $options: 'i' } }, { user_name: { $regex: filters.search, $options: 'i' } }];
    if (filters.dateFrom || filters.dateTo) {
        query.created_at = {};
        if (filters.dateFrom) query.created_at.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.created_at.$lte = new Date(filters.dateTo);
    }
    // Trạng thái trả lời (Lọc xem mảng replies có phần tử nào không)
    if (filters.replyStatus === 'replied') query['replies.0'] = { $exists: true };
    if (filters.replyStatus === 'unreplied') query.replies = { $size: 0 };

    let sort = { created_at: -1 }; 
    if (filters.sortBy) { sort = {}; sort[filters.sortBy] = filters.sortDir === 'asc' ? 1 : -1; }
    const limit = Number(filters.limit) || 10;
    const page = Number(filters.page) || 1;
    const skip = (page - 1) * limit;
    const Review = mongoose.model('Review');
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).populate('product_id', 'name').sort(sort).skip(skip).limit(limit);
    const data = reviews.map(r => {
      const doc = r.toObject();
      doc.id = doc._id;
      doc.product_name = doc.product_id?.name;
      delete doc._id;
      return doc;
  });

  // Trả về object chứa cả data và pagination
  return {
      data,
      pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1
      }
  };
};