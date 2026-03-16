const db = require('./db');

const buildFilters = (filters = {}) => {
  let clause = 'WHERE 1 = 1';
  const params = [];

  if (filters.status) {
    clause += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.display_position) {
    clause += ' AND display_position = ?';
    params.push(filters.display_position);
  }

  return { clause, params };
};

exports.listBanners = async (filters = {}) => {
  const { clause, params } = buildFilters(filters);
  const limit = Number(filters.limit) || 20;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;

  const rows = await db.all(
    `SELECT * FROM banners ${clause} ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const totalRow = await db.get(
    `SELECT COUNT(*) as total FROM banners ${clause}`,
    params
  );

  return {
    data: rows,
    pagination: {
      total: totalRow?.total || 0,
      page,
      limit,
      pages: Math.ceil((totalRow?.total || 0) / limit) || 1
    }
  };
};

exports.findById = (id) => db.get('SELECT * FROM banners WHERE id = ?', [id]);

exports.createBanner = async (payload) => {
  const now = new Date().toISOString();
  const result = await db.run(
    `INSERT INTO banners
      (title, description, image_url, link, link_type, status, display_position, sort_order, start_date, end_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.title || null,
      payload.description || null,
      payload.image_url,
      payload.link || null,
      payload.link_type || 'none',
      payload.status || 'active',
      payload.display_position || 'homepage_hero',
      Number(payload.sort_order) || 0,
      payload.start_date || null,
      payload.end_date || null,
      now,
      now
    ]
  );

  return exports.findById(result.lastID);
};

exports.updateBanner = async (id, payload) => {
  const existing = await exports.findById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fields = [];
  const params = [];

  if (typeof payload.title !== 'undefined') {
    fields.push('title = ?');
    params.push(payload.title);
  }
  if (typeof payload.description !== 'undefined') {
    fields.push('description = ?');
    params.push(payload.description);
  }
  if (typeof payload.image_url !== 'undefined') {
    fields.push('image_url = ?');
    params.push(payload.image_url);
  }
  if (typeof payload.link !== 'undefined') {
    fields.push('link = ?');
    params.push(payload.link);
  }
  if (typeof payload.link_type !== 'undefined') {
    fields.push('link_type = ?');
    params.push(payload.link_type);
  }
  if (typeof payload.status !== 'undefined') {
    fields.push('status = ?');
    params.push(payload.status);
  }
  if (typeof payload.display_position !== 'undefined') {
    fields.push('display_position = ?');
    params.push(payload.display_position);
  }
  if (typeof payload.sort_order !== 'undefined') {
    fields.push('sort_order = ?');
    params.push(Number(payload.sort_order));
  }
  if (typeof payload.start_date !== 'undefined') {
    fields.push('start_date = ?');
    params.push(payload.start_date || null);
  }
  if (typeof payload.end_date !== 'undefined') {
    fields.push('end_date = ?');
    params.push(payload.end_date || null);
  }

  if (fields.length === 0) return existing;

  fields.push('updated_at = ?');
  params.push(now, id);

  await db.run(
    `UPDATE banners SET ${fields.join(', ')} WHERE id = ?`,
    params
  );

  return exports.findById(id);
};

exports.deleteBanner = async (id) => {
  const result = await db.run('DELETE FROM banners WHERE id = ?', [id]);
  return result.changes > 0;
};
