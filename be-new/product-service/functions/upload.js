// // File: product-service/functions/upload.js
// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// const uploadDir = path.join(__dirname, '..', 'upload');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (_, file, cb) => {
//     const timestamp = Date.now();
//     const safeName = file.originalname.replace(/\s+/g, '-');
//     cb(null, `${timestamp}-${safeName}`);
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (_, file, cb) => {
//     const allowed = /jpeg|jpg|png|gif|webp/;
//     const mimetypeOk = allowed.test(file.mimetype.toLowerCase());
//     const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
//     if (mimetypeOk && extOk) {
//       return cb(null, true);
//     }
//     cb(new Error('Định dạng ảnh không hợp lệ'));
//   }
// });

// module.exports = upload;

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product-images', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp','avif'],
    public_id: (req, file) => {
      const name = file.originalname.split('.')[0];
      return `${Date.now()}-${name}`;
    }
  }
});

const upload = multer({ storage: storage });

module.exports = upload;