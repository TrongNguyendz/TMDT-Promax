const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'notification_service.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Không thể kết nối notification_service.db:', err.message);
    return;
  }

  console.log('✅ Đã kết nối notification_service.db');

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');

    // notify_type: order hoặc là quên mật khẩu

    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        notification_type TEXT NOT NULL,
        email_user TEXT NOT NULL, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type)`);

  });
});

module.exports = db;
