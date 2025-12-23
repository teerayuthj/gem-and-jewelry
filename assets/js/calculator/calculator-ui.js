/**
 * Gold Saving Calculator 2 - UI Rendering Module
 * Contains all UI rendering logic for calculator and product displays
 */

// ============================================================================
// UI RENDERER - Main Calculator HTML Generation
// ============================================================================

window.UIRenderer = {
    /**
     * Render main calculator UI
     * @param {Object} data - Configuration data
     * @param {number} data.monthlyAmount - Monthly saving amount
     * @param {number} data.months - Number of months
     * @param {number} data.minAmount - Minimum amount for slider
     * @param {number} data.maxAmount - Maximum amount for slider
     * @param {number} data.maxMonths - Maximum months allowed
     * @param {Array} data.quickAmounts - Quick select amounts
     * @param {Array} data.presetMonths - Preset month options
     * @param {Object} data.localLead - Local lead capture data
     * @param {Object} data.localUi - Local UI state
     * @param {Array} data.countryCodes - Country codes for phone
     * @param {Function} t - Translation function
     * @returns {string} HTML string for calculator
     */
    render(data, t) {
        const {
            monthlyAmount,
            months,
            minAmount,
            maxAmount,
            maxMonths = 84,
            quickAmounts,
            presetMonths,
            localLead,
            localUi,
            countryCodes
        } = data;

        const formatNumber = GoldSavingUtils.formatNumber;
        const escapeHtml = GoldSavingUtils.escapeHtml;

        return `
            <div class="gold-saving2-wrapper">
                <!-- Header -->
                <div class="saving2-header">
                    <h1 class="saving2-title-simple">${t('title')}</h1>
                    <div class="info-box2-simple">
                        <i class="fas fa-info-circle"></i>
                        <span>${t('backtestInfo')}</span>
                    </div>
                </div>

                <!-- Main Calculator -->
                <div class="calculator2-container">
                    <!-- Left Panel - Inputs -->
                    <div class="calculator2-left">
                        <!-- Amount Section - Liquid Glass -->
                        <div class="liquid-glass-card lg-amount-card">
                            <div class="card-header">
                                <div class="card-icon"><i class="fas fa-wallet"></i></div>
                                <h3 class="card-title">${t('monthlyLabel')}</h3>
                            </div>

                            <div class="amount-display">
                                <span class="amount-value" id="amountDisplay2">${formatNumber(monthlyAmount)}</span>
                                <span class="amount-unit">${t('baht')}</span>
                            </div>

                            <div class="daily-info" id="dailyInfo2">
                                <i class="fas fa-calendar-check"></i>
                                <span>${t('dailyBuyInfo')}: ~<strong id="dailyAmount2">-</strong> ${t('perDay')}</span>
                            </div>

                            <div class="slider-wrapper">
                                <input type="range"
                                       id="amountSlider2"
                                       class="glass-slider"
                                       min="${minAmount}"
                                       max="${maxAmount}"
                                       step="500"
                                       value="${monthlyAmount}">
                                <div class="slider-labels">
                                    <span>${formatNumber(minAmount)}</span>
                                    <span>${formatNumber(maxAmount)}</span>
                                </div>
                            </div>

                            <div class="quick-btns">
                                ${quickAmounts.map(amt => `
                                    <button class="quick-btn ${amt === monthlyAmount ? 'active' : ''}"
                                            data-amount="${amt}">
                                        ${formatNumber(amt)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Duration Section - Liquid Glass -->
                        <div class="liquid-glass-card lg-duration-card" style="margin-top: 1.5rem;">
                            <div class="card-header">
                                <div class="card-icon"><i class="fas fa-calendar-alt"></i></div>
                                <h3 class="card-title">${t('monthsLabel')}</h3>
                            </div>

                            <div class="duration-options">
                                ${presetMonths.map(m => `
                                    <div class="duration-chip ${m === months ? 'active' : ''}" data-months="${m}">
                                        <div class="chip-text">${m} ${t('monthUnit')}</div>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="custom-input-wrapper">
                                <label>${t('customMonths')}:</label>
                                <input type="number"
                                       id="customMonths2"
                                       class="custom-input"
                                       min="1"
                                       max="${maxMonths}"
                                       value="${months}">
                                <span>${t('monthUnit')}</span>
                                <span class="max-hint">(สูงสุด ${maxMonths})</span>
                            </div>
                        </div>

                        <!-- Optional Contact Info (stored locally) -->
                        <div class="liquid-glass-card lg-lead-card" style="margin-top: 1.5rem;">
                            <details id="leadDetails2" class="lead-details" ${localUi.contactOpen ? 'open' : ''}>
                                <summary class="lead-summary">
                                    <div class="lead-summary-left">
                                        <i class="fas fa-address-card"></i>
                                        <div class="lead-summary-text">
                                            <div class="lead-summary-title">${t('contactTitle')}</div>
                                            <div class="lead-summary-subtitle">${t('contactSubtitle')}</div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right lead-chevron" aria-hidden="true"></i>
                                </summary>

                                <div class="lead-content">
                                    <div class="lead-privacy">
                                        <i class="fas fa-lock"></i>
                                        <span>${t('localOnly')}</span>
                                    </div>

                                    <div class="lead-plan-pill">
                                        <i class="fas fa-coins"></i>
                                        <span id="leadPlanSummary2">${t('planSummary')}: <strong>${formatNumber(monthlyAmount)}</strong> ${t('baht')}, <strong>${months}</strong> ${t('monthUnit')}</span>
                                    </div>

                                    <div class="lead-grid">
                                        <div class="lead-field">
                                            <label for="leadName2">${t('nameLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                            <input id="leadName2" class="lead-input" type="text" autocomplete="name" inputmode="text" value="${escapeHtml(localLead.name)}" />
                                        </div>
                                        <div class="lead-field">
                                            <label for="leadEmail2">${t('emailLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                            <input id="leadEmail2" class="lead-input" type="email" autocomplete="email" inputmode="email" value="${escapeHtml(localLead.email)}" />
                                        </div>
                                        <div class="lead-field lead-field-phone">
                                            <label for="leadPhone2">${t('phoneLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                            <div class="phone-input-group">
                                                <select id="leadPhoneCountry2" class="lead-input phone-country-select">
                                                    ${countryCodes.map(c => `<option value="${c.code}" ${c.code === localLead.phoneCountry ? 'selected' : ''}>${c.country} ${c.code}</option>`).join('')}
                                                </select>
                                                <input id="leadPhone2" class="lead-input phone-number-input" type="tel" autocomplete="tel" inputmode="tel" placeholder="812345678" value="${escapeHtml(localLead.phone)}" />
                                            </div>
                                        </div>
                                        <div class="lead-field">
                                            <label for="leadLineId2">${t('lineIdLabel')} <span class="lead-optional">(${t('optionalLabel')})</span></label>
                                            <input id="leadLineId2" class="lead-input" type="text" autocomplete="off" inputmode="text" value="${escapeHtml(localLead.lineId)}" />
                                        </div>
                                    </div>

                                    <div class="lead-actions">
                                        <button type="button" class="lead-btn" id="leadSave2">${t('savePlan')}</button>
                                        <button type="button" class="lead-btn secondary" id="leadCopy2">${t('copySummary')}</button>
                                        <button type="button" class="lead-btn secondary" id="leadClear2">${t('clearLocal')}</button>
                                        <span class="lead-status" id="leadStatus2" aria-live="polite"></span>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>

                    <!-- Right Panel - Results -->
                    <div class="calculator2-right">
                        <!-- Total Card - Liquid Glass -->
                        <div class="liquid-glass-card lg-total-card">
                            <div class="total-label">${t('totalSaving')}</div>
                            <div class="total-value">
                                <span id="totalAmount2">${formatNumber(monthlyAmount * months)}</span>
                                <span class="total-unit">${t('baht')}</span>
                            </div>
                            <div class="total-formula">
                                <span id="formula2">${formatNumber(monthlyAmount)} x ${months} ${t('monthUnit')}</span>
                            </div>
                            <div class="total-days-info" id="totalDaysInfo2">
                                <i class="fas fa-calendar-day"></i>
                                <span>ซื้อทั้งหมด <strong id="totalDays2">0</strong> วัน (จันทร์-ศุกร์)</span>
                            </div>
                        </div>

                        <!-- Gold Weight Result - Liquid Glass -->
                        <div class="liquid-glass-card lg-gold-card" style="margin-top: 1.5rem;">
                            <i class="fas fa-coins gold-icon"></i>
                            <div class="gold-label">${t('goldWeight')}</div>
                            <div class="gold-value" id="goldWeight2">0.00</div>
                            <div class="gold-unit">${t('bahtGold')}</div>
                        </div>

                        <!-- Profit/Loss Card - Liquid Glass -->
                        <div class="liquid-glass-card lg-profit-card" id="profitCard2" style="margin-top: 1.5rem;">
                            <div class="card-header">
                                <i class="fas fa-chart-line"></i>
                                <span>${t('profitLoss')}</span>
                            </div>
                            <div class="value-row">
                                <span class="value-label">${t('currentValue')}</span>
                                <span class="value-amount" id="currentValue2">0</span>
                            </div>
                            <div class="profit-result" id="profitResult2">
                                <div class="profit-amount">+0</div>
                                <div class="profit-percent">+0%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Section -->
                <div class="products2-section">
                    <h2 class="products2-title">
                        <i class="fas fa-star"></i>
                        ${t('recommendTitle')}
                    </h2>
                    <div class="products2-grid" id="productsGrid2">
                        <!-- Products will be rendered here -->
                    </div>
                </div>

                <!-- Disclaimer -->
                <div class="disclaimer2">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${t('disclaimer')}</span>
                </div>

                <!-- Debug Console -->
                <div class="debug-console" id="debugConsole">
                    <!-- Debug info will appear here -->
                </div>
            </div>
        `;
    }
};

// ============================================================================
// PRODUCT RENDERER - Product Display & Variant Modal
// ============================================================================

window.ProductRenderer = {
    /**
     * Render products grid
     * @param {Object} params - Parameters
     * @param {number} params.goldBaht - Gold weight in baht
     * @param {number} params.estimatePrice - Estimated average price
     * @param {number} params.currentGoldPrice - Current gold price
     * @param {Function} params.t - Translation function
     * @param {boolean} params.debugMode - Debug mode flag
     * @returns {Object} { html, productsByKey }
     */
    renderProducts({ goldBaht, estimatePrice, currentGoldPrice, t, debugMode = false }) {
        const formatNumber = GoldSavingUtils.formatNumber;
        const priceForProductDisplay =
            Number.isFinite(estimatePrice) && estimatePrice > 0 ? estimatePrice : currentGoldPrice;
        const allProducts = GoldProducts.getProductsWithPrice(priceForProductDisplay).sort(
            (a, b) => a.multiplier - b.multiplier
        );

        // Debug: Display product prices
        if (debugMode) {
            console.log('=== ราคาสินค้าในส่วนเป้าหมายทองคำแท่ง ===');
            allProducts.forEach(p => {
                const source = p.apiPrice ? '✅ API' : '⚙️ คำนวณ';
                const variantCount = GoldProducts.getVariantCount(p.weight);
                console.log(`${p.name} (${p.weight}): ${formatNumber(p.price)} บาท [${source}] - ${variantCount} ลาย`);
            });
            console.log('==========================================');
        }

        // Show all recommendations (same category/weight logic as before)
        const recommendedProducts = allProducts;
        const productsByKey = new Map(
            recommendedProducts.map(p => [String(p.sku || p.id), p])
        );

        // Find Hero product (closest next goal)
        const heroProduct = this.findHeroProduct(recommendedProducts, goldBaht);

        let html = '';

        // Hero Section - Product that is next goal
        if (heroProduct) {
            html += this.renderHeroCard(heroProduct, goldBaht, priceForProductDisplay, t);
        }

        // Supporting Products
        const supportingProducts = recommendedProducts.filter(p => p !== heroProduct);
        if (supportingProducts.length > 0) {
            html += `<div class="smart-supporting-grid">`;
            supportingProducts.forEach(product => {
                html += this.renderSupportingCard(product, goldBaht, priceForProductDisplay, t);
            });
            html += `</div>`;
        }

        // If no product is affordable at all
        const anyAffordable = recommendedProducts.some(p => goldBaht >= p.multiplier);
        if (!anyAffordable && allProducts.length > 0) {
            const cheapest = allProducts[0];
            const needMoreGold = Math.max(0, cheapest.multiplier - goldBaht);
            const needMoreBaht = Math.ceil(needMoreGold * priceForProductDisplay);
            html = `
                <div class="no-product2">
                    <i class="fas fa-coins"></i>
                    <p>${t('noProduct')}</p>
                    <p class="tip">${t('savingTip')}</p>
                    <p class="need-amount2">ต้องการอีก <strong>${needMoreGold.toFixed(4)}</strong> ${t('bahtGold')}
                    (~<strong>${formatNumber(needMoreBaht)}</strong> ${t('baht')})<br>
                    เพื่อซื้อ ${cheapest.name}</p>
                </div>
            ` + html;
        }

        return { html, productsByKey };
    },

    /**
     * Smart Recommendation: Select 3-5 relevant products
     * @param {Array} allProducts - All products
     * @param {number} goldBaht - Gold weight in baht
     * @returns {Array} Recommended products
     */
    getSmartRecommendation(allProducts, goldBaht) {
        const result = [];

        // Group products
        const affordable = []; // Already affordable
        const almostThere = []; // Close (70-99%)
        const nextGoals = []; // Next goals (< 70%)

        allProducts.forEach(product => {
            const progressPercent = (goldBaht / product.multiplier) * 100;

            if (progressPercent >= 100) {
                affordable.push({ ...product, progressPercent });
            } else if (progressPercent >= 70) {
                almostThere.push({ ...product, progressPercent });
            } else {
                nextGoals.push({ ...product, progressPercent });
            }
        });

        // Select products: 1-2 affordable + 1-2 almost there + 1-2 goals
        // Total max 5 items

        // 1. Affordable products (last 2 that can be bought)
        const affordableToShow = affordable.slice(-2);
        result.push(...affordableToShow);

        // 2. Almost there (first 2)
        const almostToShow = almostThere.slice(0, 2);
        result.push(...almostToShow);

        // 3. Next goals (fill to 5 total)
        const remaining = 5 - result.length;
        const nextToShow = nextGoals.slice(0, remaining);
        result.push(...nextToShow);

        // If still less than 3, add more from nextGoals
        if (result.length < 3 && nextGoals.length > nextToShow.length) {
            const moreNeeded = 3 - result.length;
            const moreGoals = nextGoals.slice(nextToShow.length, nextToShow.length + moreNeeded);
            result.push(...moreGoals);
        }

        // Sort by multiplier
        result.sort((a, b) => a.multiplier - b.multiplier);

        return result;
    },

    /**
     * Find Hero product - closest next goal
     * @param {Array} products - Products array
     * @param {number} goldBaht - Gold weight in baht
     * @returns {Object} Hero product
     */
    findHeroProduct(products, goldBaht) {
        // Find products not yet reached but closest (highest progress < 100%)
        const notYetReached = products.filter(p => {
            const progress = (goldBaht / p.multiplier) * 100;
            return progress < 100;
        });

        if (notYetReached.length === 0) {
            // If all affordable, return highest priced affordable
            return products[products.length - 1];
        }

        // Return the one with highest progress (closest to goal)
        return notYetReached.reduce((best, current) => {
            const bestProgress = (goldBaht / best.multiplier) * 100;
            const currentProgress = (goldBaht / current.multiplier) * 100;
            return currentProgress > bestProgress ? current : best;
        });
    },

    /**
     * Render Hero Card - Large card for next goal
     * @param {Object} product - Product object
     * @param {number} goldBaht - Gold weight in baht
     * @param {number} priceForProductDisplay - Price to use for display
     * @param {Function} t - Translation function
     * @returns {string} HTML string
     */
    renderHeroCard(product, goldBaht, priceForProductDisplay, t) {
        const formatNumber = GoldSavingUtils.formatNumber;
        const getNoImageFallback = GoldSavingUtils.getNoImageFallbackDataUri;
        const canAfford = goldBaht >= product.multiplier;
        const missingGold = Math.max(0, product.multiplier - goldBaht);
        const missingBahtEstimate = Math.ceil(missingGold * (product.apiPrice || priceForProductDisplay));
        const progressPercent = Math.min(100, (goldBaht / product.multiplier) * 100);
        const isAlmostThere = !canAfford && progressPercent >= 70;

        // Variant info
        const variantCount = GoldProducts.getVariantCount(product.weight);
        const priceRange = GoldProducts.getPriceRange(product.weight);
        const hasManyVariants = variantCount > 1;

        // Badge
        let badgeHtml = '';
        let statusClass = '';
        if (canAfford) {
            badgeHtml = `<div class="hero-badge can-buy"><i class="fas fa-check-circle"></i> ${t('canBuy')}</div>`;
            statusClass = 'affordable';
        } else if (isAlmostThere) {
            badgeHtml = `<div class="hero-badge almost"><i class="fas fa-fire"></i> ${t('almostThere')}</div>`;
            statusClass = 'almost';
        } else {
            badgeHtml = `<div class="hero-badge next-goal"><i class="fas fa-bullseye"></i> เป้าหมายถัดไป</div>`;
            statusClass = 'next-goal';
        }

        // Progress bar
        let progressHtml = '';
        if (!canAfford) {
            progressHtml = `
                <div class="hero-progress">
                    <div class="hero-progress-bar" style="width: ${progressPercent.toFixed(1)}%"></div>
                    <span class="hero-progress-text">${progressPercent.toFixed(1)}%</span>
                </div>
                <p class="hero-diff">
                    ต้องออมเพิ่ม <strong>+${missingGold.toFixed(4)}</strong> ${t('bahtGold')}
                    <span>(~${formatNumber(missingBahtEstimate)} ${t('baht')})</span>
                </p>
            `;
        }

        // Price display
        let priceHtml = '';
        if (hasManyVariants && priceRange) {
            if (priceRange.min === priceRange.max) {
                priceHtml = `${formatNumber(priceRange.min)} ${t('baht')}`;
            } else {
                priceHtml = `${formatNumber(priceRange.min)} - ${formatNumber(priceRange.max)} ${t('baht')}`;
            }
        } else {
            priceHtml = `${formatNumber(product.price)} ${t('baht')}`;
        }

        // Variant badge
        const variantBadge = hasManyVariants
            ? `<span class="variant-count-badge">${variantCount} ลายให้เลือก</span>`
            : '';

        const productKey = String(product.sku || product.id);
        const imageCount = Array.isArray(product.images) ? product.images.length : 0;
        const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';
        const heroClickableClass = !hasManyVariants && canAfford && product.link ? 'is-clickable' : '';
        const heroClickableAttrs = !hasManyVariants && canAfford && product.link
            ? `data-link="${product.link}" tabindex="0" role="link"`
            : '';
        const actionsHtml = hasManyVariants
            ? `
                <div class="hero-actions">
                    <button class="hero-btn select-variant" type="button" data-weight="${product.weight}" data-affordable="${canAfford ? 1 : 0}">
                        <i class="fas ${canAfford ? 'fa-th' : 'fa-lock'}"></i> ${canAfford ? 'เลือกลาย' : 'ดูตัวอย่างลาย'}
                    </button>
                </div>
            `
            : '';

        return `
            <div class="hero-card ${statusClass} ${heroClickableClass}" ${heroClickableAttrs} data-affordable="${canAfford ? 1 : 0}" data-weight="${product.weight}">
                ${badgeHtml}
                <div class="hero-content">
                    <button type="button" class="hero-image js-img-preview" data-images-key="${productKey}" aria-label="ดูรูปภาพ">
                        <img src="${product.image}" alt="${product.name}" loading="eager" decoding="async" fetchpriority="high"
                             onerror="this.src='${getNoImageFallback()}';">
                        ${imageCountBadge}
                    </button>
                    <div class="hero-info">
                        <h3 class="hero-name">${product.name}</h3>
                        <p class="hero-weight">${product.weight} ${variantBadge}</p>
                        <p class="hero-price">${priceHtml}</p>
                        ${progressHtml}
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render Supporting Card - Small card for other products
     * @param {Object} product - Product object
     * @param {number} goldBaht - Gold weight in baht
     * @param {number} priceForProductDisplay - Price to use for display
     * @param {Function} t - Translation function
     * @returns {string} HTML string
     */
    renderSupportingCard(product, goldBaht, priceForProductDisplay, t) {
        const formatNumber = GoldSavingUtils.formatNumber;
        const getNoImageFallback = GoldSavingUtils.getNoImageFallbackDataUri;
        const imagePlaceholder = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 10 10%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>';

        const canAfford = goldBaht >= product.multiplier;
        const progressPercent = Math.min(100, (goldBaht / product.multiplier) * 100);
        const isAlmostThere = !canAfford && progressPercent >= 70;

        // Variant info
        const variantCount = GoldProducts.getVariantCount(product.weight);
        const priceRange = GoldProducts.getPriceRange(product.weight);
        const hasManyVariants = variantCount > 1;

        // Status class
        let statusClass = '';
        let statusIcon = '';
        if (canAfford) {
            statusClass = 'affordable';
            statusIcon = '<i class="fas fa-check status-icon affordable"></i>';
        } else if (isAlmostThere) {
            statusClass = 'almost';
            statusIcon = '<i class="fas fa-clock status-icon almost"></i>';
        } else {
            statusClass = 'locked';
            statusIcon = '<i class="fas fa-lock status-icon locked"></i>';
        }

        // Price display
        let priceHtml = '';
        if (hasManyVariants && priceRange) {
            priceHtml = `ราคา ${formatNumber(priceRange.min)}`;
        } else {
            priceHtml = `${formatNumber(product.price)}`;
        }

        // Variant info
        const variantInfo = hasManyVariants
            ? `<span class="variant-hint">${variantCount} ลาย</span>`
            : '';

        const productKey = String(product.sku || product.id);
        const imageCount = Array.isArray(product.images) ? product.images.length : 0;
        const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';

        return `
            <div class="supporting-card ${statusClass}" data-weight="${product.weight}" data-affordable="${canAfford ? 1 : 0}">
                ${statusIcon}
                <button type="button" class="supporting-img js-img-preview" data-images-key="${productKey}" aria-label="ดูรูปภาพ">
                    <img class="lazy-img" src="${imagePlaceholder}" data-src="${product.image}" alt="${product.name}"
                         loading="lazy" decoding="async" fetchpriority="low"
                         onerror="this.src='${getNoImageFallback()}'; this.classList.add('is-loaded'); this.removeAttribute('data-src');">
                    ${imageCountBadge}
                </button>
                <div class="supporting-info">
                    <p class="supporting-weight">${product.weight}</p>
                    <p class="supporting-price">${priceHtml} <span class="currency">${t('baht')}</span></p>
                    ${variantInfo}
                    <div class="supporting-progress">
                        <div class="progress-fill" style="width: ${progressPercent.toFixed(1)}%"></div>
                    </div>
                    <p class="supporting-percent">${progressPercent.toFixed(0)}%</p>
                </div>
                ${hasManyVariants ? `<div class="tap-hint">${canAfford ? 'แตะเพื่อเลือกลาย' : 'แตะเพื่อดูตัวอย่าง (ล็อก)'}</div>` : ''}
            </div>
        `;
    },

    /**
     * Open Variant Modal
     * @param {string} weightLabel - Weight label (e.g., "1 บาท")
     * @param {Object} options - Options
     * @param {boolean} options.locked - Whether modal is in locked/preview mode
     * @param {Function} t - Translation function
     * @param {Function} loadLazyImageCallback - Callback to load lazy images
     * @param {Function} openImageLightboxCallback - Callback to open image lightbox
     */
    openVariantModal(weightLabel, options = {}, t, loadLazyImageCallback, openImageLightboxCallback) {
        const formatNumber = GoldSavingUtils.formatNumber;
        const getNoImageFallback = GoldSavingUtils.getNoImageFallbackDataUri;
        const imagePlaceholder = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 10 10%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>';

        const variants = GoldProducts.getVariantsByWeight(weightLabel);
        if (variants.length === 0) return;
        const isLocked = !!options.locked;
        const variantsByKey = new Map(variants.map(v => [String(v.sku || v.id), v]));

        // Remove existing modal
        const existingModal = document.getElementById('variantModal');
        if (existingModal) {
            try {
                if (typeof existingModal._cleanup === 'function') existingModal._cleanup();
            } catch (_) {
                // ignore
            }
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'variantModal';
        modal.className = `variant-modal${isLocked ? ' locked' : ''}`;

        const noImageFallback = getNoImageFallback();
        let variantsHtml = variants.map(variant => {
            const variantKey = String(variant.sku || variant.id);
            const imageCount = Array.isArray(variant.images) ? variant.images.length : 0;
            const imageCountBadge = imageCount > 1 ? `<span class="img-count-badge">${imageCount}</span>` : '';
            return `
                <div class="variant-item" data-variant-key="${variantKey}" tabindex="0" role="link">
                    <button type="button" class="variant-img js-img-preview" data-variant-key="${variantKey}" aria-label="ดูรูปภาพ">
                        <img class="lazy-img" src="${imagePlaceholder}" data-src="${variant.image}" alt="${variant.name}"
                             loading="lazy" decoding="async" fetchpriority="low"
                             onerror="this.src='${noImageFallback}'; this.classList.add('is-loaded'); this.removeAttribute('data-src');">
                        ${imageCountBadge}
                    </button>
                    <div class="variant-info">
                        <h4 class="variant-name">${variant.name}</h4>
                        <p class="variant-price">${formatNumber(variant.price)} ${t('baht')}</p>
                    </div>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="variant-modal-backdrop"></div>
            <div class="variant-modal-content">
                <div class="variant-modal-header">
                    <h3><i class="fas fa-th"></i> ทองแท่ง ${weightLabel} - เลือกลายที่ชอบ</h3>
                    <button class="variant-modal-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="variant-modal-body">
                    <p class="variant-count-info">
                        มีทั้งหมด ${variants.length} ลายให้เลือก
                        ${isLocked ? '<span class="variant-locked-note"> (โหมดตัวอย่าง - ออมถึงเป้าหมายก่อนเพื่อกดเลือก)</span>' : ''}
                    </p>
                    <div class="variant-grid">
                        ${variantsHtml}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const variantGrid = modal.querySelector('.variant-grid');
        const variantClickHandler = (e) => {
            if (isLocked) {
                e.preventDefault();
                return;
            }
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && modal.contains(previewBtn)) {
                e.preventDefault();
                e.stopPropagation();
                const key = previewBtn.dataset.variantKey;
                const variant = key ? variantsByKey.get(String(key)) : null;
                const images = Array.isArray(variant?.images) && variant.images.length > 0
                    ? variant.images
                    : variant?.image
                        ? [variant.image]
                        : [];
                if (images.length === 0) return;
                if (openImageLightboxCallback) {
                    openImageLightboxCallback({ title: variant?.name || '', images, startIndex: 0 });
                }
                return;
            }

            const item = e.target.closest('.variant-item');
            if (!item || !modal.contains(item)) return;
            const key = item.dataset.variantKey;
            const variant = key ? variantsByKey.get(String(key)) : null;
            if (variant?.link) window.open(variant.link, '_blank');
        };

        const variantKeyHandler = (e) => {
            if (isLocked) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const item = e.target.closest('.variant-item');
            if (!item || !modal.contains(item)) return;
            e.preventDefault();
            const key = item.dataset.variantKey;
            const variant = key ? variantsByKey.get(String(key)) : null;
            if (variant?.link) window.open(variant.link, '_blank');
        };

        variantGrid?.addEventListener('click', variantClickHandler);
        variantGrid?.addEventListener('keydown', variantKeyHandler);

        // Progressive image loading within the modal scroll container
        const modalBody = modal.querySelector('.variant-modal-body');
        const modalImgs = Array.from(modal.querySelectorAll('img[data-src]'));
        let modalObserver = null;
        if (modalImgs.length > 0) {
            if (typeof IntersectionObserver === 'undefined') {
                modalImgs.forEach(img => {
                    if (loadLazyImageCallback) loadLazyImageCallback(img);
                });
            } else {
                modalObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => {
                            if (!entry.isIntersecting) return;
                            const img = entry.target;
                            modalObserver?.unobserve(img);
                            if (loadLazyImageCallback) loadLazyImageCallback(img);
                        });
                    },
                    { root: modalBody, rootMargin: '200px 0px', threshold: 0.01 }
                );
                modalImgs.forEach(img => modalObserver.observe(img));
            }
        }

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Close events
        const closeBtn = modal.querySelector('.variant-modal-close');
        const backdrop = modal.querySelector('.variant-modal-backdrop');

        const closeModal = () => {
            if (modalObserver) modalObserver.disconnect();
            variantGrid?.removeEventListener('click', variantClickHandler);
            variantGrid?.removeEventListener('keydown', variantKeyHandler);
            document.removeEventListener('keydown', escHandler);
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);

        // ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escHandler);

        // Expose cleanup for any forced removal
        modal._cleanup = () => {
            if (modalObserver) modalObserver.disconnect();
            variantGrid?.removeEventListener('click', variantClickHandler);
            variantGrid?.removeEventListener('keydown', variantKeyHandler);
            document.removeEventListener('keydown', escHandler);
        };
    }
};
