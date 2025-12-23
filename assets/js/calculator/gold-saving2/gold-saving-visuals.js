/**
 * Gold Saving Calculator 2 - Visual Effects Module
 * Particles, Confetti, Animated Counter, Progress Rings
 */

// ============================================================================
// PARTICLES BACKGROUND
// ============================================================================

window.ParticlesBackground = {
    container: null,
    particles: [],
    animationId: null,
    isEnabled: true,

    /**
     * Initialize particles background
     * @param {Object} options - Configuration options
     * @param {number} options.count - Number of particles (default: 30)
     * @param {number} options.minSize - Minimum particle size (default: 4)
     * @param {number} options.maxSize - Maximum particle size (default: 12)
     * @param {number} options.minDuration - Minimum animation duration (default: 15)
     * @param {number} options.maxDuration - Maximum animation duration (default: 35)
     */
    init(options = {}) {
        const {
            count = 30,
            minSize = 4,
            maxSize = 12,
            minDuration = 15,
            maxDuration = 35
        } = options;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            return;
        }

        // Don't initialize on mobile devices
        if (window.innerWidth < 768) {
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
            wrapper.appendChild(container);
        }
        this.container = container;

        // Clear existing particles
        container.innerHTML = '';
        this.particles = [];

        // Create particles
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(minSize, maxSize, minDuration, maxDuration);
            container.appendChild(particle);
            this.particles.push(particle);
        }
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

    /**
     * Trigger confetti celebration
     * @param {Object} options - Configuration options
     * @param {number} options.count - Number of confetti pieces (default: 150)
     * @param {number} options.duration - Duration in ms (default: 4000)
     * @param {string} options.origin - Origin of confetti ('top' or 'center', default: 'top')
     */
    trigger(options = {}) {
        const {
            count = 150,
            duration = 4000,
            origin = 'top'
        } = options;

        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // Find or create container
        let container = document.querySelector('.confetti-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'confetti-container';
            document.body.appendChild(container);
        }
        this.container = container;

        // Clear existing confetti after a delay
        if (this.confetti.length > 0) {
            setTimeout(() => {
                this.container.innerHTML = '';
                this.confetti = [];
            }, 100);
        }

        // Create confetti pieces
        for (let i = 0; i < count; i++) {
            const confetti = this.createConfetti(origin);
            container.appendChild(confetti);
            this.confetti.push(confetti);
        }

        // Clean up after duration
        setTimeout(() => {
            container.innerHTML = '';
            this.confetti = [];
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
// MOUSE TRACKING FOR GLOW EFFECTS
// ============================================================================

window.MouseGlowEffect = {
    /**
     * Initialize mouse tracking glow effect
     * @param {string} selector - Card selector (default: '.liquid-glass-card, .lg-profit-card')
     */
    init(selector = '.liquid-glass-card, .lg-profit-card') {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll(selector);
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Check if mouse is over the card
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                }
            });
        });
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

    /**
     * Check and trigger milestones
     * @param {number} goldBaht - Gold weight in baht
     * @param {number} totalAmount - Total amount saved
     */
    check(goldBaht, totalAmount) {
        const newMilestones = [];

        // Check gold milestones
        if (goldBaht >= 1 && !this.achievedMilestones.has('oneBaht')) {
            this.achievedMilestones.add('oneBaht');
            newMilestones.push(this.milestones.oneBaht);
        }

        if (goldBaht >= 5 && !this.achievedMilestones.has('fiveBaht')) {
            this.achievedMilestones.add('fiveBaht');
            newMilestones.push(this.milestones.fiveBaht);
        }

        if (goldBaht >= 10 && !this.achievedMilestones.has('tenBaht')) {
            this.achievedMilestones.add('tenBaht');
            newMilestones.push(this.milestones.tenBaht);
        }

        // Check amount milestones
        if (totalAmount >= 100000 && !this.achievedMilestones.has('firstHundredThousand')) {
            this.achievedMilestones.add('firstHundredThousand');
            newMilestones.push(this.milestones.firstHundredThousand);
        }

        if (totalAmount >= 1000000 && !this.achievedMilestones.has('firstMillion')) {
            this.achievedMilestones.add('firstMillion');
            newMilestones.push(this.milestones.firstMillion);
        }

        // Trigger celebrations for new milestones
        newMilestones.forEach(milestone => {
            this.celebrate(milestone);
        });

        return newMilestones;
    },

    /**
     * Celebrate a milestone achievement
     */
    celebrate(milestone) {
        // Show toast notification
        ToastNotifications.success(`🎉 ยินดีด้วย! คุณถึงเป้าหมาย "${milestone.name}" แล้ว!`);

        // Trigger confetti
        ConfettiEffect.trigger({ count: 100, origin: 'top' });
    },

    /**
     * Reset milestones (for testing)
     */
    reset() {
        this.achievedMilestones.clear();
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize all visual effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles background
    ParticlesBackground.init({
        count: 25,
        minSize: 4,
        maxSize: 12,
        minDuration: 15,
        maxDuration: 35
    });

    // Initialize ripple effect
    RippleEffect.init();

    // Initialize mouse glow effect
    MouseGlowEffect.init();
});

// Initialize toast notifications on first use
ToastNotifications.init();

// Export for use in other modules
window.VisualEffects = {
    Particles: ParticlesBackground,
    Confetti: ConfettiEffect,
    Counter: AnimatedCounter,
    ProgressRing: ProgressRing,
    Toast: ToastNotifications,
    Ripple: RippleEffect,
    Glow: MouseGlowEffect,
    Milestones: MilestoneTracker
};
