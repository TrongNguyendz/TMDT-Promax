// File: user-service/functions/upload.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'upload');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const mimetypeOk = allowed.test(file.mimetype.toLowerCase());
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mimetypeOk && extOk) {
      return cb(null, true);
    }
    cb(new Error('Định dạng ảnh không hợp lệ'));
  }
});

const deleteOldAvatar = (oldAvatarUrl) => {
  if (!oldAvatarUrl || oldAvatarUrl.includes('default-avatar')) {
    return; // không xóa ảnh mặc định hoặc không có ảnh
  }

  const oldFilePath = path.join(__dirname, '..', 'upload', path.basename(oldAvatarUrl));
  
  fs.unlink(oldFilePath, (err) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        console.error('Lỗi khi xóa ảnh cũ:', err);
      }
      // ENOENT = file không tồn tại → bỏ qua, không phải lỗi nghiêm trọng
    } else {
      console.log('Đã xóa ảnh cũ:', oldFilePath);
    }
  });
};

module.exports = {
  upload,
  deleteOldAvatar
};
