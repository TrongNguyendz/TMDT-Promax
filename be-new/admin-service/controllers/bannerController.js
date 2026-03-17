const BannerModel = require('../models/bannerModel');
const { deleteFile } = require('../functions/upload');
exports.healthCheck = (_req, res) => {
  res.json({
    status: 'UP',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
};

exports.listBanners = async (req, res) => {
  try {
    const result = await BannerModel.listBanners(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách banners',
      error: error.message
    });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }
    res.json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin banner',
      error: error.message
    });
  }
};

// exports.createBanner = async (req, res) => {
//   const required = ['image_url'];
//   const missing = required.filter((field) => !req.body[field]);

//   if (missing.length) {
//     return res.status(400).json({
//       success: false,
//       message: `Thiếu các trường bắt buộc: ${missing.join(', ')}`
//     });
//   }

//   try {
//     const banner = await BannerModel.createBanner(req.body);
//     res.status(201).json({
//       success: true,
//       message: 'Tạo banner thành công',
//       data: banner
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Không thể tạo banner',
//       error: error.message
//     });
//   }
// };

// exports.updateBanner = async (req, res) => {
//   try {
//     const banner = await BannerModel.updateBanner(req.params.id, req.body);
//     if (!banner) {
//       return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
//     }
//     res.json({
//       success: true,
//       message: 'Cập nhật banner thành công',
//       data: banner
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Không thể cập nhật banner',
//       error: error.message
//     });
//   }
// };
// Tạo banner mới + upload file
// admin-service/controllers/bannerController.js
exports.createBanner = async (req, res) => {
  try {
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    //  Trích xuất dữ liệu an toàn (Dùng dấu ?. để tránh lỗi undefined)
    const payload = {
      title: req.body?.title || '',
      description: req.body?.description || '',
      image_url: mediaUrl || '',
      link: req.body?.link || '',
      link_type: req.body?.link_type || 'none',
      status: req.body?.status || 'active',
      display_position: req.body?.display_position || 'homepage_hero',
      sort_order: Number(req.body?.sort_order) || 0,
      start_date: req.body?.start_date || null,
      end_date: req.body?.end_date || null
    };

    //  Gọi Model
    const banner = await BannerModel.createBanner(payload);
    
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    console.error("Lỗi Controller:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
// Cập nhật banner (có thể thay ảnh/video mới)
exports.updateBanner = async (req, res) => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (!banner) {
      if (req.file) deleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    }

    const newMediaUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    const payload = {
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
      link_type: req.body.link_type,
      status: req.body.status,
      display_position: req.body.display_position,
      sort_order: req.body.sort_order,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
    };

    // Chỉ cập nhật image_url nếu có file mới hoặc có gửi image_url
    if (newMediaUrl) {
      payload.image_url = newMediaUrl;
      // Xóa file cũ
      if (banner.image_url && !banner.image_url.includes('default')) {
        deleteFile(banner.image_url);
      }
    }

    const updatedBanner = await BannerModel.updateBanner(req.params.id, payload);

    res.json({
      success: true,
      message: 'Cập nhật banner thành công',
      data: updatedBanner
    });
  } catch (error) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật banner',
      error: error.message
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (banner && banner.image_url && !banner.image_url.includes('default')) {
      deleteFile(banner.image_url);
    }
    const deleted = await BannerModel.deleteBanner(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
    res.json({ success: true, message:true, message: 'Xóa banner thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

