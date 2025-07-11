// Gold Price Manager Class
class GoldPriceManager {
    constructor() {
        this.isExpanded = false;
        this.translations = {};
        this.currentLang = localStorage.getItem('language') || 'th';
        this.mockData = this.generateMockData();
        this.init();
    }

    async init() {
        await this.loadGoldTranslations();
        this.render();
        this.bindEvents();
        this.updatePricesDisplay();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.currentLang = event.detail.language;
            this.updateLanguageContent();
        });
    }

    async loadGoldTranslations() {
        try {
            const response = await fetch('./assets/data/gold-translations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('Gold translations loaded successfully');
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
                        priceSell: "ราคาขาย",
                        priceChange: "ราคาเปลี่ยนแปลง",
                        goldTypes: {
                            ausitis965: "Ausitis 96.5%",
                            ausitis9999: "Ausitis 99.99%",
                            spotGold: "Spot Gold (USD/oz)",
                            silverUsdOz: "Silver (USD/oz)",
                            goldKg: "Ausitis 99.99% (KG)",
                            goldChit: "สวนจิตต์ 96.5%",
                            infinite: "Infinite (THB/กรัม)"
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
                        priceBuy: "Buy Price",
                        priceSell: "Sell Price",
                        priceChange: "Price Change",
                        goldTypes: {
                            ausitis965: "Ausitis 96.5%",
                            ausitis9999: "Ausitis 99.99%",
                            spotGold: "Spot Gold (USD/oz)",
                            silverUsdOz: "Silver (USD/oz)",
                            goldKg: "Ausitis 99.99% (KG)",
                            goldChit: "Garden Chit 96.5%",
                            infinite: "Infinite (THB/gram)"
                        },
                        unit: "THB"
                    }
                }
            };
        }
    }

    getText(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
        }
        
        return value;
    }

    generateMockData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });

        return {
            updateTime: `วันที่ 8 กรกฎาคม 2568 เวลา ${timeString} น.`,
            updateTimeEn: `July 8, 2568 at ${timeString}`,
            visiblePrices: [
                {
                    id: 'ausitis965',
                    type: 'gold',
                    buyPrice: 51300,
                    sellPrice: null,
                    change: +250,
                    icon: './public/logo1.png'
                },
                {
                    id: 'ausitis9999',
                    type: 'gold',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo1.png'
                },
                {
                    id: 'spotGold',
                    type: 'usd',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo2.jpg'
                }
            ],
            hiddenPrices: [
                {
                    id: 'goldKg',
                    type: 'gold',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo1.png'
                },
                {
                    id: 'goldChit',
                    type: 'gold',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo4.jpg'
                },
                {
                    id: 'silverUsdOz',
                    type: 'usd',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo3.jpg'
                },
                {
                    id: 'infinite',
                    type: 'gold',
                    buyPrice: 53067,
                    sellPrice: null,
                    change: +236,
                    icon: './public/logo5.jpg'
                }
            ]
        };
    }

    formatPrice(price, type = 'gold') {
        if (type === 'usd') {
            return `$${price.toLocaleString()}`;
        }
        return `${price.toLocaleString()} ${this.getText('goldPrices.unit')}`;
    }

    formatChange(change) {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change}`;
    }

    createPriceRow(priceData) {
        const changeClass = priceData.change >= 0 ? 'text-green-600' : 'text-red-600';
        const changeSymbol = priceData.change >= 0 ? '↗' : '↘';
        
        // Check if icon is a path or emoji
        const iconElement = priceData.icon.startsWith('./') || priceData.icon.startsWith('/') || priceData.icon.startsWith('http') ? 
            `<img src="${priceData.icon}" alt="icon" class="w-6 h-6 rounded-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
             <span class="text-xl" style="display:none;">🥇</span>` : 
            `<span class="text-xl">${priceData.icon}</span>`;
        
        return `
            <div class="flex items-center justify-between p-3 border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-3">
                    ${iconElement}
                    <span class="font-medium text-gray-800">${this.getText(`goldPrices.goldTypes.${priceData.id}`)}</span>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-gray-900">
                        ${this.formatPrice(priceData.buyPrice, priceData.type)}
                    </span>
                    <span class="${changeClass} font-medium flex items-center gap-1">
                        <span class="text-xs">${changeSymbol}</span>
                        ${this.formatChange(priceData.change)}
                    </span>
                </div>
            </div>
        `;
    }

    render() {
        const container = document.getElementById('goldPriceContainer');
        if (!container) return;

        const visibleRows = this.mockData.visiblePrices.map(price => this.createPriceRow(price)).join('');
        const hiddenRows = this.mockData.hiddenPrices.map(price => this.createPriceRow(price)).join('');

        container.innerHTML = `
            <div class="max-w-md mx-auto">
                <!-- Date Header - Standalone with Gradient -->
                <div class="mb-4 p-3 text-center rounded-lg" style="background: linear-gradient(135deg, #C2B061 0%, #AD8C2D 100%);">
                    <p class="text-white text-sm font-medium" id="goldDateHeader">
                        ${this.currentLang === 'th' ? 'วันที่ 8 กรกฎาคม 2568' : 'July 8, 2568'}
                    </p>
                </div>
                
                <!-- Main Card -->
                <div class="rounded-xl overflow-hidden">
                    <!-- Update Time -->
                    <div class="p-2 text-center">
                        <p class="text-gray-600 text-xs" id="goldUpdateTime">
                            ${this.getText('goldPrices.updateTime')}: ${this.currentLang === 'th' ? this.mockData.updateTime.split('เวลา ')[1] : this.mockData.updateTimeEn.split(' at ')[1]}
                        </p>
                    </div>
                    
                    <!-- Main Header -->
                    <div class="p-4">
                        <div class="flex justify-between items-center" style="color: #AD8C2D;">
                            <h2 class="text-lg font-bold" data-gold-i18n="goldPrices.title">
                                ${this.getText('goldPrices.title')}
                            </h2>
                            <div class="flex gap-4 text-sm">
                                <span data-gold-i18n="goldPrices.priceSell">${this.getText('goldPrices.priceSell')}</span>
                                <span data-gold-i18n="goldPrices.priceChange">${this.getText('goldPrices.priceChange')}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Gold Prices List -->
                    <div>
                        <!-- Always Visible Prices -->
                        <div id="visiblePrices">
                            ${visibleRows}
                        </div>

                        <!-- Show More Button -->
                        <div class="text-center py-3 border-t border-gray-200">
                            <button 
                                id="togglePricesBtn" 
                                style="color: #C2B061; border-bottom: 1px solid #C2B061;" 
                                class="hover:opacity-80 font-medium transition-opacity duration-200 focus:outline-none bg-transparent border-0"
                                data-gold-i18n="goldPrices.showMore"
                            >
                                ${this.getText('goldPrices.showMore')}
                            </button>
                        </div>

                        <!-- Hidden Prices (Initially Hidden) -->
                        <div 
                            id="hiddenPrices" 
                            class="transition-all duration-300 ease-in-out"
                            style="display: none;"
                        >
                            ${hiddenRows}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const toggleBtn = document.getElementById('togglePricesBtn');
        const hiddenPrices = document.getElementById('hiddenPrices');

        if (toggleBtn && hiddenPrices) {
            toggleBtn.addEventListener('click', () => {
                this.isExpanded = !this.isExpanded;
                
                if (this.isExpanded) {
                    hiddenPrices.style.display = 'block';
                    setTimeout(() => {
                        hiddenPrices.style.opacity = '1';
                        hiddenPrices.style.transform = 'translateY(0)';
                    }, 10);
                    toggleBtn.textContent = this.getText('goldPrices.showLess');
                    toggleBtn.style.color = '#C2B061';
                    toggleBtn.style.borderBottom = '1px solid #C2B061';
                } else {
                    hiddenPrices.style.opacity = '0';
                    hiddenPrices.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        hiddenPrices.style.display = 'none';
                    }, 300);
                    toggleBtn.textContent = this.getText('goldPrices.showMore');
                    toggleBtn.style.color = '#C2B061';
                    toggleBtn.style.borderBottom = '1px solid #C2B061';
                }
            });
        }
    }

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

        // Update date
        const dateElement = document.getElementById('goldDateHeader');
        if (dateElement) {
            dateElement.textContent = this.currentLang === 'th' ? 'วันที่ 8 กรกฎาคม 2568' : 'July 8, 2568';
        }

        // Update time
        const timeElement = document.getElementById('goldUpdateTime');
        if (timeElement) {
            const timeText = this.currentLang === 'th' ? 
                this.mockData.updateTime.split('เวลา ')[1] : 
                this.mockData.updateTimeEn.split(' at ')[1];
            timeElement.textContent = `${this.getText('goldPrices.updateTime')}: ${timeText}`;
        }

        // Re-render price rows to update gold type names
        this.updatePricesDisplay();
    }

    updatePricesDisplay() {
        const visibleContainer = document.getElementById('visiblePrices');
        const hiddenContainer = document.getElementById('hiddenPrices');

        if (visibleContainer) {
            const visibleRows = this.mockData.visiblePrices.map(price => this.createPriceRow(price)).join('');
            visibleContainer.innerHTML = visibleRows;
        }

        if (hiddenContainer) {
            const hiddenRows = this.mockData.hiddenPrices.map(price => this.createPriceRow(price)).join('');
            hiddenContainer.innerHTML = hiddenRows;
        }
    }

    // Method to update prices with real data
    updatePrices(newPriceData) {
        this.mockData = { ...this.mockData, ...newPriceData };
        this.updatePricesDisplay();
    }
}

// Global instance
let goldPriceManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    goldPriceManager = new GoldPriceManager();
});