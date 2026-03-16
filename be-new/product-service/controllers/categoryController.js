const CategoryModel = require('../models/categoryModel');

exports.listCategories = async (_req, res) => {
  try {
    const data = await CategoryModel.listCategories();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách danh mục',
      error: error.message
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await CategoryModel.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh mục',
      error: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({
      success: false,
      message: 'Tên danh mục là bắt buộc'
    });
  }

  try {
    const category = await CategoryModel.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể tạo danh mục',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await CategoryModel.updateCategory(req.params.id, req.body);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    res.json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật danh mục',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await CategoryModel.deleteCategory(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    res.json({ success: true, message: 'Xóa danh mục thành công' });

  } catch (error) {
    console.error('LỖI SERVER:', error); 

    // Kiểm tra tất cả các khả năng báo lỗi ràng buộc
    if (
        error.message === 'HAS_PRODUCTS' || 
        error.message.includes('FOREIGN KEY') || 
        error.message.includes('constraint failed') ||
        error.code === 'SQLITE_CONSTRAINT' // Mã lỗi chuẩn của SQLite
    ) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa! Danh mục này đang chứa sản phẩm.'
      });
    }

    // Các lỗi khác (Cú pháp, kết nối...)
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống',
      error: error.message
    });
  }
};