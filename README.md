# ระบบสั่งของภายในองค์กร

ระบบจัดการการสั่งซื้อสินค้าภายในองค์กร พัฒนาด้วย HTML, CSS, JavaScript และเชื่อมต่อกับ Google Sheets

## 🚀 วิธีการติดตั้ง

### 1. Setup Google Sheets & Apps Script
1. สร้าง Google Sheet ใหม่
2. ไปที่ Extensions > Apps Script
3. Copy code จาก `Code.gs` ที่ให้มา
4. แทนที่ `YOUR_SPREADSHEET_ID_HERE` ด้วย ID ของ Sheet
5. บันทึกและ Deploy เป็น Web app

### 2. ตั้งค่าระบบ
1. เปิดไฟล์ `js/config.js`
2. แทนที่ `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` ด้วย URL ที่ได้จาก Deploy
3. บันทึกไฟล์

### 3. เปิดใช้งาน
1. เปิดไฟล์ `index.html` ในเบราว์เซอร์
2. เลือกชื่อผู้ใช้เพื่อเข้าสู่ระบบ

## 📁 โครงสร้างไฟล์order-system/
├── index.html          # หน้าหลัก
├── css/
│   └── styles.css      # สไตล์ทั้งหมด
├── js/
│   ├── config.js       # การตั้งค่า
│   ├── app.js          # โมดูลหลัก
│   ├── auth.js         # ระบบ authentication
│   ├── orders.js       # จัดการคำสั่งซื้อ
│   ├── cart.js         # จัดการตะกร้า
│   └── admin.js        # แผงควบคุมผู้ดูแล
└── README.md           # คู่มือการใช้งาน
## 🔧 การปรับแต่ง

### เปลี่ยนสี Theme
แก้ไขใน `css/styles.css`:
```css
/* Primary colors */
--primary-color: #00d09c;
--primary-dark: #00b386;
