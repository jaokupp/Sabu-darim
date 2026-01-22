const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    reward TEXT,
    used INTEGER DEFAULT 0,
    created_at TEXT,
    expires_at TEXT,
    used_at TEXT,
    used_by TEXT
  )`);

  const stmt = db.prepare(`INSERT OR IGNORE INTO coupons (code, reward, created_at, expires_at, used)
    VALUES (?, ?, datetime('now'), ?, 0)`);

  // ตัวอย่างโค้ด
  stmt.run('WELCOME2026', 'คูปองลด 10%', null);
  stmt.run('ONETIME-100', 'รับของขวัญฟรี (ใช้ครั้งเดียว)', null);
  stmt.finalize();
});

db.close();
console.log('DB initialized (database.sqlite)');
