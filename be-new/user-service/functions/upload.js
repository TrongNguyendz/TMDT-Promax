// File: user-service/functions/upload.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { fileTypeFromBuffer } = require('file-type');   // ← thêm dòng này

const uploadDir = path.join(__dirname, '..', 'upload');   // bạn muốn dùng uploads

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file ngẫu nhiên + extension gốc (an toàn hơn rất nhiều)
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  }
});

// Multer config
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const mimeOk = allowedMimeTypes.includes(file.mimetype.toLowerCase());
    const ext = path.extname(file.originalname).toLowerCase();
    const extOk = allowedExtensions.includes(ext);

    if (mimeOk && extOk) {
      return cb(null, true);
    }
    cb(new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận jpg, jpeg, png, gif, webp.'));
  }
});

// Middleware kiểm tra magic bytes (file signature thực tế) - Rất quan trọng
const validateImageContent = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = fs.readFileSync(req.file.path);
    const detectedType = await fileTypeFromBuffer(buffer);

    const allowedTypes = ['jpg', 'png', 'gif', 'webp'];

    if (!detectedType || !allowedTypes.includes(detectedType.ext)) {
      // Xóa file giả mạo ngay lập tức
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'File không phải là ảnh hợp lệ (phát hiện nội dung không đúng định dạng)'
      });
    }

    // Nếu muốn thêm: resize ảnh bằng sharp (tùy chọn sau)
    // const sharp = require('sharp');
    // await sharp(req.file.path).resize(800).toFile(...)

    next();
  } catch (err) {
    if (req.file?.path) {
      fs.unlinkSync(req.file.path); // xóa file lỗi
    }
    console.error('Lỗi validate image content:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý file' });
  }
};

// Hàm xóa ảnh cũ (giữ nguyên logic của bạn, chỉ sửa đường dẫn)
const deleteOldAvatar = (oldAvatarUrl) => {
  if (!oldAvatarUrl || oldAvatarUrl.includes('default-avatar')) {
    return;
  }

  try {
    const filename = path.basename(oldAvatarUrl);
    const oldFilePath = path.join(uploadDir, filename);

    fs.unlink(oldFilePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Lỗi khi xóa ảnh cũ:', err);
      } else if (!err) {
        console.log('Đã xóa ảnh cũ:', oldFilePath);
      }
    });
  } catch (err) {
    console.error('Lỗi deleteOldAvatar:', err);
  }
};

module.exports = {
  upload,
  validateImageContent,   // ← thêm middleware này
  deleteOldAvatar
};