/**
 * Modern Luxury Effects - Interactive JavaScript
 * PERFORMANCE OPTIMIZED VERSION v2
 *
 * Optimizations:
 * - Single RAF loop for all effects
 * - Increased throttle for better performance
 * - Scroll-aware effect pausing
 * - Low-end device detection
 * - Removed duplicate mouse tracking (using MouseGlowEffect instead)
 */

class ModernLuxuryEffects {
    constructor() {
        // DISABLED - Now handled by consolidated MouseGlowEffect in gold-saving-visuals.js
        this.spotlightEnabled = false;
        this.tiltEnabled = false; // DISABLED - too heavy
        this.counterEnabled = true;
        this.magneticEnabled = false; // DISABLED by default - heavy effect

        // Performance optimization flags
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.rafId = null;
        this.lastMoveTime = 0;
        this.THROTTLE_MS = 50; // Increased to ~20fps for better performance

        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Check for low-end device
        this.isLowEnd = this.detectLowEndDevice();

        this.init();
    }

    detectLowEndDevice() {
        return navigator.hardwareConcurrency <= 2 ||
               (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

        // Skip heavy effects on low-end devices
        if (this.isLowEnd) {
            console.log('ModernLuxuryEffects: Low-end device detected, using minimal effects');
            this.spotlightEnabled = false;
            this.magneticEnabled = false;
        }

        // Setup scroll detection for performance
        this.setupScrollDetection();

        // Spotlight DISABLED - Now handled by MouseGlowEffect in gold-saving-visuals.js
        // if (this.spotlightEnabled) {
        //     this.setupSpotlightEffect();
        // }

        // Counter animation is lightweight
        this.setupCounterAnimation();

        // Magnetic buttons disabled by default
        if (this.magneticEnabled) {
            this.setupMagneticButtons();
        }

        // Shimmer overlay DISABLED - continuous CSS animation hurts performance
        // this.setupShimmerOverlay();

        // MutationObserver DISABLED - no card effects to setup anymore
        // this.observeChanges();
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

        // Find all price elements in products grid
        const prices = document.querySelectorAll('#productsGrid2 .supporting-price, #productsGrid2 .hero-price');
        prices.forEach(priceEl => {
            const value = this.parsePrice(priceEl.textContent);
            if (value > 0) {
                this.animateCounter(priceEl, value);
            }
        });

        // Total Amount counter
        const totalAmountEl = document.getElementById('totalAmount2');
        if (totalAmountEl) {
            const totalValue = this.parsePrice(totalAmountEl.textContent);
            if (totalValue > 0) {
                this.animateCounter(totalAmountEl, totalValue);
            }
        }

        // Gold Weight counter
        const goldWeightEl = document.getElementById('goldWeight2');
        if (goldWeightEl) {
            const weightValue = parseFloat(goldWeightEl.textContent) || 0;
            if (weightValue > 0) {
                this.animateCounter(goldWeightEl, weightValue, true); // isDecimal = true
            }
        }

        // Current Value counter
        const currentValueEl = document.getElementById('currentValue2');
        if (currentValueEl) {
            const currentValue = this.parsePrice(currentValueEl.textContent);
            if (currentValue > 0) {
                this.animateCounter(currentValueEl, currentValue);
            }
        }

        // Profit Amount counter
        const profitAmountEl = document.querySelector('#profitResult2 .profit-amount');
        if (profitAmountEl) {
            const profitText = profitAmountEl.textContent.trim();
            const profitValue = this.parsePrice(profitText);
            if (profitValue !== 0) {
                this.animateCounter(profitAmountEl, profitValue);
            }
        }

        // Profit Percent counter
        const profitPercentEl = document.querySelector('#profitResult2 .profit-percent');
        if (profitPercentEl) {
            const percentText = profitPercentEl.textContent.trim();
            const percentValue = this.parsePercent(percentText);
            if (percentValue !== 0) {
                this.animatePercentCounter(profitPercentEl, percentValue);
            }
        }
    }

    /**
     * Parse price string to number
     * Handles formats like: "+123,456 บาท", "-123,456 บาท", "123,456"
     */
    parsePrice(text) {
        if (!text) return 0;
        const cleaned = text.replace(/,/g, '').replace(/[^\-0-9]/g, '');
        const value = parseInt(cleaned) || 0;

        // Check if original text had negative sign
        const isNegative = text.trim().startsWith('-');
        return isNegative ? -Math.abs(value) : value;
    }

    /**
     * Parse percent string to number
     * Handles formats like: "+7.78%", "-7.78%", "7.78%"
     */
    parsePercent(text) {
        if (!text) return 0;
        const cleaned = text.replace(/,/g, '').replace(/[^\-0-9.]/g, '');
        const value = parseFloat(cleaned) || 0;

        // Check if original text had negative sign
        const isNegative = text.trim().startsWith('-');
        return isNegative ? -Math.abs(value) : value;
    }

    /**
     * Animate counter from 0 to value
     * @param {HTMLElement} element - Target element
     * @param {number} targetValue - Target value to animate to
     * @param {boolean|number} isDecimal - Whether to show decimals (or number of decimal places)
     * @param {number} duration - Animation duration in ms
     */
    animateCounter(element, targetValue, isDecimal = false, duration = 1500) {
        const startTime = performance.now();
        const startValue = 0;
        const formatOriginal = element.innerHTML;

        // Handle negative values for profit/loss
        const isNegative = targetValue < 0;
        const absTargetValue = Math.abs(targetValue);

        // Determine decimal places
        const decimalPlaces = typeof isDecimal === 'number' ? isDecimal : (isDecimal ? 2 : 0);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentValue = startValue + (absTargetValue - startValue) * easeOut;

            // Format number with commas and decimals
            let formatted;
            if (decimalPlaces > 0) {
                // Use toLocaleString for both integer and decimal parts to get commas
                const parts = currentValue.toFixed(decimalPlaces).split('.');
                parts[0] = parseInt(parts[0]).toLocaleString('th-TH');
                formatted = parts.join('.');
            } else {
                formatted = Math.floor(currentValue).toLocaleString('th-TH');
            }

            // Add negative sign if needed
            if (isNegative) {
                formatted = '-' + formatted;
            }

            // Preserve original formatting (currency suffix like "บาท")
            if (formatOriginal.includes('<')) {
                // Has HTML (currency span)
                const currencyMatch = formatOriginal.match(/<span[^>]*>(.*?)<\/span>/);
                if (currencyMatch) {
                    element.innerHTML = `${formatted}<span class="currency">${currencyMatch[1]}</span>`;
                }
            } else if (formatOriginal.trim().match(/\s+[\u0E01-\u0E5B\s]+$/)) {
                // Check if original text ends with Thai text (like " บาท")
                const suffixMatch = formatOriginal.trim().match(/(\s+[\u0E01-\u0E5B\s]+)$/);
                if (suffixMatch) {
                    element.textContent = formatted + suffixMatch[1];
                } else {
                    element.textContent = formatted;
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
     * Animate percent counter from 0 to value
     * @param {HTMLElement} element - Target element
     * @param {number} targetValue - Target value to animate to (e.g., 7.78)
     * @param {number} duration - Animation duration in ms
     */
    animatePercentCounter(element, targetValue, duration = 1500) {
        const startTime = performance.now();
        const startValue = 0;

        // Handle negative values for profit/loss
        const isNegative = targetValue < 0;
        const absTargetValue = Math.abs(targetValue);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentValue = startValue + (absTargetValue - startValue) * easeOut;

            // Format with sign and % symbol
            const sign = isNegative ? '' : '+';
            const formatted = `${sign}${currentValue.toFixed(2)}%`;

            element.textContent = formatted;

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
     * NOTE: Spotlight and Shimmer are DISABLED for performance
     * Mouse glow is now handled by consolidated MouseGlowEffect
     */
    setupCardEffects(card) {
        // All card effects disabled for performance optimization
        // - Spotlight: handled by MouseGlowEffect in gold-saving-visuals.js
        // - Shimmer: disabled (continuous CSS animation)
        // - 3D tilt: disabled by default
        return;
    }

    /**
     * Trigger celebration effect - OPTIMIZED v2
     * Uses ConfettiEffect from gold-saving-visuals.js
     */
    triggerCelebration() {
        // Skip if reduced motion preferred or low-end device
        if (this.prefersReducedMotion || this.isLowEnd) return;

        // Use centralized ConfettiEffect instead of creating own confetti
        if (window.ConfettiEffect) {
            window.ConfettiEffect.trigger({
                count: 40, // Reduced count
                duration: 3000
            });
        }

        // Add pulse effect to affordable cards (lightweight CSS animation)
        const affordableCards = document.querySelectorAll('#productsGrid2 .supporting-card.affordable');
        affordableCards.forEach(card => {
            card.classList.add('celebration-pulse');
            setTimeout(() => card.classList.remove('celebration-pulse'), 1000);
        });
    }

    /**
     * Setup Variant Modal Effects - Add animations to variant selection items
     */
    setupVariantModalEffects() {
        if (this.prefersReducedMotion) return;

        const modal = document.getElementById('variantModal');
        if (!modal) return;

        const variantItems = modal.querySelectorAll('.variant-item');
        if (variantItems.length === 0) return;

        variantItems.forEach((item, index) => {
            // Add entrance animation with staggered delay
            item.style.animationDelay = `${index * 0.08}s`;
            item.classList.add('variant-item-animate');

            // Add spotlight element
            if (this.spotlightEnabled && !item.querySelector('.variant-spotlight')) {
                const spotlight = document.createElement('div');
                spotlight.className = 'variant-spotlight';
                item.appendChild(spotlight);
            }

            // Add shimmer overlay
            if (!item.querySelector('.variant-shimmer')) {
                const shimmer = document.createElement('div');
                shimmer.className = 'variant-shimmer';
                item.appendChild(shimmer);
            }

            // Add ripple element for click feedback
            if (!item.querySelector('.variant-ripple')) {
                const ripple = document.createElement('div');
                ripple.className = 'variant-ripple';
                item.appendChild(ripple);
            }
        });

        // Setup spotlight effect for variant items
        this.setupVariantSpotlight(variantItems);

        // Setup hover effects
        this.setupVariantHoverEffects(variantItems);

        // Setup selection animation
        this.setupVariantSelectionAnimation(variantItems);
    }

    /**
     * Setup spotlight effect for variant items
     */
    setupVariantSpotlight(items) {
        if (!this.spotlightEnabled) return;

        items.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                if (this.isScrolling) return;

                const now = performance.now();
                if (now - this.lastMoveTime < this.THROTTLE_MS) return;
                this.lastMoveTime = now;

                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                item.style.setProperty('--variant-mouse-x', `${x}px`);
                item.style.setProperty('--variant-mouse-y', `${y}px`);
            }, { passive: true });
        });
    }

    /**
     * Setup hover effects for variant items
     */
    setupVariantHoverEffects(items) {
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (this.isScrolling) return;
                item.classList.add('variant-hover');
            });

            item.addEventListener('mouseleave', () => {
                item.classList.remove('variant-hover');
            });
        });
    }

    /**
     * Setup selection animation for variant items
     */
    setupVariantSelectionAnimation(items) {
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                // Skip if in locked mode or clicking preview button
                if (item.closest('.variant-modal.locked')) return;
                if (e.target.closest('.js-img-preview')) return;

                // Remove selected class from all items
                items.forEach(i => i.classList.remove('variant-selected'));

                // Add selected class to clicked item
                item.classList.add('variant-selected');

                // Create ripple effect
                this.createRippleEffect(item, e);
            });
        });
    }

    /**
     * Create ripple effect on click
     */
    createRippleEffect(element, event) {
        const ripple = element.querySelector('.variant-ripple');
        if (!ripple) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        ripple.style.cssText = `
            left: ${x}px;
            top: ${y}px;
        `;

        ripple.classList.remove('ripple-animate');
        void ripple.offsetWidth; // Trigger reflow
        ripple.classList.add('ripple-animate');
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
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernLuxuryEffects;
}
