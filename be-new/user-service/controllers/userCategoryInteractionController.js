const categoryInteractionModel = require('../models/userCategoryInteractionModel');

// ====================== CONTROLLER ======================

// Ghi nhận khi user click vào một danh mục
exports.recordCategoryClick = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.params.userId || req.body.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId không hợp lệ'
      });
    }

    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng truyền category_id'
      });
    }

    const interaction = await categoryInteractionModel.addCategoryClick(userId, category_id);

    if (!interaction) {
      return res.status(400).json({
        success: false,
        message: 'Không thể ghi nhận tương tác'
      });
    }

    res.json({
      success: true,
      message: 'Ghi nhận click danh mục thành công',
      data: {
        user_id: userId,
        category_id,
        click_count: interaction.click_count,
        last_clicked_at: interaction.last_clicked_at
      }
    });
  } catch (error) {
    console.error('Record category click error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể ghi nhận tương tác danh mục',
      error: error.message
    });
  }
};

// Lấy danh sách category_id mà user hay click nhất (dùng để recommend)
exports.getRecentCategories = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.params.userId || req.body.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId không hợp lệ'
      });
    }

    const limit = parseInt(req.query.limit) || 5;

    const categoryIds = await categoryInteractionModel.getRecentCategoryIds(userId, limit);

    res.json({
      success: true,
      data: {
        user_id: userId,
        recent_category_ids: categoryIds,
        count: categoryIds.length
      }
    });
  } catch (error) {
    console.error('Get recent categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách danh mục gần đây',
      error: error.message
    });
  }
};

// Lấy chi tiết danh mục + số lần click (nếu cần debug hoặc hiển thị)
exports.getRecentCategoriesWithCount = async (req, res) => {
  try {
    const userId = Number(req.user?.id || req.params.userId);
    console.log('Fetching recent categories with count for user_id:', userId);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'userId không hợp lệ'
      });
    }

    const limit = parseInt(req.query.limit) || 8;

    const data = await categoryInteractionModel.getRecentCategoriesWithCount(userId, limit);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get recent categories with count error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin tương tác danh mục',
      error: error.message
    });
  }
};
