// Test script to verify modal functionality on saving2.html
// This script should be run in the browser console on the saving2.html page

console.log('🔍 Starting modal functionality test...');

// Wait for the calculator to be fully loaded
const waitForCalculator = () => {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            if (window.goldSavingCalc2 && typeof goldSavingCalc2.openVariantModal === 'function') {
                clearInterval(checkInterval);
                console.log('✅ Calculator instance found and ready');
                resolve();
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Calculator not loaded after 10 seconds'));
        }, 10000);
    });
};

// Test the modal functionality
const testModalFunctionality = async () => {
    try {
        await waitForCalculator();
        
        // Test 1: Check if products grid exists
        const grid = document.getElementById('productsGrid2');
        if (!grid) {
            console.error('❌ Products grid not found');
            return;
        }
        console.log('✅ Products grid found');
        
        // Test 2: Check if there are any hero buttons or supporting cards
        const heroButtons = grid.querySelectorAll('.select-variant');
        const supportingCards = grid.querySelectorAll('.supporting-card');
        
        console.log(`📊 Found ${heroButtons.length} hero buttons and ${supportingCards.length} supporting cards`);
        
        // Test 3: Try to manually trigger a modal
        if (heroButtons.length > 0) {
            const firstHeroButton = heroButtons[0];
            const weight = firstHeroButton.dataset.weight;
            const locked = firstHeroButton.dataset.affordable !== '1';
            
            console.log(`🎯 Testing modal for weight: ${weight}, locked: ${locked}`);
            
            // Try to open the modal programmatically
            try {
                goldSavingCalc2.openVariantModal(weight, { locked: locked });
                console.log('✅ Modal opened successfully!');
            } catch (error) {
                console.error('❌ Error opening modal:', error);
            }
        } else if (supportingCards.length > 0) {
            const firstCard = supportingCards[0];
            const weight = firstCard.dataset.weight;
            const locked = firstCard.dataset.affordable !== '1';
            
            console.log(`🎯 Testing modal for supporting card weight: ${weight}, locked: ${locked}`);
            
            // Try to open the modal programmatically
            try {
                goldSavingCalc2.openVariantModal(weight, { locked: locked });
                console.log('✅ Modal opened successfully!');
            } catch (error) {
                console.error('❌ Error opening modal:', error);
            }
        } else {
            console.warn('⚠️ No hero buttons or supporting cards found to test');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// Run the test
testModalFunctionality();