// Unified Language Management System
class UnifiedLanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.components = {
            banner: null,
            goldPrice: null,
            specialOffer: null
        };
        this.init();
    }
    
    init() {
        this.updateLanguageButton();
        this.setupLanguageToggle();
        this.initializeComponents();
    }
    
    updateLanguageButton() {
        // Update unified button if exists (currently disabled)
        const button = document.getElementById('unifiedLangSwitcher');
        if (button) {
            button.textContent = this.currentLang === 'th' ? 'ไทย' : 'English';
        }
        
        // Update banner language button text if exists
        const bannerBtn = document.querySelector('#langSwitcher');
        if (bannerBtn) {
            bannerBtn.textContent = this.currentLang === 'th' ? 'English' : 'Thai';
        }
    }
    
    setupLanguageToggle() {
        // Unified button is disabled, language control is handled by banner
        const button = document.getElementById('unifiedLangSwitcher');
        if (button) {
            button.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }
    
    toggleLanguage() {
        this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('language', this.currentLang);
        this.updateLanguageButton();
        this.broadcastLanguageChange();
    }
    
    broadcastLanguageChange() {
        console.log('Unified: Broadcasting language change to', this.currentLang);
        
        // Send unified language change event (components will handle this)
        document.dispatchEvent(new CustomEvent('unifiedLanguageChanged', {
            detail: { language: this.currentLang }
        }));
    }
    
    updateSpecialOfferTranslations() {
        // This will be handled by the existing i18n system
        if (window.i18nManager) {
            window.i18nManager.updateTranslations();
        }
    }
    
    async initializeComponents() {
        try {
            // Initialize Banner Component
            await this.initializeBanner();
            
            // Initialize other components
            this.initializeGoldPrice();
            this.initializeSpecialOffer();
            
            console.log('All components initialized successfully');
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }
    
    async initializeBanner() {
        return new Promise((resolve) => {
            console.log('UnifiedLanguageManager: Skipping banner initialization - handled by banner-slideshow.js');
            
            // Just initialize secondary banner
            this.initializeSecondaryBanner();
            
            resolve(null);
        });
    }
    
    initializeSecondaryBanner() {
        const secondaryContainer = document.getElementById('secondaryBanner');
        if (secondaryContainer) {
            try {
                // Secondary banner images only (no text content)
                const bannerImages = [
                    'http://www.ausiris.co.th/content/dam/ausirisgold/icon/rich-menu_01.jpg',
                    'http://www.ausiris.co.th/content/dam/ausirisgold/icon/rich-menu_mto_02.jpg', 
                    'http://www.ausiris.co.th/content/dam/ausirisgold/icon/rich-menu_01.jpg',
                    'http://www.ausiris.co.th/content/dam/ausirisgold/icon/rich-menu_mto_02.jpg'
                ];
                
                let currentSlide = 0;
                const totalSlides = bannerImages.length;
                
                const updateSecondaryBanner = () => {
                    const currentImage = bannerImages[currentSlide];
                    
                    // Test if image exists before setting
                    const img = new Image();
                    img.onload = function() {
                        // Remove any overlay - show pure image
                        secondaryContainer.style.backgroundImage = `url('${currentImage}')`;
                        secondaryContainer.style.backgroundSize = 'cover';
                        secondaryContainer.style.backgroundPosition = 'center';
                        secondaryContainer.style.backgroundRepeat = 'no-repeat';
                    };
                    img.onerror = function() {
                        console.error('Secondary Banner: Failed to load image:', currentImage);
                        // Fallback gradient background
                        secondaryContainer.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    };
                    img.src = currentImage;
                    
                    // Clear any existing content - show only image
                    secondaryContainer.innerHTML = '';
                };
                
                // Initial load
                updateSecondaryBanner();
                
                // Auto-advance slides every 4 seconds
                setInterval(() => {
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateSecondaryBanner();
                }, 4000);
                
                console.log('Secondary banner initialized');
                
            } catch (error) {
                console.error('Secondary banner initialization failed:', error);
            }
        }
    }
    
    initializeGoldPrice() {
        // Gold Price Manager should initialize automatically
        if (window.goldPriceManager) {
            this.components.goldPrice = window.goldPriceManager;
            console.log('Gold Price Manager ready');
        }
    }
    
    initializeSpecialOffer() {
        // Special offer components should initialize automatically
        if (window.i18nManager) {
            this.components.specialOffer = window.i18nManager;
            console.log('Special Offer Manager ready');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.unifiedLanguageManager = new UnifiedLanguageManager();
});

// Debug function
window.debugUnified = () => {
    console.log('Unified Language Manager:', window.unifiedLanguageManager);
    console.log('Current Language:', window.unifiedLanguageManager?.currentLang);
    console.log('Components:', window.unifiedLanguageManager?.components);
};