// Quick fix - Force Thai text for headers
function forceThaiHeaders() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const priceSellSpan = document.querySelector('[data-gold-i18n="goldPrices.priceSell"]');
        const priceChangeSpan = document.querySelector('[data-gold-i18n="goldPrices.priceChange"]');
        
        if (priceSellSpan) {
            priceSellSpan.textContent = 'ขาย';
        }
        if (priceChangeSpan) {
            priceChangeSpan.textContent = 'เปลี่ยนแปลง';
        }
        
        console.log('Forced Thai headers applied');
    }, 100);
}

// Apply fix when component loads
document.addEventListener('DOMContentLoaded', function() {
    forceThaiHeaders();
    
    // Also apply after language changes
    document.addEventListener('languageChanged', function(event) {
        if (event.detail.language === 'th') {
            forceThaiHeaders();
        }
    });
});

// Apply fix when gold price manager is ready
if (window.goldPriceManager) {
    forceThaiHeaders();
} else {
    setTimeout(forceThaiHeaders, 1000);
}