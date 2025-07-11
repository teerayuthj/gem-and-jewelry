# Gold Price Component

คอมโพเนนต์แสดงราคาทองคำแบบเรียลไทม์ที่รองรับ 2 ภาษา (ไทย/อังกฤษ) และมีฟีเจอร์แสดง/ซ่อนราคาเพิ่มเติม

## ฟีเจอร์หลัก

- 🌐 รองรับ 2 ภาษา (ไทย/อังกฤษ)
- 📱 Responsive Design
- ⚡ แสดง/ซ่อนราคาเพิ่มเติมได้
- 🎨 Animation ที่ลื่นไหล
- 📊 ตัวบอกการเปลี่ยนแปลงราคา
- 🔄 อัปเดตราคาแบบเรียลไทม์
- 💎 Mock Data ครบถ้วน

## โครงสร้างไฟล์

```
assets/
├── css/
│   └── gold-price.css          # Styles สำหรับ component
├── js/
│   ├── gold-price-manager.js   # Main component logic
│   └── i18n.js                 # Language management (updated)
└── data/
    └── gold-translations.json  # Text translations

gold-price-demo.html           # Demo page
```

## การติดตั้งและใช้งาน

### 1. Include ไฟล์ที่จำเป็น

```html
<!-- CSS -->
<link rel="stylesheet" href="./assets/css/gold-price.css">

<!-- JavaScript -->
<script src="./assets/js/i18n.js"></script>
<script src="./assets/js/gold-price-manager.js"></script>
```

### 2. เพิ่ม HTML Container

```html
<div id="goldPriceContainer"></div>
```

### 3. Component จะ Auto-initialize

Component จะทำงานอัตโนมัติเมื่อ DOM โหลดเสร็จ

## การใช้งาน API

### อัปเดตราคา

```javascript
// อัปเดตราคาใหม่
goldPriceManager.updatePrices({
    visiblePrices: [
        {
            id: 'ausitis965',
            type: 'gold',
            buyPrice: 51500,
            sellPrice: null,
            change: +300,
            icon: '🥇'
        }
    ]
});
```

### เปลี่ยนภาษา

```javascript
// เปลี่ยนภาษาผ่าน i18n manager
i18n.switchLanguage();
```

## ข้อมูล Mock

Component มาพร้อมกับ Mock Data ตามภาพ:

### ราคาที่แสดงเริ่มต้น (3 รายการ)
1. **Ausitis 96.5%** - ราคา 51,300 บาท (+250)
2. **Ausitis 99.99%** - ราคา 53,067 บาท (+236)
3. **Spot Gold (USD/oz)** - ราคา $53,067 (+236)

### ราคาที่ซ่อนไว้ (4 รายการ)
1. **Ausitis 99.99% (KG)** - ราคา 53,067 บาท (+236)
2. **สวนจิตต์ 96.5%** - ราคา 53,067 บาท (+236)
3. **Silver (USD/oz)** - ราคา $53,067 (+236)
4. **Infinite (THB/กรัม)** - ราคา 53,067 บาท (+236)

## การแปลภาษา

### รูปแบบ Translations

```json
{
  "th": {
    "goldPrices": {
      "title": "ราคาทองคำ",
      "updateTime": "อัปเดตครั้งล่าสุด",
      "showMore": "แสดงเพิ่มเติม",
      "showLess": "แสดงน้อยลง"
    }
  }
}
```

## Responsive Design

- **Desktop**: แสดงเต็มขนาด
- **Tablet**: ปรับ padding และ font size
- **Mobile**: Responsive ครบถ้วน

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## ตัวอย่างการใช้งาน

ดูตัวอย่างได้ที่ `gold-price-demo.html` ซึ่งรวมถึง:

- การสลับภาษา
- การอัปเดตราคาแบบอัตโนมัติ (ทุก 30 วินาที)
- การแสดง/ซ่อนราคาเพิ่มเติม

## การ Customize

### เปลี่ยนสี Theme

แก้ไขใน `gold-price.css`:

```css
.gold-header-gradient {
    background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}
```

### เพิ่มประเภททองใหม่

แก้ไขใน `gold-translations.json`:

```json
"goldTypes": {
    "newGoldType": "ชื่อทองคำใหม่"
}
```

## Performance

- ⚡ Fast rendering
- 💾 Local storage สำหรับภาษา
- 🔄 Efficient DOM updates
- 📱 Mobile optimized

## License

MIT License - ใช้งานได้ฟรีในโปรเจ็คพาณิชย์

---

*สร้างโดย Claude สำหรับโปรเจ็ค new-gem-2025*