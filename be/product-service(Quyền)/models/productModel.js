
const db = require('./db');
const slugify = require('../functions/slugify');
const cloudinary = require('../config/cloudinary'); 


// --- HELPERS ---

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug; let counter = 1;
  while (true) {
    const existing = await db.get(`SELECT id FROM products WHERE slug = ? ${excludeId ? 'AND id != ?' : ''}`, excludeId ? [slug, excludeId] : [slug]);
    if (!existing) return slug; slug = `${baseSlug}-${counter++}`;
  }
};

const buildFilters = (filters = {}) => {
  let clause = ''; const params = [];
  if (filters.categoryId) { clause += ' AND p.category_id = ?'; params.push(Number(filters.categoryId)); }
  // Tìm kiếm theo tên hoặc SKU
  if (filters.search) { 
      clause += ' AND (LOWER(p.name) LIKE LOWER(?) OR LOWER(p.sku) LIKE LOWER(?))'; 
      params.push(`%${filters.search}%`, `%${filters.search}%`); 
  }
  // Lọc giá
  if (filters.minPrice) { clause += ' AND p.price >= ?'; params.push(Number(filters.minPrice)); }
  if (filters.maxPrice) { clause += ' AND p.price <= ?'; params.push(Number(filters.maxPrice)); }
  
  return { clause, params };
};

const attachRelations = async (products) => {
  if (!products || products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const placeholders = ids.map(() => '?').join(', ');

  const [images, attributes] = await Promise.all([
    db.all(`SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`, ids),
    db.all(`SELECT * FROM product_attributes WHERE product_id IN (${placeholders})`, ids)
  ]);

  return products.map((product) => ({
    ...product,
    images: images.filter((img) => img.product_id === product.id),
    attributes: attributes.filter((attr) => attr.product_id === product.id)
  }));
};

const parseAttributes = (raw) => {
  if (!raw) return [];
  if (typeof raw === 'object' && !Array.isArray(raw)) return [];
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return []; }
};

// --- LOGIC ẢNH ---
const normalizeFileImages = (files = []) => files.map((file, index) => ({
    image_url: file.path, public_id: file.filename, alt_text: file.originalname, sort_order: index
}));
const normalizeBodyImages = (images) => {
    try { return typeof images === 'string' ? JSON.parse(images) : (images || []); } catch { return []; }
};

const deleteCloudinaryImages = async (imageRecords = []) => {
    const ids = imageRecords
        .map(i => i.public_id)
        .filter(Boolean);
    if (ids.length === 0) return;
    try {
        const result = await cloudinary.api.delete_resources(ids, {
            resource_type: 'image'
        });
        console.log('Đã xóa ảnh Cloudinary:', result.deleted);
    } catch (e) {
        console.warn('Không thể xóa một số ảnh trên Cloudinary (có thể đã xóa trước):', e.message);
        // Không throw → tiếp tục
    }
};

// --- MAIN FUNCTIONS ---


exports.listProducts = async (filters = {}) => {
  const { clause, params } = buildFilters(filters);
  const limit = Number(filters.limit) || 20;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;

  const rows = await db.all(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE 1 = 1 ${clause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const totalRow = await db.get(`SELECT COUNT(*) as total FROM products p WHERE 1 = 1 ${clause}`, params);

  const enriched = await attachRelations(rows);
  return {
    data: enriched,
    pagination: {
      total: totalRow?.total || 0,
      page,
      limit,
      pages: Math.ceil((totalRow?.total || 0) / limit) || 1
    }
  };
};

exports.getProductById = async (id) => {
  const row = await db.get(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );
  if (!row) return null;
  
  const [images, attributes] = await Promise.all([
    db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]),
    db.all('SELECT * FROM product_attributes WHERE product_id = ?', [id])
  ]);

  return { ...row, images, attributes };
};

// --- CREATE PRODUCT (ĐÃ SỬA: BỎ TRƯỜNG THỪA) ---

exports.createProduct = async (payload, files = []) => {
  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const now = new Date().toISOString();


  // Logic ảnh
  // const fileImages = normalizeFileImages(files);
  const fileImages = files
  .filter(file => file && file.path && file.filename)  // Chỉ lấy file upload THÀNH CÔNG
  .map((file, index) => ({
    image_url: file.path,
    public_id: file.filename,
    alt_text: file.originalname,
    sort_order: index
  }));
  console.log('Uploaded files from Cloudinary:', files.map(f => ({ 
  originalname: f.originalname, 
  path: f.path, 
  filename: f.filename,
  size: f.size 
})));

console.log('Số ảnh hợp lệ sẽ lưu:', fileImages.length);
  const bodyImages = normalizeBodyImages(payload.images);
  const mergedImages = [...bodyImages, ...fileImages];

  // Logic màu

  let imageColors = [];
  try { imageColors = JSON.parse(payload.image_colors || '[]'); } catch {}

  const attributes = parseAttributes(payload.attributes);

  await db.run('BEGIN TRANSACTION');
  try {

    const insert = await db.run(
      `INSERT INTO products 
        (sku, name, slug, description, category_id, price, stock_quantity, rating, review_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        payload.sku,
        payload.name,
        slug,
        payload.description,
        Number(payload.category_id),
        Number(payload.price),
        Number(payload.stock_quantity),
        now,
        now
      ]
    );

    const productId = insert.lastID;

    // Lưu ảnh
    for (let i = 0; i < mergedImages.length; i++) {
      const img = mergedImages[i];
      const color = imageColors[i] || null;
      await db.run(
        `INSERT INTO product_images (product_id, image_url, public_id, color, is_primary, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, img.image_url, img.public_id, color, i === 0 ? 1 : 0, i]
      );
    }

    // Lưu thuộc tính
    if (Array.isArray(attributes)) {
        for (const attr of attributes) {
            if (attr.attribute_name) {
                await db.run(
                    `INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                     VALUES (?, ?, ?)`,
                    [productId, attr.attribute_name, attr.attribute_value]
                );
            }
        }
    }

    await db.run('COMMIT');
    return exports.getProductById(productId);
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

// --- UPDATE PRODUCT (ĐÃ SỬA: BỎ TRƯỜNG THỪA) ---

exports.updateProduct = async (id, payload, files = []) => {
  const existing = await exports.getProductById(id);
  if (!existing) return null;

  const slug = await ensureUniqueSlug(slugify(payload.slug || payload.name || existing.name), id);
  const now = new Date().toISOString();

  // Logic ảnh
  // const fileImages = normalizeFileImages(files);
  const fileImages = files
  .filter(file => file && file.path && file.filename)  // Chỉ lấy file upload THÀNH CÔNG
  .map((file, index) => ({
    image_url: file.path,
    public_id: file.filename,
    alt_text: file.originalname,
    sort_order: index
  }));
  console.log('Uploaded files from Cloudinary:', files.map(f => ({ 
  originalname: f.originalname, 
  path: f.path, 
  filename: f.filename,
  size: f.size 
})));

console.log('Số ảnh hợp lệ sẽ lưu:', fileImages.length);
  const bodyImages = normalizeBodyImages(payload.images);
  const mergedImages = [...bodyImages, ...fileImages];
  


  let imageColors = [];
  try { imageColors = JSON.parse(payload.image_colors || '[]'); } catch {}

  const hasImageUpdate = files.length > 0 || payload.images !== undefined;

  await db.run('BEGIN TRANSACTION');
  try {

    // SỬA Ở ĐÂY: Bỏ update các trường thừa
    await db.run(
      `UPDATE products
       SET sku = ?, name = ?, slug = ?, description = ?, category_id = ?,
           price = ?, stock_quantity = ?, updated_at = ?
       WHERE id = ?`,
      [
        payload.sku || existing.sku,
        payload.name || existing.name,
        slug,
        payload.description ?? existing.description,
        Number(payload.category_id || existing.category_id),
        typeof payload.price !== 'undefined' ? Number(payload.price) : existing.price,
        typeof payload.stock_quantity !== 'undefined' ? Number(payload.stock_quantity) : existing.stock_quantity,
        now,
        id
      ]
    );


    if (hasImageUpdate) {
        const oldImages = await db.all('SELECT * FROM product_images WHERE product_id = ?', [id]);
        const newPublicIds = mergedImages.map(i => i.public_id).filter(Boolean);
        const toDelete = oldImages.filter(old => old.public_id && !newPublicIds.includes(old.public_id));
        if (toDelete.length) await deleteCloudinaryImages(toDelete);

        await db.run('DELETE FROM product_images WHERE product_id=?', [id]);
        for (let i = 0; i < mergedImages.length; i++) {
             const img = mergedImages[i];
             const color = imageColors[i] || null;
             await db.run(`INSERT INTO product_images (product_id, image_url, public_id, color, is_primary, sort_order) VALUES (?,?,?,?,?,?)`, 
             [id, img.image_url, img.public_id, color, i===0?1:0, i]);
        }
    }

    // Update attributes
    const attributes = parseAttributes(payload.attributes);

    if (payload.attributes) {
        await db.run('DELETE FROM product_attributes WHERE product_id = ?', [id]);
        if (Array.isArray(attributes)) {
            for (const attr of attributes) {
                if (attr.attribute_name) await db.run(`INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES (?,?,?)`, [id, attr.attribute_name, attr.attribute_value]);
            }

        }
    }

    await db.run('COMMIT');
    return exports.getProductById(id);

  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

exports.deleteProduct = async (id) => {
    // Logic xóa 
    const images = await db.all('SELECT * FROM product_images WHERE product_id = ?', [id]);
    await db.run('BEGIN TRANSACTION');
    try {
        const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
        if (result.changes > 0) await deleteCloudinaryImages(images);
        await db.run('COMMIT');
        return result.changes > 0;
    } catch (error) {
        await db.run('ROLLBACK');
        throw error;
    }
};


exports.updateStock = async (id, quantity) => {
    try {
        const sql = 'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        
        // 1. Thực hiện Update (Dùng await vì db.run trả về Promise)
        const result = await db.run(sql, [quantity, id]);

        // 2. Kiểm tra kết quả
        if (result.changes === 0) {
            return null; 
        }

        // 3. Trả về dữ liệu sản phẩm mới nhất sau khi update
        const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        return updatedProduct;

    } catch (error) {
        console.error("Lỗi Model updateStock:", error.message);
        throw error; 
    }
};
// Lấy ảnh đại diện (sort_order = 0) theo SKU sản phẩm
exports.getPrimaryImageBySku = async (sku) => {
  const image = await db.get(
    `SELECT pi.image_url, pi.public_id, pi.color, pi.alt_text, pi.is_primary, pi.sort_order
     FROM product_images pi
     INNER JOIN products p ON pi.product_id = p.id
     WHERE p.sku = ?
     ORDER BY pi.sort_order ASC
     LIMIT 1`,
    [sku]
  );
  return image || null;
};

// Optional: Lấy ID sản phẩm từ SKU (nếu cần dùng ở nơi khác)
exports.getProductIdBySku = async (sku) => {
  const row = await db.get('SELECT id FROM products WHERE sku = ?', [sku]);
  return row ? row.id : null;
};
