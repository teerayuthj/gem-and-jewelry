class DiscountCodeCard {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const container = document.getElementById('discountCodeCard');
        if (!container) return;

        container.innerHTML = `
            <div class="card bg-gradient-to-br from-yellow-50 to-amber-100 text-gray-800 shadow-lg mb-4">
                <div class="card-body">
                    <h3 class="text-lg md:text-xl lg:text-2xl font-bold text-accent mb-3" data-i18n="offer.codeTitle">
                        🏷️ คัดลอกโค้ดส่วนลด
                    </h3>
                    
                    <div class="join w-full max-w-md mx-auto">
                        <input id="discountCode" type="text" value="AUS50THB" readonly 
                               class="input input-bordered input-accent join-item flex-1 text-center font-bold" 
                               data-i18n-value="offer.discountCode" />
                        <button id="copyBtn" class="btn btn-accent join-item">
                            <svg id="copyIcon" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <svg id="checkIcon" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span id="btnText" data-i18n="offer.copyButton">คัดลอก</span>
                        </button>
                    </div>
                    
                    <p class="text-warning font-semibold mt-2">
                        <span data-i18n="offer.codeExpiry">⏰ โค้ดหมดอายุ:</span> <span id="expiryDate">28/07/2025</span>
                    </p>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyDiscountCode());
        }
    }

    copyDiscountCode() {
        const discountCode = document.getElementById('discountCode');
        const copyIcon = document.getElementById('copyIcon');
        const checkIcon = document.getElementById('checkIcon');
        const btnText = document.getElementById('btnText');
        
        if (discountCode) {
            discountCode.select();
            document.execCommand('copy');
            
            // Show success state
            copyIcon.classList.add('hidden');
            checkIcon.classList.remove('hidden');
            btnText.textContent = 'คัดลอกแล้ว';
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                checkIcon.classList.add('hidden');
                btnText.textContent = 'คัดลอก';
            }, 2000);
        }
    }
}