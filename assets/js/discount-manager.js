// Discount Code Management System
class DiscountManager {
    constructor() {
        this.defaultCodes = {
            th: 'AUBGJF50TH',
            en: 'AUBGJF50TH'
        };
        this.activeCodes = {};
        this.campaignConfig = {
            enabled: true,
            startDate: '2025-09-09',
            endDate: '2025-09-13',
            discountAmount: 50,
            currency: 'THB'
        };
        this.init();
    }

    init() {
        // Load custom codes from localStorage or API
        this.loadCustomCodes();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            this.updateDiscountCode(event.detail.language);
        });
        
        // Initial setup
        this.updateDiscountCode(this.getCurrentLanguage());
    }

    loadCustomCodes() {
        // Try to load from localStorage first
        const savedCodes = localStorage.getItem('discountCodes');
        if (savedCodes) {
            try {
                this.activeCodes = JSON.parse(savedCodes);
            } catch (e) {
                console.warn('Failed to parse saved discount codes:', e);
                this.activeCodes = { ...this.defaultCodes };
            }
        } else {
            this.activeCodes = { ...this.defaultCodes };
        }
    }

    saveCustomCodes() {
        localStorage.setItem('discountCodes', JSON.stringify(this.activeCodes));
    }

    updateDiscountCode(language = 'th') {
        const codeInput = document.getElementById('discountCode');
        if (codeInput) {
            const code = this.getDiscountCode(language);
            codeInput.value = code;
            
            // Update i18n if available
            if (typeof i18n !== 'undefined') {
                // Update the translations dynamically
                if (i18n.translations && i18n.translations[language] && i18n.translations[language].offer) {
                    i18n.translations[language].offer.discountCode = code;
                }
            }
        }
    }

    getDiscountCode(language = 'th') {
        return this.activeCodes[language] || this.defaultCodes[language] || 'AUBGJF50TH';
    }

    setDiscountCode(language, code) {
        this.activeCodes[language] = code;
        this.saveCustomCodes();
        this.updateDiscountCode(language);
    }

    getCurrentLanguage() {
        if (typeof i18n !== 'undefined') {
            return i18n.getCurrentLanguage();
        }
        return localStorage.getItem('language') || 'th';
    }

    // Campaign management methods
    isCampaignActive() {
        const now = new Date();
        const start = new Date(this.campaignConfig.startDate);
        const end = new Date(this.campaignConfig.endDate);
        
        return this.campaignConfig.enabled && now >= start && now <= end;
    }

    getCampaignInfo() {
        return {
            isActive: this.isCampaignActive(),
            config: this.campaignConfig,
            codes: this.activeCodes
        };
    }

    updateCampaignConfig(config) {
        this.campaignConfig = { ...this.campaignConfig, ...config };
        localStorage.setItem('campaignConfig', JSON.stringify(this.campaignConfig));
    }

    // API methods for external integration
    async fetchDiscountCodes(apiEndpoint) {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.codes) {
                this.activeCodes = { ...this.activeCodes, ...data.codes };
                this.saveCustomCodes();
                this.updateDiscountCode(this.getCurrentLanguage());
            }
            
            if (data.campaign) {
                this.updateCampaignConfig(data.campaign);
            }
            
            return data;
        } catch (error) {
            console.error('Failed to fetch discount codes:', error);
            return null;
        }
    }

    // Analytics methods
    trackCodeUsage(code, language) {
        const usage = JSON.parse(localStorage.getItem('codeUsage') || '{}');
        const today = new Date().toISOString().split('T')[0];
        
        if (!usage[today]) {
            usage[today] = {};
        }
        
        const key = `${code}_${language}`;
        usage[today][key] = (usage[today][key] || 0) + 1;
        
        localStorage.setItem('codeUsage', JSON.stringify(usage));
    }

    getUsageStats() {
        return JSON.parse(localStorage.getItem('codeUsage') || '{}');
    }
}

// Global discount manager instance
let discountManager;

// Initialize discount manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    discountManager = new DiscountManager();
    
    // Make it globally accessible for debugging
    window.discountManager = discountManager;
});
