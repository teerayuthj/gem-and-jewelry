// Gold Price Manager Class with Real API Integration and Smooth Button Movement
class GoldPriceManager {
    constructor() {
        this.isExpanded = false;
        this.translations = {};
        this.currentLang = localStorage.getItem('language') || 'en';
        this.realData = null;
        this.yesterdayData = null;
        this.silverData = null;
        this.silverYesterdayData = null;
        this.sharedPriceManager = window.sharedPriceManager;
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        // Show loading state
        this.showLoadingState();
        
        await this.loadGoldTranslations();
        this.subscribeToSharedPriceManager();
        this.render();
        this.bindEvents();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLang = event.detail.language;
            this.updateLanguageContent();
        });
        
        // Listen for banner language changes
        document.addEventListener('bannerLanguageChanged', (event) => {
            console.log('Gold Price: Received banner language change:', event.detail.language);
            if (event.detail.language !== this.currentLang) {
                this.currentLang = event.detail.language;
                localStorage.setItem('language', this.currentLang);
                // Update immediately, don't wait
                setTimeout(() => {
                    this.updateLanguageContent();
                }, 50);
            }
        });
        
        // Listen for unified language changes
        document.addEventListener('unifiedLanguageChanged', (event) => {
            console.log('Gold Price: Received unified language change:', event.detail.language);
            if (event.detail.language !== this.currentLang) {
                this.currentLang = event.detail.language;
                localStorage.setItem('language', this.currentLang);
                this.updateLanguageContent();
            }
        });
    }

    showLoadingState() {
        const container = document.getElementById('goldPriceContainer');
        if (container) {
            container.innerHTML = `
                <div class="w-full mx-auto rounded-xl p-8 text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600">กำลังโหลดข้อมูลราคาทองจริง...</p>
                    <p class="mt-2 text-xs text-gray-500">กำลังเชื่อมต่อ API...</p>
                </div>
            `;
        }
    }

    async loadGoldTranslations() {
        try {
            // Add timestamp to bypass cache
            const timestamp = new Date().getTime();
            const response = await fetch(`./assets/data/gold-translations.json?t=${timestamp}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load gold translations:', error);
            // Fallback translations
            this.translations = {
                th: {
                    goldPrices: {
                        title: "ทองคำแท่ง",
                        updateTime: "อัปเดตครั้งล่าสุด",
                        showMore: "แสดงเพิ่มเติม",
                        showLess: "แสดงน้อยลง",
                        priceBuy: "ราคาซื้อ",
                        priceSell: "ขาย",
                        priceChange: "เปลี่ยนแปลง",
                        goldTypes: {
                            ausitis965: "ออสสิริส 96.5%",
                            ausitis9999: "ออสสิริส 99.99%",
                            spotGold: "Spot Gold (USD/oz)",
                            silverUsdOz: "แท่งเงิน (USD/oz)",
                            goldKg: "ออสสิริส 99.99% (KG)",
                            goldChit: "สมาคมทองคำ 96.5%",
                            silverThb: "แท่งเงิน (บาท/กก.)"
                        },
                        unit: "บาท"
                    }
                },
                en: {
                    goldPrices: {
                        title: "Gold Bar",
                        updateTime: "Last updated",
                        showMore: "Show more",
                        showLess: "Show less",
                        priceBuy: "Buy",
                        priceSell: "Sell",
                        priceChange: "Change",
                        goldTypes: {
                            ausitis965: "Ausiris 96.5%",
                            ausitis9999: "Ausiris 99.99%",
                            spotGold: "Spot Gold (USD/oz)",
                            silverUsdOz: "Silver Bar\n(USD/oz)",
                            goldKg: "Ausiris 99.99% (KG)",
                            goldChit: "Gold Association 96.5%",
                            silverThb: "Silver Bar (THB/kg)"
                        },
                        unit: "THB"
                    }
                }
            };
        }
    }

    // Subscribe to SharedPriceManager for real-time data
    subscribeToSharedPriceManager() {
        if (!this.sharedPriceManager) {
            console.error('SharedPriceManager not available');
            this.loadFallbackData();
            return;
        }

        // Subscribe to price updates
        this.unsubscribe = this.sharedPriceManager.subscribe('GoldPriceManager', (data) => {
            this.updateDataFromShared(data);
        });
        
        console.log('GoldPriceManager subscribed to SharedPriceManager');
    }

    // Update local data from SharedPriceManager
    updateDataFromShared(sharedData) {
        this.realData = sharedData.gold;
        this.yesterdayData = sharedData.goldYesterday;
        this.silverData = sharedData.silver;
        this.silverYesterdayData = sharedData.silverYesterday;
        this.syncedUpdateTime = sharedData.syncedUpdateTime; // Store synced time
        
        // Update the display if component is already rendered
        if (document.getElementById('goldPriceContainer') && document.getElementById('visiblePrices')) {
            this.updatePricesDisplay();
        }
    }

    loadFallbackData() {
        const now = new Date();
        const timeString = now.toISOString().slice(0, 19).replace('T', ' ');
        
        this.realData = {
            "G965B": {"time": timeString, "offer": 51387, "offer_asso": 51400},
            "G9999B": {"time": timeString, "offer": 53251},
            "G9999KG": {"time": timeString, "offer": 3493265},
            "G9999US": {"time": timeString, "offer": 3335}
        };
        this.yesterdayData = {
            "G965B": {"offer": 51300, "offer_asso": 51350},
            "G9999B": {"offer": 53100},
            "G9999KG": {"offer": 3490000},
            "G9999US": {"offer": 3330}
        };
        this.silverData = {
            "Silver": {"offer": "39390", "offerspot": "37.21", "time": timeString}
        };
        this.silverYesterdayData = {
            "Silver": {"offer": "39300", "offerspot": "37.15"}
        };
        
    }

    getText(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key}, currentLang: ${this.currentLang}`);
                return key;
            }
        }
        return value;
    }

    calculateChange(current, yesterday) {
        if (!current || !yesterday) return 0;
        return current - yesterday;
    }

    formatDate(timeString) {
        if (!timeString) return '';
        
        try {
            // Clean the time string (remove trailing dot if exists)
            const cleanTime = timeString.replace(/\.$/, '');
            const date = new Date(cleanTime);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            if (this.currentLang === 'th') {
                const thaiMonths = [
                    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
                ];
                const day = date.getDate();
                const month = thaiMonths[date.getMonth()];
                const year = date.getFullYear() + 543; // Convert to Buddhist Era
                return `วันที่ ${day} ${month} ${year}`;
            } else {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('en-US', options);
            }
        } catch (error) {
            console.error('Date formatting error:', error, 'Input:', timeString);
            return this.currentLang === 'th' ? 'วันที่ 11 กรกฎาคม 2568' : 'July 11, 2568';
        }
    }

    formatTime(timeString) {
        if (!timeString) return '';
        
        try {
            // Clean the time string (remove trailing dot if exists)
            const cleanTime = timeString.replace(/\.$/, '');
            const date = new Date(cleanTime);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            
            return date.toLocaleTimeString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Time formatting error:', error, 'Input:', timeString);
            // Extract time from string if possible
            if (timeString && timeString.includes(' ')) {
                const timePart = timeString.split(' ')[1];
                if (timePart && timePart.match(/\d{2}:\d{2}:\d{2}/)) {
                    return timePart.replace(/\.$/, '');
                }
            }
            return '10:13:21';
        }
    }

    generateRealData() {
        if (!this.realData || !this.silverData) {
            return this.generateFallbackData();
        }

        // Use synced time from SharedPriceManager if available, otherwise format API time
        const apiTime = this.realData.G965B?.time || new Date().toISOString();
        const displayTime = this.syncedUpdateTime || this.formatTime(apiTime);

        return {
            updateTime: displayTime,
            date: this.formatDate(apiTime),
            visiblePrices: [
                {
                    id: 'ausitis965',
                    type: 'gold',
                    buyPrice: this.realData.G965B?.offer || 0,
                    change: this.calculateChange(
                        this.realData.G965B?.offer || 0, 
                        this.yesterdayData?.G965B?.offer || 0
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/Logo1.png'
                },
                {
                    id: 'ausitis9999',
                    type: 'gold',
                    buyPrice: this.realData.G9999B?.offer || 0,
                    change: this.calculateChange(
                        this.realData.G9999B?.offer || 0,
                        this.yesterdayData?.G9999B?.offer || 0
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/Logo1.png'
                },
                {
                    id: 'spotGold',
                    type: 'usd',
                    buyPrice: this.realData.G9999US?.offer || 0,
                    change: this.calculateChange(
                        this.realData.G9999US?.offer || 0,
                        this.yesterdayData?.G9999US?.offer || 0
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/Logo2.jpg'
                }
            ],
            hiddenPrices: [
                {
                    id: 'goldKg',
                    type: 'gold',
                    buyPrice: this.realData.G9999KG?.offer || 0,
                    change: this.calculateChange(
                        this.realData.G9999KG?.offer || 0,
                        this.yesterdayData?.G9999KG?.offer || 0
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/Logo1.png'
                },
                {
                    id: 'goldChit',
                    type: 'gold',
                    buyPrice: this.realData.G965B?.offer_asso || 0,
                    change: this.calculateChange(
                        this.realData.G965B?.offer_asso || 0,
                        this.yesterdayData?.G965B?.offer_asso || 0
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/logo4.jpg'
                },
                {
                    id: 'silverUsdOz',
                    type: 'usd',
                    buyPrice: parseFloat(this.silverData.Silver?.offerspot || 0),
                    change: this.calculateChange(
                        parseFloat(this.silverData.Silver?.offerspot || 0),
                        parseFloat(this.silverYesterdayData?.Silver?.offerspot || 0)
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/Logo3.jpg'
                },
                {
                    id: 'silverThb',
                    type: 'gold',
                    buyPrice: parseInt(this.silverData.Silver?.offer || 0),
                    change: this.calculateChange(
                        parseInt(this.silverData.Silver?.offer || 0),
                        parseInt(this.silverYesterdayData?.Silver?.offer || 0)
                    ),
                    icon: 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/logo5.jpg'
                }
            ]
        };
    }

    generateFallbackData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });

        return {
            updateTime: timeString,
            date: this.currentLang === 'th' ? 'วันที่ 11 กรกฎาคม 2568' : 'July 11, 2568',
            visiblePrices: [
                {
                    id: 'ausitis965',
                    type: 'gold',
                    buyPrice: 51387,
                    change: +87,
                    icon: './public/Logo1.png'
                },
                {
                    id: 'ausitis9999',
                    type: 'gold',
                    buyPrice: 53251,
                    change: +151,
                    icon: './public/Logo1.png'
                },
                {
                    id: 'spotGold',
                    type: 'usd',
                    buyPrice: 3335,
                    change: +5,
                    icon: './public/Logo1.png'
                }
            ],
            hiddenPrices: [
                {
                    id: 'goldKg',
                    type: 'gold',
                    buyPrice: 3493265,
                    change: +3265,
                    icon: './public/Logo1.png'
                },
                {
                    id: 'goldChit',
                    type: 'gold',
                    buyPrice: 51400,
                    change: +50,
                    icon: './public/Logo1.png'
                },
                {
                    id: 'silverUsdOz',
                    type: 'usd',
                    buyPrice: 37.21,
                    change: +0.06,
                    icon: './public/Logo1.png'
                },
                {
                    id: 'silverThb',
                    type: 'gold',
                    buyPrice: 39390,
                    change: +90,
                    icon: './public/Logo1.png'
                }
            ]
        };
    }

    formatPrice(price, type = 'gold', id = '') {
        if (type === 'usd') {
            // Show decimal places for Silver USD/oz
            if (id === 'silverUsdOz') {
                return `${price.toFixed(2)}`;
            }
            return `${Math.round(price).toLocaleString()}`;
        }
        
        // Special formatting for KG to make it shorter
        if (id === 'goldKg' && price > 1000000) {
            const millions = (price / 1000000).toFixed(1);
            return `${millions}M ${this.getText('goldPrices.unit')}`;
        }
        
        return `${price.toLocaleString()} ${this.getText('goldPrices.unit')}`;
    }

    formatPriceWithUnit(price, type = 'gold', id = '') {
        if (type === 'usd') {
            // Show decimal places for Silver USD/oz
            const formatted = (id === 'silverUsdOz') ? 
                price.toFixed(2) : 
                Math.round(price).toLocaleString();
            return {
                number: formatted,
                unit: 'USD'
            };
        }
        
        // Special formatting for KG to make it shorter
        if (id === 'goldKg' && price > 1000000) {
            const millions = (price / 1000000).toFixed(1);
            return {
                number: `${millions}M`,
                unit: this.getText('goldPrices.unit')
            };
        }
        
        return {
            number: price.toLocaleString(),
            unit: this.getText('goldPrices.unit')
        };
    }

    formatChange(change, id = '') {
        const sign = change >= 0 ? '+' : '';
        
        // Special formatting for KG changes to make them shorter
        if (id === 'goldKg' && Math.abs(change) > 1000) {
            if (Math.abs(change) >= 1000000) {
                const millions = (change / 1000000).toFixed(1);
                return `${sign}${millions}M`;
            } else {
                const thousands = (change / 1000).toFixed(1);
                return `${sign}${thousands}K`;
            }
        }
        
        if (Math.abs(change) < 1) {
            return `${sign}${change.toFixed(2)}`;
        }
        return `${sign}${Math.round(change)}`;
    }

    createPriceRow(priceData) {
        const changeClass = priceData.change >= 0 ? 'text-green-600' : 'text-red-600';
        // Use thicker, more consistent arrow symbols for both languages
        const changeSymbol = priceData.change >= 0 ? '▲' : '▼';
        
        // Check if icon is a path or emoji
        const iconElement = priceData.icon.startsWith('./') || priceData.icon.startsWith('/') || priceData.icon.startsWith('http') ? 
            `<img src="${priceData.icon}" alt="icon" class="w-10 h-10 rounded-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
             <span class="text-xl" style="display:none;">🥇</span>` : 
            `<span class="text-xl">${priceData.icon}</span>`;
        
        // Format price with separate number and unit
        const { number } = this.formatPriceWithUnit(priceData.buyPrice, priceData.type, priceData.id);
        
        return `
            <div class="flex items-center justify-between p-3 border-t border-gray-200 hover:bg-blue-100 transition-colors">
                <div class="flex items-center gap-3 flex-1">
                    ${iconElement}
                    <span class="text-[14px] text-gray-800">${this.getText(`goldPrices.goldTypes.${priceData.id}`)}</span>
                </div>
                <div class="flex items-center gap-2 price-details">
                    <div class="text-right min-w-[120px]">
                        <span class="font-bold text-gray-900 price-amount">
                            ${number}
                        </span>
                    </div>
                    <div class="text-right min-w-[60px]">
                        <span class="${changeClass} font-medium flex items-center justify-end gap-1 price-change">
                            <span class="text-xs">${changeSymbol}</span>
                            ${this.formatChange(priceData.change, priceData.id)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const container = document.getElementById('goldPriceContainer');
        if (!container) return;

        const data = this.generateRealData();
        const visibleRows = data.visiblePrices.map(price => this.createPriceRow(price)).join('');
        const hiddenRows = data.hiddenPrices.map(price => this.createPriceRow(price)).join('');

        container.innerHTML = `
            <div class="w-full mx-auto">
                <!-- Date Header - Standalone with Gradient -->
                <div class="mb-4 p-3 text-center rounded-lg" style="background: linear-gradient(135deg, #C2B061 0%, #AD8C2D 100%);">
                    <p class="text-white text-sm font-medium" id="goldDateHeader">
                        ${data.date}
                    </p>
                </div>
                
                <!-- Main Card -->
                <div class="rounded-xl overflow-hidden">
                    <!-- Update Time -->
                    <div class="p-2 text-center">
                        <p class="text-gray-600 text-xs" id="goldUpdateTime">
                            ${this.getText('goldPrices.updateTime')}: ${data.updateTime}
                        </p>
                    </div>
                    
                    <!-- Main Header -->
                    <div class="p-4">
                        <div class="flex justify-between items-center" style="color: #AD8C2D;">
                            <h2 class="text-lg font-bold" data-gold-i18n="goldPrices.title">
                                ${this.getText('goldPrices.title')}
                            </h2>
                            <div class="flex gap-4 text-[12px] font-bold">
                                <span data-gold-i18n="goldPrices.priceSell">${this.getText('goldPrices.priceSell')}</span>
                                <span data-gold-i18n="goldPrices.priceChange" class="price-change-label">${this.getText('goldPrices.priceChange')}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Gold Prices List -->
                    <div class="relative">
                        <!-- Always Visible Prices -->
                        <div id="visiblePrices">
                            ${visibleRows}
                        </div>

                        <!-- Hidden Prices (Initially Hidden) -->
                        <div 
                            id="hiddenPrices" 
                            class="transition-all duration-500 ease-in-out overflow-hidden"
                            style="max-height: 0; opacity: 0;"
                        >
                            ${hiddenRows}
                        </div>

                        <!-- Show More Button Container - Will move smoothly -->
                        <div id="toggleButtonContainer" class="text-center py-3 border-t border-gray-200 transition-all duration-500 ease-in-out">
                            <button 
                                id="togglePricesBtn" 
                                style="color: #C2B061; border-bottom: 1px solid #C2B061;" 
                                class="hover:opacity-80 text-[14px] transition-opacity duration-200 focus:outline-none bg-transparent border-0 pb-1"
                                data-gold-i18n="goldPrices.showMore"
                            >
                                ${this.getText('goldPrices.showMore')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const toggleBtn = document.getElementById('togglePricesBtn');
        const hiddenPrices = document.getElementById('hiddenPrices');
        const buttonContainer = document.getElementById('toggleButtonContainer');

        if (toggleBtn && hiddenPrices && buttonContainer) {
            toggleBtn.addEventListener('click', () => {
                this.isExpanded = !this.isExpanded;
                
                if (this.isExpanded) {
                    // Smooth show animation
                    hiddenPrices.style.display = 'block';
                    hiddenPrices.style.opacity = '0';
                    hiddenPrices.style.transform = 'translateY(-10px)';
                    hiddenPrices.style.maxHeight = 'none';
                    hiddenPrices.style.position = 'static';
                    hiddenPrices.style.visibility = 'visible';
                    
                    setTimeout(() => {
                        hiddenPrices.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
                        hiddenPrices.style.opacity = '1';
                        hiddenPrices.style.transform = 'translateY(0)';
                    }, 10);
                    
                    const contentHeight = hiddenPrices.scrollHeight;
                    
                    // Reset for animation
                    hiddenPrices.style.position = '';
                    hiddenPrices.style.visibility = '';
                    hiddenPrices.style.maxHeight = '0';
                    hiddenPrices.style.opacity = '0';
                    
                    // Animate content expansion
                    requestAnimationFrame(() => {
                        hiddenPrices.style.maxHeight = contentHeight + 'px';
                        hiddenPrices.style.opacity = '1';
                    });
                    
                    // Update button text and style
                    toggleBtn.textContent = this.getText('goldPrices.showLess');
                    toggleBtn.style.color = '#C2B061';
                    toggleBtn.style.borderBottom = '1px solid #C2B061';
                } else {
                    // Smooth hide animation
                    hiddenPrices.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, max-height 0.3s ease-in-out';
                    hiddenPrices.style.opacity = '0';
                    hiddenPrices.style.transform = 'translateY(-10px)';
                    hiddenPrices.style.maxHeight = '0';
                    
                    setTimeout(() => {
                        hiddenPrices.style.display = 'none';
                        hiddenPrices.style.transition = '';
                    }, 300);
                    
                    // Update button text and style
                    toggleBtn.textContent = this.getText('goldPrices.showMore');
                    toggleBtn.style.color = '#C2B061';
                    toggleBtn.style.borderBottom = '1px solid #C2B061';
                }
            });
        }
    }

    // No longer needed - SharedPriceManager handles updates
    // startAutoUpdate() and stopAutoUpdate() removed

    updateLanguageContent() {
        // Update all text elements
        const elementsToUpdate = [
            { selector: '[data-gold-i18n="goldPrices.title"]', key: 'goldPrices.title' },
            { selector: '[data-gold-i18n="goldPrices.priceSell"]', key: 'goldPrices.priceSell' },
            { selector: '[data-gold-i18n="goldPrices.priceChange"]', key: 'goldPrices.priceChange' },
            { selector: '#togglePricesBtn', key: this.isExpanded ? 'goldPrices.showLess' : 'goldPrices.showMore' }
        ];

        elementsToUpdate.forEach(({ selector, key }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = this.getText(key);
            }
        });

        // Update date and time with real data
        const data = this.generateRealData();
        
        const dateElement = document.getElementById('goldDateHeader');
        if (dateElement) {
            dateElement.textContent = data.date;
        }

        const timeElement = document.getElementById('goldUpdateTime');
        if (timeElement) {
            timeElement.textContent = `${this.getText('goldPrices.updateTime')}: ${data.updateTime}`;
        }

        // Re-render price rows to update gold type names
        this.updatePricesDisplay();
    }

    updatePricesDisplay() {
        const data = this.generateRealData();
        const visibleContainer = document.getElementById('visiblePrices');
        const hiddenContainer = document.getElementById('hiddenPrices');

        if (visibleContainer) {
            const visibleRows = data.visiblePrices.map(price => this.createPriceRow(price)).join('');
            visibleContainer.innerHTML = visibleRows;
        }

        if (hiddenContainer) {
            const hiddenRows = data.hiddenPrices.map(price => this.createPriceRow(price)).join('');
            hiddenContainer.innerHTML = hiddenRows;
        }

        // Update time display
        const timeElement = document.getElementById('goldUpdateTime');
        if (timeElement) {
            timeElement.textContent = `${this.getText('goldPrices.updateTime')}: ${data.updateTime}`;
        }

        // Update date display
        const dateElement = document.getElementById('goldDateHeader');
        if (dateElement) {
            dateElement.textContent = data.date;
        }
    }

    // Method to set language programmatically
    setLanguage(language) {
        console.log('Gold Price: setLanguage called with:', language);
        this.currentLang = language;
        localStorage.setItem('language', this.currentLang);
        this.updateLanguageContent();
    }
    
    // Clean up when component is destroyed
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        console.log('GoldPriceManager unsubscribed from SharedPriceManager');
    }
}

// Global instance
let goldPriceManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    goldPriceManager = new GoldPriceManager();
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (goldPriceManager) {
        goldPriceManager.destroy();
    }
});