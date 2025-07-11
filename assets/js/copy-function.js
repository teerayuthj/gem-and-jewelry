// Copy discount code function with mobile support
function copyDiscountCode() {
    const copyText = document.getElementById('discountCode');
    // Get current discount code value (could be different based on language)
    const textValue = copyText.value || (typeof i18n !== 'undefined' ? i18n.getText('offer.discountCode') : 'AUS100TH');
    
    // Prevent multiple clicks
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn.disabled) return;
    
    // Modern clipboard API (preferred method)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textValue)
            .then(() => {
                showCopySuccess();
            })
            .catch(() => {
                // Fallback if clipboard API fails
                fallbackCopyMethod(copyText, textValue);
            });
    } else {
        // Fallback for older browsers or unsupported environments
        fallbackCopyMethod(copyText, textValue);
    }
    
    function fallbackCopyMethod(element, value) {
        // Create a temporary textarea for mobile compatibility
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = value;
        tempTextarea.style.position = 'fixed';
        tempTextarea.style.left = '-9999px';
        tempTextarea.style.top = '-9999px';
        tempTextarea.style.opacity = '0';
        document.body.appendChild(tempTextarea);
        
        // Focus and select for mobile
        tempTextarea.focus();
        tempTextarea.select();
        
        // For iOS Safari
        if (navigator.userAgent.match(/ipad|iphone/i)) {
            tempTextarea.contentEditable = true;
            tempTextarea.readOnly = false;
            const range = document.createRange();
            range.selectNodeContents(tempTextarea);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            tempTextarea.setSelectionRange(0, 999999);
        }
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showCopyError();
            }
        } catch (err) {
            console.error('Copy failed:', err);
            showCopyError();
        }
        
        // Clean up
        document.body.removeChild(tempTextarea);
    }
    
    function showCopySuccess() {
        const copyBtn = document.getElementById('copyBtn');
        const copyIcon = document.getElementById('copyIcon');
        const checkIcon = document.getElementById('checkIcon');
        const btnText = document.getElementById('btnText');
        
        // Track code usage if discount manager is available
        if (typeof discountManager !== 'undefined') {
            const currentLang = (typeof i18n !== 'undefined') ? i18n.getCurrentLanguage() : 'th';
            discountManager.trackCodeUsage(textValue, currentLang);
        }
        
        // Switch to success state
        copyBtn.classList.add('copied');
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
        btnText.textContent = (typeof i18n !== 'undefined') ? i18n.getText('offer.copiedButton') : 'คัดลอกแล้ว!';
        
        // Disable button temporarily
        copyBtn.disabled = true;
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
            btnText.textContent = (typeof i18n !== 'undefined') ? i18n.getText('offer.copyButton') : 'คัดลอก';
            copyBtn.disabled = false;
        }, 2000);
    }
    
    function showCopyError() {
        // Show error message or fallback
        const errorMsg = (typeof i18n !== 'undefined') ? 
            i18n.getText('offer.copyError') || 'คัดลอกโค้ด: ' + textValue :
            'คัดลอกโค้ด: ' + textValue;
        alert(errorMsg);
        
        // Still show success state for user feedback
        showCopySuccess();
    }
}