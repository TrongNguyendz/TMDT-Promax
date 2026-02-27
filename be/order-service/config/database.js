
const fs = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();  // Thêm dòng này
// hoặc nếu dùng Node mới hơn: const path = require('node:path');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const DB_PATH = path.join(dataDir, 'order_service.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('❌ Lỗi kết nối', err.message);
    else console.log('✅ Đã kết nối thành công đến database order_service.db');
});

// Wrapper Promise
const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err); else resolve({ lastID: this.lastID, changes: this.changes });
    });
});
const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
});
const all = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    // 1. ORDERS: Gộp địa chỉ vào để Snapshot
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        
        -- Snapshot Address (Lưu cứng)
        shipping_fullname TEXT,
        shipping_phone TEXT,
        shipping_address TEXT,
        shipping_city TEXT,
        
        -- Money
        total_amount REAL NOT NULL,
        shipping_fee REAL DEFAULT 0,
        final_amount REAL NOT NULL,
        
        -- Status
        status TEXT DEFAULT 'pending', 
        payment_method TEXT DEFAULT 'cod',
        payment_status TEXT DEFAULT 'unpaid',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. ITEMS: Lưu Snapshot sản phẩm (Tên, ảnh, giá lúc mua)
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        
        -- Snapshot Product Info
        product_name TEXT NOT NULL,
        product_image TEXT,
        unit_price REAL NOT NULL,
        color TEXT,
        size TEXT,
        
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`);

    // 3. Wishlist 
    db.run(`CREATE TABLE IF NOT EXISTS wishlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
    )`);


});

module.exports = { db, run, get, all };

