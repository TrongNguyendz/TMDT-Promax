// functions/upload.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'upload');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Danh sách loại file được phép
const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
const allowedVideoTypes = /mp4|webm|ogg|mov|avi/; // thêm các loại video bạn muốn

const mimeTypeToExt = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogg',
  'video/quicktime': '.mov', // iOS
  'video/x-msvideo': '.avi'
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = mimeTypeToExt[file.mimetype] || path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (tăng lên vì video nặng hơn ảnh)
  },
  fileFilter: (_, file, cb) => {
    const isImage = allowedImageTypes.test(file.mimetype);
    const isVideo = allowedVideoTypes.test(file.mimetype);

    if (isImage || isVideo) {
      return cb(null, true);
    }
    cb(new Error('Chỉ cho phép ảnh (jpg, png, gif, webp) và video (mp4, webm, mov, avi)'));
  }
});

// Hàm xóa file cũ (dùng chung cho avatar và các file khác)
const deleteFile = (fileUrl) => {
  if (!fileUrl || fileUrl.includes('default-avatar')) return;

  const filePath = path.join(__dirname, '..', 'upload', path.basename(fileUrl));

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Lỗi khi xóa file cũ:', err);
    }
  });
};

module.exports = {
  upload,
  deleteFile,           // đổi tên từ deleteOldAvatar → deleteFile cho chung
};