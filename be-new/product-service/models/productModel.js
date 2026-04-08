// File: product-service/models/productModel.js
const mongoose = require('mongoose');
const slugify = require('../functions/slugify');
const cloudinary = require('../config/cloudinary');

/**
 * Chuẩn hóa text: Bỏ dấu Tiếng Việt và xóa khoảng trắng
 * Để so sánh chính xác
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

// Định nghĩa Schema
const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  normalized_name: { type: String }, // Tên đã chuẩn hóa để tìm kiếm
  slug: { type: String, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock_quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  
  // Liên kết sang Category
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  // Nhúng mảng Ảnh trực tiếp
  images: [{
    image_url: String,
    public_id: String,
    color: String,
    is_primary: { type: Boolean, default: false },
    sort_order: Number
  }],

  // Nhúng mảng Thuộc tính trực tiếp
  attributes: [{
    attribute_name: String,
    attribute_value: String
  }]

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

// Tạo text index để tìm kiếm toàn văn
productSchema.index({ name: 'text', sku: 'text', description: 'text' }); 
// Tạo index cho normalized_name để tìm kiếm nhanh
productSchema.index({ normalized_name: 1 });

// Middleware: Tự động chuẩn hóa name khi save/update
productSchema.pre('save', function(next) {
  if (this.name) {
    this.normalized_name = normalizeText(this.name);
  }
  next();
});

productSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  const update = this.getUpdate();
  if (update && update.name) {
    update.normalized_name = normalizeText(update.name);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

// Helper xóa ảnh
const deleteCloudinaryImages = async (publicIds = []) => {
    if(publicIds.length) try { await cloudinary.api.delete_resources(publicIds); } catch(e) { console.error(e); }
};

exports.listProducts = async (filters = {}) => {
  const query = {};
  
  // Lọc theo Category
  if (filters.categoryId) query.category_id = filters.categoryId;
  
  // Tìm kiếm với chuẩn hóa text
  if (filters.search) {
     const normalizedSearch = normalizeText(filters.search);
     // Tìm kiếm vừa dùng text index, vừa dùng normalized_name
     query.$or = [
         { normalized_name: { $regex: normalizedSearch, $options: 'i' } },
         { sku: { $regex: filters.search, $options: 'i' } }
     ];
  }
  
  // Lọc giá
  if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  const limit = Number(filters.limit) || 20;
  const page = Number(filters.page) || 1;
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
                                .populate('category_id', 'name')
                                .sort({ created_at: -1 })
                                .skip(skip)
                                .limit(limit);

  const total = await Product.countDocuments(query);

  const data = products.map(p => {
      const doc = p.toObject ? p.toObject() : p;
      doc.id = doc._id;
      doc.category_name = doc.category_id?.name; // Lấy tên danh mục
      delete doc._id;
      delete doc.normalized_name; // Không trả về field này
      return doc;
  });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

exports.getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const product = await Product.findById(id).populate('category_id', 'name');
  if (!product) return null;

  const doc = product.toObject();
  doc.id = doc._id;
  doc.category_name = doc.category_id?.name;
  
  doc.category_id = doc.category_id?._id ? doc.category_id._id.toString() : doc.category_id;
  delete doc._id;
  delete doc.normalized_name; // Không trả về field này
  return doc;
};

exports.increaseSold = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const bulkOps = items.map(item => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(
          item.product_id || item.productId
        )
      },
      update: {
        $inc: {
          sold: Number(item.quantity || 0)
        }
      }
    }
  }));

console.log('🧪 bulkOps:', JSON.stringify(bulkOps, null, 2));

  return await Product.bulkWrite(bulkOps);
};

exports.getTopProducts = async (limit = 20) => {
  const products = await Product.find()
    .sort({ sold: -1 }) // 🔥 sắp xếp theo bán nhiều nhất
    .limit(Number(limit))
    .select('name sold stock_quantity');

  return products.map(p => ({
    id: p._id,
    name: p.name,
    sold: p.sold,
    stock_quantity: p.stock_quantity
  }));
};

exports.createProduct = async (payload, files = []) => {
  const baseSlug = slugify(payload.slug || payload.name);
  // Check trùng slug 
  let slug = baseSlug;
  if (await Product.exists({ slug })) slug = `${baseSlug}-${Date.now()}`;

  // Chuẩn bị ảnh
  let imageColors = [];
  try { imageColors = JSON.parse(payload.image_colors || '[]'); } catch {}

  const images = files.map((file, index) => ({
      image_url: file.path,
      public_id: file.filename,
      alt_text: file.originalname,
      sort_order: index,
      is_primary: index === 0,
      color: imageColors[index] || null
  }));

  // Chuẩn bị Attributes
  let attributes = [];
  try { attributes = typeof payload.attributes === 'string' ? JSON.parse(payload.attributes) : payload.attributes; } catch {}

  const newProduct = await Product.create({
      sku: payload.sku,
      name: payload.name,
      slug: slug,
      description: payload.description,
      price: payload.price,
      stock_quantity: payload.stock_quantity,
      sold: payload.sold || 0,
      category_id: payload.category_id,
      images: images,       // Lưu thẳng mảng ảnh
      attributes: attributes // Lưu thẳng mảng thuộc tính
  });

  return exports.getProductById(newProduct._id);
};

exports.updateProduct = async (id, payload, files = []) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const product = await Product.findById(id);
  if (!product) return null;

  // Update field cơ bản
  if (payload.name) product.name = payload.name;
  if (payload.price) product.price = payload.price;
  if (payload.stock_quantity) product.stock_quantity = payload.stock_quantity;
  if (payload.sold) product.sold = payload.sold;
  if (payload.description) product.description = payload.description;
  if (payload.category_id) product.category_id = payload.category_id;
  if (payload.sku) product.sku = payload.sku;

  // Update Attributes
  if (payload.attributes) {
      try {
          product.attributes = typeof payload.attributes === 'string' ? JSON.parse(payload.attributes) : payload.attributes;
      } catch {}
  }

  // Update Images 
  const hasImageUpdate = files.length > 0 || payload.images !== undefined;
  if (hasImageUpdate) {
      //  Xóa ảnh cũ trên Cloud
      const oldPublicIds = product.images.map(img => img.public_id).filter(Boolean);
      
      
      // Parse ảnh cũ frontend gửi lên
      let keptOldImages = [];
      try { keptOldImages = JSON.parse(payload.images || '[]'); } catch {}
      const keptIds = keptOldImages.map(img => img.public_id);

      const toDelete = oldPublicIds.filter(id => !keptIds.includes(id));
      if (toDelete.length) await deleteCloudinaryImages(toDelete);

      //  Tạo mảng ảnh mới
      let newImages = [...keptOldImages]; // Giữ lại ảnh cũ
      
      let imageColors = [];
      try { imageColors = JSON.parse(payload.image_colors || '[]'); } catch {}

      // Map ảnh mới upload
      const uploadedImages = files.map((file, i) => ({
          image_url: file.path,
          public_id: file.filename,
          color: null, 
          is_primary: false,
          sort_order: 0
      }));

      newImages = [...newImages, ...uploadedImages];

      // Gán lại màu và sort order theo index
      newImages = newImages.map((img, index) => ({
          ...img,
          color: imageColors[index] || img.color || null,
          sort_order: index,
          is_primary: index === 0
      }));

      product.images = newImages;
  }

  await product.save();
  return exports.getProductById(id);
};

exports.deleteProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const product = await Product.findById(id);
  if (!product) return false;

  // Xóa ảnh trên cloud
  const publicIds = product.images.map(img => img.public_id).filter(Boolean);
  if (publicIds.length) await deleteCloudinaryImages(publicIds);
  // Xóa review liên quan
  const Review = mongoose.model('Review');
  await Review.deleteMany({ product_id: id });
  // Xóa sản phẩm
  await Product.findByIdAndDelete(id);
  return true;
};

exports.updateStock = async (id, qty) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Product.findByIdAndUpdate(id, { stock_quantity: qty }, { new: true });
};
exports.getPrimaryImageBySku = async (sku) => {
  // Tìm sản phẩm dựa trên SKU
  const product = await Product.findOne({ sku });

  if (!product || !product.images || product.images.length === 0) {
    return null;
  }

  // Vì trong logic update/create bạn đã gán sort_order và is_primary,
  // chúng ta có thể tìm ảnh có is_primary: true hoặc đơn giản là lấy ảnh đầu tiên
  const primaryImage = product.images.find(img => img.is_primary) || product.images[0];

  return {
    image_url: primaryImage.image_url,
    public_id: primaryImage.public_id,
    color: primaryImage.color,
    alt_text: primaryImage.alt_text, // Lưu ý: Schema của bạn chưa có field này, hãy thêm nếu cần
    is_primary: primaryImage.is_primary,
    sort_order: primaryImage.sort_order
  };
};
