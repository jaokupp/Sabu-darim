const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

module.exports = {
  getCoupon(code) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM coupons WHERE code = ?', [code], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  markUsed(id, used_by) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE coupons SET used = 1, used_at = datetime('now'), used_by = ? WHERE id = ?`,
        [used_by || null, id],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  createCoupon(code, reward, expires_at) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO coupons (code, reward, created_at, expires_at) VALUES (?, ?, datetime('now'), ?)`,
        [code, reward, expires_at || null],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  listCoupons() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM coupons ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
