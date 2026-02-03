const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'user_service.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Không thể kết nối user_service.db:', err.message);
    return;
  }

  console.log('✅ Đã kết nối user_service.db');

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'customer',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.all(`PRAGMA table_info(users)`, (err, columns) => {
      if (err) return console.error(err);

      const hasTempPassword = columns.some(c => c.name === 'temp_password');
      const hasTempPasswordExpires = columns.some(c => c.name === 'temp_password_expires');

      if (!hasTempPassword) {
        db.run(`ALTER TABLE users ADD COLUMN temp_password TEXT`);
        console.log('✅ Đã thêm cột temp_password');
      } else {
        console.log('ℹ️ Cột temp_password đã tồn tại, bỏ qua');
      }

      if (!hasTempPasswordExpires) {
        db.run(`ALTER TABLE users ADD COLUMN temp_password_expires INTEGER`);
        console.log('✅ Đã thêm cột temp_password_expires');
      } else {
        console.log('ℹ️ Cột temp_password_expires đã tồn tại, bỏ qua');
      }
    });

// bỏ qua bảng này 

// bỏ địa chỉ đi 


    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  });
});

module.exports = db;
