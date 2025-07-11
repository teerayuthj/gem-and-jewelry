// Countdown Timer Class
class CountdownTimer {
    constructor(config) {
        this.config = config;
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
        this.updateCountdown();
        this.startCountdown();
    }
    
    parseDate(dateString) {
        const parts = dateString.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0);
    }
    
    setupDates() {
        this.elements.startDate.textContent = this.config.startDate;
        this.elements.endDate.textContent = this.config.endDate;
        this.elements.expiryDate.textContent = this.config.endDate;
        this.elements.discountCode.value = this.config.discountCode;
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
            this.elements.actionBtn.classList.add('btn-disabled');
        } else if (now >= startDate && now <= endDateWithTime) {
            // During promotion
            diff = endDateWithTime - now;
            this.updateCountdownLabel('countdown.label');
            this.updateActionButton('buttons.getOffer');
            this.elements.actionBtn.classList.remove('btn-disabled');
        } else {
            // After promotion ends
            diff = 0;
            this.updateCountdownLabel('countdown.labelExpired');
            this.updateActionButton('buttons.expired');
            this.elements.actionBtn.classList.add('btn-disabled');
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
        this.elements.days.style.setProperty('--value', days);
        this.elements.days.textContent = days;
        this.elements.days.setAttribute('aria-label', days);
        
        this.elements.hours.style.setProperty('--value', hours);
        this.elements.hours.textContent = hours;
        this.elements.hours.setAttribute('aria-label', hours);
        
        this.elements.minutes.style.setProperty('--value', minutes);
        this.elements.minutes.textContent = minutes;
        this.elements.minutes.setAttribute('aria-label', minutes);
        
        this.elements.seconds.style.setProperty('--value', seconds);
        this.elements.seconds.textContent = seconds;
        this.elements.seconds.setAttribute('aria-label', seconds);
        
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
        ];
        
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
        const message = (typeof i18n !== 'undefined') ? i18n.getText(messageKey) : messageKey;
        this.elements.urgencyText.textContent = message;
        this.elements.urgencyMessage.className = `mt-4 p-3 rounded-lg font-bold text-center ${bgClass}`;
        this.elements.urgencyMessage.classList.remove('hidden');
    }
    
    hideUrgencyMessage() {
        this.elements.urgencyMessage.classList.add('hidden');
    }
    
    updateCountdownLabel(key) {
        const label = (typeof i18n !== 'undefined') ? i18n.getText(key) : key;
        this.elements.countdownLabel.textContent = label;
    }
    
    updateActionButton(key) {
        const text = (typeof i18n !== 'undefined') ? i18n.getText(key) : key;
        this.elements.actionBtn.textContent = text;
    }
    
    updateLanguage() {
        // Called when language changes - update dynamic content
        this.updateCountdown();
    }
    
    startCountdown() {
        this.updateCountdown();
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
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