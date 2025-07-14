// Copy discount code function
function copyDiscountCode() {
    const codeInput = document.getElementById('discountCode');
    const copyBtn = document.getElementById('copyBtn');
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');
    const btnText = document.getElementById('btnText');
    
    if (codeInput) {
        codeInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        btnText.textContent = window.unifiedLanguageManager?.currentLang === 'th' ? 'คัดลอกแล้ว!' : 'Copied!';
        
        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
            btnText.textContent = window.unifiedLanguageManager?.currentLang === 'th' ? 'คัดลอก' : 'Copy';
        }, 2000);
    }
}