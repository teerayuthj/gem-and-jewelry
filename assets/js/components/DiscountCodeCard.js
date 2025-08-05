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
                    
                    <div style="display: flex !important; max-width: 350px !important; margin: 0 auto !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;">
                        <input id="discountCode" type="text" value="AUBGJF50TH" readonly 
                               data-i18n-value="offer.discountCode"
                               style="
                                   flex: 1 !important;
                                   border: 2px solid #14b8a6 !important;
                                   border-right: none !important;
                                   border-radius: 8px 0 0 8px !important;
                                   padding: 4px 6px !important;
                                   text-align: center !important;
                                   font-weight: bold !important;
                                   font-size: 1.5rem !important;
                                   background: white !important;
                                   color: #0f172a !important;
                                   outline: none !important;
                                   min-width: 0 !important;
                               " />
                        <button id="copyBtn" 
                                style="
                                    background: #14b8a6 !important;
                                    color: white !important;
                                    border: 2px solid #14b8a6 !important;
                                    border-radius: 0 8px 8px 0 !important;
                                    padding: 14px 18px !important;
                                    font-weight: bold !important;
                                    font-size: 1.1rem !important;
                                    cursor: pointer !important;
                                    display: flex !important;
                                    align-items: center !important;
                                    gap: 6px !important;
                                    min-width: 100px !important;
                                    justify-content: center !important;
                                    transition: all 0.2s ease !important;
                                "
                                onmouseover="this.style.background='#0f766e'"
                                onmouseout="this.style.background='#14b8a6'">
                            <svg id="copyIcon" style="width: 20px !important; height: 20px !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <svg id="checkIcon" style="width: 20px !important; height: 20px !important; display: none !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span id="btnText" data-i18n="offer.copyButton">คัดลอก</span>
                        </button>
                    </div>
                    
                    <p class="text-warning font-semibold mt-2">
                        <span data-i18n="offer.codeExpiry">⏰ โค้ดหมดอายุ:</span> <span id="expiryDate">13/09/2025</span>
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
            copyIcon.style.display = 'none';
            checkIcon.style.display = 'block';
            btnText.textContent = 'คัดลอกแล้ว';
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyIcon.style.display = 'block';
                checkIcon.style.display = 'none';
                btnText.textContent = 'คัดลอก';
            }, 2000);
        }
    }
}