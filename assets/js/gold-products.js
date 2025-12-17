/**
 * Gold Products Data
 * ดึงข้อมูลสินค้าทองคำจาก API โดยตรง
 * ใช้ final_price, goldpricefilter_label, product_name, image_1
 */

const GoldProducts = {
    // ราคาทองอ้างอิง (จะถูก update จาก API)
    baseGoldPrice: 64550,

    // API endpoint
    apiEndpoint: 'http://localhost:2323/api/products',

    // Image base URL - format: /api/product-images/{product_id}/{filename}
    imageBaseUrl: 'http://localhost:2323/api/product-images/',

    // Flag บอกว่าโหลดจาก API แล้วหรือยัง
    isLoaded: false,

    // SKU ที่ต้องการใช้สำหรับแต่ละน้ำหนัก (ถ้ามี จะใช้ SKU นี้แทนการเลือกราคาต่ำสุด)
    preferredSKUs: {
        '0.3 กรัม': 'ABS9601-00300gRE-LO-ASTbluA',
        '0.6 กรัม': 'ABS9602-00600gRE-LO-ASTbluA'
    },

    // SKU ที่ต้อง exclude (สินค้าทดสอบ)
    excludeSKUPatterns: ['test', 'Test', 'TEST'],

    // Map goldpricefilter_label -> multiplier (บาททอง)
    // 1 บาททอง = 15.244 กรัม
    labelToMultiplier: {
        // กรัม
        '0.1 กรัม': 0.006560,      // 0.1 / 15.244
        '0.3 กรัม': 0.019679,      // 0.3 / 15.244
        '0.6 กรัม': 0.039360,      // 0.6 / 15.244
        '1 กรัม': 0.065599,        // 1 / 15.244
        '100 กรัม': 6.5599,        // 100 / 15.244

        // บาท (ตรงกับ API)
        '0.125 บาท': 0.125,        // ครึ่งสลึง
        '0.25 บาท': 0.25,          // 1 สลึง
        '0.5 บาท': 0.5,            // 2 สลึง
        '1 บาท': 1,
        '2 บาท': 2,
        '3 บาท': 3,
        '5 บาท': 5,
        '10 บาท': 10,
        '20 บาท': 20,
        '50 บาท': 50,

        // Alias (สำหรับ compatibility)
        '1 สลึง': 0.25,
        '2 สลึง': 0.5,
        'ครึ่งสลึง': 0.125,

        // อื่นๆ
        '1 ออนซ์': 2.1165,         // 31.104g / 15.244
        '1 กิโลกรัม': 65.599       // 1000g / 15.244
    },

    // สินค้าทองคำแท่ง (จะถูกสร้างจาก API)
    products: [],

    // Fallback products ถ้า API ไม่ทำงาน
    fallbackProducts: [
        {
            id: 'gold-0.1g',
            name: 'ทองคำแท่ง 0.1 กรัม',
            nameEn: 'Gold Bar 0.1 Gram',
            weight: '0.1 กรัม',
            multiplier: 0.006560,
            premium: 500,
            price: 924,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/01-ausiris.png',
            link: 'https://express.ausiris.co.th/0-1-gram-gold/01gram-logo.html',
            popular: false
        },
        {
            id: 'gold-0.3g',
            name: 'ทองคำแท่ง 0.3 กรัม',
            nameEn: 'Gold Bar 0.3 Gram',
            weight: '0.3 กรัม',
            multiplier: 0.019679,
            premium: 400,
            price: 1670,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/03-ausiris.png',
            link: 'https://express.ausiris.co.th/0-3-gram-gold/03gram-logo.html',
            popular: false
        },
        {
            id: 'gold-0.6g',
            name: 'ทองคำแท่ง 0.6 กรัม',
            nameEn: 'Gold Bar 0.6 Gram',
            weight: '0.6 กรัม',
            multiplier: 0.039360,
            premium: 100,
            price: 2641,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/06-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/0-6-gram-gold/0-6gram-logo.html',
            popular: false
        },
        {
            id: 'gold-1g',
            name: 'ทองคำแท่ง 1 กรัม',
            nameEn: 'Gold Bar 1 Gram',
            weight: '1 กรัม',
            multiplier: 0.065599,
            premium: 150,
            price: 4384,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/1grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/gold1gram/1gram-default.html',
            popular: true
        },
        {
            id: 'gold-half-salung',
            name: 'ทองคำแท่ง ครึ่งสลึง',
            nameEn: 'Gold Bar Half Salung',
            weight: '0.125 บาท',
            multiplier: 0.125,
            premium: 200,
            price: 8269,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/0125grams-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/0125baht/0125baht-default.html',
            popular: true
        },
        {
            id: 'gold-1-baht',
            name: 'ทองคำแท่ง 1 บาท',
            nameEn: 'Gold Bar 1 Baht',
            weight: '1 บาท',
            multiplier: 1,
            premium: 150,
            price: 64700,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/1baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/1baht/1baht-default.html',
            popular: true
        },
        {
            id: 'gold-bar-5-baht',
            name: 'ทองคำแท่ง 5 บาท',
            nameEn: 'Gold Bar 5 Baht',
            weight: '5 บาท',
            multiplier: 5,
            premium: 150,
            price: 322900,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/5baht-cast.html',
            popular: false
        },
        {
            id: 'gold-bar-10-baht',
            name: 'ทองคำแท่ง 10 บาท',
            nameEn: 'Gold Bar 10 Baht',
            weight: '10 บาท',
            multiplier: 10,
            premium: 200,
            price: 645700,
            image: 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/5baht-ausiris.jpeg',
            link: 'https://express.ausiris.co.th/cast-gold/10baht-cast.html',
            popular: true
        }
    ],

    /**
     * ดึงข้อมูลสินค้าจาก API และสร้าง products array ใหม่
     */
    fetchFromAPI: async function() {
        try {
            console.log('📦 กำลังดึงข้อมูลสินค้าจาก API...');
            const response = await fetch(this.apiEndpoint);
            const result = await response.json();

            if (!result.data || !Array.isArray(result.data)) {
                console.warn('⚠️ ไม่พบข้อมูลสินค้าจาก API, ใช้ fallback');
                this.products = [...this.fallbackProducts];
                this.isLoaded = true;
                return;
            }

            // ฟังก์ชันตรวจสอบว่า SKU เป็นสินค้าทดสอบหรือไม่
            const isTestProduct = (sku) => {
                if (!sku) return false;
                return this.excludeSKUPatterns.some(pattern =>
                    sku.toLowerCase().includes(pattern.toLowerCase())
                );
            };

            // Filter เฉพาะสินค้าทองแท่งที่มีราคา และไม่ใช่สินค้าทดสอบ
            const goldProducts = result.data.filter(item => {
                // ข้ามสินค้าทดสอบ
                if (isTestProduct(item.sku)) {
                    console.log(`   🚫 ข้ามสินค้าทดสอบ: ${item.product_name} (SKU: ${item.sku})`);
                    return false;
                }
                return item.final_price &&
                    item.type_label === 'ทองแท่ง' &&
                    item.status === 1;
            });

            console.log(`📊 พบสินค้าทองแท่ง ${goldProducts.length} รายการจาก API (หลัง exclude test)`);

            // สร้าง map ของสินค้าตาม SKU สำหรับค้นหา preferred SKU
            const productsBySKU = {};
            goldProducts.forEach(item => {
                if (item.sku) {
                    productsBySKU[item.sku] = item;
                }
            });

            // Group by goldpricefilter_label และเลือกสินค้า
            // ถ้ามี preferredSKU ให้ใช้ SKU นั้น ถ้าไม่มีให้เลือกราคาต่ำสุด
            const productsByWeight = {};
            goldProducts.forEach(item => {
                // สร้าง groupKey สำหรับจัดหมวดหมู่
                const groupKey = item.goldpricefilter_option_id != null
                    ? `gpf:${item.goldpricefilter_option_id}`
                    : item.goldpricefilter_label
                        ? `label:${item.goldpricefilter_label}`
                        : 'unknown';

                // ใช้ label สำหรับแสดงผล (fallback เป็น "ไม่ระบุ")
                const groupLabel = item.goldpricefilter_label ?? 'ไม่ระบุ';

                // ข้ามสินค้าที่ไม่มี label (ไม่รู้ขนาด)
                if (groupKey === 'unknown') {
                    console.log(`   ⏭️ ข้าม: ${item.product_name} (ไม่มีข้อมูลน้ำหนัก)`);
                    return;
                }

                // ตรวจสอบว่ามี preferred SKU สำหรับ label นี้หรือไม่
                const preferredSKU = this.preferredSKUs[groupLabel];
                const preferredProduct = preferredSKU ? productsBySKU[preferredSKU] : null;

                // ถ้ามี preferred SKU และตรงกับ item นี้ ให้ใช้เลย
                if (preferredProduct && item.sku === preferredSKU) {
                    productsByWeight[groupKey] = {
                        ...item,
                        groupKey,
                        groupLabel
                    };
                    console.log(`   ⭐ ใช้ preferred SKU: ${item.sku} สำหรับ ${groupLabel}`);
                    return;
                }

                // ถ้าไม่มี preferred หรือยังไม่ได้ set ให้เลือกราคาต่ำสุด (แต่ไม่ทับ preferred)
                if (!productsByWeight[groupKey]) {
                    // ถ้ามี preferred SKU แต่ยังไม่เจอ ให้รอก่อน
                    if (preferredProduct) {
                        return; // รอให้เจอ preferred SKU
                    }
                    productsByWeight[groupKey] = {
                        ...item,
                        groupKey,
                        groupLabel
                    };
                } else if (!preferredProduct && item.final_price < productsByWeight[groupKey].final_price) {
                    // อัพเดตเฉพาะเมื่อไม่มี preferred และราคาต่ำกว่า
                    productsByWeight[groupKey] = {
                        ...item,
                        groupKey,
                        groupLabel
                    };
                }
            });

            // ตรวจสอบว่ามี preferred SKU ที่ยังไม่ได้ใส่หรือไม่
            Object.entries(this.preferredSKUs).forEach(([label, sku]) => {
                const preferredProduct = productsBySKU[sku];
                if (preferredProduct) {
                    const groupKey = preferredProduct.goldpricefilter_option_id != null
                        ? `gpf:${preferredProduct.goldpricefilter_option_id}`
                        : `label:${label}`;

                    productsByWeight[groupKey] = {
                        ...preferredProduct,
                        groupKey,
                        groupLabel: label
                    };
                    console.log(`   ⭐ เพิ่ม preferred SKU: ${sku} สำหรับ ${label}`);
                } else {
                    console.warn(`   ⚠️ ไม่พบ preferred SKU: ${sku} สำหรับ ${label}`);
                }
            });

            // สร้าง products array จาก API data
            this.products = [];

            Object.entries(productsByWeight).forEach(([groupKey, item]) => {
                const weightLabel = item.groupLabel; // ใช้ groupLabel ที่เตรียมไว้
                const multiplier = this.labelToMultiplier[weightLabel];

                if (!multiplier) {
                    console.warn(`⚠️ ไม่พบ multiplier สำหรับ: ${weightLabel} (groupKey: ${groupKey})`);
                    return;
                }

                // สร้าง image URL - format: /api/product-images/{product_id}/{filename}
                const imageUrl = item.image_1
                    ? `${this.imageBaseUrl}${item.product_id}/${item.image_1}`
                    : 'http://www.ausiris.co.th/content/dam/ausirisgold/stamped-gold/01-ausiris.png';

                // สร้าง link ไปหน้าสินค้า
                const productLink = `https://express.ausiris.co.th/product/${item.sku || item.product_id}.html`;

                this.products.push({
                    id: `api-${item.product_id}`,
                    sku: item.sku,
                    name: item.product_name,
                    nameEn: item.product_name, // ใช้ชื่อเดียวกันถ้าไม่มี EN
                    weight: weightLabel,
                    weightGroupKey: groupKey,
                    multiplier: multiplier,
                    price: item.final_price,
                    apiPrice: item.final_price,
                    goldWeight: item.goldweight,
                    goldpricefilter_option_id: item.goldpricefilter_option_id,
                    image: imageUrl,
                    link: productLink,
                    popular: ['1 กรัม', '0.125 บาท', '1 บาท', '10 บาท'].includes(weightLabel)
                });

                console.log(`   ✅ [${weightLabel}] ${item.product_name}: ${item.final_price.toLocaleString()} บาท`);
            });

            // เรียงตามราคา
            this.products.sort((a, b) => a.price - b.price);

            console.log(`✨ โหลดสินค้าจาก API สำเร็จ ${this.products.length} รายการ`);
            console.log('💰 รายการสินค้า:');
            this.products.forEach(p => {
                console.log(`   ${p.weight}: ${p.name} - ${p.price.toLocaleString()} บาท`);
            });

            this.isLoaded = true;

        } catch (error) {
            console.error('❌ Error fetching products from API:', error);
            console.log('⚠️ ใช้ fallback products');
            this.products = [...this.fallbackProducts];
            this.isLoaded = true;
        }
    },

    /**
     * คำนวณราคาสินค้า - ใช้ราคาจาก API โดยตรง
     */
    calculatePrice: function(product, goldPrice) {
        // ใช้ราคาจาก API หรือ price ที่มีอยู่
        if (product.apiPrice && product.apiPrice > 0) {
            return product.apiPrice;
        }
        if (product.price && product.price > 0) {
            return product.price;
        }
        // Fallback: คำนวณจาก goldPrice
        goldPrice = goldPrice || this.baseGoldPrice;
        const premium = product.premium || 0;
        return Math.round((product.multiplier * goldPrice) + premium);
    },

    /**
     * คำนวณราคาสินค้าทั้งหมดและเรียงตามราคา
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
     */
    getAffordableProducts: function(budget, goldPrice) {
        const productsWithPrice = this.getProductsWithPrice(goldPrice);
        return productsWithPrice.filter(p => p.price <= budget);
    },

    /**
     * หาสินค้าที่ใกล้เคียงงบประมาณที่สุด
     */
    getBestMatch: function(budget, goldPrice) {
        const affordable = this.getAffordableProducts(budget, goldPrice);
        if (affordable.length === 0) return null;
        return affordable[affordable.length - 1];
    },

    /**
     * อัพเดตราคาทองอ้างอิง
     */
    updateBasePrice: function(newPrice) {
        this.baseGoldPrice = newPrice;
    },

    /**
     * Initialize - ดึงข้อมูลจาก API
     */
    init: async function() {
        await this.fetchFromAPI();
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoldProducts;
}
