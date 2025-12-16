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

        // Max months limit (จะอัปเดตจาก API)
        // ข้อมูลราคาทองเริ่มตั้งแต่ 2018-01-31
        this.maxMonths = 84; // ค่าเริ่มต้น 7 ปี

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
                totalSaving: 'ยอดเงินรวมทั้งหมด',
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
                currentValue: 'มูลค่าปัจจุบัน',
                totalCost: 'ต้นทุนทั้งหมด',
                profitLoss: 'กำไร/ขาดทุน',
                profit: 'กำไร',
                loss: 'ขาดทุน',
                comparePrice: 'เทียบราคา',
                howItWorks: 'วิธีการคำนวณ',
                backtestInfo: 'ระบบนี้ใช้ราคาทองจริงย้อนหลังตามจำนวนเดือนที่คุณเลือก เพื่อจำลองว่าถ้าคุณออมทองกับเรามาก่อนหน้านี้ จะได้ผลลัพธ์และกำไรเท่าไร',
                futureNote: 'ผลตอบแทนในอนาคตขึ้นอยู่กับราคาทองคำตลาดโลก ซึ่งอาจเปลี่ยนแปลงได้',
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
                currentValue: 'Current Value',
                totalCost: 'Total Cost',
                profitLoss: 'Profit/Loss',
                profit: 'Profit',
                loss: 'Loss',
                comparePrice: 'Price Comparison',
                howItWorks: 'How It Works',
                backtestInfo: 'This calculator uses historical gold prices based on the months you selected to simulate what would have happened if you saved gold with us in the past.',
                futureNote: 'Future returns depend on global gold market prices, which may vary.',
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
                currentValue: '当前价值',
                totalCost: '总成本',
                profitLoss: '盈亏',
                profit: '盈利',
                loss: '亏损',
                comparePrice: '价格对比',
                howItWorks: '运作方式',
                backtestInfo: '本系统使用您选择月份的真实历史金价，模拟如果您过去与我们储蓄黄金会获得的结果和利润。',
                futureNote: '未来回报取决于全球黄金市场价格，可能会有变化。',
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
     * - หาวันที่ใกล้เคียงสิ้นเดือนมากที่สุดในแต่ละเดือน
     * - ห้ามข้ามเดือน (ถ้าสิ้นเดือนเป็นเสาร์-อาทิตย์ ให้ย้อนหลังในเดือนเดียวกัน)
     * - เอาเฉพาะเดือนที่ผ่านไปแล้ว (ไม่เอาเดือนปัจจุบันที่ยังไม่จบ)
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

            // วันที่ปัจจุบัน
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; // 1-12

            // Group data by month
            const monthlyData = {};

            allData.forEach(item => {
                const date = new Date(item.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // 1-12
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = [];
                }
                monthlyData[monthKey].push(item);
            });

            // หาวันที่ใกล้เคียงสิ้นเดือนที่สุดในแต่ละเดือน (ห้ามข้ามเดือน)
            const monthlyPrices = {};

            Object.keys(monthlyData).forEach(monthKey => {
                const [yearStr, monthStr] = monthKey.split('-');
                const year = parseInt(yearStr);
                const month = parseInt(monthStr);

                // ข้ามเดือนปัจจุบันที่ยังไม่จบ
                if (year === currentYear && month === currentMonth) {
                    if (this.debugMode) {
                        console.log(`⏭️ ข้าม ${monthKey}: เดือนปัจจุบันยังไม่จบ`);
                    }
                    return;
                }

                // ข้ามเดือนในอนาคต
                if (year > currentYear || (year === currentYear && month > currentMonth)) {
                    if (this.debugMode) {
                        console.log(`⏭️ ข้าม ${monthKey}: เดือนในอนาคต`);
                    }
                    return;
                }

                const monthItems = monthlyData[monthKey];

                // เรียงตามวันที่จากมากไปน้อย (วันที่มากสุดก่อน)
                monthItems.sort((a, b) => new Date(b.date) - new Date(a.date));

                // เอาวันแรก (วันที่มากที่สุด = ใกล้สิ้นเดือนที่สุด)
                monthlyPrices[monthKey] = monthItems[0];
            });

            // แปลงเป็น array และเรียงจากเก่าไปใหม่
            this.endOfMonthPrices = Object.values(monthlyPrices)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            // Debug: console.log ราคาทุกสิ้นเดือน
            if (this.debugMode) {
                console.log('=== ราคาทองสิ้นเดือน (ใกล้เคียงที่สุด) - ทั้งหมด ===');
                this.endOfMonthPrices.forEach(item => {
                    const date = new Date(item.date);
                    const dayOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'][date.getDay()];
                    console.log(`${item.date} (${dayOfWeek}): ${this.formatNumber(item.sellBar)} บาท`);
                });
                console.log('========================================================');

                // แสดง 6 เดือนล่าสุดแบบละเอียด (ปี 2025)
                console.log('\n=== ตรวจสอบ 6 เดือนล่าสุด (2025) - ละเอียด ===');
                const recent6Months = this.endOfMonthPrices.slice(-6);

                recent6Months.forEach((selectedItem, index) => {
                    const date = new Date(selectedItem.date);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const dayOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'][date.getDay()];
                    const monthName = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][month - 1];

                    // หาจำนวนวันในเดือนนั้น
                    const daysInMonth = new Date(year, month, 0).getDate();

                    console.log(`\n[${index + 1}] ${monthName} ${year}:`);
                    console.log(`   ✓ วันที่เลือก: ${day} ${monthName} ${year} (${dayOfWeek})`);
                    console.log(`   ✓ ราคา: ${this.formatNumber(selectedItem.sellBar)} บาท`);

                    if (day === daysInMonth) {
                        console.log(`   ✓ สถานะ: วันสุดท้ายของเดือน (${daysInMonth} วัน) ✅`);
                    } else {
                        console.log(`   ⚠ สถานะ: ไม่ใช่วันสุดท้าย (เดือนมี ${daysInMonth} วัน)`);
                        console.log(`   → เหตุผล: วันที่ ${daysInMonth} ${monthName} อาจตกวันหยุด/สมาคมไม่ออกราคา`);
                    }

                    // แสดงข้อมูลในเดือนนั้นๆ จาก monthlyData
                    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
                    if (monthlyData[monthKey]) {
                        const monthDates = monthlyData[monthKey]
                            .map(item => {
                                const d = new Date(item.date);
                                return d.getDate();
                            })
                            .sort((a, b) => b - a); // เรียงจากมากไปน้อย

                        console.log(`   → วันที่มีข้อมูลใน API: ${monthDates.join(', ')}`);
                    }
                });
                console.log('\n=====================================================');
            }

            // อัปเดต maxMonths จากข้อมูลจริงที่มี
            this.maxMonths = this.endOfMonthPrices.length;
            if (this.debugMode) {
                console.log(`📊 อัปเดต maxMonths = ${this.maxMonths} เดือน (จากข้อมูล API)`);
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
        this.container.innerHTML = `
            <div class="gold-saving2-wrapper">
                <!-- Header -->
                <div class="saving2-header">
                    <!-- Info Box -->
                    <div class="info-box2">
                        <div class="info-icon2">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div class="info-content2">
                            <h4>${this.t('howItWorks')}</h4>
                            <p>${this.t('backtestInfo')}</p>
                            <p class="info-note2"><i class="fas fa-info-circle"></i> ${this.t('futureNote')}</p>
                        </div>
                    </div>

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
                        <!-- Amount Section - Liquid Glass -->
                        <div class="liquid-glass-card lg-amount-card">
                            <div class="card-header">
                                <div class="card-icon"><i class="fas fa-wallet"></i></div>
                                <h3 class="card-title">${this.t('monthlyLabel')}</h3>
                            </div>

                            <div class="amount-display">
                                <span class="amount-value" id="amountDisplay2">${this.formatNumber(this.monthlyAmount)}</span>
                                <span class="amount-unit">${this.t('baht')}</span>
                            </div>

                            <div class="slider-wrapper">
                                <input type="range"
                                       id="amountSlider2"
                                       class="glass-slider"
                                       min="${this.minAmount}"
                                       max="${this.maxAmount}"
                                       step="500"
                                       value="${this.monthlyAmount}">
                                <div class="slider-labels">
                                    <span>${this.formatNumber(this.minAmount)}</span>
                                    <span>${this.formatNumber(this.maxAmount)}</span>
                                </div>
                            </div>

                            <div class="quick-btns">
                                ${this.quickAmounts.map(amt => `
                                    <button class="quick-btn ${amt === this.monthlyAmount ? 'active' : ''}"
                                            data-amount="${amt}">
                                        ${this.formatNumber(amt)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Duration Section - Liquid Glass -->
                        <div class="liquid-glass-card lg-duration-card" style="margin-top: 1.5rem;">
                            <div class="card-header">
                                <div class="card-icon"><i class="fas fa-calendar-alt"></i></div>
                                <h3 class="card-title">${this.t('monthsLabel')}</h3>
                            </div>

                            <div class="duration-options">
                                ${this.presetMonths.map(m => `
                                    <div class="duration-chip ${m === this.months ? 'active' : ''}" data-months="${m}">
                                        <div class="num">${m}</div>
                                        <div class="label">${this.t('monthUnit')}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="custom-input-wrapper">
                                <label>${this.t('customMonths')}:</label>
                                <input type="number"
                                       id="customMonths2"
                                       class="custom-input"
                                       min="1"
                                       max="${this.maxMonths}"
                                       value="${this.months}">
                                <span>${this.t('monthUnit')}</span>
                                <span class="max-hint">(สูงสุด ${this.maxMonths})</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Results -->
                    <div class="calculator2-right">
                        <!-- Total Card - Liquid Glass -->
                        <div class="liquid-glass-card lg-total-card">
                            <div class="total-label">${this.t('totalSaving')}</div>
                            <div class="total-value">
                                <span id="totalAmount2">${this.formatNumber(this.monthlyAmount * this.months)}</span>
                                <span class="total-unit">${this.t('baht')}</span>
                            </div>
                            <div class="total-formula">
                                <span id="formula2">${this.formatNumber(this.monthlyAmount)} x ${this.months} ${this.t('monthUnit')}</span>
                            </div>
                        </div>

                        <!-- Gold Weight Result - Liquid Glass -->
                        <div class="liquid-glass-card lg-gold-card" style="margin-top: 1.5rem;">
                            <i class="fas fa-coins gold-icon"></i>
                            <div class="gold-label">${this.t('goldWeight')}</div>
                            <div class="gold-value" id="goldWeight2">0.00</div>
                            <div class="gold-unit">${this.t('bahtGold')}</div>
                        </div>

                        <!-- Profit/Loss Card - Liquid Glass -->
                        <div class="liquid-glass-card lg-profit-card" id="profitCard2" style="margin-top: 1.5rem;">
                            <div class="card-header">
                                <i class="fas fa-chart-line"></i>
                                <span>${this.t('profitLoss')}</span>
                            </div>
                            <div class="value-row">
                                <span class="value-label">${this.t('currentValue')}</span>
                                <span class="value-amount" id="currentValue2">0</span>
                            </div>
                            <div class="profit-result" id="profitResult2">
                                <div class="profit-amount">+0</div>
                                <div class="profit-percent">+0%</div>
                            </div>
                        </div>
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

        // Quick amount buttons (Liquid Glass)
        const quickBtns = document.querySelectorAll('.lg-amount-card .quick-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.monthlyAmount = parseInt(btn.dataset.amount);
                slider.value = this.monthlyAmount;
                document.getElementById('amountDisplay2').textContent = this.formatNumber(this.monthlyAmount);
                this.updateQuickButtons();
                this.updateCalculation();
            });
        });

        // Duration chips (Liquid Glass)
        const durationChips = document.querySelectorAll('.lg-duration-card .duration-chip');
        const customInput = document.getElementById('customMonths2');

        durationChips.forEach(chip => {
            chip.addEventListener('click', () => {
                durationChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.months = parseInt(chip.dataset.months);
                customInput.value = this.months;
                this.updateCalculation();
            });
        });

        // Custom months input
        customInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 1;
            this.months = Math.max(1, Math.min(this.maxMonths, value));
            durationChips.forEach(c => {
                c.classList.toggle('active', parseInt(c.dataset.months) === this.months);
            });
        });

        customInput.addEventListener('blur', () => {
            // Ensure value doesn't exceed maxMonths
            customInput.value = Math.min(parseInt(customInput.value) || 1, this.maxMonths);
            this.months = parseInt(customInput.value);
            this.updateCalculation();
        });

        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customInput.blur();
            }
        });
    }

    updateQuickButtons() {
        const quickBtns = document.querySelectorAll('.lg-amount-card .quick-btn');
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

        // Debug: แสดงราคาทองสิ้นเดือนจาก API ที่ใช้คำนวณ
        if (this.debugMode) {
            console.log('=== ราคาทองสิ้นเดือนจาก API ที่ใช้คำนวณ DCA ===');
            console.log(`ต้องการออม: ${this.months} เดือน`);

            // ดึงราคาจำนวนเดือนที่ต้องการ
            const selectedPrices = this.endOfMonthPrices.slice(-this.months);
            console.log(`ราคาจาก API ที่ใช้ (${selectedPrices.length} เดือน):`);

            selectedPrices.forEach((item, index) => {
                console.log(`  [${index + 1}] วันที่: ${item.date} - ราคาขายแท่ง: ${this.formatNumber(item.sellBar)} บาท`);
            });

            // ถ้าไม่พอ แสดง fallback
            if (selectedPrices.length < this.months) {
                const missingMonths = this.months - selectedPrices.length;
                console.log(`❗ ข้อมูลใน API ไม่พอ! ขาด ${missingMonths} เดือน`);
                console.log(`ใช้ราคา fallback: ${this.formatNumber(fallbackPrice)} บาท สำหรับเดือนที่ขาด`);
            }

            console.log(`ราคาเฉลี่ยที่คำนวณได้: ${this.formatNumber(Math.round(avgCostPrice))} บาท/บาททอง`);
            console.log('============================================');
        }

        // Update gold weight
        document.getElementById('goldWeight2').textContent = totalGoldBaht.toFixed(4);

        // Calculate profit/loss
        const currentGoldValue = totalGoldBaht * this.currentGoldPrice;
        const profitAmount = currentGoldValue - total;
        const profitPercent = total > 0 ? (profitAmount / total) * 100 : 0;

        // Update current value
        document.getElementById('currentValue2').textContent =
            `${this.formatNumber(Math.round(currentGoldValue))} ${this.t('baht')}`;

        // Update profit/loss display (Liquid Glass)
        const profitResult = document.getElementById('profitResult2');
        const profitCard = document.getElementById('profitCard2');

        if (profitAmount > 0) {
            profitCard.classList.add('profit');
            profitCard.classList.remove('loss');
            profitResult.innerHTML = `
                <div class="profit-amount">+${this.formatNumber(Math.round(profitAmount))} ${this.t('baht')}</div>
                <div class="profit-percent">+${profitPercent.toFixed(2)}%</div>
            `;
        } else if (profitAmount < 0) {
            profitCard.classList.add('loss');
            profitCard.classList.remove('profit');
            profitResult.innerHTML = `
                <div class="profit-amount">${this.formatNumber(Math.round(profitAmount))} ${this.t('baht')}</div>
                <div class="profit-percent">${profitPercent.toFixed(2)}%</div>
            `;
        } else {
            profitCard.classList.remove('profit', 'loss');
            profitResult.innerHTML = `
                <div class="profit-amount">0 ${this.t('baht')}</div>
                <div class="profit-percent">0%</div>
            `;
        }

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
            console.log(`มูลค่าปัจจุบัน: ${this.formatNumber(Math.round(currentGoldValue))} บาท`);
            console.log(`กำไร/ขาดทุน: ${this.formatNumber(Math.round(profitAmount))} บาท (${profitPercent.toFixed(2)}%)`);
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
