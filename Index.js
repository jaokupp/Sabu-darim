require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
const path = require('path');
const db = require('./db');

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// public files
app.use('/', express.static(path.join(__dirname, 'public')));

// API: redeem
app.post('/api/redeem', async (req, res) => {
  const code = (req.body.code || '').trim();
  const user = (req.body.name || '').trim() || null;

  if (!code) return res.status(400).json({ ok: false, message: 'กรุณากรอกโค้ด' });

  try {
    const coupon = await db.getCoupon(code);
    if (!coupon) return res.json({ ok: false, message: 'โค้ดไม่ถูกต้อง' });

    if (coupon.used) return res.json({ ok: false, message: 'โค้ดถูกใช้แล้ว' });

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ ok: false, message: 'โค้ดหมดอายุ' });
    }

    // ทำเครื่องหมายว่าใช้แล้ว
    await db.markUsed(coupon.id, user);
    return res.json({ ok: true, message: 'สำเร็จ', reward: coupon.reward });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: 'เกิดข้อผิดพลาด' });
  }
});

// Admin protection
app.use(
  '/admin',
  basicAuth({
    users: { [ADMIN_USER]: ADMIN_PASS },
    challenge: true,
    realm: 'Admin Area'
  })
);

// Serve admin UI
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin API: create coupon
app.post('/admin/api/create', async (req, res) => {
  const { code, reward, expires_at } = req.body;
  if (!code || !reward) return res.status(400).json({ ok: false, message: 'code & reward required' });
  try {
    await db.createCoupon(code.trim(), reward.trim(), expires_at ? expires_at.trim() : null);
    res.json({ ok: true, message: 'สร้างโค้ดแล้ว' });
  } catch (err) {
    if (err && err.message && err.message.includes('UNIQUE')) {
      res.json({ ok: false, message: 'โค้ดซ้ำ (มีอยู่แล้ว)' });
    } else {
      console.error(err);
      res.status(500).json({ ok: false, message: 'error' });
    }
  }
});

// Admin API: list
app.get('/admin/api/list', async (req, res) => {
  try {
    const rows = await db.listCoupons();
    res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
