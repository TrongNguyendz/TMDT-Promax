// File: product-service/models/categoryModel.js
const mongoose = require('mongoose');
const slugify = require('../functions/slugify');

//  Định nghĩa Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

const Category = mongoose.model('Category', categorySchema);

exports.listCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

exports.getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Category.findById(id);
};

exports.createCategory = async (payload) => {
  const baseSlug = slugify(payload.slug || payload.name);
  let slug = baseSlug;
  
  // Xử lý trùng slug
  let counter = 1;
  while (await Category.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const category = await Category.create({
    name: payload.name,
    slug: slug,
    description: payload.description
  });
  return category;
};

exports.updateCategory = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  
  const updateData = {
      name: payload.name,
      description: payload.description
  };

  // Nếu đổi tên thì đổi slug
  if (payload.name) {
      updateData.slug = slugify(payload.name);
  }

  return await Category.findByIdAndUpdate(id, updateData, { new: true });
};

exports.deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;

  const Product = mongoose.model('Product'); // Lấy model Product đã đăng ký
  const productCount = await Product.countDocuments({ category_id: id });
  
  if (productCount > 0) {
      throw new Error('HAS_PRODUCTS');
  }

  const result = await Category.findByIdAndDelete(id);
  return !!result;
};