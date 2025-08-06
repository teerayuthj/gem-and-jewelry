// ====== Gold & Silver Calculator Component ======
class GoldSilverCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentMetal = 'gold';
        this.currentGoldType = '96.5_osiris';
        this.currentUnit = 'baht';
        this.currentCurrency = 'THB';
        this.currentLang = localStorage.getItem('language') || 'en';
        this.sharedPriceManager = window.sharedPriceManager;
        this.exchangeRateManager = window.exchangeRateManager;
        this.unsubscribePrices = null;
        this.unsubscribeRates = null;
        
        // Exchange rates (will be updated from ExchangeRateManager)
        this.exchangeRates = {
            THB: 1,
            USD: 0.031,
            EUR: 0.027,
            JPY: 4.54,
            CNY: 0.22,
            KRW: 42.8,
            INR: 2.71,
            SGD: 0.040,
            HKD: 0.243
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

        // Unit conversions to grams
        this.conversions = {
            gram: 1,
            baht: 15.244,
            kg: 1000,
            troy_oz: 31.1035       // Troy Ounce (international standard)
        };

        this.init();
    }

    init() {
        this.setupLanguageSupport();
        this.subscribeToSharedPriceManager();
        this.subscribeToExchangeRateManager();
        this.render();
        this.bindEvents();
        this.initializeUI();
        this.updateDisplay();
    }
    
    // Subscribe to SharedPriceManager for real-time data
    subscribeToSharedPriceManager() {
        if (!this.sharedPriceManager) {
            console.error('SharedPriceManager not available for Calculator');
            // Use fallback data
            this.generateFallbackPrices();
            return;
        }

        // Subscribe to price updates
        this.unsubscribePrices = this.sharedPriceManager.subscribe('GoldSilverCalculator', (data) => {
            this.updatePricesFromShared(data);
        });
        
        console.log('GoldSilverCalculator subscribed to SharedPriceManager');
    }

    // Subscribe to ExchangeRateManager for currency conversion
    subscribeToExchangeRateManager() {
        if (!this.exchangeRateManager) {
            console.error('ExchangeRateManager not available for Calculator');
            return;
        }

        // Subscribe to exchange rate updates
        this.unsubscribeRates = this.exchangeRateManager.subscribe('GoldSilverCalculator', (data) => {
            this.updateExchangeRatesFromManager(data);
        });
        
        console.log('GoldSilverCalculator subscribed to ExchangeRateManager');
    }

    // Update exchange rates from ExchangeRateManager
    updateExchangeRatesFromManager(rateData) {
        if (!rateData.rates) return;

        // Update exchange rates from the manager
        this.exchangeRates = { ...rateData.rates };
        
        console.log('Calculator: Exchange rates updated from ExchangeRateManager');
        
        // Update exchange rate display
        this.updateExchangeRateInfo();
        
        // Recalculate price if needed
        this.calculatePrice();
    }

    // Update prices from SharedPriceManager data
    updatePricesFromShared(sharedData) {
        if (!sharedData.gold || !sharedData.silver) return;

        // Update gold prices according to API format
        if (sharedData.gold.G965B) {
            this.prices.gold['96.5_osiris'].bid = sharedData.gold.G965B.bid || this.prices.gold['96.5_osiris'].bid;
            this.prices.gold['96.5_osiris'].offer = sharedData.gold.G965B.offer || this.prices.gold['96.5_osiris'].offer;
            this.prices.gold['96.5_assoc'].bid = sharedData.gold.G965B.bid_asso || this.prices.gold['96.5_assoc'].bid;
            this.prices.gold['96.5_assoc'].offer = sharedData.gold.G965B.offer_asso || this.prices.gold['96.5_assoc'].offer;
        }
        
        if (sharedData.gold.G9999B) {
            this.prices.gold['99.99_osiris'].bid = sharedData.gold.G9999B.bid || this.prices.gold['99.99_osiris'].bid;
            this.prices.gold['99.99_osiris'].offer = sharedData.gold.G9999B.offer || this.prices.gold['99.99_osiris'].offer;
        }
        
        if (sharedData.gold.G9999KG) {
            this.prices.gold['99.99_osiris_kg'].bid = sharedData.gold.G9999KG.bid || this.prices.gold['99.99_osiris_kg'].bid;
            this.prices.gold['99.99_osiris_kg'].offer = sharedData.gold.G9999KG.offer || this.prices.gold['99.99_osiris_kg'].offer;
        }

        // Update silver prices according to API format
        if (sharedData.silver.Silver) {
            this.prices.silver['bar_99.99'].bid = parseInt(sharedData.silver.Silver.bid) || this.prices.silver['bar_99.99'].bid;
            this.prices.silver['bar_99.99'].offer = parseInt(sharedData.silver.Silver.offer) || this.prices.silver['bar_99.99'].offer;
        }
        
        // Store synced update time from SharedPriceManager
        this.syncedUpdateTime = sharedData.syncedUpdateTime;
        
        // Update display with synced time
        this.updateDisplay();
    }

    // Generate fallback prices when SharedPriceManager is not available
    generateFallbackPrices() {
        console.log('Calculator using fallback prices');
        // Keep existing fallback prices in this.prices
        this.simulatePriceUpdate();
        this.updateDisplay();
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
                        gram: "กรัม",
                        troy_oz: "ทรอย เอานซ์"
                    },
                    currencies: {
                        label: "สกุลเงิน",  
                        THB: "บาท (THB)",
                        USD: "ดอลลาร์สหรัฐ (USD)",
                        EUR: "ยูโร (EUR)",
                        JPY: "เยน (JPY)",
                        CNY: "หยวน (CNY)",
                        KRW: "วอน (KRW)",
                        INR: "รูปี (INR)",
                        SGD: "ดอลลาร์สิงคโปร์ (SGD)",
                        HKD: "ดอลลาร์ฮ่องกง (HKD)"
                    },
                    weight: {
                        label: "น้ำหนัก",
                        placeholder: "0.00"
                    },
                    prices: {
                        sell: "ราคาซื้อ",
                        buy: "ราคาขาย"
                    },
                    total: {
                        label: "มูลค่ารวม"
                    },
                    noteGold: "💡 <strong>หมายเหตุ:</strong> ราคาอ้างอิงแบบเรียลไทม์ การแปลงสกุลเงินอาจคลาดเคลื่อนจากอัตราตลาดจริง ยังไม่รวมค่ากำเหน็จและเงื่อนไขการซื้อขาย",
                    noteSilver: "💡 <strong>หมายเหตุ:</strong> ราคาอ้างอิงแบบเรียลไทม์ การแปลงสกุลเงินอาจคลาดเคลื่อนจากอัตราตลาดจริง ยังไม่รวม VAT 7% และเงื่อนไขการซื้อขาย"
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
                        "96.5_osiris": "96.5% Ausiris",
                        "99.99_osiris": "99.99% Ausiris",
                        "99.99_osiris_kg": "99.99% Ausiris (Kilogram)",
                        "96.5_assoc": "96.5% Association"
                    },
                    units: {
                        label: "Unit",
                        baht: "Baht Gold",
                        kg: "Kilogram",
                        gram: "Gram",
                        troy_oz: "Troy Ounce"
                    },
                    currencies: {
                        label: "Currency",
                        THB: "Thai Baht (THB)",
                        USD: "US Dollar (USD)",
                        EUR: "Euro (EUR)",
                        JPY: "Japanese Yen (JPY)",
                        CNY: "Chinese Yuan (CNY)",
                        KRW: "Korean Won (KRW)",
                        INR: "Indian Rupee (INR)",
                        SGD: "Singapore Dollar (SGD)",
                        HKD: "Hong Kong Dollar (HKD)"
                    },
                    weight: {
                        label: "Weight",
                        placeholder: "0.00"
                    },
                    prices: {
                        sell: "Sell Price",
                        buy: "Buy Price"
                    },
                    total: {
                        label: "Total Value"
                    },
                    noteGold: "💡 <strong>Note:</strong> Real-time reference prices. Currency conversion may vary from actual market rates. Excludes premium and trading conditions.",
                    noteSilver: "💡 <strong>Note:</strong> Real-time reference prices. Currency conversion may vary from actual market rates. Excludes 7% VAT and trading conditions."
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

    getCurrencyText(key) {
        const currencies = this.getTranslatedText('calculator.currencies');
        if (currencies && typeof currencies === 'object') {
            return currencies[key] || key;
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
                <h1 class="calculator-title">${this.getTranslatedText('calculator.title').replace(/\n/g, '<br>')}</h1>
                
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
                                <!-- Units will be populated by initializeUI() method -->
                                <option value="baht">${this.getUnitText('baht')}</option>
                                <option value="gram">${this.getUnitText('gram')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- แถวที่ 3: สกุลเงิน (เต็มความกว้าง) -->
                    <div class="input-group">
                        <label for="currencySelector" class="input-label">${this.getTranslatedText('calculator.currencies.label')}</label>
                        <select id="currencySelector" class="calc-select">
                            <option value="THB">${this.getCurrencyText('THB')}</option>
                            <option value="USD">${this.getCurrencyText('USD')}</option>
                            <option value="EUR">${this.getCurrencyText('EUR')}</option>
                            <option value="JPY">${this.getCurrencyText('JPY')}</option>
                            <option value="CNY">${this.getCurrencyText('CNY')}</option>
                            <option value="KRW">${this.getCurrencyText('KRW')}</option>
                            <option value="INR">${this.getCurrencyText('INR')}</option>
                            <option value="SGD">${this.getCurrencyText('SGD')}</option>
                            <option value="HKD">${this.getCurrencyText('HKD')}</option>
                        </select>
                        <div id="exchangeRateInfo" class="exchange-rate-info" style="margin-top: 8px; font-size: 12px; color: #666; display: none;">
                            <!-- Exchange rate info will be displayed here -->
                        </div>
                        <div id="exchangeRateTime" class="exchange-rate-time" style="margin-top: 4px; font-size: 11px; color: #999; display: none;">
                            <!-- Exchange rate update time will be displayed here -->
                        </div>
                    </div>
                </div>

                <div class="price-display">
                    <div class="price-info" id="priceInfo">
                        <div class="price-item sell">
                            <div class="price-label">${this.getTranslatedText('calculator.prices.sell')}</div>
                            <div class="price-value sell-price" id="sellPrice">50,838</div>
                        </div>
                        <div class="price-item buy">
                            <div class="price-label">${this.getTranslatedText('calculator.prices.buy')}</div>
                            <div class="price-value buy-price" id="buyPrice">50,738</div>
                        </div>
                    </div>

                    <div class="total-section">
                        <div class="total-price" id="totalPriceCard">
                            <div class="total-label-inside">${this.getTranslatedText('calculator.total.label')}</div>
                            <div class="total-value" id="totalPrice">0</div>
                            <div class="currency-inside" id="currencyDisplay">THB</div>
                        </div>
                    </div>
                </div>


                <div class="info-text">
                    ${this.getTranslatedText(`calculator.note${this.currentMetal === 'gold' ? 'Gold' : 'Silver'}`)}
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

        // Currency selector event
        const currencySelector = this.container.querySelector('#currencySelector');
        currencySelector.addEventListener('change', (e) => {
            this.currentCurrency = e.target.value;
            this.updateCurrencyDisplay();
            this.calculatePrice(); // Only recalculate total, don't update sell/buy prices
        });
    }

    initializeUI() {
        // Ensure gold type selector is visible on initial load for gold
        const goldTypeSelector = this.container.querySelector('#goldTypeSelector');
        if (goldTypeSelector && this.currentMetal === 'gold') {
            goldTypeSelector.style.display = 'block';
        }
        
        // Set initial metal selector state
        const goldOption = this.container.querySelector('[data-metal="gold"]');
        const selectorBg = this.container.querySelector('#selectorBg');
        if (goldOption && selectorBg) {
            goldOption.classList.add('active');
            selectorBg.className = 'selector-bg gold';
        }
        
        // Initialize unit selector for the default gold type
        if (this.currentMetal === 'gold') {
            this.updateUnitSelectorForGoldType(this.currentGoldType);
        }
    }

    updateCurrencyDisplay() {
        const currencyDisplay = this.container.querySelector('#currencyDisplay');
        if (currencyDisplay) {
            currencyDisplay.textContent = this.currentCurrency;
        }
        
        // Update exchange rate info
        this.updateExchangeRateInfo();
    }

    updateExchangeRateInfo() {
        const exchangeRateInfo = this.container.querySelector('#exchangeRateInfo');
        const exchangeRateTime = this.container.querySelector('#exchangeRateTime');
        if (!exchangeRateInfo) return;

        if (this.currentCurrency === 'THB') {
            // Hide for THB since it's the base currency
            exchangeRateInfo.style.display = 'none';
            if (exchangeRateTime) exchangeRateTime.style.display = 'none';
            return;
        }

        const rate = this.exchangeRates[this.currentCurrency];
        if (!rate) {
            exchangeRateInfo.style.display = 'none';
            if (exchangeRateTime) exchangeRateTime.style.display = 'none';
            return;
        }

        // Since ExchangeRateManager converts to THB base:
        // rate = how much of foreign currency you get for 1 THB
        const thbToTarget = rate; // 1 THB = rate foreign currency
        const targetToThb = 1 / rate; // 1 foreign currency = 1/rate THB

        let rateText;
        if (this.currentLang === 'th') {
            if (thbToTarget < 1) {
                // For currencies where 1 THB < 1 foreign currency (like USD, EUR)
                rateText = `1 ${this.currentCurrency} = ${targetToThb.toFixed(2)} บาท`;
            } else {
                // For currencies where 1 THB > 1 foreign currency (like JPY, KRW)
                rateText = `1 บาท = ${thbToTarget.toFixed(2)} ${this.currentCurrency}`;
            }
        } else {
            if (thbToTarget < 1) {
                rateText = `1 ${this.currentCurrency} = ${targetToThb.toFixed(2)} THB`;
            } else {
                rateText = `1 THB = ${thbToTarget.toFixed(2)} ${this.currentCurrency}`;
            }
        }

        exchangeRateInfo.textContent = rateText;
        exchangeRateInfo.style.display = 'block';

        // Show update time
        if (exchangeRateTime && this.exchangeRateManager) {
            const updateInfo = this.exchangeRateManager.getUpdateInfo();
            exchangeRateTime.textContent = `Last updated: ${updateInfo}`;
            exchangeRateTime.style.display = 'block';
        }
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
        
        // Update unit options for silver vs gold
        const unitSelector = this.container.querySelector('#unitSelector');
        if (metal === 'silver') {
            unitSelector.innerHTML = `
                <option value="kg">${this.getUnitText('kg')}</option>
            `;
            this.currentUnit = 'kg';
            unitSelector.value = 'kg';
        } else {
            // Gold - update units based on gold type
            this.updateUnitSelectorForGoldType(this.currentGoldType);
        }
        
        // Update note text based on metal type
        const infoText = this.container.querySelector('.info-text');
        if (infoText) {
            infoText.innerHTML = this.getTranslatedText(`calculator.note${this.currentMetal === 'gold' ? 'Gold' : 'Silver'}`);
        }
        
        this.updateDisplay();
    }

    switchGoldType(type) {
        this.currentGoldType = type;
        
        const goldTypeSelect = this.container.querySelector('#goldTypeSelect');
        if (goldTypeSelect) {
            goldTypeSelect.value = type;
        }
        
        // Update unit selector based on gold type
        this.updateUnitSelectorForGoldType(type);
        
        this.updateDisplay();
    }

    updateUnitSelectorForGoldType(goldType) {
        const unitSelector = this.container.querySelector('#unitSelector');
        if (!unitSelector) return;

        let unitOptions = '';
        let defaultUnit = 'baht';

        if (goldType === '99.99_osiris_kg') {
            // 99.99% Kilogram - only kg unit
            unitOptions = `<option value="kg">${this.getUnitText('kg')}</option>`;
            defaultUnit = 'kg';
        } else if (goldType === '96.5_assoc') {
            // 96.5% Association - no kilogram
            unitOptions = `
                <option value="baht">${this.getUnitText('baht')}</option>
                <option value="gram">${this.getUnitText('gram')}</option>
            `;
        } else if (goldType === '96.5_osiris') {
            // 96.5% Ausiris - no kilogram
            unitOptions = `
                <option value="baht">${this.getUnitText('baht')}</option>
                <option value="gram">${this.getUnitText('gram')}</option>
            `;
        } else if (goldType === '99.99_osiris') {
            // 99.99% Ausiris - includes kilogram and Troy Ounce
            unitOptions = `
                <option value="baht">${this.getUnitText('baht')}</option>
                <option value="kg">${this.getUnitText('kg')}</option>
                <option value="gram">${this.getUnitText('gram')}</option>
                <option value="troy_oz">${this.getUnitText('troy_oz')}</option>
            `;
        }

        unitSelector.innerHTML = unitOptions;
        
        // Reset to appropriate default if current unit is not available
        if (!unitSelector.querySelector(`option[value="${this.currentUnit}"]`)) {
            this.currentUnit = defaultUnit;
            unitSelector.value = defaultUnit;
        } else {
            unitSelector.value = this.currentUnit;
        }
    }

    updateDisplay() {
        let currentPrices;
        const sellPriceElement = this.container.querySelector('#sellPrice');
        const buyPriceElement = this.container.querySelector('#buyPrice');
        
        if (this.currentMetal === 'gold') {
            currentPrices = this.prices.gold[this.currentGoldType];
        } else {
            currentPrices = this.prices.silver['bar_99.99'];
        }
        
        // Keep sell/buy prices in THB (no currency conversion)
        sellPriceElement.textContent = Math.round(currentPrices.bid).toLocaleString();
        buyPriceElement.textContent = Math.round(currentPrices.offer).toLocaleString();
        
        this.calculatePrice();
    }

    calculatePrice() {
        const amountInput = this.container.querySelector('#amount');
        const totalPriceElement = this.container.querySelector('#totalPrice');
        const amount = parseFloat(amountInput.value) || 0;
        let currentPrices;
        let totalPriceInTHB = 0;
        
        // Convert input amount to grams first
        const amountInGrams = amount * this.conversions[this.currentUnit];
        
        if (this.currentMetal === 'gold') {
            currentPrices = this.prices.gold[this.currentGoldType];
            
            if (this.currentGoldType === '99.99_osiris_kg') {
                // ทอง 99.99% กิโลกรัม - ราคาต่อกิโลกรัม
                totalPriceInTHB = (amountInGrams / 1000) * currentPrices.offer;
            } else {
                // ทองปกติ - ราคาต่อบาททอง (ใช้ราคาขาย) 
                const bahtGold = amountInGrams / 15.244; // Convert grams to baht gold
                totalPriceInTHB = bahtGold * currentPrices.offer;
            }
        } else {
            // เงิน - ราคาต่อกิโลกรัม (ใช้ราคาขาย)
            currentPrices = this.prices.silver['bar_99.99'];
            totalPriceInTHB = (amountInGrams / 1000) * currentPrices.offer;
        }
        
        // Convert from THB to selected currency
        const finalPrice = totalPriceInTHB * this.exchangeRates[this.currentCurrency];
        
        // Format price as whole numbers (no decimal places)
        const formattedPrice = Math.round(finalPrice).toLocaleString();
        
        totalPriceElement.textContent = formattedPrice;
    }


    // No longer needed - prices come from SharedPriceManager
    // fetchPricesFromAPI() method removed

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
    
    // Cleanup method
    destroy() {
        if (this.unsubscribePrices) {
            this.unsubscribePrices();
            this.unsubscribePrices = null;
        }
        if (this.unsubscribeRates) {
            this.unsubscribeRates();
            this.unsubscribeRates = null;
        }
        console.log('GoldSilverCalculator unsubscribed from managers');
    }

    updateLanguageContent() {
        // Update calculator title
        const titleElement = this.container.querySelector('.calculator-title');
        if (titleElement) {
            titleElement.innerHTML = this.getTranslatedText('calculator.title').replace(/\n/g, '<br>');
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
        
        
        // Update info text based on metal type
        const infoText = this.container.querySelector('.info-text');
        if (infoText) {
            infoText.innerHTML = this.getTranslatedText(`calculator.note${this.currentMetal === 'gold' ? 'Gold' : 'Silver'}`);
        }
        
        // Update price labels
        const priceLabels = this.container.querySelectorAll('.price-label');
        if (priceLabels.length >= 2) {
            priceLabels[0].textContent = this.getTranslatedText('calculator.prices.sell');
            priceLabels[1].textContent = this.getTranslatedText('calculator.prices.buy');
        }
        
        // Update price display
        this.updateDisplay();
    }
}

// Export to global scope
// Ensure GemApp namespace exists
window.GemApp = window.GemApp || {};

window.GemApp.GoldSilverCalculator = GoldSilverCalculator;