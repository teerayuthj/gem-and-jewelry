class CountdownTimer {
    constructor() {
        this.targetDate = new Date('2025-07-28T23:59:59');
        this.init();
    }

    init() {
        this.render();
        // รอให้ DOM render เสร็จแล้วค่อยเริ่ม countdown
        setTimeout(() => {
            this.startCountdown();
        }, 50);
    }

    render() {
        const container = document.getElementById('countdownTimer');
        if (!container) return;

        container.innerHTML = `
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
        `;
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date();
            const diff = this.targetDate - now;

            if (diff <= 0) {
                this.displayExpired();
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            this.updateDisplay('countdown-days', days);
            this.updateDisplay('countdown-hours', hours);
            this.updateDisplay('countdown-minutes', minutes);
            this.updateDisplay('countdown-seconds', seconds);
        };

        // เรียกใช้ทันทีเพื่อแสดงค่าเริ่มต้น
        updateCountdown();
        this.interval = setInterval(updateCountdown, 1000);
    }

    updateDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.setProperty('--value', value);
            element.textContent = value;
        }
    }


    displayExpired() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        const container = document.getElementById('countdownTimer');
        if (container) {
            container.innerHTML = `
                <div class="mb-4 text-center">
                    <h3 class="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">
                        ⏰ โปรโมชั่นหมดอายุแล้ว
                    </h3>
                </div>
            `;
        }
    }
}