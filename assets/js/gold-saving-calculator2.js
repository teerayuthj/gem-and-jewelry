/**
 * Gold Saving Calculator 2
 * ระบบคำนวณการออมทองกับออสิริส - Version 2 พร้อมราคาเฉลี่ยถ่วงน้ำหนักย้อนหลัง
 */

class GoldSavingCalculator2 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLang = 'th';

        // ค่าเริ่มต้น
        this.minAmount = 1000;
        this.maxAmount = 100000;
        this.defaultAmount = 5000;
        this.monthlyAmount = this.defaultAmount;
        this.months = 6;

        // Quick amounts
        this.quickAmounts = [1000, 3000, 5000, 10000, 20000, 50000];

        // Preset เดือน
        this.presetMonths = [3, 6, 12, 24];

        // ราคาทอง (จะดึงจาก API หรือใช้ค่าเริ่มต้น)
        this.currentGoldPrice = GoldProducts.baseGoldPrice;

        // ราคาทองสิ้นเดือนย้อนหลัง
        this.endOfMonthPrices = [];
        this.weightedAvgPrice = 0;
        this.lastDcaAvgPrice = 0;

        // Debug mode
        this.debugMode = true;

        // Translations
        this.translations = {
            th: {
                title: 'ออมทอง สร้างอนาคต',
                subtitle: 'คำนวณว่าออมทองกี่เดือน จะได้ทองแท่งเท่าไร',
                monthlyLabel: 'เงินออมต่อเดือน',
                monthsLabel: 'ระยะเวลาออม',
                monthUnit: 'เดือน',
                customMonths: 'กำหนดเอง',
                totalSaving: 'ยอดรวมที่ออมได้',
                baht: 'บาท',
                recommendTitle: 'เป้าหมายทองคำแท่ง',
                noProduct: 'ออมเพิ่มอีกนิด เพื่อเป็นเจ้าของทองคำแท่ง',
                buyNow: 'ดูรายละเอียด',
                canBuy: 'ออมถึงแล้ว!',
                needMore: 'ต้องออมเพิ่ม',
                goldPrice: 'ราคาทองวันนี้',
                avgPrice: 'ต้นทุนเฉลี่ย',
                perBaht: 'บาท/บาททอง',
                costByWeight: 'ต้นทุนตามน้ำหนัก',
                benefit1: 'ทองคำรักษามูลค่าดีกว่าเงินสด',
                benefit2: 'ออมทุกเดือน สร้างวินัยทางการเงิน',
                benefit3: 'เป็นเจ้าของทองคำแท่งได้ง่ายๆ',
                almostThere: 'อีกนิดเดียว!',
                savingTip: 'ลองเพิ่มจำนวนเงินหรือระยะเวลาออม',
                goldWeight: 'น้ำหนักทองโดยประมาณ',
                bahtGold: 'บาททอง',
                historicalPrices: 'ราคาทองย้อนหลัง (สิ้นเดือน)',
                weightedAvg: 'ราคาเฉลี่ยถ่วงน้ำหนัก',
                disclaimer: 'ราคาทองอ้างอิงจากราคาตลาด อาจมีการเปลี่ยนแปลงได้ ผลการคำนวณเป็นเพียงการประมาณการ'
            },
            en: {
                title: 'Save Gold, Build Future',
                subtitle: 'Calculate how much gold you can own by saving monthly',
                monthlyLabel: 'Monthly Saving',
                monthsLabel: 'Duration',
                monthUnit: 'months',
                customMonths: 'Custom',
                totalSaving: 'Total Savings',
                baht: 'THB',
                recommendTitle: 'Gold Bar Goals',
                noProduct: 'Save a little more to own gold bars',
                buyNow: 'View Details',
                canBuy: 'Goal Reached!',
                needMore: 'Need More',
                goldPrice: "Today's Price",
                avgPrice: 'Avg Cost',
                perBaht: 'THB/Baht Gold',
                costByWeight: 'Cost for your weight',
                benefit1: 'Gold preserves value better than cash',
                benefit2: 'Monthly savings build financial discipline',
                benefit3: 'Own gold bars easily',
                almostThere: 'Almost there!',
                savingTip: 'Try increasing amount or duration',
                goldWeight: 'Estimated Gold Weight',
                bahtGold: 'Baht Gold',
                historicalPrices: 'Historical Prices (End of Month)',
                weightedAvg: 'Weighted Average Price',
                disclaimer: 'Gold prices are based on market rates and may change. Calculations are estimates only.'
            },
            cn: {
                title: '储蓄黄金，创造未来',
                subtitle: '计算每月储蓄可获得多少黄金',
                monthlyLabel: '每月储蓄',
                monthsLabel: '储蓄期限',
                monthUnit: '个月',
                customMonths: '自定义',
                totalSaving: '总储蓄额',
                baht: '泰铢',
                recommendTitle: '金条目标',
                noProduct: '再多存一点就能拥有金条',
                buyNow: '查看详情',
                canBuy: '达到目标!',
                needMore: '还需要',
                goldPrice: '今日金价',
                avgPrice: '平均成本',
                perBaht: '泰铢/泰铢黄金',
                costByWeight: '按重量成本',
                benefit1: '黄金比现金更保值',
                benefit2: '每月储蓄培养财务纪律',
                benefit3: '轻松拥有金条',
                almostThere: '快要达到了!',
                savingTip: '尝试增加金额或期限',
                goldWeight: '预计黄金重量',
                bahtGold: '泰铢黄金',
                historicalPrices: '历史价格（月末）',
                weightedAvg: '加权平均价格',
                disclaimer: '金价基于市场行情，可能会有变化。计算结果仅供参考。'
            }
        };

        this.init();
    }

    async init() {
        await this.fetchEndOfMonthPrices();
        this.render();
        this.bindEvents();
        this.updateCalculation();
        this.fetchCurrentGoldPrice();
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    formatNumber(num) {
        return num.toLocaleString('th-TH');
    }

    /**
     * ดึงราคาทองสิ้นเดือนย้อนหลัง
     */
    async fetchEndOfMonthPrices() {
        try {
            const response = await fetch('http://27.254.3.14:8000/api/datagraph');
            const text = await response.text();
            const lines = text.trim().split('\n');

            // Parse all data
            const allData = lines.map(line => {
                const parts = line.split(',');
                return {
                    date: parts[0],
                    time: parts[1],
                    sellBar: parseInt(parts[2]),
                    buyBar: parseInt(parts[3]),
                    sellNecklace: parseInt(parts[4]),
                    buyNecklace: parseInt(parts[5])
                };
            });

            // หาวันสุดท้ายของแต่ละเดือน
            const monthlyPrices = {};

            allData.forEach(item => {
                const date = new Date(item.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                // เก็บเฉพาะวันสุดท้ายของเดือน
                if (!monthlyPrices[monthKey] || new Date(item.date) > new Date(monthlyPrices[monthKey].date)) {
                    monthlyPrices[monthKey] = item;
                }
            });

            // แปลงเป็น array และเรียงจากเก่าไปใหม่
            this.endOfMonthPrices = Object.values(monthlyPrices)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            // Debug: console.log ราคาทุกสิ้นเดือน
            if (this.debugMode) {
                console.log('=== ราคาทองสิ้นเดือนย้อนหลัง ===');
                this.endOfMonthPrices.forEach(item => {
                    console.log(`วันที่: ${item.date}, ราคาขายแท่ง: ${this.formatNumber(item.sellBar)} บาท`);
                });
                console.log('================================');
            }

            // คำนวณราคาเฉลี่ยถ่วงน้ำหนัก
            this.calculateWeightedAverage();

        } catch (error) {
            console.error('Error fetching end of month prices:', error);
            this.endOfMonthPrices = [];
        }
    }

    /**
     * คำนวณราคาเฉลี่ยถ่วงน้ำหนัก (ให้น้ำหนักมากกว่ากับเดือนล่าสุด)
     */
    calculateWeightedAverage() {
        if (this.endOfMonthPrices.length === 0) {
            this.weightedAvgPrice = this.currentGoldPrice;
            return;
        }

        // ใช้ราคา 12 เดือนล่าสุด
        const recentPrices = this.endOfMonthPrices.slice(-12);

        let totalWeight = 0;
        let weightedSum = 0;

        // ให้น้ำหนักมากขึ้นกับเดือนล่าสุด (เดือนล่าสุด = weight 12, เดือนก่อนหน้า = 11, ...)
        recentPrices.forEach((item, index) => {
            const weight = index + 1; // 1 ถึง 12
            weightedSum += item.sellBar * weight;
            totalWeight += weight;
        });

        this.weightedAvgPrice = Math.round(weightedSum / totalWeight);

        if (this.debugMode) {
            console.log('=== คำนวณราคาเฉลี่ยถ่วงน้ำหนัก ===');
            console.log(`จำนวนเดือนที่ใช้คำนวณ: ${recentPrices.length}`);
            console.log(`ราคาเฉลี่ยถ่วงน้ำหนัก: ${this.formatNumber(this.weightedAvgPrice)} บาท`);
            console.log('==================================');
        }
    }

    getPurchasePricesForMonths(monthCount, fallbackPrice) {
        const safeCount = Math.max(1, Math.floor(Number(monthCount) || 1));
        const safeFallback =
            Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : this.currentGoldPrice;

        const fromHistory = this.endOfMonthPrices
            .slice(-safeCount)
            .map(item => Number(item.sellBar))
            .filter(price => Number.isFinite(price) && price > 0);

        const missingCount = safeCount - fromHistory.length;
        return missingCount > 0 ? Array(missingCount).fill(safeFallback).concat(fromHistory) : fromHistory;
    }

    calculateDcaGold(monthlyAmount, months, fallbackPrice) {
        const prices = this.getPurchasePricesForMonths(months, fallbackPrice);
        const safeMonthlyAmount = Math.max(0, Number(monthlyAmount) || 0);

        let totalGoldBaht = 0;
        for (const price of prices) {
            const safePrice = Number.isFinite(price) && price > 0 ? price : fallbackPrice;
            if (Number.isFinite(safePrice) && safePrice > 0) {
                totalGoldBaht += safeMonthlyAmount / safePrice;
            }
        }

        const totalSpent = safeMonthlyAmount * prices.length;
        const avgCostPrice =
            totalGoldBaht > 0 ? totalSpent / totalGoldBaht : (Number(fallbackPrice) || this.currentGoldPrice);

        return { totalGoldBaht, avgCostPrice, pricesUsed: prices };
    }

    render() {
        // ดึง 6 เดือนล่าสุดสำหรับแสดง
        const recent6Months = this.endOfMonthPrices.slice(-6);

        this.container.innerHTML = `
            <div class="gold-saving2-wrapper">
                <!-- Header -->
                <div class="saving2-header">
                    <h1 class="saving2-title">${this.t('title')}</h1>
                    <p class="saving2-subtitle">${this.t('subtitle')}</p>
                    <div class="price-badge-row">
                        <div class="price-badge2">
                            <i class="fas fa-chart-line"></i>
                            <span>${this.t('goldPrice')}: <strong id="currentPrice2">${this.formatNumber(this.currentGoldPrice)}</strong> ${this.t('perBaht')}</span>
                        </div>
                    </div>
                </div>

                <!-- Main Calculator -->
                <div class="calculator2-container">
                    <!-- Left Panel - Inputs -->
                    <div class="calculator2-left">
                        <!-- Amount Section -->
                        <div class="amount-section2">
                            <div class="section-title2">
                                <div class="icon-circle"><i class="fas fa-wallet"></i></div>
                                <span>${this.t('monthlyLabel')}</span>
                            </div>

                            <div class="amount-display2">
                                <span class="amount-value2" id="amountDisplay2">${this.formatNumber(this.monthlyAmount)}</span>
                                <span class="amount-unit2">${this.t('baht')}</span>
                            </div>

                            <div class="slider-container2">
                                <input type="range"
                                       id="amountSlider2"
                                       class="amount-slider2"
                                       min="${this.minAmount}"
                                       max="${this.maxAmount}"
                                       step="500"
                                       value="${this.monthlyAmount}">
                                <div class="slider-marks2">
                                    <span>${this.formatNumber(this.minAmount)}</span>
                                    <span>${this.formatNumber(this.maxAmount)}</span>
                                </div>
                            </div>

                            <div class="quick-amounts2">
                                ${this.quickAmounts.map(amt => `
                                    <button class="quick-btn2 ${amt === this.monthlyAmount ? 'active' : ''}"
                                            data-amount="${amt}">
                                        ${this.formatNumber(amt)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Duration Section -->
                        <div class="duration-section2">
                            <div class="section-title2">
                                <div class="icon-circle"><i class="fas fa-calendar-alt"></i></div>
                                <span>${this.t('monthsLabel')}</span>
                            </div>

                            <div class="duration-cards2">
                                ${this.presetMonths.map(m => `
                                    <div class="duration-card2 ${m === this.months ? 'active' : ''}" data-months="${m}">
                                        <div class="num">${m}</div>
                                        <div class="label">${this.t('monthUnit')}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="custom-duration2">
                                <label>${this.t('customMonths')}:</label>
                                <input type="number"
                                       id="customMonths2"
                                       class="custom-input2"
                                       min="1"
                                       max="120"
                                       value="${this.months}">
                                <span>${this.t('monthUnit')}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Results -->
                    <div class="calculator2-right">
                        <!-- Total Card -->
                        <div class="total-card2">
                            <div class="total-label2">${this.t('totalSaving')}</div>
                            <div class="total-value2">
                                <span id="totalAmount2">${this.formatNumber(this.monthlyAmount * this.months)}</span>
                                <span class="total-unit2">${this.t('baht')}</span>
                            </div>
                            <div class="total-formula2">
                                <span id="formula2">${this.formatNumber(this.monthlyAmount)} x ${this.months} ${this.t('monthUnit')}</span>
                            </div>
                        </div>

                        <!-- Gold Weight Result -->
                        <div class="gold-result2">
                            <i class="fas fa-coins icon-big"></i>
                            <div class="result-label">${this.t('goldWeight')}</div>
                            <div class="result-value" id="goldWeight2">0.00</div>
                            <div class="result-sub">${this.t('bahtGold')}</div>
                        </div>

                        <!-- Historical Prices Info -->
                        <div class="avg-info-card2">
                            <h4><i class="fas fa-history"></i> ${this.t('historicalPrices')}</h4>
                            <div class="avg-list2" id="avgList2">
                                ${recent6Months.map(item => `
                                    <div class="avg-item2">
                                        <span class="date">${this.formatDate(item.date)}</span>
                                        <span class="price">${this.formatNumber(item.sellBar)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Benefits -->
                <div class="benefits2">
                    <div class="benefit2">
                        <div class="icon"><i class="fas fa-shield-alt"></i></div>
                        <span>${this.t('benefit1')}</span>
                    </div>
                    <div class="benefit2">
                        <div class="icon"><i class="fas fa-piggy-bank"></i></div>
                        <span>${this.t('benefit2')}</span>
                    </div>
                    <div class="benefit2">
                        <div class="icon"><i class="fas fa-gem"></i></div>
                        <span>${this.t('benefit3')}</span>
                    </div>
                </div>

                <!-- Products Section -->
                <div class="products2-section">
                    <h2 class="products2-title">
                        <i class="fas fa-star"></i>
                        ${this.t('recommendTitle')}
                    </h2>
                    <div class="products2-grid" id="productsGrid2">
                        <!-- Products will be rendered here -->
                    </div>
                </div>

                <!-- Disclaimer -->
                <div class="disclaimer2">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${this.t('disclaimer')}</span>
                </div>

                <!-- Debug Console -->
                <div class="debug-console ${this.debugMode ? 'show' : ''}" id="debugConsole">
                    <!-- Debug info will appear here -->
                </div>
            </div>
        `;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    }

    bindEvents() {
        // Amount slider
        const slider = document.getElementById('amountSlider2');
        slider.addEventListener('input', (e) => {
            this.monthlyAmount = parseInt(e.target.value);
            document.getElementById('amountDisplay2').textContent = this.formatNumber(this.monthlyAmount);
            this.updateQuickButtons();
            this.updateCalculation();
        });

        // Quick amount buttons
        const quickBtns = document.querySelectorAll('.quick-btn2');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.monthlyAmount = parseInt(btn.dataset.amount);
                slider.value = this.monthlyAmount;
                document.getElementById('amountDisplay2').textContent = this.formatNumber(this.monthlyAmount);
                this.updateQuickButtons();
                this.updateCalculation();
            });
        });

        // Duration cards
        const durationCards = document.querySelectorAll('.duration-card2');
        const customInput = document.getElementById('customMonths2');

        durationCards.forEach(card => {
            card.addEventListener('click', () => {
                durationCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.months = parseInt(card.dataset.months);
                customInput.value = this.months;
                this.updateCalculation();
            });
        });

        // Custom months input
        customInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 1;
            this.months = Math.max(1, Math.min(120, value));
            durationCards.forEach(c => {
                c.classList.toggle('active', parseInt(c.dataset.months) === this.months);
            });
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

    updateQuickButtons() {
        const quickBtns = document.querySelectorAll('.quick-btn2');
        quickBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.amount) === this.monthlyAmount);
        });
    }

    updateCalculation() {
        const total = this.monthlyAmount * this.months;

        // Update total display
        document.getElementById('totalAmount2').textContent = this.formatNumber(total);
        document.getElementById('formula2').textContent =
            `${this.formatNumber(this.monthlyAmount)} x ${this.months} ${this.t('monthUnit')}`;

        const fallbackPrice = this.weightedAvgPrice > 0 ? this.weightedAvgPrice : this.currentGoldPrice;
        const { totalGoldBaht, avgCostPrice } = this.calculateDcaGold(
            this.monthlyAmount,
            this.months,
            fallbackPrice
        );
        this.lastDcaAvgPrice = avgCostPrice;

        document.getElementById('goldWeight2').textContent = totalGoldBaht.toFixed(4);

        // Update products
        const estimatePrice = this.currentGoldPrice > 0 ? this.currentGoldPrice : fallbackPrice;
        this.renderProducts({ goldBaht: totalGoldBaht, estimatePrice });

        // Debug log
        if (this.debugMode) {
            console.log(`--- คำนวณใหม่ ---`);
            console.log(`ออมเดือนละ: ${this.formatNumber(this.monthlyAmount)} บาท`);
            console.log(`ระยะเวลา: ${this.months} เดือน`);
            console.log(`ยอดรวม: ${this.formatNumber(total)} บาท`);
            console.log(`ต้นทุนเฉลี่ย (DCA): ${this.formatNumber(Math.round(avgCostPrice))} บาท/บาททอง`);
            console.log(`ทองสะสม: ${totalGoldBaht.toFixed(4)} บาททอง`);
        }
    }

    renderProducts({ goldBaht, estimatePrice }) {
        const grid = document.getElementById('productsGrid2');
        const priceForProductDisplay =
            Number.isFinite(estimatePrice) && estimatePrice > 0 ? estimatePrice : this.currentGoldPrice;
        const allProducts = GoldProducts.getProductsWithPrice(priceForProductDisplay).sort(
            (a, b) => a.multiplier - b.multiplier
        );

        let html = '';

        allProducts.forEach(product => {
            const canAfford = goldBaht >= product.multiplier;
            const missingGold = Math.max(0, product.multiplier - goldBaht);
            const missingBahtEstimate = Math.ceil(missingGold * priceForProductDisplay);

            html += `
                <div class="product-card2 ${canAfford ? 'affordable' : 'not-affordable'}">
                    ${canAfford ?
                        `<div class="product-badge2 can-buy"><i class="fas fa-check"></i> ${this.t('canBuy')}</div>` :
                        (!canAfford && missingGold > 0 && missingGold <= product.multiplier * 0.3 ?
                            `<div class="product-badge2 almost"><i class="fas fa-clock"></i> ${this.t('almostThere')}</div>` :
                            '')}

                    <div class="product-img2">
                        <img src="${product.image}" alt="${product.name}" loading="lazy"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>'">
                    </div>

                    <div class="product-info2">
                        <h3 class="product-name2">${this.currentLang === 'en' ? product.nameEn : product.name}</h3>
                        <p class="product-weight2">${product.weight}</p>
                        <p class="product-price2">${this.formatNumber(product.price)} ${this.t('baht')}</p>

                        ${!canAfford ? `
                            <p class="product-diff2">
                                ${this.t('needMore')}: +${missingGold.toFixed(4)} ${this.t('bahtGold')}
                                (~${this.formatNumber(missingBahtEstimate)} ${this.t('baht')})
                            </p>
                        ` : ''}
                    </div>

                    <a href="${product.link}" target="_blank" class="product-btn2 ${canAfford ? '' : 'disabled'}">
                        ${this.t('buyNow')}
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
        });

        // ถ้าไม่มีสินค้าที่ซื้อได้เลย
        const anyAffordable = allProducts.some(p => goldBaht >= p.multiplier);
        if (!anyAffordable) {
            const cheapest = allProducts[0];
            const needMoreGold = Math.max(0, cheapest.multiplier - goldBaht);
            const needMoreBaht = Math.ceil(needMoreGold * priceForProductDisplay);
            html = `
                <div class="no-product2">
                    <i class="fas fa-coins"></i>
                    <p>${this.t('noProduct')}</p>
                    <p class="tip">${this.t('savingTip')}</p>
                    <p class="need-amount2">ต้องการอีก <strong>${needMoreGold.toFixed(4)}</strong> ${this.t('bahtGold')}
                    (~<strong>${this.formatNumber(needMoreBaht)}</strong> ${this.t('baht')})<br>
                    เพื่อซื้อ ${cheapest.name}</p>
                </div>
            ` + html;
        }

        grid.innerHTML = html;
    }

    async fetchCurrentGoldPrice() {
        try {
            if (typeof SharedPriceManager !== 'undefined') {
                const price = await SharedPriceManager.getPrice();
                if (price && price.sellBar) {
                    this.currentGoldPrice = price.sellBar;
                    document.getElementById('currentPrice2').textContent =
                        this.formatNumber(this.currentGoldPrice);

                    // Recalculate weighted average including current price
                    this.calculateWeightedAverage();

                    this.updateCalculation();
                }
            }
        } catch (error) {
            console.log('Using default gold price:', this.currentGoldPrice);
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

    toggleDebug() {
        this.debugMode = !this.debugMode;
        const console = document.getElementById('debugConsole');
        if (console) {
            console.classList.toggle('show', this.debugMode);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoldSavingCalculator2;
}
