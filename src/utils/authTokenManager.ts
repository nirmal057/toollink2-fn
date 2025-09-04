/**
 * Auth Token Manager - Handles token cleanup and validation
 */

export class AuthTokenManager {
    private static readonly TOKEN_KEYS = [
        'accessToken',
        'refreshToken',
        'user'
    ];

    /**
     * Clear all authentication data from localStorage
     */
    static clearAuthData(): void {
        try {
            this.TOKEN_KEYS.forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('✅ All authentication data cleared from localStorage');
        } catch (error) {
            console.error('❌ Error clearing auth data:', error);
        }
    }

    /**
     * Check if stored token is expired
     */
    static isTokenExpired(token: string): boolean {
        try {
            if (!token) return true;

            // Decode the JWT payload without verification (just to check expiry)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            return payload.exp < currentTime;
        } catch (error) {
            console.warn('⚠️ Invalid token format:', error);
            return true; // Treat invalid tokens as expired
        }
    }

    /**
     * Validate and clean authentication state
     */
    static validateAndCleanAuthState(): boolean {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const user = localStorage.getItem('user');

            // Check if we have both token and user data
            if (!accessToken || !user) {
                console.log('🔍 Missing auth data, clearing localStorage');
                this.clearAuthData();
                return false;
            }

            // Check if token is expired
            if (this.isTokenExpired(accessToken)) {
                console.log('⏰ Access token expired, clearing localStorage');
                this.clearAuthData();
                return false;
            }

            // Validate user data format
            try {
                const userData = JSON.parse(user);
                if (!userData.id || !userData.email || !userData.role) {
                    console.log('📝 Invalid user data format, clearing localStorage');
                    this.clearAuthData();
                    return false;
                }
            } catch (parseError) {
                console.log('🔧 Invalid user JSON format, clearing localStorage');
                this.clearAuthData();
                return false;
            }

            console.log('✅ Authentication state is valid');
            return true;
        } catch (error) {
            console.error('❌ Error validating auth state:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Get token age in minutes
     */
    static getTokenAge(token: string): number {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const issuedAt = payload.iat * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            return Math.floor((currentTime - issuedAt) / (1000 * 60)); // Return minutes
        } catch (error) {
            return 0;
        }
    }

    /**
     * Force logout and clear all data
     */
    static forceLogout(): void {
        console.log('🚪 Force logout initiated');
        this.clearAuthData();

        // Dispatch a custom event to notify components
        window.dispatchEvent(new CustomEvent('auth:forceLogout'));

        // Redirect to login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    /**
     * Debug authentication state
     */
    static debugAuthState(): void {
        console.group('🔍 Auth State Debug');

        this.TOKEN_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                if (key === 'user') {
                    try {
                        const userData = JSON.parse(value);
                        console.log(`${key}:`, {
                            id: userData.id,
                            email: userData.email,
                            role: userData.role,
                            isActive: userData.isActive
                        });
                    } catch (e) {
                        console.log(`${key}: Invalid JSON`);
                    }
                } else {
                    const age = this.getTokenAge(value);
                    const isExpired = this.isTokenExpired(value);
                    console.log(`${key}: ${value.substring(0, 20)}... (age: ${age}min, expired: ${isExpired})`);
                }
            } else {
                console.log(`${key}: Not found`);
            }
        });

        console.groupEnd();
    }
}

// Global debug function for console
(window as any).debugAuth = () => AuthTokenManager.debugAuthState();
(window as any).clearAuth = () => AuthTokenManager.clearAuthData();
(window as any).forceLogout = () => AuthTokenManager.forceLogout();
