class SecondaryBannerSlideshow {
    constructor() {
        // Ensure single running instance
        if (SecondaryBannerSlideshow.instance) {
            return SecondaryBannerSlideshow.instance;
        }
        this.images = [
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/ads-page-1.jpg',
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/ads-page-2.jpg',
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/ads-page-3.jpg',
            'http://www.ausiris.co.th/content/dam/ausirisgold/banner/ads-page-4.png'
        ];
        this.currentIndex = 0;
        this.intervalId = null;
        this.isInView = true;
        this.visibilityHandler = this.handleVisibilityChange.bind(this);
        this.intersectionObserver = null;
        this.prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.intervalMs = this.prefersReduced ? 8000 : 4000;
        this.init();
        SecondaryBannerSlideshow.instance = this;
    }

    init() {
        this.render();
        this.setupVisibilityHandling();
        this.setupIntersectionObserver();
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
        if (this.intervalId) return; // avoid duplicates
        // Update immediately
        this.updateBanner();
        // Then update periodically
        this.intervalId = setInterval(() => {
            if (this.isInView && !document.hidden) {
                this.updateBanner();
            }
        }, this.intervalMs);
    }

    stopSlideshow() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.stopSlideshow();
        } else if (this.isInView) {
            this.startSlideshow();
        }
    }

    setupIntersectionObserver() {
        const container = document.getElementById('secondaryBanner');
        if (!container || !('IntersectionObserver' in window)) return;
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isInView = entry.isIntersecting && entry.intersectionRatio > 0.1;
                if (this.isInView && !document.hidden) {
                    this.startSlideshow();
                } else {
                    this.stopSlideshow();
                }
            });
        }, { threshold: [0, 0.1, 0.25] });
        this.intersectionObserver.observe(container);
    }

    // Clean up method
    destroy() {
        this.stopSlideshow();
        document.removeEventListener('visibilitychange', this.visibilityHandler);
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        if (SecondaryBannerSlideshow.instance === this) {
            SecondaryBannerSlideshow.instance = null;
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบว่า secondary banner container มีอยู่หรือไม่
    const secondaryContainer = document.getElementById('secondaryBanner');
    if (secondaryContainer) {
        new SecondaryBannerSlideshow();
    }
    // Cleanup when leaving the page
    window.addEventListener('beforeunload', () => {
        if (SecondaryBannerSlideshow.instance) {
            SecondaryBannerSlideshow.instance.destroy();
        }
    });
});
