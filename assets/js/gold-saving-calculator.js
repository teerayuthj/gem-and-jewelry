/**
 * Gold Saving Calculator
 * ระบบคำนวณการออมทองกับออสิริส
 */

class GoldSavingCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLang = 'th';

        // ค่าเริ่มต้น
        this.minAmount = 1000;
        this.maxAmount = 100000;
        this.defaultAmount = 5000;
        this.monthlyAmount = this.defaultAmount;
        this.months = 6;

        // Preset เดือน
        this.presetMonths = [3, 6, 12, 24];

        // ราคาทอง (จะดึงจาก API หรือใช้ค่าเริ่มต้น)
        this.goldPrice = GoldProducts.baseGoldPrice;

        // Translations
        this.translations = {
            th: {
                title: 'คำนวณการออมทอง',
                subtitle: 'วางแผนการออมทองกับออสิริส เพื่ออนาคตที่มั่นคง',
                monthlyLabel: 'จำนวนเงินออมต่อเดือน',
                monthsLabel: 'ระยะเวลาออม',
                monthUnit: 'เดือน',
                customMonths: 'กำหนดเอง',
                totalSaving: 'ยอดรวมเงินออม',
                baht: 'บาท',
                recommendTitle: 'ทองแท่งที่คุณจะได้รับ',
                noProduct: 'ออมเพิ่มอีกนิด เพื่อเป็นเจ้าของทองคำแท่ง',
                buyNow: 'ดูรายละเอียด',
                canBuy: 'ซื้อได้ทันที',
                needMore: 'ต้องออมเพิ่ม',
                goldPrice: 'ราคาทองวันนี้',
                perBaht: 'บาท/บาททอง',
                benefit1: 'ทองคำรักษามูลค่าดีกว่าเงินสด',
                benefit2: 'ออมทุกเดือน สร้างวินัยทางการเงิน',
                benefit3: 'เป็นเจ้าของทองคำแท่งได้ง่ายๆ',
                almostThere: 'อีกนิดเดียว!',
                savingTip: 'ลองเพิ่มจำนวนเงินหรือระยะเวลาออม'
            },
            en: {
                title: 'Gold Saving Calculator',
                subtitle: 'Plan your gold savings with Ausiris for a secure future',
                monthlyLabel: 'Monthly Saving Amount',
                monthsLabel: 'Saving Duration',
                monthUnit: 'months',
                customMonths: 'Custom',
                totalSaving: 'Total Savings',
                baht: 'THB',
                recommendTitle: 'Gold Bars You Will Receive',
                noProduct: 'Save a little more to own gold bars',
                buyNow: 'View Details',
                canBuy: 'Buy Now',
                needMore: 'Need More',
                goldPrice: "Today's Gold Price",
                perBaht: 'THB/Baht Gold',
                benefit1: 'Gold preserves value better than cash',
                benefit2: 'Monthly savings build financial discipline',
                benefit3: 'Own gold bars easily',
                almostThere: 'Almost there!',
                savingTip: 'Try increasing amount or duration'
            },
            cn: {
                title: '黄金储蓄计算器',
                subtitle: '与Ausiris一起规划黄金储蓄，保障未来',
                monthlyLabel: '每月储蓄金额',
                monthsLabel: '储蓄期限',
                monthUnit: '个月',
                customMonths: '自定义',
                totalSaving: '总储蓄额',
                baht: '泰铢',
                recommendTitle: '您将获得的金条',
                noProduct: '再多存一点就能拥有金条',
                buyNow: '查看详情',
                canBuy: '立即购买',
                needMore: '还需要',
                goldPrice: '今日金价',
                perBaht: '泰铢/泰铢黄金',
                benefit1: '黄金比现金更保值',
                benefit2: '每月储蓄培养财务纪律',
                benefit3: '轻松拥有金条',
                almostThere: '快要达到了！',
                savingTip: '尝试增加金额或期限'
            }
        };

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateCalculation();
        this.fetchGoldPrice();
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    formatNumber(num) {
        return num.toLocaleString('th-TH');
    }

    render() {
        this.container.innerHTML = `
            <div class="gold-saving-wrapper">
                <!-- Header -->
                <div class="saving-header">
                    <h1 class="saving-title">${this.t('title')}</h1>
                    <p class="saving-subtitle">${this.t('subtitle')}</p>
                    <div class="gold-price-badge">
                        <i class="fas fa-coins"></i>
                        <span>${this.t('goldPrice')}: <strong id="currentGoldPrice">${this.formatNumber(this.goldPrice)}</strong> ${this.t('perBaht')}</span>
                    </div>
                </div>

                <!-- Calculator Panel -->
                <div class="calculator-panel">
                    <div class="calculator-grid">
                        <!-- Left Column: Inputs -->
                        <div class="calculator-left">
                            <!-- Monthly Amount -->
                            <div class="input-group">
                                <label class="input-label">
                                    <i class="fas fa-wallet"></i>
                                    ${this.t('monthlyLabel')}
                                </label>
                                <div class="amount-input-wrapper">
                                    <input type="text"
                                           id="monthlyAmountInput"
                                           class="amount-input"
                                           value="${this.formatNumber(this.monthlyAmount)}"
                                           inputmode="numeric">
                                    <span class="amount-suffix">${this.t('baht')}</span>
                                </div>
                                <input type="range"
                                       id="amountSlider"
                                       class="amount-slider"
                                       min="${this.minAmount}"
                                       max="${this.maxAmount}"
                                       step="500"
                                       value="${this.monthlyAmount}">
                                <div class="slider-labels">
                                    <span>${this.formatNumber(this.minAmount)}</span>
                                    <span>${this.formatNumber(this.maxAmount)}</span>
                                </div>
                            </div>

                            <!-- Months Selection -->
                            <div class="input-group">
                                <label class="input-label">
                                    <i class="fas fa-calendar-alt"></i>
                                    ${this.t('monthsLabel')}
                                </label>
                                <div class="months-buttons">
                                    ${this.presetMonths.map(m => `
                                        <button class="month-btn ${m === this.months ? 'active' : ''}"
                                                data-months="${m}">
                                            ${m} ${this.t('monthUnit')}
                                        </button>
                                    `).join('')}
                                    <button class="month-btn custom-btn" data-months="custom">
                                        ${this.t('customMonths')}
                                    </button>
                                </div>
                                <div class="custom-months-input" id="customMonthsWrapper" style="display: none;">
                                    <input type="number"
                                           id="customMonthsInput"
                                           class="custom-input"
                                           min="1"
                                           max="120"
                                           value="${this.months}"
                                           placeholder="1-120">
                                    <span class="amount-suffix">${this.t('monthUnit')}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Total & Info -->
                        <div class="calculator-right">
                            <!-- Total Display -->
                            <div class="total-display">
                                <div class="total-label">${this.t('totalSaving')}</div>
                                <div class="total-amount">
                                    <span id="totalAmount">${this.formatNumber(this.monthlyAmount * this.months)}</span>
                                    <span class="total-currency">${this.t('baht')}</span>
                                </div>
                                <div class="saving-formula">
                                    <span id="formulaDisplay">${this.formatNumber(this.monthlyAmount)} x ${this.months} ${this.t('monthUnit')}</span>
                                </div>
                            </div>

                            <!-- Info Cards -->
                            <div class="info-cards">
                                <div class="info-card">
                                    <div class="info-icon">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <div class="info-content">
                                        <div class="info-label">${this.t('goldPrice')}</div>
                                        <div class="info-value" id="infoGoldPrice">${this.formatNumber(this.goldPrice)}</div>
                                    </div>
                                </div>
                                <div class="info-card">
                                    <div class="info-icon">
                                        <i class="fas fa-coins"></i>
                                    </div>
                                    <div class="info-content">
                                        <div class="info-label">${this.currentLang === 'th' ? 'รายเดือน' : 'Monthly'}</div>
                                        <div class="info-value" id="infoMonthly">${this.formatNumber(this.monthlyAmount)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Benefits -->
                <div class="benefits-row">
                    <div class="benefit-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>${this.t('benefit1')}</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-piggy-bank"></i>
                        <span>${this.t('benefit2')}</span>
                    </div>
                    <div class="benefit-item">
                        <i class="fas fa-gem"></i>
                        <span>${this.t('benefit3')}</span>
                    </div>
                </div>

                <!-- Product Recommendations -->
                <div class="recommend-section">
                    <h2 class="recommend-title">
                        <i class="fas fa-star"></i>
                        ${this.t('recommendTitle')}
                    </h2>
                    <div class="products-grid" id="productsGrid">
                        <!-- Products will be rendered here -->
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Amount slider
        const slider = document.getElementById('amountSlider');
        const amountInput = document.getElementById('monthlyAmountInput');

        slider.addEventListener('input', (e) => {
            this.monthlyAmount = parseInt(e.target.value);
            amountInput.value = this.formatNumber(this.monthlyAmount);
            this.updateCalculation();
        });

        // Amount input
        amountInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value.replace(/,/g, '')) || this.minAmount;
            this.monthlyAmount = Math.max(this.minAmount, Math.min(this.maxAmount, value));
            slider.value = this.monthlyAmount;
        });

        amountInput.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value.replace(/,/g, '')) || this.minAmount;
            this.monthlyAmount = Math.max(this.minAmount, Math.min(this.maxAmount, value));
            amountInput.value = this.formatNumber(this.monthlyAmount);
            slider.value = this.monthlyAmount;
            this.updateCalculation();
        });

        amountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                amountInput.blur();
            }
        });

        // Month buttons
        const monthBtns = document.querySelectorAll('.month-btn');
        const customWrapper = document.getElementById('customMonthsWrapper');
        const customInput = document.getElementById('customMonthsInput');

        monthBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                monthBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const monthValue = btn.dataset.months;
                if (monthValue === 'custom') {
                    customWrapper.style.display = 'flex';
                    customInput.focus();
                } else {
                    customWrapper.style.display = 'none';
                    this.months = parseInt(monthValue);
                    this.updateCalculation();
                }
            });
        });

        // Custom months input
        customInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 1;
            this.months = Math.max(1, Math.min(120, value));
        });

        customInput.addEventListener('blur', () => {
            this.updateCalculation();
        });

        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customInput.blur();
            }
        });
    }

    updateCalculation() {
        const total = this.monthlyAmount * this.months;

        // Update total display
        document.getElementById('totalAmount').textContent = this.formatNumber(total);
        document.getElementById('formulaDisplay').textContent =
            `${this.formatNumber(this.monthlyAmount)} x ${this.months} ${this.t('monthUnit')}`;

        // Update info cards
        const infoMonthly = document.getElementById('infoMonthly');
        if (infoMonthly) {
            infoMonthly.textContent = this.formatNumber(this.monthlyAmount);
        }

        // Update products
        this.renderProducts(total);
    }

    renderProducts(budget) {
        const grid = document.getElementById('productsGrid');
        const allProducts = GoldProducts.getProductsWithPrice(this.goldPrice);
        const affordableIds = new Set(
            GoldProducts.getAffordableProducts(budget, this.goldPrice).map(p => p.id)
        );

        // แสดงสินค้าทั้งหมด โดยสินค้าที่ซื้อได้จะเน้น
        let html = '';

        allProducts.forEach(product => {
            const canAfford = affordableIds.has(product.id);
            const difference = product.price - budget;

            html += `
                <div class="product-card ${canAfford ? 'affordable' : 'not-affordable'}">
                    ${canAfford ? `<div class="can-buy-badge"><i class="fas fa-check"></i> ${this.t('canBuy')}</div>` : ''}
                    ${!canAfford && difference <= budget * 0.3 ?
                        `<div class="almost-badge"><i class="fas fa-clock"></i> ${this.t('almostThere')}</div>` : ''}

                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
                    </div>

                    <div class="product-info">
                        <h3 class="product-name">${this.currentLang === 'en' ? product.nameEn : product.name}</h3>
                        <p class="product-weight">${product.weight}</p>
                        <p class="product-price">${this.formatNumber(product.price)} ${this.t('baht')}</p>

                        ${!canAfford ? `
                            <p class="need-more">
                                ${this.t('needMore')}: +${this.formatNumber(difference)} ${this.t('baht')}
                            </p>
                        ` : ''}
                    </div>

                    <a href="${product.link}" target="_blank" class="product-btn ${canAfford ? '' : 'disabled'}">
                        ${this.t('buyNow')}
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
        });

        // ถ้าไม่มีสินค้าที่ซื้อได้เลย
        if (affordableIds.size === 0) {
            const cheapest = allProducts[0];
            const needMore = cheapest.price - budget;
            html = `
                <div class="no-product-message">
                    <i class="fas fa-coins"></i>
                    <p>${this.t('noProduct')}</p>
                    <p class="tip">${this.t('savingTip')}</p>
                    <p class="need-amount">ต้องการอีก <strong>${this.formatNumber(needMore)}</strong> บาท<br>
                    เพื่อซื้อ ${cheapest.name}</p>
                </div>
            ` + html;
        }

        grid.innerHTML = html;
    }

    async fetchGoldPrice() {
        try {
            // ลองดึงราคาทองจาก SharedPriceManager ถ้ามี
            if (typeof SharedPriceManager !== 'undefined') {
                const price = await SharedPriceManager.getPrice();
                if (price && price.sellBar) {
                    this.goldPrice = price.sellBar;
                    GoldProducts.updateBasePrice(this.goldPrice);
                    document.getElementById('currentGoldPrice').textContent =
                        this.formatNumber(this.goldPrice);
                    this.updateCalculation();
                }
            }
        } catch (error) {
            console.log('Using default gold price:', this.goldPrice);
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.render();
            this.bindEvents();
            this.updateCalculation();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoldSavingCalculator;
}
