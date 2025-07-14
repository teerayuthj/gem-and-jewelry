// Contact Section Manager
class ContactManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.init();
    }
    
    init() {
        this.setupLanguageListener();
        this.updatePhoneLink();
        console.log('Contact Manager initialized');
    }
    
    setupLanguageListener() {
        // Listen for language changes
        document.addEventListener('languageChanged', (event) => {
            console.log('Contact: Language changed to', event.detail.language);
            this.currentLang = event.detail.language;
            this.updateContactContent();
        });
        
        // Listen for unified language changes
        document.addEventListener('unifiedLanguageChanged', (event) => {
            console.log('Contact: Unified language change to', event.detail.language);
            this.currentLang = event.detail.language;
            this.updateContactContent();
        });
        
        // Listen for banner language changes
        document.addEventListener('bannerLanguageChanged', (event) => {
            console.log('Contact: Banner language change to', event.detail.language);
            this.currentLang = event.detail.language;
            this.updateContactContent();
        });
    }
    
    updateContactContent() {
        // Update phone link if needed
        this.updatePhoneLink();
        
        // Add smooth transition effect
        const contactSection = document.querySelector('.map-section');
        if (contactSection) {
            contactSection.classList.add('language-changing');
            
            setTimeout(() => {
                contactSection.classList.remove('language-changing');
            }, 300);
        }
    }
    
    updatePhoneLink() {
        const phoneLink = document.querySelector('a[href^="tel:"]');
        if (phoneLink) {
            // Ensure phone number stays the same regardless of language
            phoneLink.href = 'tel:+6626134711';
        }
    }
    
    // Method to programmatically set language
    setLanguage(language) {
        this.currentLang = language;
        this.updateContactContent();
    }
    
    // Get current language
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Global instance
let contactManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    contactManager = new ContactManager();
    window.contactManager = contactManager; // Global reference
    
    console.log('Contact Manager ready');
});

// Make it available globally
window.ContactManager = ContactManager;