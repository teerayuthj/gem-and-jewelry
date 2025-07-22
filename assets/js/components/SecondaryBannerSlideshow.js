class SecondaryBannerSlideshow {
    constructor() {
        this.images = [
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/Banner-Sale-page%20Test-1.jpg',
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/Banner-Sale-page-Test-2.jpg', 
        ];
        this.currentIndex = 0;
        this.intervalId = null;
        this.init();
    }

    init() {
        this.render();
        this.startSlideshow();
    }

    render() {
        const container = document.getElementById('secondaryBanner');
        if (!container) return;

        // Container already has the right styles from HTML
        // Just need to set initial background image
        this.updateBanner();
    }

    updateBanner() {
        const container = document.getElementById('secondaryBanner');
        if (!container) return;

        const currentImage = this.images[this.currentIndex];
        
        container.style.backgroundImage = `url('${currentImage}')`;
        container.style.backgroundSize = 'contain';
        container.style.backgroundPosition = 'center center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.width = '100%';
        container.style.height = '300px';
        
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }

    startSlideshow() {
        // Update immediately
        this.updateBanner();
        
        // Then update every 4 seconds
        this.intervalId = setInterval(() => {
            this.updateBanner();
        }, 4000);
    }

    stopSlideshow() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    // Clean up method
    destroy() {
        this.stopSlideshow();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่า secondary banner container มีอยู่หรือไม่
    const secondaryContainer = document.getElementById('secondaryBanner');
    if (secondaryContainer) {
        new SecondaryBannerSlideshow();
    }
});