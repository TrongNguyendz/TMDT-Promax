const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname,'..','data', 'admin_service.db');

const db = new sqlite3.Database(DB_PATH,(err) => {
    if (err) {
        console.error('❌ không thể kết nối đến admin_service.db:',err.message);
        return;
    }
    console.log('✅ Đã kết nối đến admin_service.db');

    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;');
        // bỏ display_position khỏi bảng banners

        db.run(`
          CREATE TABLE IF NOT EXISTS banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            image_url TEXT NOT NULL,
            link TEXT,
            link_type TEXT DEFAULT 'none',  -- 'product', 'category', 'external', 'none'
            status TEXT DEFAULT 'active',    -- 'active', 'inactive',
            sort_order INTEGER DEFAULT 0,
            start_date DATE ,
            end_date DATE ,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_banners_display_position ON banners(display_position)`);

        
    })
})

module.exports = db;