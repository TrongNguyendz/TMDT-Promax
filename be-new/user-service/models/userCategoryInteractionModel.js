const mongoose = require('mongoose');

const UserCategoryInteractionSchema = new mongoose.Schema({
  user_id: { 
    type: Number, 
    required: true 
  },

  category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },

  click_count: { 
    type: Number, 
    default: 1 
  },

  last_clicked_at: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: false 
});

// Index quan trọng
UserCategoryInteractionSchema.index({ user_id: 1, category_id: 1 }, { unique: true }); // đảm bảo 1 user chỉ 1 record cho 1 category
UserCategoryInteractionSchema.index({ user_id: 1, last_clicked_at: -1 });

const UserCategoryInteraction = mongoose.model('UserCategoryInteraction', UserCategoryInteractionSchema);

// ====================== FUNCTIONS ======================

// Khi user click danh mục → tăng số lần click
exports.addCategoryClick = async (userId, categoryId) => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return null;
  }

  return await UserCategoryInteraction.findOneAndUpdate(
    { 
      user_id: numericUserId, 
      category_id: categoryId 
    },
    { 
      $inc: { click_count: 1 },           // tăng số lần click
      last_clicked_at: new Date()         // cập nhật thời gian click mới nhất
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Lấy danh sách category_id theo mức độ quan tâm (click_count cao nhất)
exports.getRecentCategoryIds = async (userId, limit = 8) => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) return [];

  const results = await UserCategoryInteraction.find({ user_id: numericUserId })
    .sort({ click_count: -1, last_clicked_at: -1 })   // ưu tiên click nhiều → mới nhất
    .limit(limit)
    .select('category_id click_count')
    .lean();

  return results.map(item => item.category_id);
};

// Lấy cả chi tiết (category_id + số lần click) nếu cần
exports.getRecentCategoriesWithCount = async (userId, limit = 8) => {
  const numericUserId = Number(userId);
  if (isNaN(numericUserId)) return [];

  return await UserCategoryInteraction.find({ user_id: numericUserId })
    .sort({ click_count: -1, last_clicked_at: -1 })
    .limit(limit)
    .select('category_id click_count last_clicked_at')
    .lean();
};

// Xóa dữ liệu cũ (nếu muốn giữ dữ liệu lâu dài thì bỏ hoặc tăng days lên)
exports.cleanupOldInteractions = async (days = 60) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await UserCategoryInteraction.deleteMany({ last_clicked_at: { $lt: cutoff } });
};

module.exports = exports;