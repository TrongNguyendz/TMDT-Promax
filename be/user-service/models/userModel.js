const db = require('./db');

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

exports.sanitizeUser = sanitizeUser;

exports.findById = (id) => db.get('SELECT * FROM users WHERE id = ?', [id]);

exports.findByEmail = (email) => db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);

exports.findByUsername = (username) =>
  db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);

exports.listUsers = async (filters = {}) => {
  let sql = 'SELECT * FROM users WHERE 1 = 1';
  const params = [];

  if (filters.role) {
    sql += ' AND role = ?';
    params.push(filters.role);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    sql += ' AND (LOWER(full_name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const limit = Number(filters.limit) || 20;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const data = await db.all(sql, params);
  // THÊM DÒNG NÀY – QUAN TRỌNG NHẤT!
  const sanitizedData = data.map(user => sanitizeUser(user));
  const totalRow = await db.get(
    `SELECT COUNT(*) as total FROM users WHERE 1 = 1 ${
      filters.role ? ' AND role = ?' : ''
    }${filters.status ? ' AND status = ?' : ''}${
      filters.search ? ' AND (LOWER(full_name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))' : ''
    }`,
    (() => {
      const arr = [];
      if (filters.role) arr.push(filters.role);
      if (filters.status) arr.push(filters.status);
      if (filters.search) arr.push(`%${filters.search}%`, `%${filters.search}%`);
      return arr;
    })()
  );

  return {
    data : sanitizedData,
    pagination: {
      total: totalRow?.total || 0,
      page,
      limit,
      pages: Math.ceil((totalRow?.total || 0) / limit) || 1
    }
  };
};

exports.createUser = async (payload) => {
  const now = new Date().toISOString();

  const result = await db.run(
    `INSERT INTO users (username, email, password_hash, full_name, phone, avatar_url, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.username,
      payload.email,
      payload.password_hash,
      payload.full_name,
      payload.phone || null,
      payload.avatar_url || null,
      payload.role || 'customer',
      payload.status || 'active',
      now,
      now
    ]
  );

  return exports.findById(result.lastID);
};

exports.updateUser = async (id, payload) => {
  const fields = [];
  const params = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === 'undefined') return;
    fields.push(`${key} = ?`);
    params.push(value);
  });

  if (!fields.length) return exports.findById(id);

  fields.push('updated_at = ?');
  params.push(new Date().toISOString(), id);

  await db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return exports.findById(id);
};

exports.deleteUser = async (id) => {
  const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
  return result.changes > 0;
};

exports.updateRole = async (id, role) => {
  await db.run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [
    role,
    new Date().toISOString(),
    id
  ]);
  return exports.findById(id);
};

exports.updateAvatar = async (id, avatarUrl) => {
  await db.run('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?', [
    avatarUrl,
    new Date().toISOString(),
    id
  ]);
  return exports.findById(id);

};

// Thêm vào cuối file exports
exports.setTempPassword = async (userId, tempPassword, expiresInMinutes = 30) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
  
  await db.run(
    `UPDATE users SET temp_password = ?, temp_password_expires = ?, updated_at = ? WHERE id = ?`,
    [tempPassword, expiresAt, new Date().toISOString(), userId]
  );
  
  return exports.findById(userId);
};

exports.clearTempPassword = async (userId) => {
  await db.run(
    `UPDATE users SET temp_password = NULL, temp_password_expires = NULL, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), userId]
  );
};

exports.findByEmailWithTemp = (email) => db.get(
  'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
  [email]
);

