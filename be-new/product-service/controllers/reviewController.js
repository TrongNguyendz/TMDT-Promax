// controllers/reviewController.js
const ReviewModel = require('../models/reviewModel');

exports.listReviews = async (req, res) => {
  try {
    const reviews = await ReviewModel.getReviewsByProduct(req.params.productId, req.query.status);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đánh giá',
      error: error.message
    });
  }
};

exports.listAllReviews = async (req, res) => {
    try {
        // Truyền req.query xuống Model
        const data = await ReviewModel.getAllReviews(req.query);
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};



// exports.updateReviewStatus = async (req, res) => {
//   if (!req.body.status) {
//     return res.status(400).json({
//       success: false,
//       message: 'Thiếu trạng thái mới'
//     });
//   }

//   try {
//     const review = await ReviewModel.updateReviewStatus(req.params.reviewId, req.body.status);
//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         message: 'Không tìm thấy đánh giá'
//       });
//     }
//     res.json({
//       success: true,
//       message: 'Cập nhật trạng thái đánh giá thành công',
//       data: review
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Không thể cập nhật đánh giá',
//       error: error.message
//     });
//   }
// };

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const success = await ReviewModel.deleteReview(reviewId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy review để xóa' });
    }

    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (error) {
    console.error('Lỗi xóa review:', error); // Log lỗi ra terminal
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa', error: error.message });
  }
};
 

exports.createReview = async (req, res) => {
  if (!req.body.user_id || !req.body.rating) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
  try {
    // Lấy tên từ Token (req.user) nếu có, nếu không lấy từ body
    const payload = {
        ...req.body,
        user_name: req.user?.name || req.user?.full_name || req.user?.username || req.body.user_name
    };
    const review = await ReviewModel.createReview(req.params.productId, payload);
    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: review });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Sửa hàm trả lời
exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    // LẤY THÊM user_name TỪ BODY
    const { reply, user_name } = req.body; 

    if (!reply) return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });

    const replyData = {
        user_id: req.user.id,
        // Ưu tiên lấy tên do Frontend truyền lên, nếu không có mới dùng Token, cuối cùng là 'Khách hàng'
        user_name: user_name || req.user.name || req.user.full_name || req.user.username || 'Khách hàng',
        role: req.user.role || 'customer',
        content: reply
    };

    const updatedReview = await ReviewModel.addReplyToReview(reviewId, replyData);
    res.json({ success: true, message: 'Đã trả lời', data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};