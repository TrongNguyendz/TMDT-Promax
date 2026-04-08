/**
 * Migration script: Cập nhật normalized_name cho tất cả sản phẩm hiện có
 * Chạy: npm run migrate:update-normalized-names
 * Hoặc: node scripts/updateNormalizedNames.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Tạo schema mới chỉ để migration, không có middleware
const migrationProductSchema = new mongoose.Schema({
  sku: String,
  name: String,
  normalized_name: String,
  category_id: mongoose.Schema.Types.ObjectId,
  images: Array,
  attributes: Array,
  price: Number,
  stock_quantity: Number,
  sold: Number,
  rating: Number,
  review_count: Number,
  description: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const MigrationProduct = mongoose.model('MigrationProduct', migrationProductSchema, 'products');

/**
 * Chuẩn hóa text: Bỏ dấu Tiếng Việt và xóa khoảng trắng
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')                // Tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd')              // Sửa chữ đ
    .trim();
};

async function updateNormalizedNames() {
  try {
    // Kết nối MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tmdt-promax';
    await mongoose.connect(mongoUri);

    console.log('✅ Kết nối MongoDB thành công');

    // Lấy tất cả sản phẩm
    const products = await MigrationProduct.find({});
    console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

    let updated = 0;
    let errors = 0;

    // Cập nhật từng sản phẩm
    for (const product of products) {
      try {
        const normalized = normalizeText(product.name);
        
        if (product.normalized_name !== normalized) {
          // Update trực tiếp mà không trigger middleware
          await MigrationProduct.findByIdAndUpdate(product._id, {
            normalized_name: normalized
          });
          updated++;
          
          if (updated % 10 === 0) {
            console.log(`⏳ Đã cập nhật ${updated} sản phẩm...`);
          }
        }
      } catch (error) {
        console.error(`❌ Lỗi cập nhật sản phẩm ${product.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Hoàn tất!`);
    console.log(`📊 Tổng cập nhật: ${updated} sản phẩm`);
    console.log(`❌ Lỗi:${errors} sản phẩm`);

    await mongoose.connection.close();
    console.log('🔌 Đóng kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi migration:', error);
    process.exit(1);
  }
}

// Chạy migration
updateNormalizedNames();
