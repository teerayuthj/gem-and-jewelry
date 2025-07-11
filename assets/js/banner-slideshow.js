// Modern Banner Slideshow Component with Multi-language Support
class BannerSlideshow {
    constructor(options = {}) {
        this.container = options.container || document.querySelector('.banner-slideshow');
        this.currentLang = localStorage.getItem('bannerLanguage') || 'en';
        this.translations = {};
        this.slideImages = [
            './public/banner-1.jpg',
            './public/1-2.jpg',
            './public/offer.png',
            './public/ausiris-next-2025.png'
        ];
        this.slideClasses = [
            'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
            'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
            'bg-gradient-to-r from-red-500 to-red-700 text-white',
            'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
        ];
        
        this.currentSlide = 0;
        this.totalSlides = 4;
        this.autoPlayInterval = null;
        this.autoPlayDuration = options.autoPlayDuration || 5000;
        this.isPlaying = true;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Bind keyboard handler to this instance
        this.keydownHandler = this.handleKeydown.bind(this);
        
        // Bind mouse and touch handlers
        this.mouseEnterHandler = () => this.pauseAutoPlay();
        this.mouseLeaveHandler = () => this.resumeAutoPlay();
        this.touchStartHandler = this.handleTouchStart.bind(this);
        this.touchEndHandler = this.handleTouchEnd.bind(this);
        
        this.init();
    }
    
    async init() {
        if (!this.container) {
            console.error('Banner slideshow container not found');
            return;
        }
        
        // ตรวจสอบและทำความสะอาด container อย่างสมบูรณ์
        this.cleanupContainer();
        
        await this.loadTranslations();
        this.render();
        this.bindEvents();
        this.startAutoPlay();
    }
    
    cleanupContainer() {
        // ทำความสะอาด container และลบ event listeners ทั้งหมด
        if (this.container) {
            // ลบ event listeners ที่อาจยังค้างอยู่
            this.container.removeEventListener('mouseenter', this.mouseEnterHandler);
            this.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
            this.container.removeEventListener('touchstart', this.touchStartHandler);
            this.container.removeEventListener('touchend', this.touchEndHandler);
            
            // ลบเนื้อหาทั้งหมด
            this.container.innerHTML = '';
            
            // รีเซ็ต CSS classes
            this.container.className = 'banner-slideshow';
        }
    }
    
    async loadTranslations() {
        try {
            const response = await fetch('./assets/data/banner-translations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load banner translations:', error);
            // Fallback translations
            this.translations = {
                th: {
                    slides: [
                        {
                            title: "ทองคำแท่งคุณภาพสูง",
                            subtitle: "ลงทุนกับทองคำมาตรฐานสากล 96.5% และ 99.99%",
                            buttonText: "เริ่มต้นลงทุน"
                        },
                        {
                            title: "แท่งเงินคุณภาพพรีเมี่ยม",
                            subtitle: "ราคาแท่งเงินอัปเดตแบบเรียลไทม์",
                            buttonText: "ดูราคาเงิน"
                        },
                        {
                            title: "โปรโมชั่นพิเศษ",
                            subtitle: "ส่วนลดสูงสุด 50% สำหรับลูกค้าใหม่",
                            buttonText: "รับข้อเสนอพิเศษ"
                        },
                        {
                            title: "ผู้เชี่ยวชาญด้านทองคำ",
                            subtitle: "ประสบการณ์กว่า 10 ปี ในธุรกิจทองคำและเงิน",
                            buttonText: "ติดต่อผู้เชี่ยวชาญ"
                        }
                    ]
                },
                en: {
                    slides: [
                        {
                            title: "Premium Gold Bars",
                            subtitle: "Invest in international standard gold 96.5% and 99.99%",
                            buttonText: "Start Investing"
                        },
                        {
                            title: "Premium Silver Bars",
                            subtitle: "Real-time silver bar prices updated 24/7",
                            buttonText: "View Silver Prices"
                        },
                        {
                            title: "Special Promotion",
                            subtitle: "Up to 50% discount for new customers",
                            buttonText: "Get Special Offer"
                        },
                        {
                            title: "Gold Investment Experts",
                            subtitle: "Over 10 years of experience in gold and silver business",
                            buttonText: "Contact Expert"
                        }
                    ]
                }
            };
        }
    }
    
    render() {
        const slides = this.translations[this.currentLang]?.slides || [];
        
        const slidesHtml = slides.map((slide, index) => `
            <div class="banner-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                <img src="${this.slideImages[index]}" alt="Banner ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}">
                <div class="banner-overlay"></div>
                <div class="banner-content">
                    <h1 class="banner-title">${slide.title}</h1>
                    <p class="banner-subtitle">${slide.subtitle}</p>
                    <button class="banner-button ${this.slideClasses[index]}" onclick="bannerSlideshow.handleButtonClick('${slide.buttonText}')">
                        ${slide.buttonText}
                    </button>
                </div>
            </div>
        `).join('');
        
        const indicatorsHtml = slides.map((_, index) => `
            <button class="indicator ${index === 0 ? 'active' : ''}" data-slide="${index}"></button>
        `).join('');
        
        this.container.innerHTML = `
            ${slidesHtml}
            
            <!-- Language Switcher Button -->
            <button class="lang-switcher" id="langSwitcher">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7.75a1.23 1.23 0 0 0 1.23-1.23v-2.54A1.23 1.23 0 0 0 20.25 13h-7.75a1.23 1.23 0 0 0-1.23 1.23v2.54c0 .679.551 1.23 1.23 1.23z"/>
                </svg>
                <span>${this.currentLang === 'th' ? 'EN' : 'TH'}</span>
            </button>
            
            <button class="nav-button prev" id="prevBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </button>
            
            <button class="nav-button next" id="nextBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </button>
            
            <div class="slide-indicators">
                ${indicatorsHtml}
            </div>
            
            <div class="progress-container">
                <div class="progress-bar" id="progressBar"></div>
            </div>
        `;
    }
    
    bindEvents() {
        // Language switcher
        const langSwitcher = this.container.querySelector('#langSwitcher');
        if (langSwitcher) {
            langSwitcher.addEventListener('click', () => {
                this.switchLanguage();
            });
        }
        
        // Navigation buttons
        const prevBtn = this.container.querySelector('#prevBtn');
        const nextBtn = this.container.querySelector('#nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.pauseAutoPlay();
                this.previousSlide();
                this.resumeAutoPlay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.pauseAutoPlay();
                this.nextSlide();
                this.resumeAutoPlay();
            });
        }
        
        // Indicator dots
        const indicators = this.container.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.pauseAutoPlay();
                this.goToSlide(index);
                this.resumeAutoPlay();
            });
        });
        
        // Pause on hover - ใช้ bound handlers
        this.container.addEventListener('mouseenter', this.mouseEnterHandler);
        this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
        
        // Touch/swipe support - ใช้ bound handlers  
        this.container.addEventListener('touchstart', this.touchStartHandler);
        this.container.addEventListener('touchend', this.touchEndHandler);
        
        // Keyboard navigation
        document.addEventListener('keydown', this.keydownHandler);
    }
    
    handleKeydown(e) {
        if (e.key === 'ArrowLeft') {
            this.pauseAutoPlay();
            this.previousSlide();
            this.resumeAutoPlay();
        } else if (e.key === 'ArrowRight') {
            this.pauseAutoPlay();
            this.nextSlide();
            this.resumeAutoPlay();
        }
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        
        // ป้องกันการ scroll ในขณะที่กำลัง swipe
        this.isScrolling = false;
    }
    
    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;
        
        // ตรวจสอบว่าเป็น horizontal swipe หรือ vertical scroll
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);
        
        // เพิ่มความเอียงในการตรวจสอบ swipe
        if (absX > absY && absX > 80) {
            // ป้องกัน default behavior
            e.preventDefault();
            
            this.pauseAutoPlay();
            if (diffX > 0) {
                this.nextSlide();
            } else {
                this.previousSlide();
            }
            this.resumeAutoPlay();
        }
    }
    
    goToSlide(slideIndex) {
        // Hide current slide
        const currentSlideElement = this.container.querySelector(`[data-slide="${this.currentSlide}"]`);
        const currentIndicator = this.container.querySelector(`.indicator[data-slide="${this.currentSlide}"]`);
        
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }
        if (currentIndicator) {
            currentIndicator.classList.remove('active');
        }
        
        // Update current slide
        this.currentSlide = slideIndex;
        
        // Show new slide
        const newSlideElement = this.container.querySelector(`[data-slide="${this.currentSlide}"]`);
        const newIndicator = this.container.querySelector(`.indicator[data-slide="${this.currentSlide}"]`);
        
        if (newSlideElement) {
            newSlideElement.classList.add('active');
        }
        if (newIndicator) {
            newIndicator.classList.add('active');
        }
        
        // Update progress bar
        this.updateProgressBar();
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        if (this.isPlaying) {
            this.updateProgressBar();
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoPlayDuration);
        }
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        this.pauseProgressBar();
    }
    
    resumeAutoPlay() {
        if (this.isPlaying && !this.autoPlayInterval) {
            this.startAutoPlay();
        }
    }
    
    updateProgressBar() {
        const progressBar = this.container.querySelector('#progressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.style.transition = 'none';
            
            requestAnimationFrame(() => {
                progressBar.style.transition = `width ${this.autoPlayDuration}ms linear`;
                progressBar.style.width = '100%';
            });
        }
    }
    
    pauseProgressBar() {
        const progressBar = this.container.querySelector('#progressBar');
        if (progressBar) {
            const computedStyle = window.getComputedStyle(progressBar);
            const currentWidth = computedStyle.width;
            progressBar.style.width = currentWidth;
            progressBar.style.transition = 'none';
        }
    }
    
    switchLanguage() {
        this.currentLang = this.currentLang === 'th' ? 'en' : 'th';
        localStorage.setItem('bannerLanguage', this.currentLang);
        
        // Update the document language attribute
        document.documentElement.lang = this.currentLang;
        
        // Re-render with new language
        this.render();
        this.bindEvents();
        
        // Trigger custom event for other components
        document.dispatchEvent(new CustomEvent('bannerLanguageChanged', {
            detail: { language: this.currentLang }
        }));
    }
    
    handleButtonClick(buttonText) {
        console.log(`Button clicked: ${buttonText}`);
        
        // Show notification with current language
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <span>🎯</span>
                <span>${this.currentLang === 'th' ? 'คลิก:' : 'Clicked:'} ${buttonText}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
        
        // Handle specific button actions
        const thaiButtons = ['เริ่มต้นลงทุน', 'ดูราคาเงิน', 'รับข้อเสนอพิเศษ', 'ติดต่อผู้เชี่ยวชาญ'];
        const englishButtons = ['Start Investing', 'View Silver Prices', 'Get Special Offer', 'Contact Expert'];
        
        if (thaiButtons.includes(buttonText) || englishButtons.includes(buttonText)) {
            // Add your specific button logic here
            console.log(`Handling action for: ${buttonText}`);
        }
    }
    
    // Public methods
    play() {
        this.isPlaying = true;
        this.startAutoPlay();
    }
    
    pause() {
        this.isPlaying = false;
        this.pauseAutoPlay();
    }
    
    destroy() {
        this.pauseAutoPlay();
        
        // Remove all event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        
        if (this.container) {
            this.container.removeEventListener('mouseenter', this.mouseEnterHandler);
            this.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
            this.container.removeEventListener('touchstart', this.touchStartHandler);
            this.container.removeEventListener('touchend', this.touchEndHandler);
        }
        
        // Clear container completely
        this.cleanupContainer();
        
        // Reset global reference
        if (window.bannerSlideshow === this) {
            window.bannerSlideshow = null;
        }
        
        // Clear all properties
        this.container = null;
        this.translations = null;
        this.realData = null;
        
        console.log('Banner slideshow destroyed completely');
    }
}

// Auto-initialize if container exists (only if not already initialized)
document.addEventListener('DOMContentLoaded', () => {
    const bannerContainer = document.querySelector('.banner-slideshow');
    if (bannerContainer && !window.bannerSlideshow) {
        window.bannerSlideshow = new BannerSlideshow();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BannerSlideshow;
}