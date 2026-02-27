const db = require('./db');
const slugify = require('../functions/slugify');


// Hàm tạo slug duy nhất (Giữ nguyên)
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.get(
      `SELECT id FROM categories WHERE slug = ? ${excludeId ? 'AND id != ?' : ''}`,
      excludeId ? [slug, excludeId] : [slug]
    );
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
};

exports.listCategories = () => db.all(`

  SELECT * FROM categories ORDER BY name ASC

`);

exports.getCategoryById = (id) => db.get('SELECT * FROM categories WHERE id = ?', [id]);

exports.createCategory = async (payload) => {
  const baseSlug = slugify(payload.slug || payload.name);
  const slug = await ensureUniqueSlug(baseSlug);
  const now = new Date().toISOString();


  const result = await db.run(
    `INSERT INTO categories (name, slug, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,

    [
      payload.name,
      slug,
      payload.description || null,
      now,
      now
    ]
  );

  return exports.getCategoryById(result.lastID);
};


exports.updateCategory = async (id, payload) => {
  const existing = await exports.getCategoryById(id);
  if (!existing) return null;

  let slug = existing.slug;
  if (payload.name || payload.slug) {
    const baseSlug = slugify(payload.slug || payload.name || existing.name);
    slug = await ensureUniqueSlug(baseSlug, id);
  }

  const now = new Date().toISOString();


  // Bỏ các trường thừa ra khỏi câu lệnh UPDATE
  await db.run(
    `UPDATE categories
     SET name = ?, slug = ?, description = ?, updated_at = ?
     WHERE id = ?`,
    [
      payload.name || existing.name,
      slug,
      payload.description ?? existing.description,
      now,
      id
    ]
  );

  return exports.getCategoryById(id);
};

exports.deleteCategory = async (id) => {

  // 1. Kiểm tra xem có sản phẩm nào thuộc danh mục này không
  const check = await db.get(
    'SELECT COUNT(*) as total FROM products WHERE category_id = ?', 
    [id]
  );


  if (check && check.total > 0) {
    throw new Error('HAS_PRODUCTS'); 
  }

  const result = await db.run('DELETE FROM categories WHERE id = ?', [id]);
  return result.changes > 0;
};

