class GoldPriceSection {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const container = document.getElementById('goldPriceSection');
        if (!container) return;

        container.innerHTML = `
            <!-- Quick Discount Code Button -->
            <div class="text-center py-8">
                <button onclick="scrollToSpecialOffer()" class="btn btn-lg" style="background: linear-gradient(135deg, #FFD700, #FFA500); border: none; color: #333; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3); transition: all 0.3s ease; border-radius: 50px; padding: 12px 24px;">
                    <span class="text-lg font-bold" data-lang="th">
                        🎫 เก็บโค้ดส่วนลดคลิกที่นี่
                    </span>
                    <span class="text-lg font-bold hidden" data-lang="en">
                        🎫 Get Discount Code Here
                    </span>
                </button>
            </div>
            
            <!-- Real-time Price Header -->
            <div class="text-center pb-4">
                <h2 class="text-2xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2" data-lang="th">
                    ราคาทองคำและแท่งเงิน Real Time ออสสิริส
                </h2>
                <h2 class="text-2xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 hidden" data-lang="en">
                    Real-time Gold and Silver Prices<br>by Ausiris
                </h2>
            </div>
            
            <div class="container mx-auto">
                <div id="goldPriceContainer" class="gold-price-container">
                    <!-- Gold price component will be rendered here -->
                </div>
            </div>
        `;
    }

    bindEvents() {
        // scrollToSpecialOffer function is already defined globally
        // No additional binding needed for now
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GoldPriceSection();
});