/**
 * Gold Saving Calculator 2
 * ระบบคำนวณการออมทองกับออสิริส - Version 2 พร้อมราคาเฉลี่ยถ่วงน้ำหนักย้อนหลัง
 */

class GoldSavingCalculator2 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLang = 'th';
        this.lazyImageObserver = null;
        this.imagePlaceholder =
            'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 10 10%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>';
        this._productsGridClickHandler = null;
        this._productsGridKeyHandler = null;

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

        // ราคาทองรายวัน (จันทร์-ศุกร์)
        this.dailyPrices = [];
        this.weightedAvgPrice = 0;
        this.lastDcaAvgPrice = 0;

        // จำนวนวันทำการต่อเดือน (จันทร์-ศุกร์)
        this.workingDaysPerMonth = 20;

        // Max months limit (จะอัปเดตจาก API)
        // ข้อมูลราคาทองเริ่มตั้งแต่ 2018-01-31
        this.maxMonths = 84; // ค่าเริ่มต้น 7 ปี

        // Debug mode
        this.debugMode = true;

        // Translations
        this.translations = {
            th: {
                title: 'ออมเดือนละเท่าไหร่ ได้ทองกี่บาท?',
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
                benefit2: 'ออมทุกวัน สร้างวินัยทางการเงิน',
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
                backtestInfo: 'ระบบนี้ซื้อทองทุกวันจันทร์-ศุกร์ โดยนำเงินออมต่อเดือนมาเฉลี่ยซื้อทุกวัน (~20 วันทำการ/เดือน) ใช้ราคาทองจริงย้อนหลังเพื่อจำลองผลลัพธ์',
                futureNote: 'ผลตอบแทนในอนาคตขึ้นอยู่กับราคาทองคำตลาดโลก ซึ่งอาจเปลี่ยนแปลงได้',
                disclaimer: 'ราคาทองอ้างอิงจากราคาตลาด อาจมีการเปลี่ยนแปลงได้ ผลการคำนวณเป็นเพียงการประมาณการและยังไม่รวมค่าจัดส่งการแบบมีประกันของทองคำแท่ง',
                dailyBuyInfo: 'ซื้อทุกวันจันทร์-ศุกร์',
                perDay: 'บาท/วัน',
                workingDays: 'วันทำการ'
            },
            en: {
                title: 'How Much Gold Can You Get?',
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
                benefit2: 'Daily savings build financial discipline',
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
                backtestInfo: 'This system buys gold every Mon-Fri by averaging your monthly savings (~20 working days/month) using historical prices to simulate results.',
                futureNote: 'Future returns depend on global gold market prices, which may vary.',
                disclaimer: 'Gold prices are based on market rates and may change. Calculations are estimates only and do not include insured shipping costs for gold bars.',
                dailyBuyInfo: 'Buy every Mon-Fri',
                perDay: 'THB/day',
                workingDays: 'working days'
            },
            cn: {
                title: '每月存多少能买多少黄金?',
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
                benefit2: '每日储蓄培养财务纪律',
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
                backtestInfo: '本系统每周一至周五购买黄金，将月储蓄平均到每天（约20个工作日/月），使用历史价格模拟结果。',
                futureNote: '未来回报取决于全球黄金市场价格，可能会有变化。',
                disclaimer: '金价基于市场行情，可能会有变化。计算结果仅供参考，不包括金条的保险运费。',
                dailyBuyInfo: '每周一至周五购买',
                perDay: '泰铢/天',
                workingDays: '工作日'
            }
        };

        this.init();
    }

    async init() {
        // รอให้ GoldProducts โหลดข้อมูลจาก API ก่อน
        if (typeof GoldProducts !== 'undefined' && !GoldProducts.isLoaded) {
            console.log('⏳ รอ GoldProducts โหลดข้อมูลจาก API...');
            await GoldProducts.init();
            console.log('✅ GoldProducts โหลดเสร็จแล้ว');
        }

        await this.fetchEndOfMonthPrices();
        this.render();
        this.bindEvents();
        this.updateCalculation();
        this.fetchCurrentGoldPrice();
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    getNoImageFallbackDataUri() {
        return "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>";
    }

    disconnectLazyImageObserver() {
        if (!this.lazyImageObserver) return;
        this.lazyImageObserver.disconnect();
        this.lazyImageObserver = null;
    }

    loadLazyImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.classList.remove('is-loaded');
        img.addEventListener(
            'load',
            () => {
                img.classList.add('is-loaded');
            },
            { once: true }
        );

        img.setAttribute('src', src);
        img.removeAttribute('data-src');
    }

    initGridLazyImages(gridEl) {
        this.disconnectLazyImageObserver();
        if (!gridEl) return;

        const imgs = Array.from(gridEl.querySelectorAll('img[data-src]'));
        if (imgs.length === 0) return;

        if (typeof IntersectionObserver === 'undefined') {
            imgs.forEach(img => this.loadLazyImage(img));
            return;
        }

        this.lazyImageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    this.lazyImageObserver?.unobserve(img);
                    this.loadLazyImage(img);
                });
            },
            { root: null, rootMargin: '250px 0px', threshold: 0.01 }
        );

        imgs.forEach(img => this.lazyImageObserver.observe(img));
    }

    bindProductsGridEvents(gridEl, productsByKey) {
        if (!gridEl) return;

        if (this._productsGridClickHandler) {
            gridEl.removeEventListener('click', this._productsGridClickHandler);
        }
        if (this._productsGridKeyHandler) {
            gridEl.removeEventListener('keydown', this._productsGridKeyHandler);
        }

        this._productsGridClickHandler = (e) => {
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && gridEl.contains(previewBtn)) {
                const affEl = previewBtn.closest('[data-affordable]');
                const isLocked = affEl && affEl.dataset.affordable !== '1';
                if (isLocked) return; // let card click open locked modal preview instead

                e.preventDefault();
                e.stopPropagation();

                const key = previewBtn.dataset.imagesKey;
                const product = key ? productsByKey?.get(key) : null;
                const images = Array.isArray(product?.images) && product.images.length > 0
                    ? product.images
                    : product?.image
                        ? [product.image]
                        : [];
                if (images.length === 0) return;

                const title = product
                    ? (this.currentLang === 'en' ? product.nameEn : product.name)
                    : '';
                this.openImageLightbox({ title, images, startIndex: 0 });
                return;
            }

            const clickableHero = e.target.closest('.hero-card.is-clickable');
            if (clickableHero && gridEl.contains(clickableHero)) {
                const link = clickableHero.dataset.link;
                if (link) window.open(link, '_blank');
            }
        };

        this._productsGridKeyHandler = (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && gridEl.contains(previewBtn)) {
                const affEl = previewBtn.closest('[data-affordable]');
                const isLocked = affEl && affEl.dataset.affordable !== '1';
                if (isLocked) return;
                e.preventDefault();
                previewBtn.click();
                return;
            }
            const clickableHero = e.target.closest('.hero-card.is-clickable');
            if (clickableHero && gridEl.contains(clickableHero)) {
                e.preventDefault();
                const link = clickableHero.dataset.link;
                if (link) window.open(link, '_blank');
            }
        };

        gridEl.addEventListener('click', this._productsGridClickHandler);
        gridEl.addEventListener('keydown', this._productsGridKeyHandler);
    }

    openImageLightbox({ title, images, startIndex = 0 }) {
        if (!Array.isArray(images) || images.length === 0) return;

        // Remove existing lightbox
        const existing = document.getElementById('imageLightbox');
        if (existing) {
            try {
                if (typeof existing._cleanup === 'function') existing._cleanup();
            } catch (_) {
                // ignore
            }
            existing.remove();
        }

        const lightbox = document.createElement('div');
        lightbox.id = 'imageLightbox';
        lightbox.className = 'img-lightbox';

        const safeIndex = Math.max(0, Math.min(images.length - 1, startIndex));
        let index = safeIndex;

        const renderDots = () => {
            if (images.length <= 1) return '';
            return images.map((_, i) => `
                <button type="button" class="img-lightbox-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>
            `).join('');
        };

        lightbox.innerHTML = `
            <div class="img-lightbox-backdrop"></div>
            <div class="img-lightbox-content" role="dialog" aria-modal="true">
                <div class="img-lightbox-header">
                    <div class="img-lightbox-title">${title || ''}</div>
                    <div class="img-lightbox-count">${index + 1}/${images.length}</div>
                    <button type="button" class="img-lightbox-close" aria-label="Close">×</button>
                </div>
                <div class="img-lightbox-stage">
                    <button type="button" class="img-lightbox-nav prev" aria-label="Previous">‹</button>
                    <img class="img-lightbox-img" alt="${title || 'Image'}" decoding="async">
                    <button type="button" class="img-lightbox-nav next" aria-label="Next">›</button>
                </div>
                <div class="img-lightbox-dots">${renderDots()}</div>
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.classList.add('modal-open');

        const imgEl = lightbox.querySelector('.img-lightbox-img');
        const countEl = lightbox.querySelector('.img-lightbox-count');
        const dotsEl = lightbox.querySelector('.img-lightbox-dots');
        const prevBtn = lightbox.querySelector('.img-lightbox-nav.prev');
        const nextBtn = lightbox.querySelector('.img-lightbox-nav.next');
        const stageEl = lightbox.querySelector('.img-lightbox-stage');

        const preloadNeighbor = () => {
            if (images.length <= 1) return;
            const next = images[(index + 1) % images.length];
            const prev = images[(index - 1 + images.length) % images.length];
            [next, prev].forEach(src => {
                const i = new Image();
                i.src = src;
            });
        };

        const update = () => {
            imgEl.src = images[index];
            countEl.textContent = `${index + 1}/${images.length}`;
            if (images.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                dotsEl.style.display = 'none';
            } else {
                prevBtn.style.display = '';
                nextBtn.style.display = '';
                dotsEl.style.display = '';
                dotsEl.innerHTML = renderDots();
            }
            preloadNeighbor();
        };

        const go = (nextIndex) => {
            index = (nextIndex + images.length) % images.length;
            update();
        };

        const close = () => {
            if (typeof lightbox._cleanup === 'function') lightbox._cleanup();
            lightbox.classList.remove('active');
            setTimeout(() => {
                document.body.classList.remove('modal-open');
                lightbox.remove();
            }, 200);
        };

        const keyHandler = (e) => {
            if (e.key === 'Escape') return close();
            if (images.length <= 1) return;
            if (e.key === 'ArrowLeft') return go(index - 1);
            if (e.key === 'ArrowRight') return go(index + 1);
        };

        // Touch swipe
        let touchStartX = null;
        const touchStart = (e) => {
            touchStartX = e.touches?.[0]?.clientX ?? null;
        };
        const touchEnd = (e) => {
            const endX = e.changedTouches?.[0]?.clientX ?? null;
            if (touchStartX == null || endX == null || images.length <= 1) return;
            const dx = endX - touchStartX;
            if (Math.abs(dx) < 40) return;
            go(dx > 0 ? index - 1 : index + 1);
            touchStartX = null;
        };

        lightbox.querySelector('.img-lightbox-close').addEventListener('click', close);
        lightbox.querySelector('.img-lightbox-backdrop').addEventListener('click', close);
        prevBtn.addEventListener('click', () => go(index - 1));
        nextBtn.addEventListener('click', () => go(index + 1));
        dotsEl.addEventListener('click', (e) => {
            const dot = e.target.closest('.img-lightbox-dot');
            if (!dot) return;
            const i = parseInt(dot.dataset.index, 10);
            if (Number.isFinite(i)) go(i);
        });

        stageEl.addEventListener('touchstart', touchStart, { passive: true });
        stageEl.addEventListener('touchend', touchEnd, { passive: true });
        document.addEventListener('keydown', keyHandler);

        lightbox._cleanup = () => {
            document.removeEventListener('keydown', keyHandler);
        };

        requestAnimationFrame(() => lightbox.classList.add('active'));
        update();
    }

    formatNumber(num) {
        return num.toLocaleString('th-TH');
    }

    /**
     * ดึงราคาทองรายวัน (จันทร์-ศุกร์)
     * - เก็บราคาทุกวันทำการ (ไม่รวมเสาร์-อาทิตย์)
     * - เก็บข้อมูลวันทำการต่อเดือนจริง
     * - ข้ามเดือนปัจจุบันที่ยังไม่จบ
     */
    async fetchDailyPrices() {
        try {
            const response = await fetch('http://27.254.3.14:8000/api/datagraph');
            const text = await response.text();
            const lines = text.trim().split('\n');

            // Parse all data
            const allData = lines.map(line => {
                const parts = line.split(',').map(p => p.trim());
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

            // กรองเฉพาะวันจันทร์-ศุกร์ (day 1-5) และไม่เกินวันปัจจุบัน
            // หมายเหตุ: API อาจส่งหลาย record ต่อวัน (หลายเวลา) → เลือก "ราคาล่าสุดของวันนั้น" เพื่อให้เป็นการซื้อวันละ 1 ครั้ง
            const latestByDate = new Map(); // key = YYYY-MM-DD
            const toSeconds = (timeStr) => {
                const [h, m, s] = String(timeStr || '').split(':').map(v => parseInt(v, 10));
                return (Number.isFinite(h) ? h : 0) * 3600 + (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0);
            };

            allData.forEach(item => {
                const date = new Date(item.date);
                const dayOfWeek = date.getDay(); // 0=อาทิตย์, 1-5=จันทร์-ศุกร์, 6=เสาร์
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                // ข้ามเสาร์-อาทิตย์
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    return;
                }

                // ข้ามเดือนปัจจุบันที่ยังไม่จบ
                if (year === currentYear && month === currentMonth) {
                    return;
                }

                // ข้ามเดือนในอนาคต
                if (year > currentYear || (year === currentYear && month > currentMonth)) {
                    return;
                }

                // ตรวจสอบว่าราคาถูกต้อง
                if (!Number.isFinite(item.sellBar) || item.sellBar <= 0) {
                    return;
                }

                const candidate = {
                    ...item,
                    monthKey
                };

                const existing = latestByDate.get(candidate.date);
                if (!existing || toSeconds(candidate.time) >= toSeconds(existing.time)) {
                    latestByDate.set(candidate.date, candidate);
                }
            });

            const weekdayPrices = Array.from(latestByDate.values());
            const monthlyWorkingDays = {}; // เก็บจำนวนวันทำการในแต่ละเดือน
            weekdayPrices.forEach(p => {
                monthlyWorkingDays[p.monthKey] = (monthlyWorkingDays[p.monthKey] || 0) + 1;
            });

            // เรียงจากเก่าไปใหม่
            weekdayPrices.sort((a, b) => new Date(a.date) - new Date(b.date));

            this.dailyPrices = weekdayPrices;
            this.monthlyWorkingDays = monthlyWorkingDays;

            // หาจำนวนเดือนที่มีข้อมูล
            const uniqueMonths = [...new Set(weekdayPrices.map(p => p.monthKey))];
            this.maxMonths = uniqueMonths.length;

            // Debug
            if (this.debugMode) {
                console.log('=== ราคาทองรายวัน (จันทร์-ศุกร์) ===');
                console.log(`📊 จำนวนวันทั้งหมด: ${this.dailyPrices.length} วัน`);
                console.log(`📊 จำนวนเดือน: ${this.maxMonths} เดือน`);

                // แสดงจำนวนวันทำการในแต่ละเดือน (6 เดือนล่าสุด)
                const recentMonthKeys = uniqueMonths.slice(-6);
                console.log('\n=== จำนวนวันทำการจริงในแต่ละเดือน (6 เดือนล่าสุด) ===');
                recentMonthKeys.forEach(monthKey => {
                    const workingDays = monthlyWorkingDays[monthKey];
                    console.log(`${monthKey}: ${workingDays} วันทำการ`);
                });
                console.log('==========================================');
            }

            // คำนวณราคาเฉลี่ยถ่วงน้ำหนัก
            this.calculateWeightedAverage();

        } catch (error) {
            console.error('Error fetching daily prices:', error);
            this.dailyPrices = [];
            this.monthlyWorkingDays = {};
        }
    }

    // Alias สำหรับ backward compatibility
    async fetchEndOfMonthPrices() {
        return this.fetchDailyPrices();
    }

    /**
     * คำนวณราคาเฉลี่ยถ่วงน้ำหนัก (ใช้ราคารายวัน 60 วันล่าสุด)
     */
    calculateWeightedAverage() {
        if (this.dailyPrices.length === 0) {
            this.weightedAvgPrice = this.currentGoldPrice;
            return;
        }

        // ใช้ราคา 60 วันทำการล่าสุด (~3 เดือน)
        const recentPrices = this.dailyPrices.slice(-60);

        let totalWeight = 0;
        let weightedSum = 0;

        // ให้น้ำหนักมากขึ้นกับวันล่าสุด
        recentPrices.forEach((item, index) => {
            const weight = index + 1;
            weightedSum += item.sellBar * weight;
            totalWeight += weight;
        });

        this.weightedAvgPrice = Math.round(weightedSum / totalWeight);

        if (this.debugMode) {
            console.log('=== คำนวณราคาเฉลี่ยถ่วงน้ำหนัก ===');
            console.log(`จำนวนวันที่ใช้คำนวณ: ${recentPrices.length}`);
            console.log(`ราคาเฉลี่ยถ่วงน้ำหนัก: ${this.formatNumber(this.weightedAvgPrice)} บาท`);
            console.log('==================================');
        }
    }

    /**
     * ดึงราคารายวันสำหรับจำนวนเดือนที่เลือก
     * คืน array ของราคารายวันพร้อมข้อมูลเดือน
     */
    getDailyPricesForMonths(monthCount, fallbackPrice) {
        const safeCount = Math.max(1, Math.floor(Number(monthCount) || 1));
        const safeFallback =
            Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : this.currentGoldPrice;

        if (this.dailyPrices.length === 0) {
            // ถ้าไม่มีข้อมูล สร้าง fallback array
            return {
                prices: Array(safeCount * 20).fill({ sellBar: safeFallback, monthKey: 'fallback' }),
                monthsData: {}
            };
        }

        // หา unique months จากข้อมูล
        const uniqueMonths = [...new Set(this.dailyPrices.map(p => p.monthKey))];

        // เลือกเดือนที่ต้องการ (N เดือนล่าสุด)
        const selectedMonthKeys = uniqueMonths.slice(-safeCount);

        // กรองราคาเฉพาะเดือนที่เลือก
        const selectedPrices = this.dailyPrices.filter(p => selectedMonthKeys.includes(p.monthKey));

        // สร้างข้อมูลเดือน
        const monthsData = {};
        selectedMonthKeys.forEach(monthKey => {
            const monthPrices = selectedPrices.filter(p => p.monthKey === monthKey);
            monthsData[monthKey] = {
                workingDays: monthPrices.length,
                prices: monthPrices
            };
        });

        return {
            prices: selectedPrices,
            monthsData,
            selectedMonthKeys
        };
    }

    // Backward compatibility
    getPurchasePricesForMonths(monthCount, fallbackPrice) {
        const { prices } = this.getDailyPricesForMonths(monthCount, fallbackPrice);
        return prices.map(p => p.sellBar);
    }

    /**
     * คำนวณ DCA แบบรายวัน (จันทร์-ศุกร์)
     * - แบ่งเงินรายเดือนเป็นรายวันตามจำนวนวันทำการจริงในแต่ละเดือน
     * - เช่น มกราคม มี 22 วันทำการ → เงินต่อวัน = monthlyAmount / 22
     * - Loop ซื้อทองทุกวันทำการตามราคาวันนั้น
     */
    calculateDcaGold(monthlyAmount, months, fallbackPrice) {
        const safeMonthlyAmount = Math.max(0, Number(monthlyAmount) || 0);
        const safeFallback = Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : this.currentGoldPrice;

        const { monthsData, selectedMonthKeys, prices } = this.getDailyPricesForMonths(months, fallbackPrice);

        let totalGoldBaht = 0;
        let totalSpent = 0;
        let totalWorkingDays = 0;

        // Debug info
        const debugInfo = [];

        // คำนวณแต่ละเดือน
        if (selectedMonthKeys && selectedMonthKeys.length > 0) {
            selectedMonthKeys.forEach(monthKey => {
                const monthData = monthsData[monthKey];
                if (!monthData || monthData.workingDays === 0) return;

                // เงินต่อวันในเดือนนี้ = เงินต่อเดือน / จำนวนวันทำการจริง
                const dailyAmount = safeMonthlyAmount / monthData.workingDays;
                let monthGold = 0;

                // ซื้อทองทุกวันในเดือนนี้
                monthData.prices.forEach(priceData => {
                    const price = Number.isFinite(priceData.sellBar) && priceData.sellBar > 0
                        ? priceData.sellBar
                        : safeFallback;

                    const goldBought = dailyAmount / price;
                    totalGoldBaht += goldBought;
                    monthGold += goldBought;
                });

                totalSpent += safeMonthlyAmount;
                totalWorkingDays += monthData.workingDays;

                debugInfo.push({
                    month: monthKey,
                    workingDays: monthData.workingDays,
                    dailyAmount: Math.round(dailyAmount),
                    goldBought: monthGold.toFixed(6)
                });
            });
        } else {
            // Fallback ถ้าไม่มีข้อมูล
            const estimatedDays = months * 20;
            const dailyAmount = safeMonthlyAmount / 20;

            for (let i = 0; i < estimatedDays; i++) {
                totalGoldBaht += dailyAmount / safeFallback;
            }

            totalSpent = safeMonthlyAmount * months;
            totalWorkingDays = estimatedDays;
        }

        const avgCostPrice = totalGoldBaht > 0 ? totalSpent / totalGoldBaht : safeFallback;

        return {
            totalGoldBaht,
            avgCostPrice,
            totalSpent,
            totalWorkingDays,
            pricesUsed: prices,
            debugInfo
        };
    }

    render() {
        this.container.innerHTML = `
            <div class="gold-saving2-wrapper">
                <!-- Header -->
                <div class="saving2-header">
                    <h1 class="saving2-title-simple">${this.t('title')}</h1>
                    <div class="info-box2-simple">
                        <i class="fas fa-info-circle"></i>
                        <span>${this.t('backtestInfo')}</span>
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

                            <div class="daily-info" id="dailyInfo2">
                                <i class="fas fa-calendar-check"></i>
                                <span>${this.t('dailyBuyInfo')}: ~<strong id="dailyAmount2">${this.formatNumber(Math.round(this.monthlyAmount / 20))}</strong> ${this.t('perDay')}</span>
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
                                        <div class="chip-text">${m} ${this.t('monthUnit')}</div>
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
                            <div class="total-days-info" id="totalDaysInfo2">
                                <i class="fas fa-calendar-day"></i>
                                <span>ซื้อทั้งหมด <strong id="totalDays2">0</strong> วัน (จันทร์-ศุกร์)</span>
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
        const dcaResult = this.calculateDcaGold(
            this.monthlyAmount,
            this.months,
            fallbackPrice
        );

        const { totalGoldBaht, avgCostPrice, totalWorkingDays, debugInfo } = dcaResult;
        this.lastDcaAvgPrice = avgCostPrice;

        // อัปเดตเงินซื้อต่อวันโดยประมาณ (ใช้ค่าเฉลี่ย ~20 วัน/เดือน สำหรับ UI)
        const avgDailyAmount = Math.round(this.monthlyAmount / 20);
        const dailyAmountEl = document.getElementById('dailyAmount2');
        if (dailyAmountEl) {
            dailyAmountEl.textContent = this.formatNumber(avgDailyAmount);
        }

        // อัปเดตจำนวนวันทำการทั้งหมด
        const totalDaysEl = document.getElementById('totalDays2');
        if (totalDaysEl) {
            totalDaysEl.textContent = this.formatNumber(totalWorkingDays);
        }

        // Debug: แสดงข้อมูลการซื้อรายวัน
        if (this.debugMode) {
            console.log('=== 📊 การซื้อทองรายวัน (จันทร์-ศุกร์) ===');
            console.log(`ออมเดือนละ: ${this.formatNumber(this.monthlyAmount)} บาท`);
            console.log(`ระยะเวลา: ${this.months} เดือน`);
            console.log(`จำนวนวันทำการทั้งหมด: ${totalWorkingDays} วัน`);
            console.log('');
            console.log('📅 รายละเอียดแต่ละเดือน:');

            if (debugInfo && debugInfo.length > 0) {
                debugInfo.forEach((info, index) => {
                    console.log(`  [${index + 1}] ${info.month}: ${info.workingDays} วันทำการ, ซื้อวันละ ${this.formatNumber(info.dailyAmount)} บาท → ได้ทอง ${info.goldBought} บาททอง`);
                });
            }

            console.log('');
            console.log(`✅ ต้นทุนเฉลี่ย (DCA): ${this.formatNumber(Math.round(avgCostPrice))} บาท/บาททอง`);
            console.log('==========================================');
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

        // Debug summary
        if (this.debugMode) {
            console.log(`--- 📈 สรุปผลการออม ---`);
            console.log(`ยอดรวม: ${this.formatNumber(total)} บาท`);
            console.log(`ทองสะสม: ${totalGoldBaht.toFixed(4)} บาททอง`);
            console.log(`มูลค่าปัจจุบัน: ${this.formatNumber(Math.round(currentGoldValue))} บาท`);
            console.log(`กำไร/ขาดทุน: ${this.formatNumber(Math.round(profitAmount))} บาท (${profitPercent.toFixed(2)}%)`);
        }
    }

    /**
     * V2: Smart Recommendation - แสดง 3-5 สินค้าที่เกี่ยวข้องกับเงินออม
     * แบบ Hero + Supporting พร้อม Modal สำหรับดู variants
     */
    renderProducts({ goldBaht, estimatePrice }) {
        const grid = document.getElementById('productsGrid2');
        const priceForProductDisplay =
            Number.isFinite(estimatePrice) && estimatePrice > 0 ? estimatePrice : this.currentGoldPrice;
        const allProducts = GoldProducts.getProductsWithPrice(priceForProductDisplay).sort(
            (a, b) => a.multiplier - b.multiplier
        );

        // Debug: แสดงราคาสินค้าที่ใช้
        if (this.debugMode) {
            console.log('=== ราคาสินค้าในส่วนเป้าหมายทองคำแท่ง ===');
            allProducts.forEach(p => {
                const source = p.apiPrice ? '✅ API' : '⚙️ คำนวณ';
                const variantCount = GoldProducts.getVariantCount(p.weight);
                console.log(`${p.name} (${p.weight}): ${this.formatNumber(p.price)} บาท [${source}] - ${variantCount} ลาย`);
            });
            console.log('==========================================');
        }

        // แสดง Recommendation ทั้งหมด (ตามหมวด/น้ำหนักเหมือนเดิม)
        // หมายเหตุ: ยังใช้ UI แบบ Hero + Supporting + Modal เหมือน V2
        const recommendedProducts = allProducts;
        const productsByKey = new Map(
            recommendedProducts.map(p => [String(p.sku || p.id), p])
        );

        // หา Hero product (เป้าหมายถัดไปที่ใกล้ที่สุด)
        const heroProduct = this.findHeroProduct(recommendedProducts, goldBaht);

        let html = '';

        // Hero Section - สินค้าที่เป็นเป้าหมายถัดไป
        if (heroProduct) {
            html += this.renderHeroCard(heroProduct, goldBaht, priceForProductDisplay);
        }

        // Supporting Products
        const supportingProducts = recommendedProducts.filter(p => p !== heroProduct);
        if (supportingProducts.length > 0) {
            html += `<div class="smart-supporting-grid">`;
            supportingProducts.forEach(product => {
                html += this.renderSupportingCard(product, goldBaht, priceForProductDisplay);
            });
            html += `</div>`;
        }

        // ถ้าไม่มีสินค้าที่ซื้อได้เลย
        const anyAffordable = recommendedProducts.some(p => goldBaht >= p.multiplier);
        if (!anyAffordable && allProducts.length > 0) {
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

        // Smart image loading: load only near-viewport images, hero stays eager
        this.initGridLazyImages(grid);
        this.bindProductsGridEvents(grid, productsByKey);

        // Bind modal events
        this.bindModalEvents();
    }

    /**
     * Smart Recommendation: เลือก 3-5 สินค้าที่เกี่ยวข้อง
     */
    getSmartRecommendation(allProducts, goldBaht) {
        const result = [];

        // แบ่งกลุ่มสินค้า
        const affordable = []; // ซื้อได้แล้ว
        const almostThere = []; // ใกล้ถึง (70-99%)
        const nextGoals = []; // เป้าหมายถัดไป (< 70%)

        allProducts.forEach(product => {
            const progressPercent = (goldBaht / product.multiplier) * 100;

            if (progressPercent >= 100) {
                affordable.push({ ...product, progressPercent });
            } else if (progressPercent >= 70) {
                almostThere.push({ ...product, progressPercent });
            } else {
                nextGoals.push({ ...product, progressPercent });
            }
        });

        // เลือกสินค้า: 1-2 ซื้อได้ + 1-2 ใกล้ถึง + 1-2 เป้าหมาย
        // รวมไม่เกิน 5 ตัว

        // 1. สินค้าที่ซื้อได้ (เอา 2 ตัวล่าสุดที่ซื้อได้)
        const affordableToShow = affordable.slice(-2);
        result.push(...affordableToShow);

        // 2. สินค้าที่ใกล้ถึง (เอา 2 ตัวแรก)
        const almostToShow = almostThere.slice(0, 2);
        result.push(...almostToShow);

        // 3. เป้าหมายถัดไป (เอาให้ครบ 5 ตัว)
        const remaining = 5 - result.length;
        const nextToShow = nextGoals.slice(0, remaining);
        result.push(...nextToShow);

        // ถ้ายังไม่ครบ 3 ตัว ให้เพิ่มจาก nextGoals
        if (result.length < 3 && nextGoals.length > nextToShow.length) {
            const moreNeeded = 3 - result.length;
            const moreGoals = nextGoals.slice(nextToShow.length, nextToShow.length + moreNeeded);
            result.push(...moreGoals);
        }

        // เรียงตาม multiplier
        result.sort((a, b) => a.multiplier - b.multiplier);

        return result;
    }

    /**
     * หา Hero product - เป้าหมายถัดไปที่ใกล้ที่สุด
     */
    findHeroProduct(products, goldBaht) {
        // หาสินค้าที่ยังไม่ถึงเป้าแต่ใกล้ที่สุด (progress สูงสุดที่ < 100%)
        const notYetReached = products.filter(p => {
            const progress = (goldBaht / p.multiplier) * 100;
            return progress < 100;
        });

        if (notYetReached.length === 0) {
            // ถ้าซื้อได้หมดแล้ว ให้เอาตัวที่ราคาสูงสุดที่ซื้อได้
            return products[products.length - 1];
        }

        // เอาตัวที่ progress สูงสุด (ใกล้ถึงที่สุด)
        return notYetReached.reduce((best, current) => {
            const bestProgress = (goldBaht / best.multiplier) * 100;
            const currentProgress = (goldBaht / current.multiplier) * 100;
            return currentProgress > bestProgress ? current : best;
        });
    }

    /**
     * Render Hero Card - การ์ดใหญ่สำหรับเป้าหมายถัดไป
     */
    renderHeroCard(product, goldBaht, priceForProductDisplay) {
        const canAfford = goldBaht >= product.multiplier;
        const missingGold = Math.max(0, product.multiplier - goldBaht);
        const missingBahtEstimate = Math.ceil(missingGold * (product.apiPrice || priceForProductDisplay));
        const progressPercent = Math.min(100, (goldBaht / product.multiplier) * 100);
        const isAlmostThere = !canAfford && progressPercent >= 70;

        // ข้อมูล variants
        const variantCount = GoldProducts.getVariantCount(product.weight);
        const priceRange = GoldProducts.getPriceRange(product.weight);
        const hasManyVariants = variantCount > 1;

        // Badge
        let badgeHtml = '';
        let statusClass = '';
        if (canAfford) {
            badgeHtml = `<div class="hero-badge can-buy"><i class="fas fa-check-circle"></i> ${this.t('canBuy')}</div>`;
            statusClass = 'affordable';
        } else if (isAlmostThere) {
            badgeHtml = `<div class="hero-badge almost"><i class="fas fa-fire"></i> ${this.t('almostThere')}</div>`;
            statusClass = 'almost';
        } else {
            badgeHtml = `<div class="hero-badge next-goal"><i class="fas fa-bullseye"></i> เป้าหมายถัดไป</div>`;
            statusClass = 'next-goal';
        }

        // Progress bar
        let progressHtml = '';
        if (!canAfford) {
            progressHtml = `
                <div class="hero-progress">
                    <div class="hero-progress-bar" style="width: ${progressPercent.toFixed(1)}%"></div>
                    <span class="hero-progress-text">${progressPercent.toFixed(1)}%</span>
                </div>
                <p class="hero-diff">
                    ต้องออมเพิ่ม <strong>+${missingGold.toFixed(4)}</strong> ${this.t('bahtGold')}
                    <span>(~${this.formatNumber(missingBahtEstimate)} ${this.t('baht')})</span>
                </p>
            `;
        }

        // Price display
        let priceHtml = '';
        if (hasManyVariants && priceRange) {
            if (priceRange.min === priceRange.max) {
                priceHtml = `${this.formatNumber(priceRange.min)} ${this.t('baht')}`;
            } else {
                priceHtml = `${this.formatNumber(priceRange.min)} - ${this.formatNumber(priceRange.max)} ${this.t('baht')}`;
            }
        } else {
            priceHtml = `${this.formatNumber(product.price)} ${this.t('baht')}`;
        }

        // Variant badge
        const variantBadge = hasManyVariants
            ? `<span class="variant-count-badge">${variantCount} ลายให้เลือก</span>`
            : '';

        const productKey = String(product.sku || product.id);
        const imageCount = Array.isArray(product.images) ? product.images.length : 0;
        const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';
        const heroClickableClass = !hasManyVariants && canAfford && product.link ? 'is-clickable' : '';
        const heroClickableAttrs = !hasManyVariants && canAfford && product.link
            ? `data-link="${product.link}" tabindex="0" role="link"`
            : '';
        const actionsHtml = hasManyVariants
            ? `
                <div class="hero-actions">
                    <button class="hero-btn select-variant" type="button" data-weight="${product.weight}" data-affordable="${canAfford ? 1 : 0}">
                        <i class="fas ${canAfford ? 'fa-th' : 'fa-lock'}"></i> ${canAfford ? 'เลือกลาย' : 'ดูตัวอย่างลาย'}
                    </button>
                </div>
            `
            : '';

        return `
            <div class="hero-card ${statusClass} ${heroClickableClass}" ${heroClickableAttrs} data-affordable="${canAfford ? 1 : 0}" data-weight="${product.weight}">
	                ${badgeHtml}
	                <div class="hero-content">
	                    <button type="button" class="hero-image js-img-preview" data-images-key="${productKey}" aria-label="ดูรูปภาพ">
	                        <img src="${product.image}" alt="${product.name}" loading="eager" decoding="async" fetchpriority="high"
	                             onerror="this.src='${this.getNoImageFallbackDataUri()}';">
	                        ${imageCountBadge}
	                    </button>
	                    <div class="hero-info">
	                        <h3 class="hero-name">${this.currentLang === 'en' ? product.nameEn : product.name}</h3>
	                        <p class="hero-weight">${product.weight} ${variantBadge}</p>
	                        <p class="hero-price">${priceHtml}</p>
	                        ${progressHtml}
                            ${actionsHtml}
	                    </div>
	                </div>
	            </div>
        `;
    }

    /**
     * Render Supporting Card - การ์ดเล็กสำหรับสินค้าอื่นๆ
     */
    renderSupportingCard(product, goldBaht, priceForProductDisplay) {
        const canAfford = goldBaht >= product.multiplier;
        const progressPercent = Math.min(100, (goldBaht / product.multiplier) * 100);
        const isAlmostThere = !canAfford && progressPercent >= 70;

        // ข้อมูล variants
        const variantCount = GoldProducts.getVariantCount(product.weight);
        const priceRange = GoldProducts.getPriceRange(product.weight);
        const hasManyVariants = variantCount > 1;

        // Status class
        let statusClass = '';
        let statusIcon = '';
        if (canAfford) {
            statusClass = 'affordable';
            statusIcon = '<i class="fas fa-check status-icon affordable"></i>';
        } else if (isAlmostThere) {
            statusClass = 'almost';
            statusIcon = '<i class="fas fa-clock status-icon almost"></i>';
        } else {
            statusClass = 'locked';
            statusIcon = '<i class="fas fa-lock status-icon locked"></i>';
        }

        // Price display
        let priceHtml = '';
        if (hasManyVariants && priceRange) {
            priceHtml = `ราคา ${this.formatNumber(priceRange.min)}`;
        } else {
            priceHtml = `${this.formatNumber(product.price)}`;
        }

        // Variant info
        const variantInfo = hasManyVariants
            ? `<span class="variant-hint">${variantCount} ลาย</span>`
            : '';

        const productKey = String(product.sku || product.id);
        const imageCount = Array.isArray(product.images) ? product.images.length : 0;
        const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';

        return `
            <div class="supporting-card ${statusClass}" data-weight="${product.weight}" data-affordable="${canAfford ? 1 : 0}">
                ${statusIcon}
                <button type="button" class="supporting-img js-img-preview" data-images-key="${productKey}" aria-label="ดูรูปภาพ">
                    <img class="lazy-img" src="${this.imagePlaceholder}" data-src="${product.image}" alt="${product.name}"
                         loading="lazy" decoding="async" fetchpriority="low"
                         onerror="this.src='${this.getNoImageFallbackDataUri()}'; this.classList.add('is-loaded'); this.removeAttribute('data-src');">
                    ${imageCountBadge}
                </button>
                <div class="supporting-info">
                    <p class="supporting-weight">${product.weight}</p>
                    <p class="supporting-price">${priceHtml} <span class="currency">${this.t('baht')}</span></p>
                    ${variantInfo}
                    <div class="supporting-progress">
                        <div class="progress-fill" style="width: ${progressPercent.toFixed(1)}%"></div>
                    </div>
                    <p class="supporting-percent">${progressPercent.toFixed(0)}%</p>
                </div>
                ${hasManyVariants ? `<div class="tap-hint">${canAfford ? 'แตะเพื่อเลือกลาย' : 'แตะเพื่อดูตัวอย่าง (ล็อก)'}</div>` : ''}
            </div>
        `;
    }

    /**
     * Bind Modal Events
     */
    bindModalEvents() {
        // Hero button - เลือกลาย (locked -> preview only)
        const selectVariantBtns = document.querySelectorAll('.select-variant');
        selectVariantBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const weight = btn.dataset.weight;
                const locked = btn.dataset.affordable !== '1';
                this.openVariantModal(weight, { locked });
            });
        });

        // Supporting cards - tap to open modal (ignore image preview clicks)
        const supportingCards = document.querySelectorAll('.supporting-card');
        supportingCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.js-img-preview')) return;
                const weight = card.dataset.weight;
                const variantCount = GoldProducts.getVariantCount(weight);
                if (variantCount > 1) {
                    const locked = card.dataset.affordable !== '1';
                    this.openVariantModal(weight, { locked });
                } else {
                    // ถ้ามีแค่ตัวเดียว ให้เปิด link โดยตรง
                    if (card.dataset.affordable === '1') {
                        const variants = GoldProducts.getVariantsByWeight(weight);
                        if (variants.length > 0) {
                            window.open(variants[0].link, '_blank');
                        }
                    }
                }
            });
        });
    }

    /**
     * Open Variant Modal
     */
    openVariantModal(weightLabel, options = {}) {
        const variants = GoldProducts.getVariantsByWeight(weightLabel);
        if (variants.length === 0) return;
        const isLocked = !!options.locked;
        const variantsByKey = new Map(variants.map(v => [String(v.sku || v.id), v]));

        // Remove existing modal
        const existingModal = document.getElementById('variantModal');
        if (existingModal) {
            try {
                if (typeof existingModal._cleanup === 'function') existingModal._cleanup();
            } catch (_) {
                // ignore
            }
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'variantModal';
        modal.className = `variant-modal${isLocked ? ' locked' : ''}`;

        const noImageFallback = this.getNoImageFallbackDataUri();
        let variantsHtml = variants.map(variant => {
            const variantKey = String(variant.sku || variant.id);
            const imageCount = Array.isArray(variant.images) ? variant.images.length : 0;
            const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';
            return `
                <div class="variant-item" data-variant-key="${variantKey}" tabindex="0" role="link">
                    <button type="button" class="variant-img js-img-preview" data-variant-key="${variantKey}" aria-label="ดูรูปภาพ">
                        <img class="lazy-img" src="${this.imagePlaceholder}" data-src="${variant.image}" alt="${variant.name}"
                             loading="lazy" decoding="async" fetchpriority="low"
                             onerror="this.src='${noImageFallback}'; this.classList.add('is-loaded'); this.removeAttribute('data-src');">
                        ${imageCountBadge}
                    </button>
                    <div class="variant-info">
                        <h4 class="variant-name">${variant.name}</h4>
                        <p class="variant-price">${this.formatNumber(variant.price)} ${this.t('baht')}</p>
                    </div>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="variant-modal-backdrop"></div>
            <div class="variant-modal-content">
                <div class="variant-modal-header">
                    <h3><i class="fas fa-th"></i> ทองแท่ง ${weightLabel} - เลือกลายที่ชอบ</h3>
                    <button class="variant-modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="variant-modal-body">
                    <p class="variant-count-info">
                        มีทั้งหมด ${variants.length} ลายให้เลือก
                        ${isLocked ? '<span class="variant-locked-note"> (โหมดตัวอย่าง - ออมถึงเป้าหมายก่อนเพื่อกดเลือก)</span>' : ''}
                    </p>
                    <div class="variant-grid">
                        ${variantsHtml}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const variantGrid = modal.querySelector('.variant-grid');
        const variantClickHandler = (e) => {
            if (isLocked) {
                e.preventDefault();
                return;
            }
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && modal.contains(previewBtn)) {
                e.preventDefault();
                e.stopPropagation();
                const key = previewBtn.dataset.variantKey;
                const variant = key ? variantsByKey.get(String(key)) : null;
                const images = Array.isArray(variant?.images) && variant.images.length > 0
                    ? variant.images
                    : variant?.image
                        ? [variant.image]
                        : [];
                if (images.length === 0) return;
                this.openImageLightbox({ title: variant?.name || '', images, startIndex: 0 });
                return;
            }

            const item = e.target.closest('.variant-item');
            if (!item || !modal.contains(item)) return;
            const key = item.dataset.variantKey;
            const variant = key ? variantsByKey.get(String(key)) : null;
            if (variant?.link) window.open(variant.link, '_blank');
        };

        const variantKeyHandler = (e) => {
            if (isLocked) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const item = e.target.closest('.variant-item');
            if (!item || !modal.contains(item)) return;
            e.preventDefault();
            const key = item.dataset.variantKey;
            const variant = key ? variantsByKey.get(String(key)) : null;
            if (variant?.link) window.open(variant.link, '_blank');
        };

        variantGrid?.addEventListener('click', variantClickHandler);
        variantGrid?.addEventListener('keydown', variantKeyHandler);

        // Progressive image loading within the modal scroll container
        const modalBody = modal.querySelector('.variant-modal-body');
        const modalImgs = Array.from(modal.querySelectorAll('img[data-src]'));
        let modalObserver = null;
        if (modalImgs.length > 0) {
            if (typeof IntersectionObserver === 'undefined') {
                modalImgs.forEach(img => this.loadLazyImage(img));
            } else {
                modalObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => {
                            if (!entry.isIntersecting) return;
                            const img = entry.target;
                            modalObserver?.unobserve(img);
                            this.loadLazyImage(img);
                        });
                    },
                    { root: modalBody, rootMargin: '200px 0px', threshold: 0.01 }
                );
                modalImgs.forEach(img => modalObserver.observe(img));
            }
        }

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Close events
        const closeBtn = modal.querySelector('.variant-modal-close');
        const backdrop = modal.querySelector('.variant-modal-backdrop');

        const closeModal = () => {
            if (modalObserver) modalObserver.disconnect();
            variantGrid?.removeEventListener('click', variantClickHandler);
            variantGrid?.removeEventListener('keydown', variantKeyHandler);
            document.removeEventListener('keydown', escHandler);
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escHandler);

        // Expose cleanup for any forced removal
        modal._cleanup = () => {
            if (modalObserver) modalObserver.disconnect();
            variantGrid?.removeEventListener('click', variantClickHandler);
            variantGrid?.removeEventListener('keydown', variantKeyHandler);
            document.removeEventListener('keydown', escHandler);
        };
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
