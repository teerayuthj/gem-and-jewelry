/**
 * Gold Saving Calculator 2 - Event Handling & Image Loading Module
 * Contains event binding logic and image loading functionality
 */

// ============================================================================
// EVENT HANDLER - Event Binding and UI Interaction Logic
// ============================================================================

window.EventHandler = {
    /**
     * Bind all calculator events
     * @param {Object} calculator - Calculator instance
     */
    bindEvents(calculator) {
        // Amount slider
        const slider = document.getElementById('amountSlider2');
        slider.addEventListener('input', (e) => {
            calculator.monthlyAmount = parseInt(e.target.value);
            document.getElementById('amountDisplay2').textContent = calculator.formatNumber(calculator.monthlyAmount);
            this.updateQuickButtons(calculator);
            this.updateCalculation(calculator);
        });

        // Quick amount buttons (Liquid Glass)
        const quickBtns = document.querySelectorAll('.lg-amount-card .quick-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                calculator.monthlyAmount = parseInt(btn.dataset.amount);
                slider.value = calculator.monthlyAmount;
                document.getElementById('amountDisplay2').textContent = calculator.formatNumber(calculator.monthlyAmount);
                this.updateQuickButtons(calculator);
                this.updateCalculation(calculator);
            });
        });

        // Duration chips (Liquid Glass)
        const durationChips = document.querySelectorAll('.lg-duration-card .duration-chip');
        const customInput = document.getElementById('customMonths2');

        durationChips.forEach(chip => {
            chip.addEventListener('click', () => {
                durationChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                calculator.months = parseInt(chip.dataset.months);
                customInput.value = calculator.months;
                this.updateCalculation(calculator);
            });
        });

        // Custom months input
        customInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 1;
            calculator.months = Math.max(1, Math.min(calculator.maxMonths, value));
            durationChips.forEach(c => {
                c.classList.toggle('active', parseInt(c.dataset.months) === calculator.months);
            });
        });

        customInput.addEventListener('blur', () => {
            // Ensure value doesn't exceed maxMonths
            customInput.value = Math.min(parseInt(customInput.value) || 1, calculator.maxMonths);
            calculator.months = parseInt(customInput.value);
            this.updateCalculation(calculator);
        });

        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                customInput.blur();
            }
        });

        // Optional contact info (stored locally)
        const leadDetails = document.getElementById('leadDetails2');
        if (leadDetails) {
            leadDetails.addEventListener('toggle', () => {
                calculator.localUi.contactOpen = Boolean(leadDetails.open);
                calculator.queuePersistLocalState();
            });
        }

        const nameEl = document.getElementById('leadName2');
        const emailEl = document.getElementById('leadEmail2');
        const phoneCountryEl = document.getElementById('leadPhoneCountry2');
        const phoneEl = document.getElementById('leadPhone2');
        const lineIdEl = document.getElementById('leadLineId2');

        const syncLead = () => {
            if (nameEl) calculator.localLead.name = nameEl.value.trim();
            if (emailEl) calculator.localLead.email = emailEl.value.trim();
            if (phoneCountryEl) calculator.localLead.phoneCountry = phoneCountryEl.value;
            if (phoneEl) calculator.localLead.phone = phoneEl.value.trim();
            if (lineIdEl) calculator.localLead.lineId = lineIdEl.value.trim();
            calculator.queuePersistLocalState();
            this.updateSaveButtonState(calculator);
        };

        [nameEl, emailEl, phoneCountryEl, phoneEl, lineIdEl].filter(Boolean).forEach((input) => {
            input.addEventListener('input', () => syncLead());
            input.addEventListener('change', () => syncLead());
            // Save silently on blur; show status only when user clicks "บันทึก"
            input.addEventListener('blur', () => syncLead());
        });

        const clearBtn = document.getElementById('leadClear2');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (nameEl) nameEl.value = '';
                if (emailEl) emailEl.value = '';
                if (phoneCountryEl) phoneCountryEl.value = '+66';
                if (phoneEl) phoneEl.value = '';
                if (lineIdEl) lineIdEl.value = '';
                calculator.clearLocalLead();
                syncLead();
                this.setLeadStatus('cleared', 'info', (key) => calculator.t(key));
                if (leadDetails) leadDetails.open = false;
                this.updateSaveButtonState(calculator);
            });
        }

        const saveBtn = document.getElementById('leadSave2');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (calculator._saveInProgress) return;
                syncLead();

                const currentHash = calculator.getLeadPayloadHash();
                if (currentHash && currentHash === calculator.localMeta.lastSavedHash) {
                    this.setLeadStatus('noChanges', 'info', (key) => calculator.t(key));
                    this.updateSaveButtonState(calculator);
                    return;
                }

                calculator._saveInProgress = true;
                this.updateSaveButtonState(calculator);

                // Local-only "save" (for future: replace with API call, and keep hash to dedupe requests)
                calculator.localMeta.lastSavedHash = currentHash;
                calculator.localMeta.lastSavedAt = new Date().toISOString();
                calculator.queuePersistLocalState();
                this.setLeadStatus('saved', 'success', (key) => calculator.t(key));

                calculator._saveInProgress = false;
                this.updateSaveButtonState(calculator);
            });
        }

        const copyBtn = document.getElementById('leadCopy2');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const ok = await calculator.copyToClipboard(calculator.getLeadSummaryText());
                if (ok) this.setLeadStatus('copied', 'info', (key) => calculator.t(key));
            });
        }

        this.updateSaveButtonState(calculator);
    },

    /**
     * Update quick amount button states
     * @param {Object} calculator - Calculator instance
     */
    updateQuickButtons(calculator) {
        const quickBtns = document.querySelectorAll('.lg-amount-card .quick-btn');
        quickBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.amount) === calculator.monthlyAmount);
        });
    },

    // Flag to track if this is the first calculation (for milestone notifications)
    isFirstCalculation: true,

    /**
     * Update calculation and UI
     * @param {Object} calculator - Calculator instance
     * @param {boolean} animateNumbers - Whether to animate number changes (default: true)
     */
    updateCalculation(calculator, animateNumbers = true) {
        const total = calculator.monthlyAmount * calculator.months;

        // Update total display (with animation if enabled)
        const totalAmountEl = document.getElementById('totalAmount2');
        if (animateNumbers && typeof window.AnimatedCounter !== 'undefined') {
            // Get current value and parse it correctly for animation
            const currentText = totalAmountEl.textContent || '0';
            const currentTotal = parseFloat(currentText.replace(/,/g, '')) || 0;

            window.AnimatedCounter.animate(totalAmountEl, total, {
                duration: 800,
                format: (num) => calculator.formatNumber(Math.round(num))
            });
        } else {
            totalAmountEl.textContent = calculator.formatNumber(total);
        }

        document.getElementById('formula2').textContent =
            `${calculator.formatNumber(calculator.monthlyAmount)} x ${calculator.months} ${calculator.t('monthUnit')}`;

        // Keep local "plan pill" in sync
        const leadPlanEl = document.getElementById('leadPlanSummary2');
        if (leadPlanEl) {
            leadPlanEl.innerHTML = `${calculator.t('planSummary')}: <strong>${calculator.formatNumber(calculator.monthlyAmount)}</strong> ${calculator.t('baht')}, <strong>${calculator.months}</strong> ${calculator.t('monthUnit')}`;
        }

        // Persist latest plan locally
        calculator.queuePersistLocalState();
        this.updateSaveButtonState(calculator);

        const fallbackPrice = calculator.weightedAvgPrice > 0 ? calculator.weightedAvgPrice : calculator.currentGoldPrice;
        const dcaResult = calculator.calculateDcaGold(
            calculator.monthlyAmount,
            calculator.months,
            fallbackPrice
        );

        const { totalGoldBaht, avgCostPrice, totalWorkingDays, debugInfo } = dcaResult;
        calculator.lastDcaAvgPrice = avgCostPrice;

        // อัปเดตเงินซื้อต่อวันโดยใช้จำนวนวันทำการจริงจาก API
        const avgWorkingDaysPerMonth = totalWorkingDays / calculator.months;
        const avgDailyAmount = avgWorkingDaysPerMonth > 0
            ? Math.round(calculator.monthlyAmount / avgWorkingDaysPerMonth)
            : Math.round(calculator.monthlyAmount / 20); // fallback
        const dailyAmountEl = document.getElementById('dailyAmount2');
        if (dailyAmountEl) {
            dailyAmountEl.textContent = calculator.formatNumber(avgDailyAmount);
        }

        // อัปเดตจำนวนวันทำการทั้งหมด
        const totalDaysEl = document.getElementById('totalDays2');
        if (totalDaysEl) {
            totalDaysEl.textContent = calculator.formatNumber(totalWorkingDays);
        }

        // Check for milestones (skip notification on first load to avoid spam)
        if (typeof window.MilestoneTracker !== 'undefined') {
            window.MilestoneTracker.check(totalGoldBaht, total, this.isFirstCalculation);
            // Reset flag after first calculation
            this.isFirstCalculation = false;
        }

        // Debug: แสดงข้อมูลการซื้อรายวัน
        if (calculator.debugMode) {
            console.log('=== 📊 การซื้อทองรายวัน (จันทร์-ศุกร์) ===');
            console.log(`ออมเดือนละ: ${calculator.formatNumber(calculator.monthlyAmount)} บาท`);
            console.log(`ระยะเวลา: ${calculator.months} เดือน`);
            console.log(`จำนวนวันทำการทั้งหมด: ${totalWorkingDays} วัน`);
            console.log('');
            console.log('📅 รายละเอียดแต่ละเดือน:');

            if (debugInfo && debugInfo.length > 0) {
                debugInfo.forEach((info, index) => {
                    console.log(`  [${index + 1}] ${info.month}: ${info.workingDays} วันทำการ, ซื้อวันละ ${calculator.formatNumber(info.dailyAmount)} บาท → ได้ทอง ${info.goldBought} บาททอง`);
                });
            }

            console.log('');
            console.log(`✅ ต้นทุนเฉลี่ย (DCA): ${calculator.formatNumber(Math.round(avgCostPrice))} บาท/บาททอง`);
            console.log('==========================================');
        }

        // Update gold weight (with animation if enabled)
        const goldWeightEl = document.getElementById('goldWeight2');
        if (animateNumbers && typeof window.AnimatedCounter !== 'undefined') {
            // Get current value from text content and parse it correctly
            const currentText = goldWeightEl.textContent || '0';
            const currentGoldWeight = parseFloat(currentText.replace(/,/g, '')) || 0;

            window.AnimatedCounter.animate(goldWeightEl, totalGoldBaht, {
                duration: 800,
                format: (num) => num.toFixed(4)
            });
        } else {
            goldWeightEl.textContent = totalGoldBaht.toFixed(4);
        }

        // Calculate profit/loss
        const currentGoldValue = totalGoldBaht * calculator.currentGoldPrice;
        const profitAmount = currentGoldValue - total;
        const profitPercent = total > 0 ? (profitAmount / total) * 100 : 0;

        // Update labels with months information
        const currentValueLabel = calculator.currentLang === 'th'
            ? `มูลค่า (ย้อนหลัง ${calculator.months} เดือน)`
            : calculator.currentLang === 'en'
            ? `Value (${calculator.months} months ago)`
            : `价值（${calculator.months}个月前）`;

        const profitLossLabel = calculator.currentLang === 'th'
            ? `กำไร/ขาดทุน (ย้อนหลัง ${calculator.months} เดือน)`
            : calculator.currentLang === 'en'
            ? `Profit/Loss (${calculator.months} months ago)`
            : `盈亏（${calculator.months}个月前）`;

        const currentValueLabelEl = document.getElementById('currentValueLabel2');
        if (currentValueLabelEl) {
            currentValueLabelEl.textContent = currentValueLabel;
        }

        const profitLossLabelEl = document.getElementById('profitLossLabel2');
        if (profitLossLabelEl) {
            profitLossLabelEl.textContent = profitLossLabel;
        }

        // Update current value
        document.getElementById('currentValue2').textContent =
            `${calculator.formatNumber(Math.round(currentGoldValue))} ${calculator.t('baht')}`;

        // Update profit/loss display (Liquid Glass)
        const profitResult = document.getElementById('profitResult2');
        const profitCard = document.getElementById('profitCard2');

        if (profitAmount > 0) {
            profitCard.classList.add('profit');
            profitCard.classList.remove('loss');
            profitResult.innerHTML = `
                <div class="profit-amount">+${calculator.formatNumber(Math.round(profitAmount))} ${calculator.t('baht')}</div>
                <div class="profit-percent">+${profitPercent.toFixed(2)}%</div>
            `;
        } else if (profitAmount < 0) {
            profitCard.classList.add('loss');
            profitCard.classList.remove('profit');
            profitResult.innerHTML = `
                <div class="profit-amount">${calculator.formatNumber(Math.round(profitAmount))} ${calculator.t('baht')}</div>
                <div class="profit-percent">${profitPercent.toFixed(2)}%</div>
            `;
        } else {
            profitCard.classList.remove('profit', 'loss');
            profitResult.innerHTML = `
                <div class="profit-amount">0 ${calculator.t('baht')}</div>
                <div class="profit-percent">0%</div>
            `;
        }

        // Update products
        const estimatePrice = calculator.currentGoldPrice > 0 ? calculator.currentGoldPrice : fallbackPrice;
        calculator.renderProducts({ goldBaht: totalGoldBaht, estimatePrice });

        // Debug summary
        if (calculator.debugMode) {
            console.log(`--- 📈 สรุปผลการออม ---`);
            console.log(`ยอดรวม: ${calculator.formatNumber(total)} บาท`);
            console.log(`ทองสะสม: ${totalGoldBaht.toFixed(4)} บาททอง`);
            console.log(`มูลค่าปัจจุบัน: ${calculator.formatNumber(Math.round(currentGoldValue))} บาท`);
            console.log(`กำไร/ขาดทุน: ${calculator.formatNumber(Math.round(profitAmount))} บาท (${profitPercent.toFixed(2)}%)`);
        }
    },

    /**
     * Show lead status message (using toast notifications if available)
     * @param {string} messageKey - Translation key for message
     * @param {string} variant - Status variant ('success' or 'info')
     * @param {Function} t - Translation function
     */
    setLeadStatus(messageKey, variant = 'success', t) {
        // Use toast notifications if available
        if (typeof window.ToastNotifications !== 'undefined') {
            const message = t(messageKey);
            if (variant === 'success') {
                window.ToastNotifications.success(message);
            } else {
                window.ToastNotifications.info(message);
            }
        }

        // Also update inline status as fallback
        const el = document.getElementById('leadStatus2');
        if (!el) return;
        el.classList.remove('success', 'info');
        el.classList.add(variant);
        el.textContent = t(messageKey);
        el.classList.add('show');
        window.clearTimeout(el._t);
        el._t = window.setTimeout(() => {
            el.classList.remove('show');
        }, 3000);
    },

    /**
     * Update save button state
     * @param {Object} calculator - Calculator instance
     */
    updateSaveButtonState(calculator) {
        const saveBtn = document.getElementById('leadSave2');
        if (!saveBtn) return;
        const currentHash = calculator.getLeadPayloadHash();
        const isUnchanged = currentHash && currentHash === calculator.localMeta.lastSavedHash;
        const disabled = calculator._saveInProgress || isUnchanged;
        saveBtn.disabled = disabled;
        saveBtn.classList.toggle('is-disabled', disabled);
    },

    /**
     * Bind product grid click events
     * @param {HTMLElement} gridEl - Grid element
     * @param {Map} productsByKey - Products map by key
     * @param {Object} callbacks - Callback functions
     * @param {Function} callbacks.getCurrentLang - Get current language
     * @param {Function} callbacks.openImageLightbox - Open image lightbox
     */
    bindProductsGridEvents(gridEl, productsByKey, callbacks) {
        if (!gridEl) return;

        if (gridEl._productsGridClickHandler) {
            gridEl.removeEventListener('click', gridEl._productsGridClickHandler);
        }
        if (gridEl._productsGridKeyHandler) {
            gridEl.removeEventListener('keydown', gridEl._productsGridKeyHandler);
        }

        gridEl._productsGridClickHandler = (e) => {
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && gridEl.contains(previewBtn)) {
                const affEl = previewBtn.closest('[data-affordable]');
                const isLocked = affEl && affEl.dataset.affordable !== '1';
                if (isLocked) return; // let card click open locked modal preview instead

                e.preventDefault();
                e.stopPropagation();

                const key = previewBtn.dataset.imagesKey;
                const product = key ? productsByKey?.get(key) : null;
                const images = Array.isArray(product?.images) && product.images.length > 0
                    ? product.images
                    : product?.image
                        ? [product.image]
                        : [];
                if (images.length === 0) return;

                const currentLang = callbacks.getCurrentLang();
                const title = product
                    ? (currentLang === 'en' ? product.nameEn : product.name)
                    : '';
                const price = product?.price
                    ? `${GoldSavingUtils.formatNumber(product.price)} บาท`
                    : '';
                callbacks.openImageLightbox({ title, price, images, startIndex: 0 });
                return;
            }

            const clickableHero = e.target.closest('.hero-card.is-clickable');
            if (clickableHero && gridEl.contains(clickableHero)) {
                const link = clickableHero.dataset.link;
                if (link) window.open(link, '_blank');
            }
        };

        gridEl._productsGridKeyHandler = (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const previewBtn = e.target.closest('.js-img-preview');
            if (previewBtn && gridEl.contains(previewBtn)) {
                const affEl = previewBtn.closest('[data-affordable]');
                const isLocked = affEl && affEl.dataset.affordable !== '1';
                if (isLocked) return;
                e.preventDefault();
                previewBtn.click();
                return;
            }
            const clickableHero = e.target.closest('.hero-card.is-clickable');
            if (clickableHero && gridEl.contains(clickableHero)) {
                e.preventDefault();
                const link = clickableHero.dataset.link;
                if (link) window.open(link, '_blank');
            }
        };

        gridEl.addEventListener('click', gridEl._productsGridClickHandler);
        gridEl.addEventListener('keydown', gridEl._productsGridKeyHandler);
    },

    /**
     * Bind modal events
     * @param {Object} callbacks - Callback functions
     * @param {Function} callbacks.openVariantModal - Open variant modal callback
     * @param {Function} callbacks.getVariantCount - Get variant count callback
     * @param {Function} callbacks.getVariantsByWeight - Get variants by weight callback
     */
    bindModalEvents(callbacks) {
        // Hero button - เลือกลาย (locked -> preview only)
        const selectVariantBtns = document.querySelectorAll('.select-variant');
        selectVariantBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const weight = btn.dataset.weight;
                const locked = btn.dataset.affordable !== '1';
                callbacks.openVariantModal(weight, { locked });
            });
        });

        // Supporting cards - tap to open modal (ignore image preview clicks)
        const supportingCards = document.querySelectorAll('.supporting-card');
        supportingCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.js-img-preview')) return;
                const weight = card.dataset.weight;
                const variantCount = callbacks.getVariantCount(weight);
                if (variantCount > 1) {
                    const locked = card.dataset.affordable !== '1';
                    callbacks.openVariantModal(weight, { locked });
                } else {
                    // ถ้ามีแค่ตัวเดียว ให้เปิด link โดยตรง
                    if (card.dataset.affordable === '1') {
                        const variants = callbacks.getVariantsByWeight(weight);
                        if (variants.length > 0) {
                            window.open(variants[0].link, '_blank');
                        }
                    }
                }
            });
        });
    }
};

// ============================================================================
// IMAGE LOADER - Lazy Loading and Lightbox Functionality
// ============================================================================

window.ImageLoader = {
    /**
     * Disconnect lazy image observer
     * @param {Object} calculator - Calculator instance with lazyImageObserver
     */
    disconnectLazyImageObserver(calculator) {
        if (!calculator.lazyImageObserver) return;
        calculator.lazyImageObserver.disconnect();
        calculator.lazyImageObserver = null;
    },

    /**
     * Load a single lazy image
     * @param {HTMLImageElement} img - Image element to load
     */
    loadLazyImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.classList.remove('is-loaded');
        img.addEventListener(
            'load',
            () => {
                img.classList.add('is-loaded');
            },
            { once: true }
        );

        img.setAttribute('src', src);
        img.removeAttribute('data-src');
    },

    /**
     * Initialize lazy loading for grid images
     * @param {HTMLElement} gridEl - Grid element containing images
     * @param {Object} calculator - Calculator instance
     */
    initGridLazyImages(gridEl, calculator) {
        this.disconnectLazyImageObserver(calculator);
        if (!gridEl) return;

        const imgs = Array.from(gridEl.querySelectorAll('img[data-src]'));
        if (imgs.length === 0) return;

        if (typeof IntersectionObserver === 'undefined') {
            imgs.forEach(img => this.loadLazyImage(img));
            return;
        }

        calculator.lazyImageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    calculator.lazyImageObserver?.unobserve(img);
                    this.loadLazyImage(img);
                });
            },
            { root: null, rootMargin: '250px 0px', threshold: 0.01 }
        );

        imgs.forEach(img => calculator.lazyImageObserver.observe(img));
    },

    /**
     * Open image lightbox modal - Enhanced Edition
     * @param {Object} options - Lightbox options
     * @param {string} options.title - Image title
     * @param {string} options.price - Price (optional)
     * @param {Array<string>} options.images - Array of image URLs
     * @param {number} options.startIndex - Starting index
     * @param {Function} t - Translation function
     */
    openImageLightbox({ title, price, images, startIndex = 0 }, t) {
        if (!Array.isArray(images) || images.length === 0) return;

        // Remove existing modal
        const existing = document.querySelector('.image-viewer-modal');
        if (existing) {
            try {
                if (typeof existing._cleanup === 'function') existing._cleanup();
            } catch (_) {
                // ignore
            }
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'image-viewer-modal enhanced-modal';

        const safeIndex = Math.max(0, Math.min(images.length - 1, startIndex));
        let index = safeIndex;
        let isZoomed = false;

        // Render navigation arrows for multiple images
        const renderNavigation = () => {
            if (images.length <= 1) return '';
            return `
                <button class="image-viewer-nav prev" aria-label="Previous">‹</button>
                <button class="image-viewer-nav next" aria-label="Next">›</button>
            `;
        };

        // Render dots for multiple images
        const renderDots = () => {
            if (images.length <= 1) return '';
            return `
                <div class="image-viewer-dots">
                    ${images.map((_, i) => `
                        <button type="button" class="image-viewer-dot ${i === index ? 'active' : ''}" data-index="${i}" aria-label="Image ${i + 1}"></button>
                    `).join('')}
                </div>
            `;
        };

        modal.innerHTML = `
            <div class="image-viewer-backdrop"></div>
            <div class="image-viewer-content">
                ${renderNavigation()}
                <div class="image-viewer-image-wrapper">
                    <img class="image-viewer-image" src="${images[index]}" alt="${title || 'Image'}"
                         onerror="this.src='https://via.placeholder.com/800x600/045b96/ffffff?text=Gold+Bar'">
                </div>
                <button class="image-viewer-close" aria-label="Close">✕</button>
                ${renderDots()}
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const imgEl = modal.querySelector('.image-viewer-image');
        const prevBtn = modal.querySelector('.image-viewer-nav.prev');
        const nextBtn = modal.querySelector('.image-viewer-nav.next');
        const dotsEl = modal.querySelector('.image-viewer-dots');
        const contentEl = modal.querySelector('.image-viewer-content');

        const preloadNeighbor = () => {
            if (images.length <= 1) return;
            const next = images[(index + 1) % images.length];
            const prev = images[(index - 1 + images.length) % images.length];
            [next, prev].forEach(src => {
                const i = new Image();
                i.src = src;
            });
        };

        const updateDots = () => {
            if (!dotsEl) return;
            dotsEl.querySelectorAll('.image-viewer-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        const update = () => {
            imgEl.src = images[index];
            updateDots();
            preloadNeighbor();

            // Reset zoom when changing images
            if (isZoomed) {
                isZoomed = false;
                imgEl.classList.remove('zoomed');
                modal.classList.remove('zoomed');
            }
        };

        const go = (nextIndex) => {
            index = (nextIndex + images.length) % images.length;
            update();
        };

        const close = () => {
            if (typeof modal._cleanup === 'function') modal._cleanup();
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.style.overflow = '';
                modal.remove();
            }, 400);
        };

        // Zoom functionality
        imgEl.addEventListener('click', (e) => {
            e.stopPropagation();
            isZoomed = !isZoomed;
            imgEl.classList.toggle('zoomed', isZoomed);
            modal.classList.toggle('zoomed', isZoomed);
        });

        // Event handlers
        modal.querySelector('.image-viewer-close').addEventListener('click', close);
        modal.querySelector('.image-viewer-backdrop').addEventListener('click', close);

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); go(index - 1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); go(index + 1); });

        if (dotsEl) {
            dotsEl.addEventListener('click', (e) => {
                const dot = e.target.closest('.image-viewer-dot');
                if (!dot) return;
                const i = parseInt(dot.dataset.index, 10);
                if (Number.isFinite(i)) go(i);
            });
        }

        // Keyboard navigation
        const keyHandler = (e) => {
            if (e.key === 'Escape') return close();
            if (images.length <= 1) return;
            if (e.key === 'ArrowLeft') return go(index - 1);
            if (e.key === 'ArrowRight') return go(index + 1);
        };
        document.addEventListener('keydown', keyHandler);

        // Touch swipe support
        let touchStartX = null;
        const touchStart = (e) => {
            if (isZoomed) return; // Disable swipe when zoomed
            touchStartX = e.touches?.[0]?.clientX ?? null;
        };
        const touchEnd = (e) => {
            if (isZoomed) return;
            const endX = e.changedTouches?.[0]?.clientX ?? null;
            if (touchStartX == null || endX == null || images.length <= 1) return;
            const dx = endX - touchStartX;
            if (Math.abs(dx) < 40) return;
            go(dx > 0 ? index - 1 : index + 1);
            touchStartX = null;
        };

        contentEl.addEventListener('touchstart', touchStart, { passive: true });
        contentEl.addEventListener('touchend', touchEnd, { passive: true });

        modal._cleanup = () => {
            document.removeEventListener('keydown', keyHandler);
        };

        // Trigger animation
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        preloadNeighbor();
    }
};
