
// notification-service/models/notificationModel.js
const db = require('./db'); // Import các hàm đã bọc Promise từ db.js


const buildFilters = (filters = {}) => {
  let clause = 'WHERE 1 = 1';
  const params = [];

  if (filters.user_id) {
    clause += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.notification_type) {
    clause += ' AND notification_type = ?';
    params.push(filters.notification_type);
  }

  return { clause, params };
};

exports.listNotifications = async (filters = {}) => {
  const { clause, params } = buildFilters(filters);
  const limit = Number(filters.limit) || 20;
  const page = Number(filters.page) || 1;
  const offset = (page - 1) * limit;


  // Sử dụng trực tiếp await db.all (vì db.js đã bọc Promise)
  const rows = await db.all(
    `SELECT id, user_id, notification_type, email_user, created_at 
     FROM notifications ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );


  const totalRow = await db.get(
    `SELECT COUNT(*) as total FROM notifications ${clause}`,
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


exports.findById = (id) => {
  // Sử dụng await/return trực tiếp từ db.get
  return db.get(
    'SELECT id, user_id, notification_type, email_user, created_at FROM notifications WHERE id = ?',
    [id]
  );
};

exports.createNotification = async (payload) => {
  // result sẽ nhận giá trị { lastID, changes } từ resolve của db.run trong db.js
  const result = await db.run(
    `INSERT INTO notifications (user_id, notification_type, email_user)
     VALUES (?, ?, ?)`,
    [payload.user_id, payload.notification_type, payload.email_user]
  );

  // Lấy bản ghi vừa tạo bằng lastID
  return exports.findById(result.lastID);
};

exports.deleteNotification = async (id) => {
  const result = await db.run('DELETE FROM notifications WHERE id = ?', [id]);
  return result.changes > 0;
};

