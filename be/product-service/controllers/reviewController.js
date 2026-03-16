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

exports.createReview = async (req, res) => {
  if (!req.body.user_id || !req.body.rating) {
    return res.status(400).json({
      success: false,
      message: 'user_id và rating là bắt buộc'
    });
  }

  try {
    const review = await ReviewModel.createReview(req.params.productId, req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo đánh giá thành công',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể tạo đánh giá',
      error: error.message
    });
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
 

exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body; // Nội dung trả lời

    if (!reply) return res.status(400).json({ message: 'Nội dung trả lời không được để trống' });

    const updatedReview = await ReviewModel.replyToReview(reviewId, reply);
    res.json({ success: true, message: 'Đã trả lời', data: updatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};