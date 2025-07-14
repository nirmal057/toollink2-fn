// Simple test script to debug notification button
console.log('Debug script loaded');

// Function to test notification button
function testNotificationButton() {
    console.log('Testing notification button...');
    
    // Find the notification button
    const button = document.querySelector('[data-notification-button="true"]');
    console.log('Found notification button:', button);
    
    if (button) {
        console.log('Button attributes:', {
            type: button.getAttribute('type'),
            onclick: button.onclick,
            disabled: button.disabled,
            style: button.style.cssText,
            classes: button.className
        });
        
        // Try clicking the button
        console.log('Simulating click...');
        button.click();
        
        // Check if dropdown appeared
        setTimeout(() => {
            const dropdown = document.querySelector('.notifications-container');
            console.log('Dropdown after click:', dropdown);
            
            if (dropdown) {
                console.log('Dropdown found! Style:', dropdown.style.cssText);
            } else {
                console.log('No dropdown found after click');
            }
        }, 100);
    } else {
        console.log('Notification button not found');
    }
}

// Function to check React state
function checkReactState() {
    console.log('Checking React component state...');
    
    // Look for React fiber node
    const button = document.querySelector('[data-notification-button="true"]');
    if (button) {
        const reactFiber = Object.keys(button).find(key => key.startsWith('__reactFiber'));
        if (reactFiber) {
            console.log('React fiber found, checking component...');
            // This is a bit hacky, but can help debug React state
        }
    }
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testNotificationButton, 1000);
    });
} else {
    setTimeout(testNotificationButton, 1000);
}

// Make functions available globally for manual testing
window.testNotificationButton = testNotificationButton;
window.checkReactState = checkReactState;

console.log('Debug functions available: testNotificationButton(), checkReactState()');
