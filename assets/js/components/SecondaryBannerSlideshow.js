class SecondaryBannerSlideshow {
    constructor() {
        this.images = [
            'Rich Menu_01.jpg',
            'banner-2.jpg', 
            'Banner-01.jpg',
            'get-well-soon.jpg'
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
        const imagePath = window.GitHubAssets ? window.GitHubAssets.getImagePath(currentImage) : `public/${currentImage}`;
        
        container.style.backgroundImage = `url('${imagePath}')`;
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
    new SecondaryBannerSlideshow();
});