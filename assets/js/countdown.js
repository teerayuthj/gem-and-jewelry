// Countdown Timer Class
class CountdownTimer {
    constructor(config) {
        this.config = config;
        this.isInitialized = false;
        this.intervalId = null;
        this.urgencyWarningShown = false;
        this.elements = {
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            expiryDate: document.getElementById('expiryDate'),
            discountCode: document.getElementById('discountCode'),
            countdownLabel: document.getElementById('countdownLabel'),
            days: document.getElementById('countdown-days'),
            hours: document.getElementById('countdown-hours'),
            minutes: document.getElementById('countdown-minutes'),
            seconds: document.getElementById('countdown-seconds'),
            actionBtn: document.getElementById('mainActionBtn'),
            // Countdown containers for styling
            daysContainer: document.getElementById('days-container'),
            hoursContainer: document.getElementById('hours-container'),
            minutesContainer: document.getElementById('minutes-container'),
            secondsContainer: document.getElementById('seconds-container'),
            urgencyMessage: document.getElementById('urgencyMessage'),
            urgencyText: document.getElementById('urgencyText')
        };
        
        // Store reference globally for i18n updates
        window.countdownTimerInstance = this;
        
        this.init();
    }
    
    init() {
        this.setupDates();
        // Wait for i18n to load before starting countdown
        this.waitForI18nAndStart();
    }
    
    waitForI18nAndStart() {
        if (this.isInitialized) {
            console.log('Countdown: Already initialized, skipping');
            return;
        }
        
        if (window.i18nReady && typeof i18n !== 'undefined' && i18n.translations && Object.keys(i18n.translations).length > 0) {
            console.log('Countdown: I18n loaded, starting countdown');
            this.isInitialized = true;
            this.updateCountdown();
            this.startCountdown();
        } else {
            // Listen for i18n ready event
            document.addEventListener('i18nReady', () => {
                if (!this.isInitialized) {
                    console.log('Countdown: Received i18nReady event');
                    this.isInitialized = true;
                    this.updateCountdown();
                    this.startCountdown();
                }
            }, { once: true });
            
            // Fallback timeout method
            setTimeout(() => {
                if (!this.isInitialized) {
                    // Silent fallback, no console.log
                    this.waitForI18nAndStart();
                }
            }, 500);
        }
    }
    
    parseDate(dateString) {
        const parts = dateString.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    }
    
    setupDates() {
        // Safely update elements if they exist
        if (this.elements.startDate) {
            this.elements.startDate.textContent = this.config.startDate;
        }
        if (this.elements.endDate) {
            this.elements.endDate.textContent = this.config.endDate;
        }
        if (this.elements.expiryDate) {
            this.elements.expiryDate.textContent = this.config.endDate;
        }
        if (this.elements.discountCode) {
            this.elements.discountCode.value = this.config.discountCode;
        }
    }
    
    updateCountdown() {
        const startDate = this.parseDate(this.config.startDate);
        const endDate = this.parseDate(this.config.endDate);
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        
        const now = new Date();
        let diff;
        
        if (now < startDate) {
            // Before promotion starts
            diff = startDate - now;
            this.updateCountdownLabel('countdown.labelBeforeStart');
            this.updateActionButton('buttons.getReady');
            if (this.elements.actionBtn) {
                this.elements.actionBtn.classList.add('btn-disabled');
            }
        } else if (now >= startDate && now <= endDateWithTime) {
            // During promotion
            diff = endDateWithTime - now;
            this.updateCountdownLabel('countdown.label');
            this.updateActionButton('buttons.getOffer');
            if (this.elements.actionBtn) {
                this.elements.actionBtn.classList.remove('btn-disabled');
            }
        } else {
            // After promotion ends
            diff = 0;
            this.updateCountdownLabel('countdown.labelExpired');
            this.updateActionButton('buttons.expired');
            if (this.elements.actionBtn) {
                this.elements.actionBtn.classList.add('btn-disabled');
            }
        }
        
        if (diff <= 0) {
            this.setCountdownValues(0, 0, 0, 0);
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        this.setCountdownValues(days, hours, minutes, seconds);
    }
    
    setCountdownValues(days, hours, minutes, seconds) {
        // Safely update countdown elements if they exist
        if (this.elements.days) {
            this.elements.days.style.setProperty('--value', days);
            this.elements.days.textContent = days;
            this.elements.days.setAttribute('aria-label', days);
        }
        
        if (this.elements.hours) {
            this.elements.hours.style.setProperty('--value', hours);
            this.elements.hours.textContent = hours;
            this.elements.hours.setAttribute('aria-label', hours);
        }
        
        if (this.elements.minutes) {
            this.elements.minutes.style.setProperty('--value', minutes);
            this.elements.minutes.textContent = minutes;
            this.elements.minutes.setAttribute('aria-label', minutes);
        }
        
        if (this.elements.seconds) {
            this.elements.seconds.style.setProperty('--value', seconds);
            this.elements.seconds.textContent = seconds;
            this.elements.seconds.setAttribute('aria-label', seconds);
        }
        
        // Apply urgency styling based on time remaining
        this.applyUrgencyStyling(days, hours, minutes, seconds);
    }
    
    applyUrgencyStyling(days, hours, minutes, seconds) {
        const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
        const containers = [
            this.elements.daysContainer,
            this.elements.hoursContainer, 
            this.elements.minutesContainer,
            this.elements.secondsContainer
        ].filter(container => container !== null); // Filter out null elements
        
        // Remove existing urgency classes
        const urgencyClasses = ['countdown-critical', 'countdown-urgent', 'countdown-warning', 'countdown-normal'];
        containers.forEach(container => {
            urgencyClasses.forEach(cls => container.classList.remove(cls));
        });
        
        // Apply styling based on time remaining
        if (totalSeconds <= 3600) { // Less than 1 hour - CRITICAL
            containers.forEach(container => container.classList.add('countdown-critical'));
            this.showUrgencyMessage('urgencyMessages.critical', 'bg-red-600 text-white');
        } else if (totalSeconds <= 10800) { // Less than 3 hours - URGENT  
            containers.forEach(container => container.classList.add('countdown-urgent'));
            this.showUrgencyMessage('urgencyMessages.urgent', 'bg-red-500 text-white');
        } else if (totalSeconds <= 86400) { // Less than 1 day - WARNING
            containers.forEach(container => container.classList.add('countdown-warning'));
            this.showUrgencyMessage('urgencyMessages.warning', 'bg-yellow-500 text-black');
        } else { // More than 1 day - NORMAL (but still red for urgency)
            containers.forEach(container => container.classList.add('countdown-normal'));
            this.showUrgencyMessage('urgencyMessages.normal', 'bg-red-500 text-white');
        }
    }
    
    showUrgencyMessage(messageKey, bgClass) {
        // Check if urgency elements exist before using them
        if (!this.elements.urgencyText || !this.elements.urgencyMessage) {
            // Only warn once, not every second
            if (!this.urgencyWarningShown) {
                console.warn('Urgency message elements not found, skipping urgency message display');
                this.urgencyWarningShown = true;
            }
            return;
        }
        
        const message = (typeof i18n !== 'undefined') ? i18n.getText(messageKey) : messageKey;
        this.elements.urgencyText.textContent = message;
        this.elements.urgencyMessage.className = `mt-4 p-3 rounded-lg font-bold text-center ${bgClass}`;
        this.elements.urgencyMessage.classList.remove('hidden');
    }
    
    hideUrgencyMessage() {
        // Check if urgency message element exists before using it
        if (this.elements.urgencyMessage) {
            this.elements.urgencyMessage.classList.add('hidden');
        }
    }
    
    updateCountdownLabel(key) {
        if (this.elements.countdownLabel) {
            let label = key;
            if (typeof i18n !== 'undefined' && i18n.translations) {
                label = i18n.getText(key);
            } else {
                // Fallback text while i18n is loading
                const fallbacks = {
                    'countdown.label': '⏳ เหลือเวลาอีก:',
                    'countdown.labelBeforeStart': '⏳ เหลือเวลาอีกก่อนเริ่มโปรโมชั่น:',
                    'countdown.labelExpired': '❌ โปรโมชั่นหมดอายุแล้ว'
                };
                label = fallbacks[key] || key;
            }
            this.elements.countdownLabel.textContent = label;
        }
    }
    
    updateActionButton(key) {
        if (this.elements.actionBtn) {
            let text = key;
            if (typeof i18n !== 'undefined' && i18n.translations) {
                text = i18n.getText(key);
            } else {
                // Fallback text while i18n is loading
                const fallbacks = {
                    'buttons.getOffer': '🛒 รับข้อเสนอพิเศษตอนนี้',
                    'buttons.getReady': '⏰ เตรียมพร้อมรับส่วนลด',
                    'buttons.expired': '😞 โปรโมชั่นสิ้นสุดแล้ว'
                };
                text = fallbacks[key] || key;
            }
            this.elements.actionBtn.textContent = text;
        }
    }
    
    updateLanguage() {
        // Called when language changes - update dynamic content only if already initialized
        if (this.isInitialized) {
            this.updateCountdown();
        }
    }
    
    startCountdown() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.updateCountdown();
        this.intervalId = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        console.log('Countdown: Started successfully');
    }
}

// Initialize countdown when page loads
document.addEventListener('DOMContentLoaded', function() {
    const promotionConfig = {
        startDate: "30/06/2025",
        endDate: "28/07/2025",
        discountCode: "AUS100THB"
    };
    
    new CountdownTimer(promotionConfig);
});