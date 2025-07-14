/**
 * Utility functions for handling logout operations
 */

/**
 * Force logout and redirect to login page
 * This is a failsafe function that ensures the user is logged out
 * even if other logout mechanisms fail
 */
export const forceLogoutAndRedirect = () => {
  try {
    console.log('ForceLogoutAndRedirect: Forcing logout...');
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    console.log('ForceLogoutAndRedirect: Storage cleared, redirecting...');
    
    // Force redirect
    window.location.replace('/auth/login');
  } catch (error) {
    console.error('ForceLogoutAndRedirect: Error during force logout:', error);
    // Even if there's an error, try to redirect
    window.location.href = '/auth/login';
  }
};

/**
 * Safe logout with timeout fallback
 * @param logoutFunction - The logout function to execute
 * @param timeoutMs - Timeout in milliseconds (default 5000)
 */
export const safeLogoutWithTimeout = async (
  logoutFunction: () => Promise<void>, 
  timeoutMs: number = 5000
): Promise<void> => {
  return new Promise((resolve) => {
    // Set a timeout fallback
    const timeoutId = setTimeout(() => {
      console.warn('SafeLogoutWithTimeout: Logout timeout reached, forcing logout...');
      forceLogoutAndRedirect();
      resolve();
    }, timeoutMs);
    
    // Execute the logout function
    logoutFunction()
      .then(() => {
        clearTimeout(timeoutId);
        resolve();
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('SafeLogoutWithTimeout: Logout function failed:', error);
        forceLogoutAndRedirect();
        resolve(); // Resolve anyway since we handled the error
      });
  });
};
