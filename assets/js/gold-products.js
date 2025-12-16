/**
 * Gold Products Data
 * แยกข้อมูลสินค้าทองคำไว้ในไฟล์แยก เพื่อง่ายต่อการแก้ไข
 *
 * multiplier: ค่าตัวคูณน้ำหนักทอง (บาททอง)
 * - 1 บาททอง = 15.2 กรัม
 * - 1 สลึง = 0.25 บาททอง = 3.8 กรัม
 * - ครึ่งสลึง = 0.125 บาททอง = 1.9 กรัม
 *
 * premium: ค่ากำเหน็จ (บาท)
 */

const GoldProducts = {
    // ราคาทองอ้างอิง (จะถูก update จาก API)
    baseGoldPrice: 64550, // ราคาทองแท่งขาย (บาทต่อบาททอง)

    // สินค้าทองคำแท่ง
    products: [
        {
            id: 'gold-0.1g',
            name: 'ทองคำแท่ง 0.1 กรัม',
            nameEn: 'Gold Bar 0.1 Gram',
            description: 'การ์ดมาตรฐาน',
            weight: '0.1 กรัม',
            multiplier: 0.006560, // 0.1 / 15.2444
            premium: 500,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/01-ausiris.png',
            link: 'https://express.ausiris.co.th/0-1-gram-gold/01gram-logo.html',
            popular: false
        },
        {
            id: 'gold-0.3g',
            name: 'ทองคำแท่ง 0.3 กรัม',
            nameEn: 'Gold Bar 0.3 Gram',
            description: 'การ์ดมาตรฐาน',
            weight: '0.3 กรัม',
            multiplier: 0.019679, // 0.3 / 15.2444
            premium: 400,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/03-ausiris.png',
            link: 'https://express.ausiris.co.th/0-3-gram-gold/03gram-logo.html',
            popular: false
        },
        {
            id: 'gold-0.6g',
            name: 'ทองคำแท่ง 0.6 กรัม',
            nameEn: 'Gold Bar 0.6 Gram',
            description: 'การ์ดมาตรฐาน',
            weight: '0.6 กรัม',
            multiplier: 0.039360, // 0.6 / 15.2444
            premium: 100,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/06-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/0-6-gram-gold/0-6gram-logo.html',
            popular: false
        },
        {
            id: 'gold-1g',
            name: 'ทองคำแท่ง 1 กรัม',
            nameEn: 'Gold Bar 1 Gram',
            description: 'การ์ดมาตรฐาน',
            weight: '1 กรัม',
            multiplier: 0.065599, // 1 / 15.2444
            premium: 150,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/1grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/gold1gram/1gram-default.html',
            popular: true
        },
        {
            id: 'gold-half-salung',
            name: 'ทองคำแท่ง ครึ่งสลึง',
            nameEn: 'Gold Bar Half Salung',
            description: 'การ์ดมาตรฐาน (1.9 กรัม)',
            weight: 'ครึ่งสลึง',
            multiplier: 0.125,
            premium: 200,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/0125grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/0125baht/0125baht-default.html',
            popular: true
        },
        {
            id: 'gold-1-salung',
            name: 'ทองคำแท่ง 1 สลึง',
            nameEn: 'Gold Bar 1 Salung',
            description: 'การ์ดมาตรฐาน (3.8 กรัม)',
            weight: '1 สลึง',
            multiplier: 0.25,
            premium: 150,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/025grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/025baht/025baht-default.html',
            popular: true
        },
        {
            id: 'gold-2-salung',
            name: 'ทองคำแท่ง 2 สลึง',
            nameEn: 'Gold Bar 2 Salung',
            description: 'การ์ดมาตรฐาน (7.6 กรัม)',
            weight: '2 สลึง',
            multiplier: 0.5,
            premium: 150,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/050grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/050baht.html',
            popular: false
        },
        {
            id: 'gold-1-baht',
            name: 'ทองคำแท่ง 1 บาท',
            nameEn: 'Gold Bar 1 Baht',
            description: 'การ์ดมาตรฐาน (15.2 กรัม)',
            weight: '1 บาท',
            multiplier: 1,
            premium: 150,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/1baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/1baht/1baht-default.html',
            popular: true
        },
        {
            id: 'gold-2-baht',
            name: 'ทองคำแท่ง 2 บาท',
            nameEn: 'Gold Bar 2 Baht',
            description: 'การ์ดมาตรฐาน (30.4 กรัม)',
            weight: '2 บาท',
            multiplier: 2,
            premium: 200,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/2baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/2baht/2baht-default.html',
            popular: false
        },
        {
            id: 'gold-3-baht',
            name: 'ทองคำแท่ง 3 บาท',
            nameEn: 'Gold Bar 3 Baht',
            description: 'การ์ดมาตรฐาน (45.6 กรัม)',
            weight: '3 บาท',
            multiplier: 3,
            premium: 200,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/3baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/3baht/3baht-default.html',
            popular: false
        },
        {
            id: 'gold-bar-5-baht',
            name: 'ทองคำแท่งหลอม ลายมาตรฐาน 5 บาท',
            nameEn: 'Cast Gold Bar 5 Baht',
            description: 'ทองคำแท่งหลอม (76 กรัม)',
            weight: '5 บาท',
            multiplier: 5,
            premium: 150,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/5baht-cast.html',
            popular: false
        },
        {
            id: 'gold-bar-10-baht',
            name: 'ทองคำแท่งหลอม ลายมาตรฐาน 10 บาท',
            nameEn: 'Cast Gold Bar 10 Baht',
            description: 'ทองคำแท่งหลอม (152 กรัม)',
            weight: '10 บาท',
            multiplier: 10,
            premium: 200,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/10baht-cast.html',
            popular: true
        },
        {
            id: 'gold-bar-20-baht',
            name: 'ทองคำแท่งหลอม ลายมาตรฐาน 20 บาท',
            nameEn: 'Cast Gold Bar 20 Baht',
            description: 'ทองคำแท่งหลอม (304 กรัม)',
            weight: '20 บาท',
            multiplier: 20,
            premium: 300,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/20baht-cast.html',
            popular: false
        },
        {
            id: 'gold-bar-50-baht',
            name: 'ทองคำแท่งหลอม ลายมาตรฐาน 50 บาท',
            nameEn: 'Cast Gold Bar 50 Baht',
            description: 'ทองคำแท่งหลอม (760 กรัม)',
            weight: '50 บาท',
            multiplier: 50,
            premium: 500,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/50baht-cast.html',
            popular: false
        },
        {
            id: 'gold-1kg',
            name: 'ทองคำแท่ง PAMP SWISS 1 กิโลกรัม',
            nameEn: 'PAMP SWISS Gold Bar 1 KG',
            description: 'ทองคำแท่ง PAMP SWISS (1000 กรัม)',
            weight: '1 กิโลกรัม',
            multiplier: 65.599,
            premium: 500,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/1kg/1kg-default.html',
            popular: false
        }
    ],

    /**
     * คำนวณราคาสินค้า
     * @param {Object} product - สินค้า
     * @param {number} goldPrice - ราคาทองแท่งขาย (บาทต่อบาททอง)
     * @returns {number} - ราคาสินค้า (บาท)
     */
    calculatePrice: function(product, goldPrice) {
        goldPrice = goldPrice || this.baseGoldPrice;
        return Math.round((product.multiplier * goldPrice) + product.premium);
    },

    /**
     * คำนวณราคาสินค้าทั้งหมดและเรียงตามราคา
     * @param {number} goldPrice - ราคาทองแท่งขาย
     * @returns {Array} - สินค้าพร้อมราคา
     */
    getProductsWithPrice: function(goldPrice) {
        goldPrice = goldPrice || this.baseGoldPrice;
        return this.products.map(product => ({
            ...product,
            price: this.calculatePrice(product, goldPrice)
        })).sort((a, b) => a.price - b.price);
    },

    /**
     * หาสินค้าที่เหมาะสมกับงบประมาณ
     * @param {number} budget - งบประมาณ (บาท)
     * @param {number} goldPrice - ราคาทองแท่งขาย
     * @returns {Array} - สินค้าที่ราคาไม่เกินงบประมาณ
     */
    getAffordableProducts: function(budget, goldPrice) {
        const productsWithPrice = this.getProductsWithPrice(goldPrice);
        return productsWithPrice.filter(p => p.price <= budget);
    },

    /**
     * หาสินค้าที่ใกล้เคียงงบประมาณที่สุด
     * @param {number} budget - งบประมาณ (บาท)
     * @param {number} goldPrice - ราคาทองแท่งขาย
     * @returns {Object|null} - สินค้าที่เหมาะสมที่สุด
     */
    getBestMatch: function(budget, goldPrice) {
        const affordable = this.getAffordableProducts(budget, goldPrice);
        if (affordable.length === 0) return null;
        return affordable[affordable.length - 1]; // สินค้าราคาสูงสุดที่ซื้อได้
    },

    /**
     * อัพเดตราคาทองอ้างอิง
     * @param {number} newPrice - ราคาทองใหม่
     */
    updateBasePrice: function(newPrice) {
        this.baseGoldPrice = newPrice;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoldProducts;
}
