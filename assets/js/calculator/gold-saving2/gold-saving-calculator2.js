/**
 * Gold Saving Calculator 2 - Main Orchestrator
 * Thin wrapper ที่ประสานการทำงานของ modules ทั้งหมด
 *
 * Dependencies (ต้องโหลดก่อนไฟล์นี้):
 * - GoldSavingConfig (from calculator-config.js)
 * - GoldSavingUtils, StateManager, PriceManager, CalculationEngine (from calculator-core.js)
 * - UIRenderer, ProductRenderer (from calculator-ui.js)
 * - EventHandler, ImageLoader (from calculator-features.js)
 * - GoldProducts (external)
 * - SharedPriceManager (external)
 */

class GoldSavingCalculator2 {
    constructor(containerId) {
        // DOM
        this.container = document.getElementById(containerId);

        // State
        this.currentLang = 'th';
        this.currentGoldPrice = typeof GoldProducts !== 'undefined' ? GoldProducts.baseGoldPrice : 64550;

        // Calculator settings (from config)
        this.minAmount = GoldSavingConfig.DEFAULTS.minAmount;
        this.maxAmount = GoldSavingConfig.DEFAULTS.maxAmount;
        this.maxMonths = GoldSavingConfig.DEFAULTS.maxMonths;
        this.defaultAmount = GoldSavingConfig.DEFAULTS.defaultAmount;
        this.debugMode = GoldSavingConfig.DEFAULTS.debugMode;
        this.localStorageKey = GoldSavingConfig.DEFAULTS.localStorageKey;
        this.imagePlaceholder = GoldSavingConfig.DEFAULTS.imagePlaceholder;
        this.workingDaysPerMonth = GoldSavingConfig.DEFAULTS.workingDaysPerMonth;

        // Presets (from config)
        this.quickAmounts = GoldSavingConfig.PRESETS.quickAmounts;
        this.presetMonths = GoldSavingConfig.PRESETS.months;
        this.countryCodes = GoldSavingConfig.COUNTRY_CODES;

        // User input state
        this.monthlyAmount = this.defaultAmount;
        this.months = 6;

        // Lead capture state
        this.localLead = {
            name: '',
            email: '',
            phoneCountry: '+66',
            phone: '',
            lineId: ''
        };
        this.localUi = {
            contactOpen: false
        };
        this.localMeta = {
            lastSavedHash: '',
            lastSavedAt: null
        };

        // Price data (delegated to PriceManager)
        this.weightedAvgPrice = 0;
        this.lastDcaAvgPrice = 0;

        // Image lazy loading
        this.lazyImageObserver = null;

        // Event handlers
        this._productsGridClickHandler = null;
        this._productsGridKeyHandler = null;

        // Render cache
        this._lastRenderGoldBaht = null;
        this._lastRenderPrice = null;

        // Restore saved state
        this.restoreLocalState();

        // Initialize
        this.init();
    }

    /**
     * Initialize calculator
     */
    async init() {
        // Wait for GoldProducts to load
        if (typeof GoldProducts !== 'undefined' && !GoldProducts.isLoaded) {
            console.log('⏳ Waiting for GoldProducts to load...');
            await GoldProducts.init();
            console.log('✅ GoldProducts loaded');
        }

        // Fetch daily prices (delegated to PriceManager)
        await PriceManager.fetchEndOfMonthPrices();
        this.maxMonths = PriceManager.maxMonths;

        // Render UI
        this.render();

        // Bind events (delegated to EventHandler)
        EventHandler.bindEvents(this);

        // Initial calculation
        this.updateCalculation();

        // Fetch current price
        this.fetchCurrentGoldPrice();
    }

    /**
     * Translation lookup
     */
    t(key) {
        return GoldSavingConfig.TRANSLATIONS[this.currentLang][key] || key;
    }

    /**
     * Restore state from localStorage (delegated to StateManager)
     */
    restoreLocalState() {
        const restored = StateManager.restoreLocalState(this.localStorageKey, {
            minAmount: this.minAmount,
            maxAmount: this.maxAmount,
            maxMonths: this.maxMonths
        });

        if (!restored) return;

        if (restored.monthlyAmount) this.monthlyAmount = restored.monthlyAmount;
        if (restored.months) this.months = restored.months;
        if (restored.lead) this.localLead = restored.lead;
        if (restored.ui) this.localUi = restored.ui;
        if (restored.meta) this.localMeta = restored.meta;
    }

    /**
     * Get local state snapshot (delegated to StateManager)
     */
    getLocalStateSnapshot() {
        return StateManager.getLocalStateSnapshot({
            monthlyAmount: this.monthlyAmount,
            months: this.months,
            lead: this.localLead,
            ui: this.localUi,
            meta: this.localMeta
        });
    }

    /**
     * Queue persist local state (delegated to StateManager)
     */
    queuePersistLocalState() {
        StateManager.queuePersistLocalState(
            this.localStorageKey,
            () => this.getLocalStateSnapshot()
        );
    }

    /**
     * Clear local lead (delegated to StateManager)
     */
    clearLocalLead() {
        this.localLead = { name: '', email: '', phoneCountry: '+66', phone: '', lineId: '' };
        this.localUi = { ...this.localUi, contactOpen: false };
        this.queuePersistLocalState();
    }

    /**
     * Get lead payload hash (delegated to StateManager)
     */
    getLeadPayloadHash() {
        return StateManager.getLeadPayloadHash({
            monthlyAmount: this.monthlyAmount,
            months: this.months,
            lead: this.localLead
        });
    }

    /**
     * Get lead summary text (delegated to StateManager)
     */
    getLeadSummaryText() {
        return StateManager.getLeadSummaryText({
            monthlyAmount: this.monthlyAmount,
            months: this.months,
            lead: this.localLead
        }, (key) => this.t(key));
    }

    /**
     * Update save button state (delegated to EventHandler)
     */
    updateSaveButtonState() {
        EventHandler.updateSaveButtonState(this);
    }

    /**
     * Set lead status (delegated to EventHandler)
     */
    setLeadStatus(messageKey, variant = 'success') {
        EventHandler.setLeadStatus(messageKey, variant, (key) => this.t(key));
    }

    /**
     * Utility: escapeHtml (delegated to GoldSavingUtils)
     */
    escapeHtml(value) {
        return GoldSavingUtils.escapeHtml(value);
    }

    /**
     * Utility: formatNumber (delegated to GoldSavingUtils)
     */
    formatNumber(num) {
        return GoldSavingUtils.formatNumber(num);
    }

    /**
     * Utility: formatDate (delegated to GoldSavingUtils)
     */
    formatDate(dateStr) {
        return GoldSavingUtils.formatDate(dateStr);
    }

    /**
     * Utility: copyToClipboard (delegated to GoldSavingUtils)
     */
    async copyToClipboard(text) {
        return GoldSavingUtils.copyToClipboard(text);
    }

    /**
     * Calculate DCA Gold (delegated to CalculationEngine)
     */
    calculateDcaGold(monthlyAmount, months, fallbackPrice) {
        return CalculationEngine.calculateDcaGold(monthlyAmount, months, fallbackPrice);
    }

    /**
     * Fetch current gold price (delegated to PriceManager)
     */
    async fetchCurrentGoldPrice() {
        const price = await PriceManager.fetchCurrentGoldPrice();
        if (price) {
            this.currentGoldPrice = price;
            const el = document.getElementById('currentPrice2');
            if (el) {
                el.textContent = this.formatNumber(this.currentGoldPrice);
            }

            // Recalculate weighted average
            this.weightedAvgPrice = PriceManager.calculateWeightedAverage(this.currentGoldPrice);

            // Recalculate
            this.updateCalculation();
        }
    }

    /**
     * Render main UI (delegated to UIRenderer)
     */
    render() {
        const html = UIRenderer.render({
            monthlyAmount: this.monthlyAmount,
            months: this.months,
            minAmount: this.minAmount,
            maxAmount: this.maxAmount,
            maxMonths: this.maxMonths,
            quickAmounts: this.quickAmounts,
            presetMonths: this.presetMonths,
            localLead: this.localLead,
            localUi: this.localUi,
            countryCodes: this.countryCodes
        }, (key) => this.t(key));

        this.container.innerHTML = html;
    }

    /**
     * Render products (delegated to ProductRenderer)
     * OPTIMIZED: Skip re-render if goldBaht hasn't changed significantly
     */
    renderProducts({ goldBaht, estimatePrice }) {
        // Round goldBaht to 4 decimal places for comparison
        const roundedGoldBaht = Math.round(goldBaht * 10000) / 10000;

        // Skip re-render if values haven't changed significantly
        if (this._lastRenderGoldBaht === roundedGoldBaht &&
            this._lastRenderPrice === estimatePrice) {
            return; // No need to re-render
        }

        // Update cache
        this._lastRenderGoldBaht = roundedGoldBaht;
        this._lastRenderPrice = estimatePrice;

        const { html, productsByKey } = ProductRenderer.renderProducts({
            goldBaht,
            estimatePrice,
            currentGoldPrice: this.currentGoldPrice,
            t: (key) => this.t(key),
            debugMode: this.debugMode
        });

        // Update DOM
        const grid = document.getElementById('productsGrid2');
        if (grid) {
            grid.innerHTML = html;

            // Bind product grid events (delegated to EventHandler)
            EventHandler.bindProductsGridEvents(grid, productsByKey, {
                getCurrentLang: () => this.currentLang,
                openImageLightbox: (options) => this.openImageLightbox(options),
                openVariantModal: (weightLabel, options) => this.openVariantModal(weightLabel, options)
            });

            // Bind modal events (delegated to EventHandler)
            EventHandler.bindModalEvents({
                openVariantModal: (weightLabel, options) => this.openVariantModal(weightLabel, options),
                getVariantCount: (weight) => GoldProducts.getVariantCount(weight),
                getVariantsByWeight: (weight) => GoldProducts.getVariantsByWeight(weight)
            });

            // Initialize lazy loading (delegated to ImageLoader)
            ImageLoader.initGridLazyImages(grid, this);
        }
    }

    /**
     * Open variant modal (delegated to ProductRenderer)
     */
    openVariantModal(weightLabel, options = {}) {
        ProductRenderer.openVariantModal(
            weightLabel,
            options,
            (key) => this.t(key),
            (img) => ImageLoader.loadLazyImage(img),
            (opts) => ImageLoader.openImageLightbox(opts, (key) => this.t(key))
        );
    }

    /**
     * Open image lightbox (delegated to ImageLoader)
     */
    openImageLightbox(options) {
        ImageLoader.openImageLightbox(options, (key) => this.t(key));
    }

    /**
     * Disconnect lazy image observer (delegated to ImageLoader)
     */
    disconnectLazyImageObserver() {
        ImageLoader.disconnectLazyImageObserver(this);
    }

    /**
     * Update quick buttons (delegated to EventHandler)
     */
    updateQuickButtons() {
        EventHandler.updateQuickButtons(this);
    }

    /**
     * Update calculation (delegated to EventHandler)
     */
    updateCalculation() {
        EventHandler.updateCalculation(this);
    }

    /**
     * Set language and re-render
     */
    setLanguage(lang) {
        if (GoldSavingConfig.TRANSLATIONS[lang]) {
            this.currentLang = lang;
            this.render();
            EventHandler.bindEvents(this);
            this.updateCalculation();
        }
    }

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.debugMode = !this.debugMode;
        const debugConsole = document.getElementById('debugConsole');
        if (debugConsole) {
            debugConsole.classList.toggle('show', this.debugMode);
        }
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }
}

// Export to global scope
window.GoldSavingCalculator2 = GoldSavingCalculator2;
