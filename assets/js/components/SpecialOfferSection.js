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
            <div class="hero">
                <div class="hero-content text-center w-full max-w-lg mx-auto">
                    <div class="card text-primary-content">
                        <div class="card-body">
                            <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-2" data-i18n="offer.header">
                                🎉 ข้อเสนอพิเศษวันนี้เท่านั้น! 🎉
                            </h1>
                            
                            <img src="${window.GitHubAssets ? window.GitHubAssets.getImagePath('http://www.ausiris.co.th/content/dam/ausirisgold/icon/offer-02.png') : 'http://www.ausiris.co.th/content/dam/ausirisgold/icon/offer-02.png'}" alt="Order today and get 100 THB discount" class="w-full max-w-sm h-auto rounded-lg mx-auto mb-3">
                            
                            <div id="discountCodeCard"></div>
                            
                            <!-- Promotion Period -->
                            <div class="stats bg-gradient-to-br from-yellow-50 to-amber-100 text-gray-800 shadow-lg mb-4">
                                <div class="stat">
                                    <div class="stat-title text-gray-500" data-i18n="offer.promotionPeriod">ระยะเวลาโปรโมชั่น</div>
                                    <div class="stat-value text-lg">
                                        <span id="startDate">30/06/2025</span> - <span id="endDate">28/07/2025</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Countdown Timer -->
                            <div class="mb-4">
                                <h3 class="text-lg text-gray-800 md:text-xl lg:text-2xl font-bold mb-2" id="countdownLabel" data-i18n="countdown.label">
                                    ⏳ เหลือเวลาอีก:
                                </h3>
                                
                                <!-- Enhanced Countdown with Urgency Effects -->
                                <div class="countdown-container">
                                    <div class="grid grid-flow-col gap-3 md:gap-4 lg:gap-5 text-center auto-cols-max justify-center">
                                        <div id="days-container" class="countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-4xl lg:text-5xl">
                                                <span id="countdown-days" style="--value:15;" aria-live="polite">15</span>
                                            </span>
                                            <span class="text-sm md:text-sm mt-1 font-semibold" data-i18n="countdown.days">วัน</span>
                                        </div>
                                        <div id="hours-container" class="countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-4xl lg:text-5xl">
                                                <span id="countdown-hours" style="--value:10;" aria-live="polite">10</span>
                                            </span>
                                            <span class="text-sm md:text-sm mt-1 font-semibold" data-i18n="countdown.hours">ชั่วโมง</span>
                                        </div>
                                        <div id="minutes-container" class="countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-4xl lg:text-5xl">
                                                <span id="countdown-minutes" style="--value:24;" aria-live="polite">24</span>
                                            </span>
                                            <span class="text-sm md:text-sm mt-1 font-semibold" data-i18n="countdown.minutes">นาที</span>
                                        </div>
                                        <div id="seconds-container" class="countdown-item flex flex-col p-3 md:p-3 lg:p-4 rounded-box text-white font-bold shadow-lg">
                                            <span class="countdown font-mono text-4xl md:text-4xl lg:text-5xl">
                                                <span id="countdown-seconds" style="--value:59;" aria-live="polite">59</span>
                                            </span>
                                            <span class="text-sm md:text-sm mt-1 font-semibold" data-i18n="countdown.seconds">วินาที</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Action Button -->
                            <a href="https://express.ausiris.co.th/" target="_blank" rel="noopener noreferrer" 
                               id="mainActionBtn" class="btn btn-accent text-white" data-i18n="buttons.useDiscount">
                                🛒 ใช้ส่วนลดตอนนี้เลย
                            </a>
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