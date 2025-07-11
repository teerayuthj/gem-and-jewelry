// Internationalization (i18n) Manager
class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.init();
    }
    
    async init() {
        await this.loadTranslations();
        this.updateLanguage();
        this.setupLanguageSwitch();
    }
    
    async loadTranslations() {
        try {
            const response = await fetch('./assets/data/translations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            console.log('Translations loaded successfully');
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Comprehensive fallback translations
            this.translations = {
                th: {
                    title: "ตัวจับเวลานับถอยหลัง - ข้อเสนอพิเศษ",
                    offer: {
                        header: "🎉 ข้อเสนอพิเศษวันนี้เท่านั้น! 🎉",
                        description: "สั่งซื้อภายในวันนี้ รับส่วนลด 100 บาท",
                        codeTitle: "🏷️ คัดลอกโค้ดส่วนลด",
                        copyButton: "คัดลอก",
                        copiedButton: "คัดลอกแล้ว!",
                        copyError: "คัดลอกโค้ด:",
                        codeExpiry: "⏰ โค้ดหมดอายุ:",
                        promotionPeriod: "ระยะเวลาโปรโมชั่น",
                        discountCode: "AUS100TH"
                    },
                    countdown: {
                        label: "⏳ เหลือเวลาอีก:",
                        labelBeforeStart: "⏳ เหลือเวลาอีกก่อนเริ่มโปรโมชั่น:",
                        labelExpired: "❌ โปรโมชั่นหมดอายุแล้ว",
                        days: "วัน",
                        hours: "ชั่วโมง",
                        minutes: "นาที",
                        seconds: "วินาที"
                    },
                    urgencyMessages: {
                        critical: "🚨 เร่งด่วนที่สุด! เหลือเวลาไม่ถึง 1 ชั่วโมง!",
                        urgent: "🔥 รีบด่วน! เหลือเวลาไม่ถึง 3 ชั่วโมง!",
                        warning: "⚠️ เตือน! เหลือเวลาไม่ถึง 1 วัน!",
                        normal: "🔥 ข้อเสนอพิเศษสุดคุ้ม! อย่าพลาดโอกาสทอง!"
                    },
                    buttons: {
                        getOffer: "🛒 รับข้อเสนอพิเศษตอนนี้เลย!",
                        getReady: "⏰ เตรียมพร้อมรับส่วนลด",
                        expired: "😞 โปรโมชั่นสิ้นสุดแล้ว"
                    },
                    language: {
                        current: "ไทย",
                        switch: "English"
                    }
                },
                en: {
                    title: "Countdown Timer - Special Offer",
                    offer: {
                        header: "🎉 Today Only Special Offer! 🎉",
                        description: "Order today and get 100 THB discount",
                        codeTitle: "🏷️ Copy Discount Code",
                        copyButton: "Copy",
                        copiedButton: "Copied!",
                        copyError: "Copy code:",
                        codeExpiry: "⏰ Code expires:",
                        promotionPeriod: "Promotion Period",
                        discountCode: "AUS100TH"
                    },
                    countdown: {
                        label: "⏳ Time remaining:",
                        labelBeforeStart: "⏳ Time before promotion starts:",
                        labelExpired: "❌ Promotion has expired",
                        days: "Days",
                        hours: "Hours",
                        minutes: "Minutes",
                        seconds: "Seconds"
                    },
                    urgencyMessages: {
                        critical: "🚨 Critical! Less than 1 hour remaining!",
                        urgent: "🔥 Urgent! Less than 3 hours remaining!",
                        warning: "⚠️ Warning! Less than 1 day remaining!",
                        normal: "🔥 Amazing Special Offer! Don't miss this golden opportunity!"
                    },
                    buttons: {
                        getOffer: "🛒 Get This Special Offer Now!",
                        getReady: "⏰ Get Ready for Discount",
                        expired: "😞 Promotion Ended"
                    },
                    language: {
                        current: "English",
                        switch: "ไทย"
                    }
                }
            };
            console.log('Using fallback translations');
        }
    }
    
    getText(key) {
        if (!this.translations || !this.translations[this.currentLang]) {
            console.warn(`Translations not loaded or language ${this.currentLang} not found`);
            return key;
        }
        
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key} in language: ${this.currentLang}`);
                return key; // Return the key if translation is missing
            }
        }
        
        return value;
    }
    
    updateLanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
        
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getText(key);
            element.textContent = translation;
        });
        
        // Update elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getText(key);
            element.placeholder = translation;
        });
        
        // Update elements with data-i18n-value attribute
        const valueElements = document.querySelectorAll('[data-i18n-value]');
        valueElements.forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            const translation = this.getText(key);
            element.value = translation;
        });
        
        // Update page title
        document.title = this.getText('title');
        
        // Update meta title if exists
        const metaTitle = document.querySelector('title');
        if (metaTitle) {
            metaTitle.textContent = this.getText('title');
        }
        
        // Update language switcher button
        this.updateLanguageButton();
        
        // Trigger custom event for other components to listen to
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }
    
    updateLanguageButton() {
        const langBtn = document.getElementById('langSwitcher');
        if (langBtn) {
            langBtn.textContent = this.getText('language.switch');
        }
    }
    
    switchLanguage() {
        this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('language', this.currentLang);
        this.updateLanguage();
    }
    
    setupLanguageSwitch() {
        const langBtn = document.getElementById('langSwitcher');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.switchLanguage();
            });
        }
        
        // Listen for banner language changes
        document.addEventListener('bannerLanguageChanged', (event) => {
            console.log('I18n: Received banner language change:', event.detail.language);
            if (event.detail.language !== this.currentLang) {
                this.currentLang = event.detail.language;
                localStorage.setItem('language', this.currentLang);
                // Update immediately
                setTimeout(() => {
                    this.updateLanguage();
                }, 50);
            }
        });
        
        // Listen for unified language changes
        document.addEventListener('unifiedLanguageChanged', (event) => {
            console.log('I18n: Received unified language change:', event.detail.language);
            if (event.detail.language !== this.currentLang) {
                this.currentLang = event.detail.language;
                localStorage.setItem('language', this.currentLang);
                this.updateLanguage();
            }
        });
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    // Method to set language programmatically
    setLanguage(language) {
        console.log('I18n: setLanguage called with:', language);
        this.currentLang = language;
        localStorage.setItem('language', this.currentLang);
        this.updateLanguage();
    }
    
    // Method to update translations (for unified system)
    updateTranslations() {
        this.updateLanguage();
    }
}

// Global i18n instance
let i18n;

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    i18n = new I18nManager();
    window.i18nManager = i18n; // Global reference
    
    // Notify other components that i18n is ready
    window.i18nReady = true;
    document.dispatchEvent(new CustomEvent('i18nReady', {
        detail: { i18n: i18n }
    }));
});

// Listen for language changes to update dynamic content
document.addEventListener('languageChanged', function(event) {
    // Update countdown timer text if it exists
    const countdownTimer = window.countdownTimerInstance;
    if (countdownTimer) {
        countdownTimer.updateLanguage();
    }
    
    // Update copy button text
    const btnText = document.getElementById('btnText');
    if (btnText && !document.getElementById('copyBtn').disabled) {
        btnText.textContent = i18n.getText('offer.copyButton');
    }
    
    // Update gold price component if it exists
    if (window.goldPriceManager) {
        goldPriceManager.currentLang = event.detail.language;
        goldPriceManager.updateLanguageContent();
    }
});