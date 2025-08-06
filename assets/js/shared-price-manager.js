// ====== Shared Price Manager - Centralized Data Fetching ======
class SharedPriceManager {
    constructor() {
        // Singleton pattern
        if (SharedPriceManager.instance) {
            return SharedPriceManager.instance;
        }
        SharedPriceManager.instance = this;

        this.subscribers = new Set();
        this.isRunning = false;
        this.updateInterval = null;
        this.errorCount = 0;
        
        // API URLs
        this.apiUrls = {
            gold: 'http://27.254.77.78/rest/public/rest/goldspot',
            goldYesterday: 'http://27.254.77.78/rest/public/rest/goldspot-yesterday',
            silver: 'http://27.254.77.78/rest/public/rest/silver',
            silverYesterday: 'http://27.254.77.78/rest/public/rest/silver-yesterday'
        };

        // Cached data
        this.cachedData = {
            gold: null,
            goldYesterday: null,
            silver: null,
            silverYesterday: null,
            lastUpdate: null
        };

        // Page Visibility API for performance optimization
        this.setupVisibilityHandler();
        
        console.log('SharedPriceManager initialized');
    }

    // Subscribe a component to receive price updates
    subscribe(subscriberId, callback) {
        const subscriber = { id: subscriberId, callback };
        this.subscribers.add(subscriber);
        
        console.log(`Component ${subscriberId} subscribed. Total subscribers: ${this.subscribers.size}`);
        
        // Start fetching if this is the first subscriber
        if (this.subscribers.size === 1 && !this.isRunning) {
            this.startFetching();
        }
        
        // Send cached data immediately if available
        if (this.cachedData.gold) {
            try {
                callback(this.cachedData);
            } catch (error) {
                console.error(`Error calling callback for ${subscriberId}:`, error);
            }
        }
        
        return () => this.unsubscribe(subscriberId);
    }

    // Unsubscribe a component
    unsubscribe(subscriberId) {
        for (const subscriber of this.subscribers) {
            if (subscriber.id === subscriberId) {
                this.subscribers.delete(subscriber);
                console.log(`Component ${subscriberId} unsubscribed. Total subscribers: ${this.subscribers.size}`);
                break;
            }
        }
        
        // Stop fetching if no subscribers left
        if (this.subscribers.size === 0 && this.isRunning) {
            this.stopFetching();
        }
    }

    // Start fetching data from APIs
    startFetching() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.errorCount = 0;
        
        // Fetch immediately
        this.fetchAllPrices();
        
        // Set up interval for periodic updates (every 2 seconds)
        this.updateInterval = setInterval(() => {
            this.fetchAllPrices();
        }, 2000);
        
        console.log('SharedPriceManager started fetching (every 2 seconds)');
    }

    // Stop fetching data
    stopFetching() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('SharedPriceManager stopped fetching');
    }

    // Fetch all price data from APIs
    async fetchAllPrices() {
        try {
            // Fetch all endpoints in parallel
            const promises = [
                fetch(this.apiUrls.gold),
                fetch(this.apiUrls.goldYesterday),
                fetch(this.apiUrls.silver),
                fetch(this.apiUrls.silverYesterday)
            ];

            const responses = await Promise.all(promises);
            
            // Parse all responses
            const [goldData, goldYesterdayData, silverData, silverYesterdayData] = await Promise.all(
                responses.map(response => response.json())
            );

            // Update cached data with synchronized timestamp
            const syncedTimestamp = new Date();
            this.cachedData = {
                gold: goldData,
                goldYesterday: goldYesterdayData,
                silver: silverData,
                silverYesterday: silverYesterdayData,
                lastUpdate: syncedTimestamp,
                syncedUpdateTime: syncedTimestamp.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }) + ' น.'
            };

            // Reset error count on successful fetch
            this.errorCount = 0;

            // Notify all subscribers
            this.notifySubscribers(this.cachedData);

            console.log('SharedPriceManager: Data fetched successfully');

        } catch (error) {
            console.error('SharedPriceManager: Failed to fetch prices:', error);
            this.handleFetchError();
        }
    }

    // Handle fetch errors with exponential backoff
    handleFetchError() {
        this.errorCount++;
        
        // Use fallback data if available, otherwise generate mock data
        if (!this.cachedData.gold) {
            this.generateFallbackData();
            this.notifySubscribers(this.cachedData);
        }
        
        // Implement exponential backoff for errors
        if (this.errorCount >= 3) {
            console.warn(`SharedPriceManager: ${this.errorCount} consecutive errors, reducing update frequency`);
            
            // Clear current interval and set longer interval
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = setInterval(() => {
                    this.fetchAllPrices();
                }, 10000); // 10 seconds on error
            }
        }
    }

    // Generate fallback mock data
    generateFallbackData() {
        const now = new Date();
        const timeString = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const syncedFallbackTime = now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }) + ' น.';
        
        this.cachedData = {
            gold: {
                "G965B": {"time": timeString, "bid": 50738, "offer": 50838, "bid_asso": 50700, "offer_asso": 50800},
                "G9999B": {"time": timeString, "bid": 52950, "offer": 53050},
                "G9999KG": {"time": timeString, "bid": 3470080, "offer": 3483360},
                "G9999US": {"time": timeString, "bid": 2620, "offer": 2625}
            },
            goldYesterday: {
                "G965B": {"bid": 50650, "offer": 50750, "bid_asso": 50600, "offer_asso": 50700},
                "G9999B": {"bid": 52800, "offer": 52900},
                "G9999KG": {"bid": 3465000, "offer": 3478000},
                "G9999US": {"bid": 2615, "offer": 2620}
            },
            silver: {
                "Silver": {"bid": "34600", "offer": "34900", "bidspot": "30.85", "offerspot": "31.12", "time": timeString}
            },
            silverYesterday: {
                "Silver": {"bid": "34500", "offer": "34800", "bidspot": "30.75", "offerspot": "31.02"}
            },
            lastUpdate: now,
            syncedUpdateTime: syncedFallbackTime
        };
        
        console.log('SharedPriceManager: Using fallback data');
    }

    // Notify all subscribers with new data
    notifySubscribers(data) {
        this.subscribers.forEach(subscriber => {
            try {
                subscriber.callback(data);
            } catch (error) {
                console.error(`SharedPriceManager: Error notifying subscriber ${subscriber.id}:`, error);
            }
        });
        
        // Dispatch custom event for components that prefer event-based updates
        document.dispatchEvent(new CustomEvent('priceDataUpdated', {
            detail: data
        }));
    }

    // Page Visibility API handler for performance optimization
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, reduce update frequency
                if (this.updateInterval && this.isRunning) {
                    clearInterval(this.updateInterval);
                    this.updateInterval = setInterval(() => {
                        this.fetchAllPrices();
                    }, 60000); // 1 minute when tab is hidden
                    console.log('SharedPriceManager: Reduced update frequency (tab hidden)');
                }
            } else {
                // Page is visible again, restore normal frequency
                if (this.updateInterval && this.isRunning) {
                    clearInterval(this.updateInterval);
                    this.updateInterval = setInterval(() => {
                        this.fetchAllPrices();
                    }, 2000); // Back to 2 seconds
                    console.log('SharedPriceManager: Restored normal update frequency (tab visible)');
                    
                    // Fetch immediately when tab becomes visible
                    this.fetchAllPrices();
                }
            }
        });
    }

    // Get current cached data
    getCurrentData() {
        return this.cachedData;
    }

    // Get singleton instance
    static getInstance() {
        if (!SharedPriceManager.instance) {
            new SharedPriceManager();
        }
        return SharedPriceManager.instance;
    }

    // Cleanup method
    destroy() {
        this.stopFetching();
        this.subscribers.clear();
        SharedPriceManager.instance = null;
        console.log('SharedPriceManager destroyed');
    }
}

// Export to global scope
window.SharedPriceManager = SharedPriceManager;

// Initialize singleton instance when script loads
window.sharedPriceManager = SharedPriceManager.getInstance();