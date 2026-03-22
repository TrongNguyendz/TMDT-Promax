
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ProductModel = require('../models/productModel');

const normalizeProductPayload = (payload = {}) => {
  const normalized = { ...payload };
  const numericFields = ['price', 'cost_price', 'discount_percent', 'stock_quantity'];

  numericFields.forEach((field) => {
    if (typeof normalized[field] !== 'undefined' && normalized[field] !== null && normalized[field] !== '') {
      const value = Number(normalized[field]);
      if (Number.isNaN(value)) throw new Error(`Trường ${field} phải là số`);
      normalized[field] = value;
    }
  });

  if (typeof normalized.is_featured !== 'undefined') {
    const stringValue = normalized.is_featured.toString().toLowerCase();
    normalized.is_featured = ['true', '1', 'yes', 'on'].includes(stringValue);
  }
  return normalized;
};

exports.healthCheck = (_req, res) => {
  res.json({ status: 'UP', service: 'product-service', timestamp: new Date().toISOString() });
};

exports.listProducts = async (req, res) => {
  try {
    const { data, pagination } = await ProductModel.listProducts(req.query);
    res.json({ success: true, data, pagination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể lấy danh sách sản phẩm', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await ProductModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const data = await ProductModel.getTopProducts();

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.createProduct = async (req, res) => {
  let payload;
  try {
    payload = normalizeProductPayload(req.body);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  const requiredFields = ['name', 'sku', 'price', 'category_id'];
  const missing = requiredFields.filter((field) => !payload[field] && payload[field] !== 0);

  if (missing.length) {
    return res.status(400).json({ success: false, message: `Thiếu trường: ${missing.join(', ')}` });
  }

  try {

    const product = await ProductModel.createProduct(payload, req.files);
    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tạo sản phẩm', error: error.message });
    console.log("không thể tạo sản phẩm " ,{error: error.message}) ;
  }
};

exports.updateProduct = async (req, res) => {
  let payload;
  try {
    payload = normalizeProductPayload(req.body);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  try {

    const updated = await ProductModel.updateProduct(req.params.id, payload, req.files);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await ProductModel.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa', error: error.message });
  }
};


exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock_quantity } = req.body;
        
        const updated = await ProductModel.updateStock(id, stock_quantity);
        
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' }); 
        }
        res.json({ success: true, data: updated });
        console.log(`🔄 Đang cập nhật tồn kho cho SP ${req.params.id}`); 
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.downloadProductImage = async (req, res) => {
  try {
    const product = await ProductModel.getProductById(req.params.id);
    if (!product || !product.images || product.images.length === 0) {
      return res.status(404).json({ message: 'Sản phẩm không có ảnh' });
    }

    const downloadFolder = path.join(__dirname, '..', 'downloads');
    if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder);

    const downloadPromises = product.images.map(async (image, index) => {
        try {
            const imageUrl = image.image_url;
            // Xử lý đuôi file
            const extension = path.extname(imageUrl).split('?')[0] || '.jpg';
            const filename = `product-${product.id}-img-${index + 1}${extension}`;
            const localFilePath = path.join(downloadFolder, filename);

            console.log(`Đang tải ảnh: ${imageUrl}`);
            const response = await axios({ method: 'GET', url: imageUrl, responseType: 'stream' });

            const writer = fs.createWriteStream(localFilePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(localFilePath));
                writer.on('error', reject);
            });
        } catch (err) {
            console.error('Lỗi tải 1 ảnh:', err.message);
            return null;
        }
    });

    const results = await Promise.all(downloadPromises);
    const savedPaths = results.filter(p => p !== null);

    res.json({ success: true, message: `Đã tải ${savedPaths.length} ảnh`, files: savedPaths });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tải ảnh', error: error.message });
  }
};
exports.getPrimaryImageBySku = async (req, res) => {
  try {
    const { sku } = req.params;

    if (!sku) {
      return res.status(400).json({
        success: false,
        message: 'Mã sản phẩm (SKU) là bắt buộc'
      });
    }

    const primaryImage = await ProductModel.getPrimaryImageBySku(sku.trim().toUpperCase());

    if (!primaryImage) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm hoặc sản phẩm chưa có ảnh đại diện'
      });
    }

    // Bạn có thể chọn trả về toàn bộ thông tin ảnh hoặc chỉ URL
    res.json({
      success: true,
      data: primaryImage
      // Nếu chỉ muốn URL đơn giản:
      // image_url: primaryImage.image_url
    });

  } catch (error) {
    console.error('Lỗi getPrimaryImageBySku:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};