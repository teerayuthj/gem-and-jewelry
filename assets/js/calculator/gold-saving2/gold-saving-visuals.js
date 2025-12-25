/**
 * Gold Saving Calculator 2 - Visual Effects Module
 * Particles, Confetti, Animated Counter, Progress Rings
 *
 * OPTIMIZED VERSION:
 * - Reduced particle count for better performance
 * - Consolidated mouse tracking with single RAF
 * - Passive event listeners
 * - CSS containment for better rendering
 */

// ============================================================================
// PARTICLES BACKGROUND (OPTIMIZED)
// ============================================================================

window.ParticlesBackground = {
    container: null,
    particles: [],
    animationId: null,
    isEnabled: true,
    lastOptions: null,

    /**
     * Initialize particles background
     * @param {Object} options - Configuration options
     */
    init(options = {}) {
        const defaults = {
            count: 15, // Reduced from 30 for better performance
            minSize: 4,
            maxSize: 10, // Reduced from 12
            minDuration: 20, // Increased for smoother animation
            maxDuration: 40
        };

        const settings = { ...defaults, ...options };
        const { count, minSize, maxSize, minDuration, maxDuration } = settings;
        this.lastOptions = settings;

        if (!this.isEnabled) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            return;
        }

        // Don't initialize on mobile or low-end devices
        if (window.innerWidth < 768 || navigator.hardwareConcurrency <= 2) {
            this.isEnabled = false;
            return;
        }

        // Find or create container
        const wrapper = document.querySelector('.gold-saving2-wrapper');
        if (!wrapper) return;

        let container = wrapper.querySelector('.particles-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'particles-container';
            // Add CSS containment for better performance
            container.style.contain = 'strict';
            wrapper.appendChild(container);
        }
        this.container = container;

        // Use DocumentFragment for batch DOM insertion
        const fragment = document.createDocumentFragment();
        this.particles = [];

        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(minSize, maxSize, minDuration, maxDuration);
            fragment.appendChild(particle);
            this.particles.push(particle);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    },

    /**
     * Create a single particle element
     */
    createParticle(minSize, maxSize, minDuration, maxDuration) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size
        const size = Math.random() * (maxSize - minSize) + minSize;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;

        // Random animation duration
        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        particle.style.animationDuration = `${duration}s`;

        // Random animation delay
        const delay = Math.random() * duration;
        particle.style.animationDelay = `${-delay}s`; // Negative to start immediately

        // Random opacity
        particle.style.opacity = Math.random() * 0.4 + 0.1;

        // Some particles are gold sparkles
        if (Math.random() < 0.15) {
            particle.classList.add('gold-sparkle');
            particle.style.width = `${size * 0.6}px`;
            particle.style.height = `${size * 0.6}px`;
        }

        return particle;
    },

    /**
     * Enable or disable particles
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.destroy();
            return;
        }
        this.init(this.lastOptions || {});
    },

    /**
     * Pause particles animation (when tab is hidden)
     */
    pause() {
        if (this.container) {
            this.container.style.animationPlayState = 'paused';
            this.particles.forEach(p => {
                p.style.animationPlayState = 'paused';
            });
        }
    },

    /**
     * Resume particles animation (when tab is visible)
     */
    resume() {
        if (this.container) {
            this.container.style.animationPlayState = 'running';
            this.particles.forEach(p => {
                p.style.animationPlayState = 'running';
            });
        }
    },

    /**
     * Stop and remove particles
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.particles = [];
        this.isEnabled = false;
    }
};

// ============================================================================
// CONFETTI EFFECT
// ============================================================================

window.ConfettiEffect = {
    container: null,
    confetti: [],
    isRunning: false,

    /**
     * Trigger confetti celebration (OPTIMIZED)
     * @param {Object} options - Configuration options
     */
    trigger(options = {}) {
        // Prevent multiple simultaneous confetti bursts
        if (this.isRunning) return;

        const {
            count = 60, // Reduced from 150
            duration = 3500,
            origin = 'top'
        } = options;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        this.isRunning = true;

        // Find or create container
        let container = document.querySelector('.confetti-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'confetti-container';
            container.style.contain = 'strict';
            document.body.appendChild(container);
        }
        this.container = container;
        container.innerHTML = '';

        // Use DocumentFragment for batch insertion
        const fragment = document.createDocumentFragment();
        this.confetti = [];

        for (let i = 0; i < count; i++) {
            const confetti = this.createConfetti(origin);
            fragment.appendChild(confetti);
            this.confetti.push(confetti);
        }

        container.appendChild(fragment);

        // Clean up after duration
        setTimeout(() => {
            container.innerHTML = '';
            this.confetti = [];
            this.isRunning = false;
        }, duration);
    },

    /**
     * Create a single confetti piece
     */
    createConfetti(origin) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';

        // Random shape
        const shapes = ['square', 'rectangle', 'circle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.classList.add(shape);

        // Random color
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
        confetti.classList.add(colors[Math.floor(Math.random() * colors.length)]);

        // Random starting position
        if (origin === 'top') {
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-20px';
        } else {
            // Center burst
            confetti.style.left = '50%';
            confetti.style.top = '50%';
        }

        // Random animation properties
        const duration = Math.random() * 2 + 2; // 2-4 seconds
        const delay = Math.random() * 0.5;
        const drift = (Math.random() - 0.5) * 200; // -100 to 100px drift

        confetti.style.animationDuration = `${duration}s`;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.setProperty('--drift', `${drift}px`);

        if (origin === 'center') {
            // Spread animation for center burst
            const angle = Math.random() * 360;
            const distance = Math.random() * 300 + 100;
            const endX = Math.cos(angle * Math.PI / 180) * distance;
            const endY = Math.sin(angle * Math.PI / 180) * distance;
            confetti.style.setProperty('--start-x', '0');
            confetti.style.setProperty('--start-y', '0');
            confetti.style.setProperty('--end-x', `${endX}px`);
            confetti.style.setProperty('--end-y', `${endY}px`);
            confetti.style.animationName = 'confettiSpread';
        } else {
            confetti.style.animationName = 'confettiFall';
        }

        return confetti;
    }
};

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

window.AnimatedCounter = {
    /**
     * Animate a number from 0 to target value
     * @param {HTMLElement} element - Target element
     * @param {number} targetValue - Target value
     * @param {Object} options - Options
     * @param {number} options.duration - Animation duration in ms (default: 1500)
     * @param {string} options.prefix - Prefix text (optional)
     * @param {string} options.suffix - Suffix text (optional)
     * @param {Function} options.format - Format function (default: formatNumber)
     */
    animate(element, targetValue, options = {}) {
        const {
            duration = 1500,
            prefix = '',
            suffix = '',
            format = (num) => num.toLocaleString('th-TH')
        } = options;

        if (!element) return;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.textContent = prefix + format(targetValue) + suffix;
            return;
        }

        // Get current value from text content
        const currentValue = this.parseNumber(element.textContent) || 0;
        const startValue = currentValue;

        // Add animation class
        element.classList.add('animated-counter', 'counting');

        // Animation start time
        const startTime = performance.now();

        // Animation frame callback
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease out cubic)
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Calculate current value
            const currentValue = startValue + (targetValue - startValue) * easedProgress;

            // Update text content (let format function handle rounding for decimal support)
            element.textContent = prefix + format(currentValue) + suffix;

            // Continue animation or finish
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.classList.remove('counting');
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * Parse number from text content
     */
    parseNumber(text) {
        // Remove commas, spaces, and other non-numeric characters (except minus and decimal)
        const cleaned = text.replace(/[^\d.-]/g, '');
        return cleaned ? parseFloat(cleaned) : 0;
    },

    /**
     * Animate multiple counters
     * @param {Array} counters - Array of { element, targetValue, options }
     */
    animateMultiple(counters) {
        counters.forEach((counter, index) => {
            setTimeout(() => {
                this.animate(counter.element, counter.targetValue, counter.options);
            }, index * 100); // Stagger animations
        });
    }
};

// ============================================================================
// PROGRESS RING
// ============================================================================

window.ProgressRing = {
    /**
     * Create a progress ring element
     * @param {Object} options - Configuration options
     * @param {number} options.size - Ring size in pixels (default: 120)
     * @param {number} options.strokeWidth - Stroke width (default: 8)
     * @param {number} options.progress - Progress percentage (0-100)
     * @param {string} options.color - Color type ('default', 'profit', 'loss')
     * @param {number} options.value - Value to display in center
     * @param {string} options.unit - Unit to display after value
     * @returns {HTMLElement} Progress ring container
     */
    create(options = {}) {
        const {
            size = 120,
            strokeWidth = 8,
            progress = 0,
            color = 'default',
            value = null,
            unit = '%'
        } = options;

        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        // Create container
        const container = document.createElement('div');
        container.className = 'progress-ring-container';
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('class', 'progress-ring');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        // Create definitions for gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        // Progress gradient
        const progressGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        progressGradient.setAttribute('id', 'progressGradient');
        progressGradient.setAttribute('x1', '0%');
        progressGradient.setAttribute('y1', '0%');
        progressGradient.setAttribute('x2', '100%');
        progressGradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#045b96');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#002e65');

        progressGradient.appendChild(stop1);
        progressGradient.appendChild(stop2);

        // Profit gradient
        const profitGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        profitGradient.setAttribute('id', 'profitGradient');
        profitGradient.setAttribute('x1', '0%');
        profitGradient.setAttribute('y1', '0%');
        profitGradient.setAttribute('x2', '100%');
        profitGradient.setAttribute('y2', '100%');

        const pStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pStop1.setAttribute('offset', '0%');
        pStop1.setAttribute('stop-color', '#4caf50');

        const pStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pStop2.setAttribute('offset', '100%');
        pStop2.setAttribute('stop-color', '#81c784');

        profitGradient.appendChild(pStop1);
        profitGradient.appendChild(pStop2);

        // Loss gradient
        const lossGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        lossGradient.setAttribute('id', 'lossGradient');
        lossGradient.setAttribute('x1', '0%');
        lossGradient.setAttribute('y1', '0%');
        lossGradient.setAttribute('x2', '100%');
        lossGradient.setAttribute('y2', '100%');

        const lStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        lStop1.setAttribute('offset', '0%');
        lStop1.setAttribute('stop-color', '#f44336');

        const lStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        lStop2.setAttribute('offset', '100%');
        lStop2.setAttribute('stop-color', '#ef5350');

        lossGradient.appendChild(lStop1);
        lossGradient.appendChild(lStop2);

        defs.appendChild(progressGradient);
        defs.appendChild(profitGradient);
        defs.appendChild(lossGradient);
        svg.appendChild(defs);

        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', size / 2);
        bgCircle.setAttribute('cy', size / 2);
        bgCircle.setAttribute('r', radius);
        bgCircle.setAttribute('class', 'progress-ring-circle-bg');

        // Progress circle
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', size / 2);
        progressCircle.setAttribute('cy', size / 2);
        progressCircle.setAttribute('r', radius);
        progressCircle.setAttribute('class', `progress-ring-circle ${color}`);
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference; // Start from 0

        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);

        // Center value
        if (value !== null || progress >= 0) {
            const valueDiv = document.createElement('div');
            valueDiv.className = 'progress-ring-value';
            valueDiv.textContent = (value !== null ? value : progress) + unit;
            container.appendChild(valueDiv);
        }

        container.appendChild(svg);

        // Animate progress after a small delay
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 50);

        return container;
    },

    /**
     * Update existing progress ring
     * @param {HTMLElement} container - Progress ring container
     * @param {number} progress - New progress percentage (0-100)
     * @param {string} value - New value to display (optional)
     * @param {string} unit - Unit to display (default: '%')
     */
    update(container, progress, value = null, unit = '%') {
        const svg = container.querySelector('.progress-ring');
        if (!svg) return;

        const size = parseFloat(svg.getAttribute('width'));
        const circle = container.querySelector('.progress-ring-circle');
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (progress / 100) * circumference;

        circle.style.strokeDashoffset = offset;

        // Update center value if present
        const valueEl = container.querySelector('.progress-ring-value');
        if (valueEl) {
            valueEl.textContent = (value !== null ? value : progress) + unit;
        }
    }
};

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

window.ToastNotifications = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = container;
    },

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'info'
     * @param {number} duration - Duration in ms (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.container) {
            this.init();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icon based on type
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// ============================================================================
// RIPPLE EFFECT
// ============================================================================

window.RippleEffect = {
    /**
     * Initialize ripple effect on buttons
     * @param {string} selector - Button selector (default: '.hero-btn, .quick-btn, .lead-btn')
     */
    init(selector = '.hero-btn, .quick-btn, .lead-btn') {
        document.addEventListener('click', (e) => {
            const button = e.target.closest(selector);
            if (!button) return;

            // Create ripple
            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            // Get button position
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            // Set ripple size and position
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            // Add ripple to button
            button.appendChild(ripple);

            // Remove ripple after animation
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    }
};

// ============================================================================
// MOUSE TRACKING FOR GLOW EFFECTS (OPTIMIZED)
// ============================================================================

window.MouseGlowEffect = {
    isEnabled: true,
    // Consolidated selector: includes both calculator cards AND product cards
    selector: '.liquid-glass-card, .lg-profit-card, #productsGrid2 .supporting-card, #productsGrid2 .hero-card',
    rafId: null,
    lastX: 0,
    lastY: 0,
    currentCard: null,
    handler: null,
    THROTTLE_MS: 80, // Increased throttle to ~12fps for better performance

    init(selector) {
        // Use provided selector or default consolidated selector
        if (!selector) {
            selector = '.liquid-glass-card, .lg-profit-card, #productsGrid2 .supporting-card, #productsGrid2 .hero-card';
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            return;
        }

        // Skip on low-end devices
        if (navigator.hardwareConcurrency <= 2) {
            this.isEnabled = false;
            return;
        }

        this.selector = selector;
        this.isEnabled = true;

        if (this.handler) return;

        let lastTime = 0;

        this.handler = (e) => {
            if (!this.isEnabled) return;

            // Throttle updates
            const now = performance.now();
            if (now - lastTime < this.THROTTLE_MS) return;
            lastTime = now;

            const target = e.target;
            if (!(target instanceof Element)) return;

            const card = target.closest(this.selector);

            // Clear previous card if mouse moved to different card
            if (this.currentCard && this.currentCard !== card) {
                this.currentCard.style.removeProperty('--mouse-x');
                this.currentCard.style.removeProperty('--mouse-y');
            }

            if (!card) {
                this.currentCard = null;
                return;
            }

            this.currentCard = card;
            this.lastX = e.clientX;
            this.lastY = e.clientY;

            if (this.rafId) return;

            this.rafId = requestAnimationFrame(() => {
                this.rafId = null;
                if (!this.currentCard) return;

                const rect = this.currentCard.getBoundingClientRect();
                const x = this.lastX - rect.left;
                const y = this.lastY - rect.top;

                if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
                    this.currentCard.style.setProperty('--mouse-x', `${x}px`);
                    this.currentCard.style.setProperty('--mouse-y', `${y}px`);
                }
            });
        };

        document.addEventListener('pointermove', this.handler, { passive: true });
    },

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.destroy();
            return;
        }
        this.init(this.selector);
    },

    destroy() {
        if (this.handler) {
            document.removeEventListener('pointermove', this.handler);
        }
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (this.currentCard) {
            this.currentCard.style.removeProperty('--mouse-x');
            this.currentCard.style.removeProperty('--mouse-y');
        }
        this.handler = null;
        this.rafId = null;
        this.currentCard = null;
    }
};

// ============================================================================
// MILESTONE TRACKING
// ============================================================================

window.MilestoneTracker = {
    milestones: {
        firstPurchase: { threshold: 1, name: 'การซื้อครั้งแรก', icon: 'fa-star' },
        oneBaht: { threshold: 1, name: '1 บาททอง', icon: 'fa-coins' },
        fiveBaht: { threshold: 5, name: '5 บาททอง', icon: 'fa-gem' },
        tenBaht: { threshold: 10, name: '10 บาททอง', icon: 'fa-trophy' },
        firstHundredThousand: { threshold: 100000, name: 'ออมเกิน 1 แสน', icon: 'fa-piggy-bank' },
        firstMillion: { threshold: 1000000, name: 'ออมเกิน 1 ล้าน', icon: 'fa-sack-dollar' }
    },

    achievedMilestones: new Set(),
    storageKey: 'goldSaving_achievedMilestones',
    isInitialized: false,
    notificationQueue: [],
    isProcessingQueue: false,

    /**
     * Initialize milestone tracker from localStorage
     */
    init() {
        if (this.isInitialized) return;

        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                data.forEach(id => this.achievedMilestones.add(id));
            }
        } catch (e) {
            console.warn('Failed to load milestones from storage:', e);
        }
        this.isInitialized = true;
    },

    /**
     * Save achieved milestones to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([...this.achievedMilestones]));
        } catch (e) {
            console.warn('Failed to save milestones to storage:', e);
        }
    },

    /**
     * Check and trigger milestones
     * @param {number} goldBaht - Gold weight in baht
     * @param {number} totalAmount - Total amount saved
     * @param {boolean} skipNotification - Skip notifications (for initial load)
     */
    check(goldBaht, totalAmount, skipNotification = false) {
        // Initialize on first check
        if (!this.isInitialized) {
            this.init();
        }

        const newMilestones = [];

        // Check gold milestones
        if (goldBaht >= 1 && !this.achievedMilestones.has('oneBaht')) {
            this.achievedMilestones.add('oneBaht');
            newMilestones.push({ ...this.milestones.oneBaht, id: 'oneBaht' });
        }

        if (goldBaht >= 5 && !this.achievedMilestones.has('fiveBaht')) {
            this.achievedMilestones.add('fiveBaht');
            newMilestones.push({ ...this.milestones.fiveBaht, id: 'fiveBaht' });
        }

        if (goldBaht >= 10 && !this.achievedMilestones.has('tenBaht')) {
            this.achievedMilestones.add('tenBaht');
            newMilestones.push({ ...this.milestones.tenBaht, id: 'tenBaht' });
        }

        // Check amount milestones
        if (totalAmount >= 100000 && !this.achievedMilestones.has('firstHundredThousand')) {
            this.achievedMilestones.add('firstHundredThousand');
            newMilestones.push({ ...this.milestones.firstHundredThousand, id: 'firstHundredThousand' });
        }

        if (totalAmount >= 1000000 && !this.achievedMilestones.has('firstMillion')) {
            this.achievedMilestones.add('firstMillion');
            newMilestones.push({ ...this.milestones.firstMillion, id: 'firstMillion' });
        }

        // Save new milestones to storage
        if (newMilestones.length > 0) {
            this.save();
        }

        // Trigger celebrations for new milestones (skip if on page load)
        if (!skipNotification && newMilestones.length > 0) {
            newMilestones.forEach(milestone => {
                this.notificationQueue.push(milestone);
            });
            this.processNotificationQueue();
        }

        return newMilestones;
    },

    /**
     * Process notification queue with staggered timing
     */
    processNotificationQueue() {
        if (this.isProcessingQueue || this.notificationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        const showNext = () => {
            if (this.notificationQueue.length === 0) {
                this.isProcessingQueue = false;
                return;
            }

            const milestone = this.notificationQueue.shift();
            this.celebrate(milestone);

            // Show next notification after a delay
            setTimeout(showNext, 2500);
        };

        showNext();
    },

    /**
     * Celebrate a milestone achievement with beautiful notification
     */
    celebrate(milestone) {
        // Show beautiful milestone notification
        MilestoneToast.show(milestone);

        // Trigger confetti
        ConfettiEffect.trigger({ count: 80, origin: 'top' });
    },

    /**
     * Reset milestones (for testing)
     */
    reset() {
        this.achievedMilestones.clear();
        this.save();
    }
};

// ============================================================================
// MILESTONE TOAST NOTIFICATION
// ============================================================================

window.MilestoneToast = {
    container: null,

    /**
     * Initialize milestone toast container
     */
    init() {
        let container = document.querySelector('.milestone-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'milestone-toast-container';
            document.body.appendChild(container);
        }
        this.container = container;
    },

    /**
     * Show milestone toast notification
     * @param {Object} milestone - Milestone object with name, icon, emoji
     */
    show(milestone) {
        if (!this.container) {
            this.init();
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'milestone-toast';

        toast.innerHTML = `
            <div class="milestone-toast-icon"><i class="fas ${milestone.icon}"></i></div>
            <div class="milestone-toast-content">
                <div class="milestone-toast-title">ยินดีด้วย!</div>
                <div class="milestone-toast-message">คุณถึงเป้าหมาย "${milestone.name}" แล้ว</div>
            </div>
            <div class="milestone-toast-close">
                <i class="fas fa-times"></i>
            </div>
            <div class="milestone-toast-progress"></div>
        `;

        // Add close button functionality
        const closeBtn = toast.querySelector('.milestone-toast-close');
        closeBtn.addEventListener('click', () => {
            this.dismiss(toast);
        });

        this.container.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.add('milestone-toast-show');
        });

        // Auto dismiss after 4 seconds
        const duration = prefersReducedMotion ? 5000 : 4000;
        setTimeout(() => {
            this.dismiss(toast);
        }, duration);
    },

    /**
     * Dismiss a toast notification
     */
    dismiss(toast) {
        if (!toast || toast.classList.contains('milestone-toast-dismissing')) return;

        toast.classList.add('milestone-toast-dismissing');
        toast.classList.remove('milestone-toast-show');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 400);
    },

    /**
     * Dismiss all active toasts
     */
    dismissAll() {
        const toasts = this.container?.querySelectorAll('.milestone-toast');
        toasts?.forEach(toast => this.dismiss(toast));
    }
};

// ============================================================================
// INITIALIZATION (OPTIMIZED - Lazy loading)
// ============================================================================

// Initialize visual effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay heavy effects initialization for better initial load
    requestIdleCallback ? requestIdleCallback(initEffects) : setTimeout(initEffects, 100);
});

function initEffects() {
    // Skip on low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 2 ||
                     (navigator.deviceMemory && navigator.deviceMemory <= 2);

    // Check screen size for particle count adjustment
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    if (!isLowEnd && !isMobile) {
        // Initialize particles with minimal count for better performance
        ParticlesBackground.init({
            count: isTablet ? 6 : 8, // Reduced: tablet=6, desktop=8
            minSize: 4,
            maxSize: 8, // Reduced from 10
            minDuration: 25, // Slower = less repaints
            maxDuration: 45
        });

        // Initialize mouse glow effect (consolidated with product cards)
        MouseGlowEffect.init();

        // Pause particles when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                ParticlesBackground.pause();
            } else {
                ParticlesBackground.resume();
            }
        });
    }

    // Ripple effect is lightweight, always enable
    RippleEffect.init();
}

// Initialize toast notifications on first use (lazy)
let toastInitialized = false;
const originalShow = ToastNotifications.show.bind(ToastNotifications);
ToastNotifications.show = function(...args) {
    if (!toastInitialized) {
        ToastNotifications.init();
        toastInitialized = true;
    }
    return originalShow(...args);
};

// Export for use in other modules
window.VisualEffects = {
    Particles: ParticlesBackground,
    Confetti: ConfettiEffect,
    Counter: AnimatedCounter,
    ProgressRing: ProgressRing,
    Toast: ToastNotifications,
    MilestoneToast: MilestoneToast,
    Ripple: RippleEffect,
    Glow: MouseGlowEffect,
    Milestones: MilestoneTracker
};
