/**
 * Modern Luxury Effects - Interactive JavaScript
 * PERFORMANCE OPTIMIZED VERSION
 *
 * Optimizations:
 * - RequestAnimationFrame for smooth animations
 * - Throttled mousemove events
 * - Scroll detection to pause effects
 * - Reduced motion support
 * - IntersectionObserver for viewport detection
 */

class ModernLuxuryEffects {
    constructor() {
        this.spotlightEnabled = true;
        this.tiltEnabled = false; // DISABLED by default - heavy effect
        this.counterEnabled = true;
        this.magneticEnabled = true;

        // Performance optimization flags
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.rafId = null;
        this.lastMoveTime = 0;
        this.THROTTLE_MS = 32; // ~30fps for mouse events

        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    /**
     * Initialize all effects
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEffects());
        } else {
            this.setupEffects();
        }
    }

    /**
     * Setup all effects
     */
    setupEffects() {
        // Skip all effects if user prefers reduced motion
        if (this.prefersReducedMotion) {
            console.log('ModernLuxuryEffects: Reduced motion enabled, effects disabled');
            return;
        }

        // Setup scroll detection for performance
        this.setupScrollDetection();

        this.setupSpotlightEffect();
        this.setup3DTiltEffect();
        this.setupCounterAnimation();
        this.setupMagneticButtons();
        this.setupShimmerOverlay();

        // Observe for dynamically added elements
        this.observeChanges();
    }

    /**
     * Detect scroll to pause heavy effects
     */
    setupScrollDetection() {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                // Add class to pause CSS animations during scroll
                document.body.classList.add('is-scrolling');
                this.isScrolling = true;

                // Clear previous timeout
                if (this.scrollTimeout) {
                    clearTimeout(this.scrollTimeout);
                }

                // Remove class after scroll ends
                this.scrollTimeout = setTimeout(() => {
                    document.body.classList.remove('is-scrolling');
                    this.isScrolling = false;
                    ticking = false;
                }, 150);

                ticking = true;
            }
        };

        // Use passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Spotlight Effect - Light follows cursor (OPTIMIZED)
     */
    setupSpotlightEffect() {
        if (!this.spotlightEnabled) return;

        const grid = document.getElementById('productsGrid2');
        if (!grid) return;

        // Add spotlight elements to cards
        const addSpotlight = (card) => {
            if (!card.querySelector('.spotlight')) {
                const spotlight = document.createElement('div');
                spotlight.className = 'spotlight';
                card.appendChild(spotlight);
            }
        };

        // Add spotlight to existing cards
        grid.querySelectorAll('.supporting-card, .hero-card').forEach(addSpotlight);

        // Throttled mouse tracking
        let pendingUpdate = null;

        grid.addEventListener('mousemove', (e) => {
            // Skip during scroll for better performance
            if (this.isScrolling) return;

            // Throttle updates
            const now = performance.now();
            if (now - this.lastMoveTime < this.THROTTLE_MS) return;
            this.lastMoveTime = now;

            // Cancel pending update
            if (pendingUpdate) {
                cancelAnimationFrame(pendingUpdate);
            }

            // Use RAF for smooth updates
            pendingUpdate = requestAnimationFrame(() => {
                const card = e.target.closest('.supporting-card, .hero-card');
                if (!card) return;

                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        }, { passive: true });
    }

    /**
     * 3D Tilt Effect - Card tilts based on mouse position (OPTIMIZED)
     * - Disabled by default for better performance
     * - Can be enabled via toggleEffect('tilt', true)
     */
    setup3DTiltEffect() {
        // DISABLED by default - this is one of the heaviest effects
        // Uncomment below to enable
        if (!this.tiltEnabled) return;

        const grid = document.getElementById('productsGrid2');
        if (!grid) return;

        const cards = grid.querySelectorAll('.supporting-card');
        let lastTiltTime = 0;

        cards.forEach(card => {
            let rafId = null;

            card.addEventListener('mousemove', (e) => {
                // Skip during scroll
                if (this.isScrolling) return;

                // Throttle to ~30fps for better performance
                const now = performance.now();
                if (now - lastTiltTime < 32) return;
                lastTiltTime = now;

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    // Reduced tilt intensity
                    const rotateX = (y - centerY) / 25;
                    const rotateY = (centerX - x) / 25;

                    card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = '';
            });
        });
    }

    /**
     * Counter Animation - Numbers count up smoothly
     */
    setupCounterAnimation() {
        if (!this.counterEnabled) return;

        // Find all price elements
        const prices = document.querySelectorAll('#productsGrid2 .supporting-price, #productsGrid2 .hero-price');

        prices.forEach(priceEl => {
            // Add counter class
            const value = this.parsePrice(priceEl.textContent);
            if (value > 0) {
                this.animateCounter(priceEl, value);
            }
        });
    }

    /**
     * Parse price string to number
     */
    parsePrice(text) {
        return parseInt(text.replace(/[^0-9]/g, '')) || 0;
    }

    /**
     * Animate counter from 0 to value
     */
    animateCounter(element, targetValue, duration = 1500) {
        const startTime = performance.now();
        const startValue = 0;
        const formatOriginal = element.innerHTML;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);

            // Format number with commas
            const formatted = currentValue.toLocaleString('th-TH');

            // Preserve original formatting
            if (formatOriginal.includes('<')) {
                // Has HTML (currency span)
                const currencyMatch = formatOriginal.match(/<span[^>]*>(.*?)<\/span>/);
                if (currencyMatch) {
                    element.innerHTML = `${formatted}<span class="currency">${currencyMatch[1]}</span>`;
                }
            } else {
                element.textContent = formatted;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.classList.add('counted');
                this.triggerCompletionEffect(element);
            }
        };

        element.classList.add('counter-number');
        requestAnimationFrame(updateCounter);
    }

    /**
     * Trigger completion effect on counter
     */
    triggerCompletionEffect(element) {
        element.classList.add('counting');
        setTimeout(() => {
            element.classList.remove('counting');
        }, 500);
    }

    /**
     * Magnetic Button Effect - Button pulls toward cursor (OPTIMIZED)
     */
    setupMagneticButtons() {
        if (!this.magneticEnabled) return;

        const buttons = document.querySelectorAll('#productsGrid2 .hero-btn');

        buttons.forEach(btn => {
            let rafId = null;

            btn.addEventListener('mousemove', (e) => {
                if (this.isScrolling) return;

                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    // Reduced magnetic strength
                    const strength = 0.2;

                    btn.style.transform = `translateY(-2px) translate(${x * strength}px, ${y * strength}px)`;
                });
            }, { passive: true });

            btn.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                btn.style.transform = '';
            });
        });
    }

    /**
     * Shimmer Overlay - Add shimmer div to cards
     */
    setupShimmerOverlay() {
        const grid = document.getElementById('productsGrid2');
        if (!grid) return;

        const cards = grid.querySelectorAll('.supporting-card, .hero-card');

        cards.forEach(card => {
            if (!card.querySelector('.shimmer-overlay')) {
                const shimmer = document.createElement('div');
                shimmer.className = 'shimmer-overlay';
                card.appendChild(shimmer);
            }
        });
    }

    /**
     * Observe for dynamically added elements
     */
    observeChanges() {
        const grid = document.getElementById('productsGrid2');
        if (!grid) return;

        // Use MutationObserver to watch for new cards
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Check if it's a card or contains cards
                            if (node.classList?.contains('supporting-card') ||
                                node.classList?.contains('hero-card')) {
                                this.setupCardEffects(node);
                            }

                            // Check for cards inside the added node
                            const cards = node.querySelectorAll?.('.supporting-card, .hero-card');
                            cards?.forEach(card => this.setupCardEffects(card));
                        }
                    });
                }
            });
        });

        observer.observe(grid, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Setup effects for a single card (OPTIMIZED)
     */
    setupCardEffects(card) {
        // Skip if reduced motion
        if (this.prefersReducedMotion) return;

        // Add spotlight
        if (this.spotlightEnabled && !card.querySelector('.spotlight')) {
            const spotlight = document.createElement('div');
            spotlight.className = 'spotlight';
            card.appendChild(spotlight);
        }

        // Add shimmer
        if (!card.querySelector('.shimmer-overlay')) {
            const shimmer = document.createElement('div');
            shimmer.className = 'shimmer-overlay';
            card.appendChild(shimmer);
        }

        // 3D tilt is disabled by default for performance
        // Enable with: modernLuxuryEffects.toggleEffect('tilt', true)
    }

    /**
     * Trigger celebration effect (confetti) - OPTIMIZED
     * Reduced particle count for better performance
     */
    triggerCelebration() {
        // Skip if reduced motion preferred
        if (this.prefersReducedMotion) return;

        // Create celebration overlay
        let overlay = document.querySelector('.celebration-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'celebration-overlay';
            document.body.appendChild(overlay);
        }

        // Reduced confetti count (was 100)
        const colors = ['#ffd700', '#d4af37', '#045b96', '#4caf50'];
        const confettiCount = 30;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';

                confetti.style.cssText = `
                    left: ${Math.random() * 100}%;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    animation-duration: ${Math.random() * 1.5 + 2}s;
                `;

                overlay.appendChild(confetti);
                confetti.classList.add('falling');

                // Remove after animation
                setTimeout(() => confetti.remove(), 3500);
            }, i * 50);
        }

        // Add pulse effect to affordable cards
        const affordableCards = document.querySelectorAll('#productsGrid2 .supporting-card.affordable');
        affordableCards.forEach(card => {
            card.classList.add('celebration-pulse');
            setTimeout(() => card.classList.remove('celebration-pulse'), 1000);
        });

        // Clean up overlay
        setTimeout(() => {
            if (overlay && overlay.children.length === 0) {
                overlay.remove();
            }
        }, 4000);
    }

    /**
     * Animate all price counters
     */
    refreshCounters() {
        this.setupCounterAnimation();
    }

    /**
     * Enable/disable effects
     */
    toggleEffect(effectName, enabled) {
        switch (effectName) {
            case 'spotlight':
                this.spotlightEnabled = enabled;
                break;
            case 'tilt':
                this.tiltEnabled = enabled;
                if (enabled) this.setup3DTiltEffect();
                break;
            case 'counter':
                this.counterEnabled = enabled;
                break;
            case 'magnetic':
                this.magneticEnabled = enabled;
                break;
        }
    }

    /**
     * Performance Mode - Disable all heavy effects
     */
    setPerformanceMode(enabled) {
        if (enabled) {
            // Disable all effects
            this.spotlightEnabled = false;
            this.tiltEnabled = false;
            this.magneticEnabled = false;
            document.body.classList.add('performance-mode');
            console.log('ModernLuxuryEffects: Performance mode enabled');
        } else {
            // Re-enable light effects only
            this.spotlightEnabled = true;
            this.magneticEnabled = true;
            document.body.classList.remove('performance-mode');
            console.log('ModernLuxuryEffects: Performance mode disabled');
        }
    }

    /**
     * Check if device likely needs performance mode
     */
    static shouldUsePerformanceMode() {
        // Check for low-end device indicators
        const isLowEnd =
            navigator.hardwareConcurrency <= 2 ||
            navigator.deviceMemory <= 2 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        return isLowEnd;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernLuxuryEffects;
}
