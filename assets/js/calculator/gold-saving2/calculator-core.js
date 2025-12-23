/**
 * Gold Saving Calculator 2 - Core Logic
 * Utilities, State Management, Price Management, และ Calculation Engine
 */

// ============================================================================
// UTILITIES - Helper Functions
// ============================================================================

window.GoldSavingUtils = {
    /**
     * Escape HTML to prevent XSS
     */
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
    },

    /**
     * Simple hash function (djb2 xor variant)
     */
    hashString(input) {
        const str = String(input ?? '');
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
        }
        return (h >>> 0).toString(16);
    },

    /**
     * Format number with Thai locale
     */
    formatNumber(num) {
        return num.toLocaleString('th-TH');
    },

    /**
     * Format date in Thai format
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    },

    /**
     * Copy text to clipboard
     */
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
    },

    /**
     * Get fallback image SVG data URI
     */
    getNoImageFallbackDataUri() {
        return "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>No Image</text></svg>";
    }
};

// ============================================================================
// STATE MANAGER - Local Storage & State Management
// ============================================================================

window.StateManager = {
    _persistTimer: null,
    _saveInProgress: false,

    /**
     * Read state from localStorage
     */
    readLocalState(storageKey) {
        try {
            if (typeof localStorage === 'undefined') return null;
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (_) {
            return null;
        }
    },

    /**
     * Write state to localStorage
     */
    writeLocalState(storageKey, state) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (_) {
            // ignore
        }
    },

    /**
     * Create state snapshot from current data
     */
    getLocalStateSnapshot(data) {
        return {
            monthlyAmount: data.monthlyAmount,
            months: data.months,
            lead: { ...data.lead },
            ui: { ...data.ui },
            meta: { ...data.meta },
            updatedAt: new Date().toISOString()
        };
    },

    /**
     * Queue persisting state (debounced)
     */
    queuePersistLocalState(storageKey, getSnapshotFn) {
        if (this._persistTimer) clearTimeout(this._persistTimer);
        this._persistTimer = setTimeout(() => {
            this.writeLocalState(storageKey, getSnapshotFn());
            this._persistTimer = null;
        }, 250);
    },

    /**
     * Restore state from localStorage
     */
    restoreLocalState(storageKey, config) {
        const state = this.readLocalState(storageKey);
        if (!state) return null;

        const restored = {};

        // Restore monthly amount
        const monthlyAmount = Number(state.monthlyAmount);
        if (Number.isFinite(monthlyAmount) && monthlyAmount > 0) {
            restored.monthlyAmount = Math.max(
                config.minAmount,
                Math.min(config.maxAmount, Math.round(monthlyAmount))
            );
        }

        // Restore months
        const months = Number(state.months);
        if (Number.isFinite(months) && months > 0) {
            restored.months = Math.max(1, Math.min(config.maxMonths, Math.round(months)));
        }

        // Restore lead data
        const lead = state.lead && typeof state.lead === 'object' ? state.lead : {};
        restored.lead = {
            name: typeof lead.name === 'string' ? lead.name : '',
            email: typeof lead.email === 'string' ? lead.email : '',
            phoneCountry: typeof lead.phoneCountry === 'string' ? lead.phoneCountry : '+66',
            phone: typeof lead.phone === 'string' ? lead.phone : '',
            lineId: typeof lead.lineId === 'string' ? lead.lineId : ''
        };

        // Restore UI state
        const ui = state.ui && typeof state.ui === 'object' ? state.ui : {};
        restored.ui = {
            contactOpen: Boolean(ui.contactOpen)
        };

        // Restore meta
        const meta = state.meta && typeof state.meta === 'object' ? state.meta : {};
        restored.meta = {
            lastSavedHash: typeof meta.lastSavedHash === 'string' ? meta.lastSavedHash : '',
            lastSavedAt: typeof meta.lastSavedAt === 'string' ? meta.lastSavedAt : null
        };

        return restored;
    },

    /**
     * Get lead payload hash for detecting changes
     */
    getLeadPayloadHash(data) {
        const payload = {
            monthlyAmount: Math.round(Number(data.monthlyAmount) || 0),
            months: Math.round(Number(data.months) || 0),
            lead: {
                name: String(data.lead.name || '').trim(),
                email: String(data.lead.email || '').trim(),
                phoneCountry: String(data.lead.phoneCountry || '+66'),
                phone: String(data.lead.phone || '').trim(),
                lineId: String(data.lead.lineId || '').trim()
            }
        };
        return GoldSavingUtils.hashString(JSON.stringify(payload));
    },

    /**
     * Get lead summary text
     */
    getLeadSummaryText(data, t) {
        const parts = [];
        parts.push(`${t('planSummary')}: ${GoldSavingUtils.formatNumber(data.monthlyAmount)} ${t('baht')}, ${data.months} ${t('monthUnit')}`);
        if (data.lead.name) parts.push(`${t('nameLabel')}: ${data.lead.name}`);
        if (data.lead.email) parts.push(`${t('emailLabel')}: ${data.lead.email}`);
        if (data.lead.phone) {
            const fullPhone = `${data.lead.phoneCountry} ${data.lead.phone}`;
            parts.push(`${t('phoneLabel')}: ${fullPhone}`);
        }
        if (data.lead.lineId) parts.push(`${t('lineIdLabel')}: ${data.lead.lineId}`);
        return parts.join('\n');
    }
};

// ============================================================================
// PRICE MANAGER - Price Fetching & Calculations
// ============================================================================

window.PriceManager = {
    dailyPrices: [],
    monthlyWorkingDays: {},
    weightedAvgPrice: 0,
    maxMonths: 84,

    /**
     * Fetch daily gold prices (Mon-Fri only)
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

            // Current date
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1; // 1-12

            // Filter Mon-Fri only, dedupe by date (latest time)
            const latestByDate = new Map();
            const toSeconds = (timeStr) => {
                const [h, m, s] = String(timeStr || '').split(':').map(v => parseInt(v, 10));
                return (Number.isFinite(h) ? h : 0) * 3600 + (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0);
            };

            allData.forEach(item => {
                const date = new Date(item.date);
                const dayOfWeek = date.getDay(); // 0=Sun, 1-5=Mon-Fri, 6=Sat
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                // Skip Sat-Sun
                if (dayOfWeek === 0 || dayOfWeek === 6) return;

                // Skip current month (not yet complete)
                if (year === currentYear && month === currentMonth) return;

                // Skip future months
                if (year > currentYear || (year === currentYear && month > currentMonth)) return;

                // Validate price
                if (!Number.isFinite(item.sellBar) || item.sellBar <= 0) return;

                const candidate = { ...item, monthKey };
                const existing = latestByDate.get(candidate.date);
                if (!existing || toSeconds(candidate.time) >= toSeconds(existing.time)) {
                    latestByDate.set(candidate.date, candidate);
                }
            });

            const weekdayPrices = Array.from(latestByDate.values());
            const monthlyWorkingDays = {};
            weekdayPrices.forEach(p => {
                monthlyWorkingDays[p.monthKey] = (monthlyWorkingDays[p.monthKey] || 0) + 1;
            });

            // Sort oldest to newest
            weekdayPrices.sort((a, b) => new Date(a.date) - new Date(b.date));

            this.dailyPrices = weekdayPrices;
            this.monthlyWorkingDays = monthlyWorkingDays;

            // Count available months
            const uniqueMonths = [...new Set(weekdayPrices.map(p => p.monthKey))];
            this.maxMonths = uniqueMonths.length;

            console.log(`✅ PriceManager: Loaded ${this.dailyPrices.length} days, ${this.maxMonths} months`);

        } catch (error) {
            console.error('❌ PriceManager: Error fetching prices:', error);
            this.dailyPrices = [];
            this.monthlyWorkingDays = {};
        }
    },

    /**
     * Alias for backward compatibility
     */
    async fetchEndOfMonthPrices() {
        return this.fetchDailyPrices();
    },

    /**
     * Calculate weighted average price (last 60 working days)
     */
    calculateWeightedAverage(currentGoldPrice) {
        if (this.dailyPrices.length === 0) {
            this.weightedAvgPrice = currentGoldPrice;
            return this.weightedAvgPrice;
        }

        // Use last 60 working days (~3 months)
        const recentPrices = this.dailyPrices.slice(-60);

        let totalWeight = 0;
        let weightedSum = 0;

        // Give more weight to recent days
        recentPrices.forEach((item, index) => {
            const weight = index + 1;
            weightedSum += item.sellBar * weight;
            totalWeight += weight;
        });

        this.weightedAvgPrice = Math.round(weightedSum / totalWeight);
        return this.weightedAvgPrice;
    },

    /**
     * Get daily prices for N months
     */
    getDailyPricesForMonths(monthCount, fallbackPrice) {
        const safeCount = Math.max(1, Math.floor(Number(monthCount) || 1));
        const safeFallback = Number.isFinite(fallbackPrice) && fallbackPrice > 0
            ? fallbackPrice
            : (typeof GoldProducts !== 'undefined' ? GoldProducts.baseGoldPrice : 64550);

        if (this.dailyPrices.length === 0) {
            // Fallback: no data
            return {
                prices: Array(safeCount * 20).fill({ sellBar: safeFallback, monthKey: 'fallback' }),
                monthsData: {}
            };
        }

        // Get unique months
        const uniqueMonths = [...new Set(this.dailyPrices.map(p => p.monthKey))];

        // Select last N months
        const selectedMonthKeys = uniqueMonths.slice(-safeCount);

        // Filter prices for selected months
        const selectedPrices = this.dailyPrices.filter(p => selectedMonthKeys.includes(p.monthKey));

        // Create months data
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
    },

    /**
     * Backward compatibility
     */
    getPurchasePricesForMonths(monthCount, fallbackPrice) {
        const { prices } = this.getDailyPricesForMonths(monthCount, fallbackPrice);
        return prices.map(p => p.sellBar);
    },

    /**
     * Fetch current gold price from SharedPriceManager
     */
    async fetchCurrentGoldPrice() {
        try {
            if (typeof SharedPriceManager !== 'undefined') {
                const price = await SharedPriceManager.getPrice();
                if (price && price.sellBar) {
                    return price.sellBar;
                }
            }
        } catch (error) {
            console.log('Using default gold price');
        }
        return null;
    }
};

// ============================================================================
// CALCULATION ENGINE - DCA Gold Calculations
// ============================================================================

window.CalculationEngine = {
    /**
     * Calculate DCA Gold (Daily Dollar Cost Averaging)
     * - Split monthly amount into daily purchases based on actual working days
     * - Simulate buying gold every working day at historical prices
     */
    calculateDcaGold(monthlyAmount, months, fallbackPrice) {
        const safeMonthlyAmount = Math.max(0, Number(monthlyAmount) || 0);
        const safeFallback = Number.isFinite(fallbackPrice) && fallbackPrice > 0
            ? fallbackPrice
            : (typeof GoldProducts !== 'undefined' ? GoldProducts.baseGoldPrice : 64550);

        const { monthsData, selectedMonthKeys, prices } =
            PriceManager.getDailyPricesForMonths(months, fallbackPrice);

        let totalGoldBaht = 0;
        let totalSpent = 0;
        let totalWorkingDays = 0;

        // Debug info
        const debugInfo = [];

        // Calculate for each month
        if (selectedMonthKeys && selectedMonthKeys.length > 0) {
            selectedMonthKeys.forEach(monthKey => {
                const monthData = monthsData[monthKey];
                if (!monthData || monthData.workingDays === 0) return;

                // Daily amount = monthly amount / actual working days in this month
                const dailyAmount = safeMonthlyAmount / monthData.workingDays;
                let monthGold = 0;

                // Buy gold every working day
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
            // Fallback: no data available
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
};
