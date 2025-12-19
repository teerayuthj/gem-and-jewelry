/**
 * Gold Saving Calculator 3
 * Goal-First Design - เลือกเป้าหมายทองคำก่อน แล้วคำนวณแผนออม
 */

class GoldSavingCalculator3 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLang = 'th';
        this.currentUIStyle = 'minimal';

        // เป้าหมายที่เลือก
        this.selectedGoal = null;
        this.selectedPlan = null;
        this.planAmount = null;
        this.planMonths = null;
        this.planGoalIndex = null;

        // ค่าเริ่มต้น
        this.monthlyAmounts = [3000, 5000, 10000, 20000, 50000];
        this.customAmount = null;

        // ราคาทอง
        this.currentGoldPrice = GoldProducts.baseGoldPrice;
        this.dailyPrices = [];
        this.weightedAvgPrice = 0;
        this.workingDaysPerMonth = 20;
        this.maxMonths = 84;

        // Goals (น้ำหนักทอง) - จะดึงจาก GoldProducts
        this.goals = [];

        // Local persistence (simple lead capture, stored only in this browser)
        this.localStorageKey = 'goldSavingCalculator3.local.v1';
        this.localLead = {
            name: '',
            email: '',
            phoneCountry: '+66',
            phone: '',
            lineId: ''
        };

        // Country codes for phone
        this.countryCodes = [
            { code: '+66', country: '🇹🇭 TH', name: 'Thailand' },
            { code: '+1', country: '🇺🇸 US', name: 'United States' },
            { code: '+44', country: '🇬🇧 UK', name: 'United Kingdom' },
            { code: '+81', country: '🇯🇵 JP', name: 'Japan' },
            { code: '+82', country: '🇰🇷 KR', name: 'South Korea' },
            { code: '+86', country: '🇨🇳 CN', name: 'China' },
            { code: '+852', country: '🇭🇰 HK', name: 'Hong Kong' },
            { code: '+65', country: '🇸🇬 SG', name: 'Singapore' },
            { code: '+60', country: '🇲🇾 MY', name: 'Malaysia' },
            { code: '+84', country: '🇻🇳 VN', name: 'Vietnam' },
            { code: '+62', country: '🇮🇩 ID', name: 'Indonesia' },
            { code: '+63', country: '🇵🇭 PH', name: 'Philippines' },
            { code: '+91', country: '🇮🇳 IN', name: 'India' },
            { code: '+971', country: '🇦🇪 AE', name: 'UAE' },
            { code: '+49', country: '🇩🇪 DE', name: 'Germany' },
            { code: '+33', country: '🇫🇷 FR', name: 'France' },
            { code: '+61', country: '🇦🇺 AU', name: 'Australia' },
            { code: '+64', country: '🇳🇿 NZ', name: 'New Zealand' }
        ];
        this.localUi = {
            contactOpen: false
        };
        this.localMeta = {
            lastSavedHash: '',
            lastSavedAt: null
        };
        this._persistTimer = null;
        this._saveInProgress = false;

        // Translations
        this.translations = {
            th: {
                title: 'เลือกเป้าหมายทองคำของคุณ',
                subtitle: 'แล้วเราจะบอกว่าต้องออมเท่าไหร่',
                selectGoal: 'เลือกเป้าหมาย',
                selectPlan: 'เลือกแผนออม',
                yourGoal: 'เป้าหมายของคุณ',
                targetPrice: 'ราคาเป้าหมาย',
                monthlyLabel: 'ออมเดือนละ',
                perDay: 'บาท/วัน',
                months: 'เดือน',
                reachGoal: 'ถึงเป้าหมาย',
                customAmount: 'กำหนดจำนวนเอง',
                result: 'สรุปแผนออมของคุณ',
                totalSaving: 'เงินออมทั้งหมด',
                duration: 'ระยะเวลา',
                goldWeight: 'ได้ทอง',
                baht: 'บาท',
                bahtGold: 'บาททอง',
                startNow: 'เริ่มออมเลย!',
                viewDetails: 'ดูรายละเอียด',
                backtestPreview: 'ถ้าออมย้อนหลัง',
                avgCost: 'ต้นทุนเฉลี่ย',
                currentValue: 'มูลค่าปัจจุบัน',
                profitLoss: 'กำไร/ขาดทุน',
                benefit1: 'ทองคำรักษามูลค่าดีกว่าเงินสด',
                benefit2: 'ออมทุกวัน สร้างวินัยทางการเงิน',
                benefit3: 'เป็นเจ้าของทองได้ง่ายๆ',
                disclaimer: 'ราคาทองอ้างอิงจากราคาตลาด อาจมีการเปลี่ยนแปลง ผลการคำนวณเป็นเพียงประมาณการ',
                contactTitle: 'บันทึกแผน & ให้เราติดต่อกลับ',
                contactSubtitle: 'ไม่บังคับ — กรอกเมื่อพร้อม',
                localOnly: 'ข้อมูลนี้จะถูกส่งให้ทีมงานเพื่อติดต่อกลับตามความสนใจของคุณ',
                planSummary: 'แผนตอนนี้',
                nameLabel: 'ชื่อ',
                emailLabel: 'อีเมล',
                phoneLabel: 'เบอร์โทร',
                lineIdLabel: 'LINE ID',
                optionalLabel: 'ไม่บังคับ',
                clearLocal: 'ล้างข้อมูลที่กรอก',
                savePlan: 'บันทึก',
                copySummary: 'คัดลอกสรุป',
                saved: 'บันทึกข้อมูลแล้ว',
                cleared: 'ล้างข้อมูลแล้ว',
                noChanges: 'ไม่มีการเปลี่ยนแปลง',
                copied: 'คัดลอกแล้ว',
                halfBaht: 'ครึ่งบาท',
                oneBaht: '1 บาท',
                twoBaht: '2 บาท',
                fiveBaht: '5 บาท',
                tenBaht: '10 บาท'
            },
            en: {
                title: 'Choose Your Gold Goal',
                subtitle: "We'll tell you how much to save",
                selectGoal: 'Select Goal',
                selectPlan: 'Select Saving Plan',
                yourGoal: 'Your Goal',
                targetPrice: 'Target Price',
                monthlyLabel: 'Save monthly',
                perDay: 'THB/day',
                months: 'months',
                reachGoal: 'Reach goal in',
                customAmount: 'Custom amount',
                result: 'Your Saving Plan Summary',
                totalSaving: 'Total Savings',
                duration: 'Duration',
                goldWeight: 'Gold Weight',
                baht: 'THB',
                bahtGold: 'Baht Gold',
                startNow: 'Start Saving!',
                viewDetails: 'View Details',
                backtestPreview: 'Historical simulation',
                avgCost: 'Avg Cost',
                currentValue: 'Current Value',
                profitLoss: 'Profit/Loss',
                benefit1: 'Gold preserves value better than cash',
                benefit2: 'Daily savings build discipline',
                benefit3: 'Own gold bars easily',
                disclaimer: 'Gold prices based on market rates and may change. Calculations are estimates only.',
                contactTitle: 'Save Plan & Contact Info',
                contactSubtitle: 'Optional — fill when ready',
                localOnly: 'Your info will be sent to our team to contact you based on your interest',
                planSummary: 'Current plan',
                nameLabel: 'Name',
                emailLabel: 'Email',
                phoneLabel: 'Phone',
                lineIdLabel: 'LINE ID',
                optionalLabel: 'Optional',
                clearLocal: 'Clear fields',
                savePlan: 'Save',
                copySummary: 'Copy summary',
                saved: 'Saved',
                cleared: 'Cleared',
                noChanges: 'No changes',
                copied: 'Copied',
                halfBaht: 'Half Baht',
                oneBaht: '1 Baht',
                twoBaht: '2 Baht',
                fiveBaht: '5 Baht',
                tenBaht: '10 Baht'
            },
            cn: {
                title: '选择您的黄金目标',
                subtitle: '我们会告诉您需要储蓄多少',
                selectGoal: '选择目标',
                selectPlan: '选择储蓄计划',
                yourGoal: '您的目标',
                targetPrice: '目标价格',
                monthlyLabel: '每月储蓄',
                perDay: '泰铢/天',
                months: '个月',
                reachGoal: '达成目标',
                customAmount: '自定义金额',
                result: '储蓄计划摘要',
                totalSaving: '总储蓄',
                duration: '期限',
                goldWeight: '黄金重量',
                baht: '泰铢',
                bahtGold: '泰铢黄金',
                startNow: '开始储蓄!',
                viewDetails: '查看详情',
                backtestPreview: '历史模拟',
                avgCost: '平均成本',
                currentValue: '当前价值',
                profitLoss: '盈亏',
                benefit1: '黄金比现金更保值',
                benefit2: '每日储蓄培养纪律',
                benefit3: '轻松拥有金条',
                disclaimer: '金价基于市场行情，可能会有变化。计算结果仅供参考。',
                contactTitle: '保存计划与联系方式',
                contactSubtitle: '非必填 — 准备好再填写',
                localOnly: '您的信息将发送给我们的团队，以便根据您的兴趣与您联系',
                planSummary: '当前计划',
                nameLabel: '姓名',
                emailLabel: '邮箱',
                phoneLabel: '电话',
                lineIdLabel: 'LINE ID',
                optionalLabel: '非必填',
                clearLocal: '清除已填写信息',
                savePlan: '保存',
                copySummary: '复制摘要',
                saved: '已保存',
                cleared: '已清除',
                noChanges: '无变化',
                copied: '已复制',
                halfBaht: '半泰铢',
                oneBaht: '1泰铢',
                twoBaht: '2泰铢',
                fiveBaht: '5泰铢',
                tenBaht: '10泰铢'
            }
        };

        this.restoreLocalState();
        this.init();
    }

    async init() {
        // รอ GoldProducts โหลด
        if (typeof GoldProducts !== 'undefined' && !GoldProducts.isLoaded) {
            await GoldProducts.init();
        }

        // สร้าง Goals จาก GoldProducts
        this.buildGoalsFromProducts();

        // ดึงราคาทอง
        await this.fetchEndOfMonthPrices();

        this.render();
        this.bindEvents();
    }

    buildGoalsFromProducts() {
        // ดึงน้ำหนักที่ไม่ซ้ำจาก GoldProducts
        const weights = new Set();
        const productsWithPrice = GoldProducts.getProductsWithPrice(this.currentGoldPrice);
        const products = productsWithPrice.length > 0 ? productsWithPrice : GoldProducts.getProducts();

        products.forEach(p => {
            if (p.weight) {
                weights.add(p.weight);
            }
        });

        // สร้าง Goals ตามน้ำหนัก
        const sortedWeights = Array.from(weights).sort((a, b) => a - b);

        // เลือกเฉพาะน้ำหนักหลักๆ
        const mainWeights = [0.5, 1, 2, 5, 10];
        const icons = ['🥇', '🏆', '👑', '💎', '🌟'];
        const labels = {
            th: { 0.5: 'ครึ่งบาท', 1: '1 บาท', 2: '2 บาท', 5: '5 บาท', 10: '10 บาท' },
            en: { 0.5: 'Half Baht', 1: '1 Baht', 2: '2 Baht', 5: '5 Baht', 10: '10 Baht' },
            cn: { 0.5: '半泰铢', 1: '1泰铢', 2: '2泰铢', 5: '5泰铢', 10: '10泰铢' }
        };

        this.goals = mainWeights.map((weight, index) => {
            const product = products.find(p => {
                if (Number.isFinite(p.multiplier) && p.multiplier === weight) return true;
                if (typeof p.weight === 'string') {
                    const match = p.weight.match(/([0-9.]+)\s*บาท/);
                    if (match && Number(match[1]) === weight) return true;
                }
                return false;
            });
            const price = product ? product.price : weight * this.currentGoldPrice;

            return {
                weight: weight,
                price: price,
                icon: icons[index] || '🥇',
                labels: {
                    th: labels.th[weight] || `${weight} บาท`,
                    en: labels.en[weight] || `${weight} Baht`,
                    cn: labels.cn[weight] || `${weight}泰铢`
                }
            };
        });
    }

    async fetchEndOfMonthPrices() {
        try {
            const response = await fetch('https://www.ausiris.co.th/api/daily-gold-price?limit=2000');
            if (!response.ok) throw new Error('Failed to fetch prices');

            const data = await response.json();
            if (data.success && data.data) {
                this.dailyPrices = data.data.map(item => ({
                    date: item.date,
                    price: parseFloat(item.bar_buy) || parseFloat(item.buy96_5)
                })).filter(item => item.price > 0);

                // คำนวณ max months จากข้อมูล
                if (this.dailyPrices.length > 0) {
                    const totalDays = this.dailyPrices.length;
                    this.maxMonths = Math.floor(totalDays / this.workingDaysPerMonth);
                }
            }
        } catch (error) {
            console.warn('Price history unavailable, using defaults:', error);
            this.dailyPrices = [];
        }
    }

    t(key) {
        return this.translations[this.currentLang][key] || key;
    }

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => {
            switch (ch) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return ch;
            }
        });
    }

    readLocalState() {
        try {
            if (typeof localStorage === 'undefined') return null;
            const raw = localStorage.getItem(this.localStorageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (_) {
            return null;
        }
    }

    writeLocalState(state) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(this.localStorageKey, JSON.stringify(state));
        } catch (_) {
            // ignore
        }
    }

    getLocalStateSnapshot() {
        return {
            planAmount: this.planAmount,
            planMonths: this.planMonths,
            planGoalIndex: this.planGoalIndex,
            lead: { ...this.localLead },
            ui: { ...this.localUi },
            meta: { ...this.localMeta },
            updatedAt: new Date().toISOString()
        };
    }

    queuePersistLocalState() {
        if (this._persistTimer) clearTimeout(this._persistTimer);
        this._persistTimer = setTimeout(() => {
            this.writeLocalState(this.getLocalStateSnapshot());
            this._persistTimer = null;
        }, 250);
    }

    restoreLocalState() {
        const state = this.readLocalState();
        if (!state) return;

        const planAmount = Number(state.planAmount);
        if (Number.isFinite(planAmount) && planAmount > 0) {
            this.planAmount = Math.round(planAmount);
        }

        const planMonths = Number(state.planMonths);
        if (Number.isFinite(planMonths) && planMonths > 0) {
            this.planMonths = Math.round(planMonths);
        }

        const planGoalIndex = Number(state.planGoalIndex);
        if (Number.isFinite(planGoalIndex) && planGoalIndex >= 0) {
            this.planGoalIndex = planGoalIndex;
        }

        const lead = state.lead && typeof state.lead === 'object' ? state.lead : {};
        this.localLead = {
            name: typeof lead.name === 'string' ? lead.name : '',
            email: typeof lead.email === 'string' ? lead.email : '',
            phoneCountry: typeof lead.phoneCountry === 'string' ? lead.phoneCountry : '+66',
            phone: typeof lead.phone === 'string' ? lead.phone : '',
            lineId: typeof lead.lineId === 'string' ? lead.lineId : ''
        };

        const ui = state.ui && typeof state.ui === 'object' ? state.ui : {};
        this.localUi = {
            contactOpen: Boolean(ui.contactOpen)
        };

        const meta = state.meta && typeof state.meta === 'object' ? state.meta : {};
        this.localMeta = {
            lastSavedHash: typeof meta.lastSavedHash === 'string' ? meta.lastSavedHash : '',
            lastSavedAt: typeof meta.lastSavedAt === 'string' ? meta.lastSavedAt : null
        };
    }

    clearLocalLead() {
        this.localLead = { name: '', email: '', phoneCountry: '+66', phone: '', lineId: '' };
        this.localUi = { ...this.localUi, contactOpen: false };
        this.queuePersistLocalState();
    }

    setLeadStatus(messageKey, variant = 'success') {
        const el = document.getElementById('leadStatus3');
        if (!el) return;
        el.classList.remove('success', 'info');
        el.classList.add(variant);
        el.textContent = this.t(messageKey);
        el.classList.add('show');
        window.clearTimeout(el._t);
        el._t = window.setTimeout(() => {
            el.classList.remove('show');
        }, 3000);
    }

    hashString(input) {
        const str = String(input ?? '');
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
        }
        return (h >>> 0).toString(16);
    }

    getLeadPayloadHash() {
        const payload = {
            planAmount: Math.round(Number(this.planAmount) || 0),
            planMonths: Math.round(Number(this.planMonths) || 0),
            planGoalIndex: Number.isFinite(this.planGoalIndex) ? this.planGoalIndex : null,
            lead: {
                name: String(this.localLead.name || '').trim(),
                email: String(this.localLead.email || '').trim(),
                phoneCountry: String(this.localLead.phoneCountry || '+66'),
                phone: String(this.localLead.phone || '').trim(),
                lineId: String(this.localLead.lineId || '').trim()
            }
        };
        return this.hashString(JSON.stringify(payload));
    }

    updateSaveButtonState() {
        const saveBtn = document.getElementById('leadSave3');
        if (!saveBtn) return;
        const currentHash = this.getLeadPayloadHash();
        const isUnchanged = currentHash && currentHash === this.localMeta.lastSavedHash;
        const disabled = this._saveInProgress || isUnchanged;
        saveBtn.disabled = disabled;
        saveBtn.classList.toggle('is-disabled', disabled);
    }

    async copyToClipboard(text) {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {
            // fallback
        }
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            ta.remove();
            return ok;
        } catch (_) {
            return false;
        }
    }

    getGoalLabelByIndex(index) {
        if (!Number.isFinite(index)) return '';
        const goal = this.goals[index];
        if (!goal) return '';
        return goal.labels[this.currentLang] || goal.labels['th'] || '';
    }

    getPlanSummaryHtml() {
        const t = this.t.bind(this);
        if (!this.planAmount || !this.planMonths) {
            return `${t('planSummary')}: -`;
        }
        const goalIndex = this.selectedGoal !== null ? this.selectedGoal : this.planGoalIndex;
        const goalLabel = this.getGoalLabelByIndex(goalIndex);
        const goalText = goalLabel ? `${goalLabel} • ` : '';
        return `${t('planSummary')}: ${goalText}<strong>${this.formatNumber(this.planAmount)}</strong> ${t('baht')}, <strong>${this.planMonths}</strong> ${t('months')}`;
    }

    getLeadSummaryText() {
        const parts = [];
        const t = this.t.bind(this);
        const goalIndex = this.selectedGoal !== null ? this.selectedGoal : this.planGoalIndex;
        const goalLabel = this.getGoalLabelByIndex(goalIndex);
        if (goalLabel) parts.push(`${t('yourGoal')}: ${goalLabel}`);
        if (this.planAmount && this.planMonths) {
            parts.push(`${t('planSummary')}: ${this.formatNumber(this.planAmount)} ${t('baht')}, ${this.planMonths} ${t('months')}`);
        } else {
            parts.push(`${t('planSummary')}: -`);
        }
        if (this.localLead.name) parts.push(`${t('nameLabel')}: ${this.localLead.name}`);
        if (this.localLead.email) parts.push(`${t('emailLabel')}: ${this.localLead.email}`);
        if (this.localLead.phone) {
            const fullPhone = `${this.localLead.phoneCountry} ${this.localLead.phone}`;
            parts.push(`${t('phoneLabel')}: ${fullPhone}`);
        }
        if (this.localLead.lineId) parts.push(`${t('lineIdLabel')}: ${this.localLead.lineId}`);
        return parts.join('\n');
    }

    formatNumber(num) {
        return num.toLocaleString('th-TH');
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.render();
        this.bindEvents();
        this.updateLeadPlanSummary();
        this.updateSaveButtonState();
        if (this.selectedGoal !== null) {
            this.selectGoal(this.selectedGoal);
        }
    }

    setUIStyle(style) {
        this.currentUIStyle = style;
    }

    calculateMonthsNeeded(targetPrice, monthlyAmount) {
        const dailyAmount = monthlyAmount / this.workingDaysPerMonth;
        let totalSaved = 0;
        let months = 0;

        // คำนวณแบบ DCA
        while (totalSaved < targetPrice && months < this.maxMonths) {
            totalSaved += monthlyAmount;
            months++;
        }

        return months;
    }

    calculateBacktest(monthlyAmount, months) {
        if (this.dailyPrices.length === 0) {
            return {
                totalCost: 0,
                goldWeight: 0,
                avgPrice: 0,
                currentValue: 0,
                profitLoss: 0,
                profitPercent: 0
            };
        }

        const totalDays = months * this.workingDaysPerMonth;
        const dailyAmount = monthlyAmount / this.workingDaysPerMonth;

        // ใช้ราคาย้อนหลัง
        const pricesToUse = this.dailyPrices.slice(0, Math.min(totalDays, this.dailyPrices.length));

        let totalCost = 0;
        let totalGoldWeight = 0;

        pricesToUse.forEach(day => {
            const goldBought = dailyAmount / day.price;
            totalCost += dailyAmount;
            totalGoldWeight += goldBought;
        });

        const avgPrice = totalGoldWeight > 0 ? totalCost / totalGoldWeight : 0;
        const currentPrice = this.currentGoldPrice;
        const currentValue = totalGoldWeight * currentPrice;
        const profitLoss = currentValue - totalCost;

        return {
            totalCost: totalCost,
            goldWeight: totalGoldWeight,
            avgPrice: avgPrice,
            currentValue: currentValue,
            profitLoss: profitLoss,
            profitPercent: totalCost > 0 ? (profitLoss / totalCost) * 100 : 0
        };
    }

    render() {
        const t = this.t.bind(this);

        this.container.innerHTML = `
            <div class="gold-saving3-wrapper">
                <!-- Header -->
                <header class="saving3-header">
                    <h1 class="saving3-title">${t('title')}</h1>
                    <p class="saving3-subtitle">${t('subtitle')}</p>
                </header>

                <!-- Step 1: เลือกเป้าหมาย -->
                <section class="goal-section">
                    <h2 class="goal-section-title">
                        <i class="fas fa-bullseye"></i>
                        <span>${t('selectGoal')}</span>
                    </h2>
                    <div class="goal-grid" id="goalGrid">
                        ${this.renderGoalCards()}
                    </div>
                </section>

                <!-- Step 2: เลือกแผนออม -->
                <section class="plan-section" id="planSection">
                    <h2 class="plan-section-title">
                        <i class="fas fa-wallet"></i>
                        <span>${t('selectPlan')}</span>
                    </h2>
                    <div class="selected-goal-info" id="selectedGoalInfo">
                        <!-- จะแสดงเมื่อเลือกเป้าหมาย -->
                    </div>
                    <div class="plan-options" id="planOptions">
                        <!-- จะ render เมื่อเลือกเป้าหมาย -->
                    </div>
                    <div class="custom-amount-section" id="customAmountSection">
                        <div class="custom-amount-label">${t('customAmount')}</div>
                        <div class="custom-amount-input">
                            <input type="number" id="customAmountInput" placeholder="10000" min="1000" step="1000">
                            <span class="custom-amount-result" id="customAmountResult">-</span>
                        </div>
                    </div>
                </section>

                <!-- Step 3: ผลลัพธ์ -->
                <section class="result-section" id="resultSection">
                    <div class="result-card">
                        <h3 class="result-title">${t('result')}</h3>
                        <div class="result-summary" id="resultSummary">
                            <!-- จะ render เมื่อเลือกแผน -->
                        </div>
                        <button class="cta-button" id="ctaButton">
                            <i class="fas fa-play-circle"></i>
                            <span>${t('startNow')}</span>
                        </button>

                        <!-- Backtest Preview -->
                        <div class="profit-preview" id="profitPreview">
                            <div class="profit-preview-title">
                                <i class="fas fa-chart-line"></i>
                                <span>${t('backtestPreview')}</span>
                            </div>
                            <div class="profit-stats" id="profitStats">
                                <!-- จะ render เมื่อเลือกแผน -->
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Benefits -->
                <section class="benefits3">
                    <div class="benefit3">
                        <div class="benefit3-icon"><i class="fas fa-shield-alt"></i></div>
                        <span>${t('benefit1')}</span>
                    </div>
                    <div class="benefit3">
                        <div class="benefit3-icon"><i class="fas fa-piggy-bank"></i></div>
                        <span>${t('benefit2')}</span>
                    </div>
                    <div class="benefit3">
                        <div class="benefit3-icon"><i class="fas fa-gem"></i></div>
                        <span>${t('benefit3')}</span>
                    </div>
                </section>

                <!-- Disclaimer -->
                <div class="disclaimer3">
                    <i class="fas fa-info-circle"></i>
                    <span>${t('disclaimer')}</span>
                </div>

                <!-- Contact Section -->
                <section class="contact-section3">
                    <button class="contact-toggle3" id="contactToggle">
                        <i class="fas fa-bookmark"></i>
                        <span>${t('contactTitle')}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="contact-panel3 ${this.localUi.contactOpen ? 'open' : ''}" id="contactPanel">
                        <div class="lead-privacy">
                            <i class="fas fa-lock"></i>
                            <span>${t('localOnly')}</span>
                        </div>

                        <div class="lead-plan-pill">
                            <i class="fas fa-coins"></i>
                            <span id="leadPlanSummary3">${this.getPlanSummaryHtml()}</span>
                        </div>

                        <div class="lead-grid">
                            <div class="lead-field">
                                <label for="leadName3">${t('nameLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                <input id="leadName3" class="lead-input" type="text" autocomplete="name" inputmode="text" value="${this.escapeHtml(this.localLead.name)}" />
                            </div>
                            <div class="lead-field">
                                <label for="leadEmail3">${t('emailLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                <input id="leadEmail3" class="lead-input" type="email" autocomplete="email" inputmode="email" value="${this.escapeHtml(this.localLead.email)}" />
                            </div>
                            <div class="lead-field lead-field-phone">
                                <label for="leadPhone3">${t('phoneLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                <div class="phone-input-group">
                                    <select id="leadPhoneCountry3" class="lead-input phone-country-select">
                                        ${this.countryCodes.map(c => `<option value="${c.code}" ${c.code === this.localLead.phoneCountry ? 'selected' : ''}>${c.country} ${c.code}</option>`).join('')}
                                    </select>
                                    <input id="leadPhone3" class="lead-input phone-number-input" type="tel" autocomplete="tel" inputmode="tel" placeholder="812345678" value="${this.escapeHtml(this.localLead.phone)}" />
                                </div>
                            </div>
                            <div class="lead-field">
                                <label for="leadLineId3">${t('lineIdLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                <input id="leadLineId3" class="lead-input" type="text" autocomplete="off" inputmode="text" value="${this.escapeHtml(this.localLead.lineId)}" />
                            </div>
                        </div>

                        <div class="lead-actions">
                            <button type="button" class="lead-btn" id="leadSave3">${t('savePlan')}</button>
                            <button type="button" class="lead-btn secondary" id="leadCopy3">${t('copySummary')}</button>
                            <button type="button" class="lead-btn secondary" id="leadClear3">${t('clearLocal')}</button>
                            <span class="lead-status" id="leadStatus3" aria-live="polite"></span>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    renderGoalCards() {
        return this.goals.map((goal, index) => {
            const label = goal.labels[this.currentLang] || goal.labels['th'];
            return `
                <div class="goal-card" data-goal-index="${index}">
                    <span class="goal-check"><i class="fas fa-check"></i></span>
                    <span class="goal-icon">${goal.icon}</span>
                    <div class="goal-weight">${label}</div>
                    <div class="goal-price">${this.formatNumber(Math.round(goal.price))} ${this.t('baht')}</div>
                </div>
            `;
        }).join('');
    }

    renderPlanOptions(goal) {
        const t = this.t.bind(this);
        const targetPrice = goal.price;

        return this.monthlyAmounts.map((amount, index) => {
            const months = this.calculateMonthsNeeded(targetPrice, amount);
            const dailyAmount = Math.round(amount / this.workingDaysPerMonth);

            return `
                <div class="plan-option" data-plan-index="${index}" data-amount="${amount}" data-months="${months}">
                    <div class="plan-left">
                        <div class="plan-radio"></div>
                        <div>
                            <div class="plan-amount">${this.formatNumber(amount)} ${t('baht')}</div>
                            <div class="plan-per-day">~${this.formatNumber(dailyAmount)} ${t('perDay')}</div>
                        </div>
                    </div>
                    <div class="plan-right">
                        <div class="plan-duration">${months}</div>
                        <div class="plan-label">${t('months')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderResultSummary(amount, months) {
        const t = this.t.bind(this);
        const totalSaving = amount * months;
        const goldWeight = totalSaving / this.currentGoldPrice;

        return `
            <div class="result-item">
                <div class="label">${t('totalSaving')}</div>
                <div class="value">${this.formatNumber(totalSaving)}</div>
                <div class="unit">${t('baht')}</div>
            </div>
            <div class="result-item">
                <div class="label">${t('duration')}</div>
                <div class="value">${months}</div>
                <div class="unit">${t('months')}</div>
            </div>
            <div class="result-item">
                <div class="label">${t('goldWeight')}</div>
                <div class="value">${goldWeight.toFixed(2)}</div>
                <div class="unit">${t('bahtGold')}</div>
            </div>
        `;
    }

    renderProfitStats(amount, months) {
        const t = this.t.bind(this);
        const backtest = this.calculateBacktest(amount, months);
        const profitPercent = Number.isFinite(backtest.profitPercent) ? backtest.profitPercent : 0;

        const profitClass = backtest.profitLoss >= 0 ? 'positive' : 'negative';
        const profitSign = backtest.profitLoss >= 0 ? '+' : '';

        return `
            <div class="profit-stat">
                <div class="stat-label">${t('avgCost')}</div>
                <div class="stat-value">${this.formatNumber(Math.round(backtest.avgPrice))}</div>
            </div>
            <div class="profit-stat">
                <div class="stat-label">${t('currentValue')}</div>
                <div class="stat-value">${this.formatNumber(Math.round(backtest.currentValue))}</div>
            </div>
            <div class="profit-stat">
                <div class="stat-label">${t('profitLoss')}</div>
                <div class="stat-value ${profitClass}">${profitSign}${this.formatNumber(Math.round(backtest.profitLoss))} (${profitSign}${profitPercent.toFixed(1)}%)</div>
            </div>
        `;
    }

    bindEvents() {
        // Goal selection
        const goalCards = this.container.querySelectorAll('.goal-card');
        goalCards.forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.goalIndex);
                this.selectGoal(index);
            });
        });

        // Custom amount input
        const customInput = this.container.querySelector('#customAmountInput');
        if (customInput) {
            customInput.addEventListener('input', (e) => {
                this.handleCustomAmount(e.target.value);
            });
        }

        // Contact toggle
        const contactToggle = this.container.querySelector('#contactToggle');
        if (contactToggle) {
            contactToggle.addEventListener('click', () => {
                const panel = this.container.querySelector('#contactPanel');
                panel.classList.toggle('open');
                this.localUi.contactOpen = panel.classList.contains('open');
                this.queuePersistLocalState();
            });
        }

        const nameEl = document.getElementById('leadName3');
        const emailEl = document.getElementById('leadEmail3');
        const phoneCountryEl = document.getElementById('leadPhoneCountry3');
        const phoneEl = document.getElementById('leadPhone3');
        const lineIdEl = document.getElementById('leadLineId3');

        const syncLead = () => {
            if (nameEl) this.localLead.name = nameEl.value.trim();
            if (emailEl) this.localLead.email = emailEl.value.trim();
            if (phoneCountryEl) this.localLead.phoneCountry = phoneCountryEl.value;
            if (phoneEl) this.localLead.phone = phoneEl.value.trim();
            if (lineIdEl) this.localLead.lineId = lineIdEl.value.trim();
            this.queuePersistLocalState();
            this.updateSaveButtonState();
        };

        [nameEl, emailEl, phoneCountryEl, phoneEl, lineIdEl].filter(Boolean).forEach((input) => {
            input.addEventListener('input', () => syncLead());
            input.addEventListener('change', () => syncLead());
            input.addEventListener('blur', () => syncLead());
        });

        const clearBtn = document.getElementById('leadClear3');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (nameEl) nameEl.value = '';
                if (emailEl) emailEl.value = '';
                if (phoneCountryEl) phoneCountryEl.value = '+66';
                if (phoneEl) phoneEl.value = '';
                if (lineIdEl) lineIdEl.value = '';
                this.clearLocalLead();
                syncLead();
                this.setLeadStatus('cleared', 'info');
                const panel = this.container.querySelector('#contactPanel');
                if (panel) panel.classList.remove('open');
                this.updateSaveButtonState();
            });
        }

        const saveBtn = document.getElementById('leadSave3');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (this._saveInProgress) return;
                syncLead();

                const currentHash = this.getLeadPayloadHash();
                if (currentHash && currentHash === this.localMeta.lastSavedHash) {
                    this.setLeadStatus('noChanges', 'info');
                    this.updateSaveButtonState();
                    return;
                }

                this._saveInProgress = true;
                this.updateSaveButtonState();

                this.localMeta.lastSavedHash = currentHash;
                this.localMeta.lastSavedAt = new Date().toISOString();
                this.queuePersistLocalState();
                this.setLeadStatus('saved', 'success');

                this._saveInProgress = false;
                this.updateSaveButtonState();
            });
        }

        const copyBtn = document.getElementById('leadCopy3');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const ok = await this.copyToClipboard(this.getLeadSummaryText());
                if (ok) this.setLeadStatus('copied', 'info');
            });
        }

        // CTA Button
        const ctaButton = this.container.querySelector('#ctaButton');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                if (this.selectedGoal !== null && this.planAmount && this.planMonths) {
                    const goal = this.goals[this.selectedGoal];
                    // หา product ที่ตรงกับเป้าหมาย
                    const products = GoldProducts.getProducts();
                    const product = products.find(p => {
                        if (Number.isFinite(p.multiplier) && p.multiplier === goal.weight) return true;
                        if (typeof p.weight === 'string') {
                            const match = p.weight.match(/([0-9.]+)\s*บาท/);
                            if (match && Number(match[1]) === goal.weight) return true;
                        }
                        return false;
                    });
                    if (product && product.link) {
                        window.open(product.link, '_blank');
                    }
                }
            });
        }

        this.updateLeadPlanSummary();
        this.updateSaveButtonState();
    }

    selectGoal(index) {
        this.selectedGoal = index;
        this.planGoalIndex = index;
        const goal = this.goals[index];
        const t = this.t.bind(this);

        // Update UI - highlight selected goal
        const goalCards = this.container.querySelectorAll('.goal-card');
        goalCards.forEach((card, i) => {
            card.classList.toggle('selected', i === index);
        });

        // Activate plan section
        const planSection = this.container.querySelector('#planSection');
        planSection.classList.add('active');

        // Update selected goal info
        const goalInfo = this.container.querySelector('#selectedGoalInfo');
        const label = goal.labels[this.currentLang] || goal.labels['th'];
        goalInfo.innerHTML = `
            <span class="goal-name">${goal.icon} ${t('yourGoal')}: ${label}</span>
            <span class="goal-target">${t('targetPrice')}: ${this.formatNumber(Math.round(goal.price))} ${t('baht')}</span>
        `;

        // Render plan options
        const planOptions = this.container.querySelector('#planOptions');
        planOptions.innerHTML = this.renderPlanOptions(goal);

        // Bind plan option events
        const planOptionEls = planOptions.querySelectorAll('.plan-option');
        planOptionEls.forEach(option => {
            option.addEventListener('click', () => {
                const planIndex = parseInt(option.dataset.planIndex);
                const amount = parseInt(option.dataset.amount);
                const months = parseInt(option.dataset.months);
                this.selectPlan(planIndex, amount, months);
            });
        });

        this.updateLeadPlanSummary();

        // Scroll to plan section
        planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    selectPlan(planIndex, amount, months) {
        this.selectedPlan = planIndex;
        this.planAmount = amount;
        this.planMonths = months;
        this.planGoalIndex = this.selectedGoal;

        // Update UI
        const planOptions = this.container.querySelectorAll('.plan-option');
        planOptions.forEach((option, i) => {
            option.classList.toggle('selected', i === planIndex);
        });

        // Activate result section
        const resultSection = this.container.querySelector('#resultSection');
        resultSection.classList.add('active');

        // Update result summary
        const resultSummary = this.container.querySelector('#resultSummary');
        resultSummary.innerHTML = this.renderResultSummary(amount, months);

        // Update profit stats
        const profitStats = this.container.querySelector('#profitStats');
        profitStats.innerHTML = this.renderProfitStats(amount, months);

        this.updateLeadPlanSummary();
        this.queuePersistLocalState();
        this.updateSaveButtonState();

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    handleCustomAmount(value) {
        const amount = parseInt(value);
        const resultEl = this.container.querySelector('#customAmountResult');
        const t = this.t.bind(this);

        if (!amount || amount < 1000 || this.selectedGoal === null) {
            resultEl.textContent = '-';
            this.planAmount = null;
            this.planMonths = null;
            this.updateLeadPlanSummary();
            this.queuePersistLocalState();
            this.updateSaveButtonState();
            return;
        }

        const goal = this.goals[this.selectedGoal];
        const months = this.calculateMonthsNeeded(goal.price, amount);
        resultEl.textContent = `= ${months} ${t('months')}`;

        // เลือกแผนนี้
        this.customAmount = amount;
        this.planAmount = amount;
        this.planMonths = months;
        this.planGoalIndex = this.selectedGoal;

        // Deselect preset options
        const planOptions = this.container.querySelectorAll('.plan-option');
        planOptions.forEach(option => option.classList.remove('selected'));

        // Activate result section
        const resultSection = this.container.querySelector('#resultSection');
        resultSection.classList.add('active');

        // Update result summary
        const resultSummary = this.container.querySelector('#resultSummary');
        resultSummary.innerHTML = this.renderResultSummary(amount, months);

        // Update profit stats
        const profitStats = this.container.querySelector('#profitStats');
        profitStats.innerHTML = this.renderProfitStats(amount, months);

        this.updateLeadPlanSummary();
        this.queuePersistLocalState();
        this.updateSaveButtonState();
    }

    updateLeadPlanSummary() {
        const leadPlanEl = document.getElementById('leadPlanSummary3');
        if (leadPlanEl) {
            leadPlanEl.innerHTML = this.getPlanSummaryHtml();
        }
    }
}

// Export for global use
window.GoldSavingCalculator3 = GoldSavingCalculator3;
