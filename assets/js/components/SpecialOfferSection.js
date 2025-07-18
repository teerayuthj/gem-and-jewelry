class SpecialOfferSection {
    constructor() {
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const container = document.getElementById('specialOfferSection');
        if (!container) return;

        container.innerHTML = `
            <div class="hero" style="min-height: 100vh; padding: 4rem 1rem;">
                <div class="hero-content text-center w-full max-w-4xl mx-auto">
                    <div class="card text-primary-content" style="width: 100%;">
                        <div class="card-body" style="padding: 3rem 2rem;">
                            <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4" 
                                style="text-align: center !important; margin: 0 auto !important; width: 100% !important; display: block !important;" 
                                data-i18n="offer.header">
                                🎉 Today Only Special Offer! 🎉
                            </h1>
                            
                            <img src="http://www.ausiris.co.th/content/dam/ausirisgold/icon/offer-02.png" alt="Order today and get 100 THB discount" class="w-full max-w-md h-auto rounded-lg mx-auto mb-6">
                            
                            <div id="discountCodeCard"></div>
                            
                            <!-- Promotion Period -->
                            <div class="stats bg-gradient-to-br from-yellow-50 to-amber-100 text-gray-800 shadow-lg mb-6" style="padding: 2rem;">
                                <div class="stat">
                                    <div class="stat-title text-gray-500 text-lg" data-i18n="offer.promotionPeriod">Promotion Period</div>
                                    <div class="stat-value text-xl md:text-2xl">
                                        <span id="startDate">30/06/2025</span> - <span id="endDate">28/07/2025</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Countdown Timer -->
                            <div class="mb-8">
                                <h3 class="text-xl text-gray-800 md:text-2xl lg:text-3xl font-bold mb-4" id="countdownLabel" data-i18n="countdown.label">
                                    ⏳ Time remaining:
                                </h3>
                                
                                <!-- Enhanced Countdown with Urgency Effects -->
                                <div class="countdown-container">
                                    <div class="grid grid-flow-col gap-4 md:gap-6 lg:gap-8 text-center auto-cols-max justify-center">
                                        <div id="days-container" class="countdown-item flex flex-col p-6 md:p-8 lg:p-10 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-5xl lg:text-6xl">
                                                <span id="countdown-days" style="--value:12;" aria-live="polite">12</span>
                                            </span>
                                            <span class="text-sm md:text-base mt-2 font-semibold" data-i18n="countdown.days">Days</span>
                                        </div>
                                        <div id="hours-container" class="countdown-item flex flex-col p-6 md:p-8 lg:p-10 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-5xl lg:text-6xl">
                                                <span id="countdown-hours" style="--value:10;" aria-live="polite">10</span>
                                            </span>
                                            <span class="text-sm md:text-base mt-2 font-semibold" data-i18n="countdown.hours">Hours</span>
                                        </div>
                                        <div id="minutes-container" class="countdown-item flex flex-col p-6 md:p-8 lg:p-10 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-5xl lg:text-6xl">
                                                <span id="countdown-minutes" style="--value:24;" aria-live="polite">24</span>
                                            </span>
                                            <span class="text-sm md:text-base mt-2 font-semibold" data-i18n="countdown.minutes">Minutes</span>
                                        </div>
                                        <div id="seconds-container" class="countdown-item flex flex-col p-6 md:p-8 lg:p-10 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-5xl lg:text-6xl">
                                                <span id="countdown-seconds" style="--value:42;" aria-live="polite">42</span>
                                            </span>
                                            <span class="text-sm md:text-base mt-2 font-semibold" data-i18n="countdown.seconds">Seconds</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Action Button -->
                            <div class="flex justify-center w-full">
                                <a href="https://express.ausiris.co.th/" target="_blank" rel="noopener noreferrer" 
                                   id="mainActionBtn" class="text-white font-bold transition-all duration-300" 
                                   style="
                                       background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%) !important;
                                       padding: 1.5rem 3.5rem !important;
                                       border: none !important;
                                       border-radius: 30px !important;
                                       text-decoration: none !important;
                                       display: inline-block !important;
                                       font-size: 1.375rem !important;
                                       line-height: 1.4 !important;
                                       min-width: 350px !important;
                                       text-align: center !important;
                                       box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
                                       margin: 1.5rem auto !important;
                                   " 
                                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(255, 107, 53, 0.6)';"
                                   onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 15px rgba(255, 107, 53, 0.4)';"
                                   data-i18n="buttons.getOffer">
                                    🛒 Get This Special Offer Now!
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize sub-components with proper timing
        setTimeout(() => {
            new DiscountCodeCard();
            
            // เรียกใช้ CountdownTimer หลังจาก render เสร็จ
            if (typeof CountdownTimer !== 'undefined') {
                const promotionConfig = {
                    startDate: "30/06/2025",
                    endDate: "28/07/2025",
                    discountCode: "AUS50THB"
                };
                new CountdownTimer(promotionConfig);
            }
        }, 200);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SpecialOfferSection();
});