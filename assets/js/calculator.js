// ====== Gold & Silver Calculator Component ======
class GoldSilverCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentMetal = 'gold';
        this.currentGoldType = '96.5_osiris';
        this.currentUnit = 'baht';
        this.currentLang = 'th';
        
        // API URLs
        this.apiUrls = {
            gold: 'http://27.254.77.78/rest/public/rest/goldspot',
            silver: 'http://27.254.77.78/rest/public/rest/silver'
        };

        // Price data
        this.prices = {
            gold: {
                '96.5_osiris': { bid: 50738, offer: 50838, change: 100 },
                '99.99_osiris': { bid: 52950, offer: 53000, change: 155 },
                '99.99_osiris_kg': { bid: 3470080, offer: 3483360, change: 10168 },
                '96.5_assoc': { bid: 50700, offer: 50800, change: 50 }
            },
            silver: {
                'bar_99.99': { bid: 34900, offer: 35200, change: 150 }
            }
        };

        // Unit conversions
        this.conversions = {
            gram: 1,
            baht: 15.244,
            kg: 1000
        };

        this.init();
    }

    init() {
        this.setupLanguageSupport();
        this.render();
        this.bindEvents();
        this.updateDisplay();
        this.updateLastUpdated();
        
        // Auto-update every 5 seconds
        setInterval(() => {
            this.fetchPricesFromAPI();
        }, 5000);
    }

    setupLanguageSupport() {
        // Get current language from localStorage or i18n manager
        if (typeof window.i18nManager !== 'undefined') {
            this.currentLang = window.i18nManager.getCurrentLanguage();
        } else {
            this.currentLang = localStorage.getItem('language') || 'th';
        }
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLang = event.detail.language;
            this.updateLanguageContent();
        });
        
        document.addEventListener('bannerLanguageChanged', (event) => {
            this.currentLang = event.detail.language;
            this.updateLanguageContent();
        });
        
        document.addEventListener('unifiedLanguageChanged', (event) => {
            this.currentLang = event.detail.language;
            this.updateLanguageContent();
        });
    }

    getTranslatedText(key) {
        // Always prepare fallback translations first
        // Fallback translations
        const translations = {
            th: {
                calculator: {
                    title: "คำนวณราคาทองคำและแท่งเงิน",
                    metalTypes: {
                        gold: "🥇 ทองคำ",
                        silver: "🥈 แท่งเงิน"
                    },
                    goldTypes: {
                        label: "ประเภททองคำ",
                        "96.5_osiris": "96.5% ออสสิริส",
                        "99.99_osiris": "99.99% ออสสิริส",
                        "99.99_osiris_kg": "99.99% ออสสิริส(กิโลกรัม)",
                        "96.5_assoc": "96.5% สมาคม"
                    },
                    units: {
                        label: "หน่วย",
                        baht: "บาททอง",
                        kg: "กิโลกรัม",
                        gram: "กรัม"
                    },
                    weight: {
                        label: "น้ำหนัก",
                        placeholder: "0.00"
                    },
                    prices: {
                        sellPerBaht: "ราคาซื้อ (ต่อบาททอง)",
                        buyPerBaht: "ราคาขาย (ต่อบาททอง)",
                        sellPerKg: "ราคาซื้อ (ต่อกิโลกรัม)",
                        buyPerKg: "ราคาขาย (ต่อกิโลกรัม)"
                    },
                    total: {
                        label: "มูลค่ารวม (ราคาขาย)",
                        currency: "บาท"
                    },
                    lastUpdated: "อัพเดทล่าสุด:",
                    note: "💡 <strong>หมายเหตุ:</strong> ราคาที่แสดงเป็นราคาอ้างอิงตามข้อมูลตลาด อัพเดทแบบเรียลไทม์ อิงตามทองคำโลกและเงื่อนไขการซื้อขาย"
                }
            },
            en: {
                calculator: {
                    title: "Gold & Silver Price Calculator",
                    metalTypes: {
                        gold: "🥇 Gold",
                        silver: "🥈 Silver"
                    },
                    goldTypes: {
                        label: "Gold Type",
                        "96.5_osiris": "96.5% Osiris",
                        "99.99_osiris": "99.99% Osiris",
                        "99.99_osiris_kg": "99.99% Osiris (Kilogram)",
                        "96.5_assoc": "96.5% Association"
                    },
                    units: {
                        label: "Unit",
                        baht: "Baht Gold",
                        kg: "Kilogram",
                        gram: "Gram"
                    },
                    weight: {
                        label: "Weight",
                        placeholder: "0.00"
                    },
                    prices: {
                        sellPerBaht: "Sell Price (per Baht Gold)",
                        buyPerBaht: "Buy Price (per Baht Gold)",
                        sellPerKg: "Sell Price (per Kilogram)",
                        buyPerKg: "Buy Price (per Kilogram)"
                    },
                    total: {
                        label: "Total Value (Sell Price)",
                        currency: "THB"
                    },
                    lastUpdated: "Last Updated:",
                    note: "💡 <strong>Note:</strong> Prices shown are reference prices based on market data. Real-time updates based on global gold prices and trading conditions."
                }
            }
        };
        
        // Function to get value from translations object
        const getValueFromTranslations = (translations, lang, key) => {
            const keys = key.split('.');
            let value = translations[lang];
            
            for (const k of keys) {
                if (value && value[k] !== undefined) {
                    value = value[k];
                } else {
                    return null;
                }
            }
            return value;
        };
        
        // Try i18nManager first, then fallback
        if (typeof window.i18nManager !== 'undefined' && window.i18nManager) {
            try {
                const i18nText = window.i18nManager.getText(key);
                if (i18nText && i18nText !== key) {
                    return i18nText;
                }
            } catch (e) {
                console.warn('i18nManager failed for key:', key, e);
            }
        }
        
        // Use fallback translations
        const fallbackText = getValueFromTranslations(translations, this.currentLang, key);
        if (fallbackText !== null) {
            return fallbackText;
        }
        
        // Final fallback - try English if Thai fails
        if (this.currentLang !== 'en') {
            const englishText = getValueFromTranslations(translations, 'en', key);
            if (englishText !== null) {
                return englishText;
            }
        }
        
        return key;
    }

    getGoldTypeText(key) {
        const goldTypes = this.getTranslatedText('calculator.goldTypes');
        if (goldTypes && typeof goldTypes === 'object') {
            return goldTypes[key] || key;
        }
        return key;
    }

    getUnitText(key) {
        const units = this.getTranslatedText('calculator.units');
        if (units && typeof units === 'object') {
            return units[key] || key;
        }
        return key;
    }

    // Helper function to format numbers without decimals
    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        return Math.round(num).toLocaleString('th-TH');
    }

    render() {
        this.container.innerHTML = `
            <div class="calculator-container">
                <h1 class="calculator-title">${this.getTranslatedText('calculator.title')}</h1>
                
                <div class="metal-selector">
                    <div class="selector-bg gold" id="selectorBg"></div>
                    <div class="metal-option gold active" data-metal="gold">
                        ${this.getTranslatedText('calculator.metalTypes.gold')}
                    </div>
                    <div class="metal-option silver" data-metal="silver">
                        ${this.getTranslatedText('calculator.metalTypes.silver')}
                    </div>
                </div>

                <div class="input-section">
                    <!-- แถวที่ 1: ประเภททองคำ (เต็มความกว้าง) -->
                    <div class="input-group" id="goldTypeSelector">
                        <label for="goldTypeSelect" class="input-label">${this.getTranslatedText('calculator.goldTypes.label')}</label>
                        <select id="goldTypeSelect" class="calc-select">
                            <option value="96.5_osiris">${this.getGoldTypeText('96.5_osiris')}</option>
                            <option value="99.99_osiris">${this.getGoldTypeText('99.99_osiris')}</option>
                            <option value="99.99_osiris_kg">${this.getGoldTypeText('99.99_osiris_kg')}</option>
                            <option value="96.5_assoc">${this.getGoldTypeText('96.5_assoc')}</option>
                        </select>
                    </div>
                    
                    <!-- แถวที่ 2: น้ำหนัก (ซ้าย) + หน่วย (ขวา) -->
                    <div class="input-row">
                        <div class="input-group">
                            <label for="amount" class="input-label">${this.getTranslatedText('calculator.weight.label')}</label>
                            <input type="number" id="amount" class="calc-input" placeholder="${this.getTranslatedText('calculator.weight.placeholder')}" step="0.01" min="0">
                        </div>
                        <div class="input-group">
                            <label for="unitSelector" class="input-label">${this.getTranslatedText('calculator.units.label')}</label>
                            <select id="unitSelector" class="calc-select">
                                <option value="baht">${this.getUnitText('baht')}</option>
                                <option value="kg">${this.getUnitText('kg')}</option>
                                <option value="gram">${this.getUnitText('gram')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="price-display">
                    <div class="price-info" id="priceInfo">
                        <div class="price-item sell">
                            <div class="price-label">${this.getTranslatedText('calculator.prices.sellPerBaht')}</div>
                            <div class="price-value sell-price" id="sellPrice">50,838</div>
                        </div>
                        <div class="price-item buy">
                            <div class="price-label">${this.getTranslatedText('calculator.prices.buyPerBaht')}</div>
                            <div class="price-value buy-price" id="buyPrice">50,738</div>
                        </div>
                    </div>

                    <div class="total-section">
                        <div class="total-price" id="totalPriceCard">
                            <div class="total-label-inside">${this.getTranslatedText('calculator.total.label')}</div>
                            <div class="total-value" id="totalPrice">0</div>
                            <div class="currency-inside">${this.getTranslatedText('calculator.total.currency')}</div>
                        </div>
                    </div>
                </div>

                <div class="last-updated">
                    <span class="status-indicator"></span>
                    ${this.getTranslatedText('calculator.lastUpdated')} <span id="lastUpdated">14:25:00 น.</span>
                </div>

                <div class="info-text">
                    ${this.getTranslatedText('calculator.note')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Metal selector events
        this.container.querySelectorAll('.metal-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const metal = e.target.dataset.metal;
                this.switchMetal(metal);
            });
        });

        // Gold type selector events
        const goldTypeSelect = this.container.querySelector('#goldTypeSelect');
        if (goldTypeSelect) {
            goldTypeSelect.addEventListener('change', (e) => {
                this.switchGoldType(e.target.value);
            });
        }

        // Amount input event
        const amountInput = this.container.querySelector('#amount');
        amountInput.addEventListener('input', () => this.calculatePrice());

        // Unit selector event
        const unitSelector = this.container.querySelector('#unitSelector');
        unitSelector.addEventListener('change', (e) => {
            this.currentUnit = e.target.value;
            this.calculatePrice();
        });
    }

    switchMetal(metal) {
        this.currentMetal = metal;
        
        // Update active states
        this.container.querySelectorAll('.metal-option').forEach(option => {
            option.classList.remove('active');
        });
        this.container.querySelector(`[data-metal="${metal}"]`).classList.add('active');
        
        // Animate selector background
        const selectorBg = this.container.querySelector('#selectorBg');
        selectorBg.className = `selector-bg ${metal}`;
        
        // Show/hide gold type selector
        const goldTypeSelector = this.container.querySelector('#goldTypeSelector');
        goldTypeSelector.style.display = metal === 'gold' ? 'block' : 'none';
        
        // Update unit options for silver
        const unitSelector = this.container.querySelector('#unitSelector');
        if (metal === 'silver') {
            unitSelector.innerHTML = `
                <option value="kg">${this.getUnitText('kg')}</option>
                <option value="gram">${this.getUnitText('gram')}</option>
            `;
            this.currentUnit = 'kg';
            unitSelector.value = 'kg';
        } else {
            unitSelector.innerHTML = `
                <option value="baht">${this.getUnitText('baht')}</option>
                <option value="kg">${this.getUnitText('kg')}</option>
                <option value="gram">${this.getUnitText('gram')}</option>
            `;
            this.currentUnit = 'baht';
            unitSelector.value = 'baht';
        }
        
        this.updateDisplay();
    }

    switchGoldType(type) {
        this.currentGoldType = type;
        
        const goldTypeSelect = this.container.querySelector('#goldTypeSelect');
        if (goldTypeSelect) {
            goldTypeSelect.value = type;
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        let currentPrices;
        const sellPriceElement = this.container.querySelector('#sellPrice');
        const buyPriceElement = this.container.querySelector('#buyPrice');
        const priceLabels = this.container.querySelectorAll('.price-label');
        
        if (this.currentMetal === 'gold') {
            currentPrices = this.prices.gold[this.currentGoldType];
            
            if (this.currentGoldType === '99.99_osiris_kg') {
                // Display price per kilogram
                sellPriceElement.textContent = this.formatNumber(currentPrices.bid);
                buyPriceElement.textContent = this.formatNumber(currentPrices.offer);
                priceLabels[0].textContent = this.getTranslatedText('calculator.prices.sellPerKg');
                priceLabels[1].textContent = this.getTranslatedText('calculator.prices.buyPerKg');
            } else {
                // Display price per baht gold
                sellPriceElement.textContent = this.formatNumber(currentPrices.bid);
                buyPriceElement.textContent = this.formatNumber(currentPrices.offer);
                priceLabels[0].textContent = this.getTranslatedText('calculator.prices.sellPerBaht');
                priceLabels[1].textContent = this.getTranslatedText('calculator.prices.buyPerBaht');
            }
        } else {
            // Silver - display price per kilogram
            currentPrices = this.prices.silver['bar_99.99'];
            sellPriceElement.textContent = this.formatNumber(currentPrices.bid);
            buyPriceElement.textContent = this.formatNumber(currentPrices.offer);
            priceLabels[0].textContent = this.getTranslatedText('calculator.prices.sellPerKg');
            priceLabels[1].textContent = this.getTranslatedText('calculator.prices.buyPerKg');
        }
        
        this.calculatePrice();
    }

    calculatePrice() {
        const amountInput = this.container.querySelector('#amount');
        const totalPriceElement = this.container.querySelector('#totalPrice');
        const amount = parseFloat(amountInput.value) || 0;
        let currentPrices;
        let totalPrice = 0;
        
        if (this.currentMetal === 'gold') {
            currentPrices = this.prices.gold[this.currentGoldType];
            
            if (this.currentGoldType === '99.99_osiris_kg') {
                // ทอง 99.99% กิโลกรัม - ราคาต่อกิโลกรัม
                if (this.currentUnit === 'kg') {
                    totalPrice = amount * currentPrices.offer;
                } else if (this.currentUnit === 'gram') {
                    totalPrice = (amount / 1000) * currentPrices.offer;
                } else if (this.currentUnit === 'baht') {
                    const grams = amount * 15.244;
                    totalPrice = (grams / 1000) * currentPrices.offer;
                }
            } else {
                // ทองปกติ - ราคาต่อบาททอง (ใช้ราคาขาย)
                if (this.currentUnit === 'baht') {
                    totalPrice = amount * currentPrices.offer;
                } else if (this.currentUnit === 'gram') {
                    const baht = amount / 15.244;
                    totalPrice = baht * currentPrices.offer;
                } else if (this.currentUnit === 'kg') {
                    const baht = (amount * 1000) / 15.244;
                    totalPrice = baht * currentPrices.offer;
                }
            }
        } else {
            // เงิน - ราคาต่อกิโลกรัม (ใช้ราคาขาย)
            currentPrices = this.prices.silver['bar_99.99'];
            
            if (this.currentUnit === 'kg') {
                totalPrice = amount * currentPrices.offer;
            } else if (this.currentUnit === 'gram') {
                totalPrice = (amount / 1000) * currentPrices.offer;
            }
        }
        
        totalPriceElement.textContent = this.formatNumber(totalPrice);
    }

    updateLastUpdated() {
        const lastUpdatedElement = this.container.querySelector('#lastUpdated');
        const now = new Date();
        const timeString = now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) + ' น.';
        lastUpdatedElement.textContent = timeString;
    }

    async fetchPricesFromAPI() {
        try {
            // Fetch Gold prices
            if (this.apiUrls.gold) {
                const goldResponse = await fetch(this.apiUrls.gold);
                const goldData = await goldResponse.json();
                
                // Update gold prices according to API format
                if (goldData.G965B) {
                    this.prices.gold['96.5_osiris'].bid = goldData.G965B.bid;
                    this.prices.gold['96.5_osiris'].offer = goldData.G965B.offer;
                    this.prices.gold['96.5_assoc'].bid = goldData.G965B.bid_asso;
                    this.prices.gold['96.5_assoc'].offer = goldData.G965B.offer_asso;
                }
                
                if (goldData.G9999B) {
                    this.prices.gold['99.99_osiris'].bid = goldData.G9999B.bid;
                    this.prices.gold['99.99_osiris'].offer = goldData.G9999B.offer;
                }
                
                if (goldData.G9999KG) {
                    this.prices.gold['99.99_osiris_kg'].bid = goldData.G9999KG.bid;
                    this.prices.gold['99.99_osiris_kg'].offer = goldData.G9999KG.offer;
                }
            }
            
            // Fetch Silver prices
            if (this.apiUrls.silver) {
                const silverResponse = await fetch(this.apiUrls.silver);
                const silverData = await silverResponse.json();
                
                // Update silver prices according to API format
                if (silverData.Silver) {
                    this.prices.silver['bar_99.99'].bid = parseInt(silverData.Silver.bid);
                    this.prices.silver['bar_99.99'].offer = parseInt(silverData.Silver.offer);
                }
            }
            
            // Update display
            this.updateDisplay();
            this.updateLastUpdated();
            
        } catch (error) {
            console.log('API connection failed, using mock prices');
            this.simulatePriceUpdate();
            this.updateDisplay();
            this.updateLastUpdated();
        }
    }

    simulatePriceUpdate() {
        // Simulate small price variations
        const goldTypes = ['96.5_assoc', '96.5_osiris', '99.99_osiris'];
        goldTypes.forEach(type => {
            const variation = (Math.random() - 0.5) * 100;
            const basePrice = type === '99.99_osiris' ? 53070 : 51150;
            this.prices.gold[type].offer = Math.max(basePrice * 0.98, basePrice + variation);
            this.prices.gold[type].bid = this.prices.gold[type].offer - 100;
        });
        
        // Gold 99.99% kilogram
        const kgVariation = (Math.random() - 0.5) * 10000;
        this.prices.gold['99.99_osiris_kg'].offer = Math.max(3470000, 3481000 + kgVariation);
        this.prices.gold['99.99_osiris_kg'].bid = this.prices.gold['99.99_osiris_kg'].offer - 3000;
        
        // Silver - price per kilogram
        const silverVariation = (Math.random() - 0.5) * 500;
        this.prices.silver['bar_99.99'].offer = Math.max(34000, 35391 + silverVariation);
        this.prices.silver['bar_99.99'].bid = this.prices.silver['bar_99.99'].offer - 300;
    }

    updateLanguageContent() {
        // Update calculator title
        const titleElement = this.container.querySelector('.calculator-title');
        if (titleElement) {
            titleElement.textContent = this.getTranslatedText('calculator.title');
        }
        
        // Update metal selector buttons
        const goldOption = this.container.querySelector('[data-metal="gold"]');
        const silverOption = this.container.querySelector('[data-metal="silver"]');
        if (goldOption) goldOption.innerHTML = this.getTranslatedText('calculator.metalTypes.gold');
        if (silverOption) silverOption.innerHTML = this.getTranslatedText('calculator.metalTypes.silver');
        
        // Update gold type selector
        const goldTypeLabel = this.container.querySelector('label[for="goldTypeSelect"]');
        if (goldTypeLabel) {
            goldTypeLabel.textContent = this.getTranslatedText('calculator.goldTypes.label');
        }
        
        const goldTypeSelect = this.container.querySelector('#goldTypeSelect');
        if (goldTypeSelect) {
            const options = goldTypeSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                option.textContent = this.getGoldTypeText(value);
            });
        }
        
        // Update unit selector
        const unitLabel = this.container.querySelector('label[for="unitSelector"]');
        if (unitLabel) {
            unitLabel.textContent = this.getTranslatedText('calculator.units.label');
        }
        
        const unitSelector = this.container.querySelector('#unitSelector');
        if (unitSelector) {
            const options = unitSelector.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                option.textContent = this.getUnitText(value);
            });
        }
        
        // Update weight label and placeholder
        const weightLabel = this.container.querySelector('label[for="amount"]');
        if (weightLabel) {
            weightLabel.textContent = this.getTranslatedText('calculator.weight.label');
        }
        
        const amountInput = this.container.querySelector('#amount');
        if (amountInput) {
            amountInput.placeholder = this.getTranslatedText('calculator.weight.placeholder');
        }
        
        // Update total section
        const totalLabelInside = this.container.querySelector('.total-label-inside');
        if (totalLabelInside) {
            totalLabelInside.textContent = this.getTranslatedText('calculator.total.label');
        }
        
        const currencyInside = this.container.querySelector('.currency-inside');
        if (currencyInside) {
            currencyInside.textContent = this.getTranslatedText('calculator.total.currency');
        }
        
        // Update last updated text
        const lastUpdatedText = this.container.querySelector('.last-updated');
        if (lastUpdatedText) {
            const timeSpan = lastUpdatedText.querySelector('#lastUpdated');
            const timeText = timeSpan ? timeSpan.textContent : '';
            lastUpdatedText.innerHTML = `
                <span class="status-indicator"></span>
                ${this.getTranslatedText('calculator.lastUpdated')} <span id="lastUpdated">${timeText}</span>
            `;
        }
        
        // Update info text
        const infoText = this.container.querySelector('.info-text');
        if (infoText) {
            infoText.innerHTML = this.getTranslatedText('calculator.note');
        }
        
        // Update price display labels
        this.updateDisplay();
    }
}

// Export to global scope
// Ensure GemApp namespace exists
window.GemApp = window.GemApp || {};

window.GemApp.GoldSilverCalculator = GoldSilverCalculator;