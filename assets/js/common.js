// ====== Common Utility Functions ======
class Utils {
    static formatNumber(num) {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    static smoothScrollTo(target) {
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static animateCounter(element, target, duration = 2000) {
        const originalText = element.textContent;
        let start = 0;
        const isPercentage = originalText.includes('%');
        const hasPlus = originalText.includes('+');
        const numericTarget = parseInt(target);
        
        const increment = numericTarget / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= numericTarget) {
                element.textContent = originalText;
                clearInterval(timer);
            } else {
                let displayValue = Math.floor(start);
                if (isPercentage) {
                    element.textContent = displayValue + '%';
                } else if (hasPlus) {
                    element.textContent = displayValue + '+';
                } else {
                    element.textContent = displayValue;
                }
            }
        }, 16);
    }

    static updateLastUpdated() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        };
        return now.toLocaleDateString('th-TH', options) + ' น.';
    }
}

// ====== Intersection Observer for Animations ======
class AnimationObserver {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, this.observerOptions);
    }

    observe(elements) {
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(element);
        });
    }

    observeStats(statsSection, targets = [2000, 100, 20]) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numbers = entry.target.querySelectorAll('.stat-number');
                    
                    numbers.forEach((num, index) => {
                        setTimeout(() => {
                            Utils.animateCounter(num, targets[index]);
                        }, index * 200);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }
}

// ====== Smooth Scrolling Handler ======
class SmoothScrollHandler {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                Utils.smoothScrollTo(target);
            });
        });
    }
}

// ====== Parallax Effects ======
class ParallaxEffects {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            this.updateShapes();
        });
    }

    updateShapes() {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.shape');
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    }
}

// ====== Global App Initialization ======
// Ensure GemApp namespace exists
window.GemApp = window.GemApp || {};

// Add utilities to GemApp namespace
window.GemApp.Utils = Utils;
window.GemApp.AnimationObserver = AnimationObserver;
window.GemApp.SmoothScrollHandler = SmoothScrollHandler;
window.GemApp.ParallaxEffects = ParallaxEffects;