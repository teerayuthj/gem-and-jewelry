// ====== Exchange Rate Manager - Separate API for Currency Conversion ======
class ExchangeRateManager {
    constructor() {
        // Singleton pattern
        if (ExchangeRateManager.instance) {
            return ExchangeRateManager.instance;
        }
        ExchangeRateManager.instance = this;

        this.subscribers = new Set();
        this.isRunning = false;
        this.updateInterval = null;
        this.lastFetchTime = null;
        
        // Local nginx API configuration
        this.apiUrl = 'http://27.254.3.14:7005/api/currency';
        this.updateIntervalMinutes = 60; // Update every 60 minutes (free plan friendly)
        
        // Cached exchange rates
        this.exchangeRates = {
            USD: 1, // Base currency
            THB: 32.31, // Will be updated from API
            EUR: 0.86,
            JPY: 146.77,
            CNY: 7.17,
            KRW: 1382.47,
            INR: 87.62,
            SGD: 1.29,
            HKD: 7.85
        };
        
        this.lastUpdated = null;
        
        console.log('ExchangeRateManager initialized');
    }

    // Subscribe a component to receive exchange rate updates
    subscribe(subscriberId, callback) {
        const subscriber = { id: subscriberId, callback };
        this.subscribers.add(subscriber);
        
        console.log(`Component ${subscriberId} subscribed to ExchangeRateManager. Total subscribers: ${this.subscribers.size}`);
        
        // Start fetching if this is the first subscriber
        if (this.subscribers.size === 1 && !this.isRunning) {
            this.startFetching();
        }
        
        // Send current exchange rates immediately
        try {
            callback(this.getCurrentRates());
        } catch (error) {
            console.error(`Error calling callback for ${subscriberId}:`, error);
        }
        
        return () => this.unsubscribe(subscriberId);
    }

    // Unsubscribe a component
    unsubscribe(subscriberId) {
        for (const subscriber of this.subscribers) {
            if (subscriber.id === subscriberId) {
                this.subscribers.delete(subscriber);
                console.log(`Component ${subscriberId} unsubscribed from ExchangeRateManager. Total subscribers: ${this.subscribers.size}`);
                break;
            }
        }
        
        // Stop fetching if no subscribers left
        if (this.subscribers.size === 0 && this.isRunning) {
            this.stopFetching();
        }
    }

    // Start fetching exchange rates (less frequent than gold prices)
    startFetching() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Check if we need to fetch immediately
        const now = new Date();
        const shouldFetchNow = !this.lastFetchTime || 
            (now - this.lastFetchTime) >= (this.updateIntervalMinutes * 60 * 1000);
        
        if (shouldFetchNow) {
            this.fetchExchangeRates();
        }
        
        // Set up interval for periodic updates (every 60 minutes)
        this.updateInterval = setInterval(() => {
            this.fetchExchangeRates();
        }, this.updateIntervalMinutes * 60 * 1000);
        
        console.log(`ExchangeRateManager started fetching (every ${this.updateIntervalMinutes} minutes)`);
    }

    // Stop fetching exchange rates
    stopFetching() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('ExchangeRateManager stopped fetching');
    }

    // Fetch exchange rates from CurrencyAPI
    async fetchExchangeRates() {
        try {
            console.log('ExchangeRateManager: Fetching exchange rates from CurrencyAPI...');
            
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update exchange rates from API response
            if (data.data) {
                this.exchangeRates = {
                    USD: 1, // Base currency
                    THB: data.data.THB?.value || this.exchangeRates.THB,
                    EUR: data.data.EUR?.value || this.exchangeRates.EUR,
                    JPY: data.data.JPY?.value || this.exchangeRates.JPY,
                    CNY: data.data.CNY?.value || this.exchangeRates.CNY,
                    KRW: data.data.KRW?.value || this.exchangeRates.KRW,
                    INR: data.data.INR?.value || this.exchangeRates.INR,
                    SGD: data.data.SGD?.value || this.exchangeRates.SGD,
                    HKD: data.data.HKD?.value || this.exchangeRates.HKD
                };
                
                // Use API provided timestamp if available
                if (data.meta && data.meta.last_updated_at) {
                    this.lastUpdated = new Date(data.meta.last_updated_at);
                } else if (data.fetched_at) {
                    this.lastUpdated = new Date(data.fetched_at);
                } else {
                    this.lastUpdated = new Date();
                }
                this.lastFetchTime = new Date();
                
                // Convert USD-based rates to THB-based rates for easier calculation
                const thbRate = this.exchangeRates.THB;
                this.exchangeRates = {
                    THB: 1, // Base currency changed to THB
                    USD: 1 / thbRate,
                    EUR: this.exchangeRates.EUR / thbRate,
                    JPY: this.exchangeRates.JPY / thbRate,
                    CNY: this.exchangeRates.CNY / thbRate,
                    KRW: this.exchangeRates.KRW / thbRate,
                    INR: this.exchangeRates.INR / thbRate,
                    SGD: this.exchangeRates.SGD / thbRate,
                    HKD: this.exchangeRates.HKD / thbRate
                };
                
                console.log('ExchangeRateManager: Exchange rates updated successfully');
                console.log('USD/THB rate:', (1 / this.exchangeRates.USD).toFixed(4));
                
                // Notify all subscribers
                this.notifySubscribers();
            }
            
        } catch (error) {
            console.error('ExchangeRateManager: Failed to fetch exchange rates:', error);
            
            // Use fallback rates if API fails
            console.log('ExchangeRateManager: Using fallback exchange rates');
        }
    }

    // Get current exchange rates
    getCurrentRates() {
        return {
            rates: { ...this.exchangeRates },
            lastUpdated: this.lastUpdated,
            nextUpdate: this.getNextUpdateTime()
        };
    }

    // Get next update time
    getNextUpdateTime() {
        if (!this.lastFetchTime) return null;
        
        const nextUpdate = new Date(this.lastFetchTime.getTime() + (this.updateIntervalMinutes * 60 * 1000));
        return nextUpdate;
    }

    // Get specific rate for currency conversion
    getRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;
        
        // Convert from THB base
        if (fromCurrency === 'THB') {
            return this.exchangeRates[toCurrency] || 1;
        }
        
        // Convert to THB base
        if (toCurrency === 'THB') {
            return 1 / (this.exchangeRates[fromCurrency] || 1);
        }
        
        // Convert between other currencies via THB
        const toThbRate = 1 / (this.exchangeRates[fromCurrency] || 1);
        const finalRate = toThbRate * (this.exchangeRates[toCurrency] || 1);
        return finalRate;
    }

    // Notify all subscribers
    notifySubscribers() {
        const currentRates = this.getCurrentRates();
        
        this.subscribers.forEach(subscriber => {
            try {
                subscriber.callback(currentRates);
            } catch (error) {
                console.error(`ExchangeRateManager: Error notifying subscriber ${subscriber.id}:`, error);
            }
        });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('exchangeRatesUpdated', {
            detail: currentRates
        }));
    }

    // Get singleton instance
    static getInstance() {
        if (!ExchangeRateManager.instance) {
            new ExchangeRateManager();
        }
        return ExchangeRateManager.instance;
    }

    // Cleanup method
    destroy() {
        this.stopFetching();
        this.subscribers.clear();
        ExchangeRateManager.instance = null;
        console.log('ExchangeRateManager destroyed');
    }

    // Manual refresh (for testing or user-triggered updates)
    async forceRefresh() {
        console.log('ExchangeRateManager: Force refresh requested');
        await this.fetchExchangeRates();
    }

    // Get formatted update info
    getUpdateInfo() {
        if (!this.lastUpdated) {
            return 'Not updated yet';
        }
        
        const now = new Date();
        const diffMs = now - this.lastUpdated;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just updated';
        }
    }
}

// Export to global scope
window.ExchangeRateManager = ExchangeRateManager;

// Initialize singleton instance when script loads
window.exchangeRateManager = ExchangeRateManager.getInstance();