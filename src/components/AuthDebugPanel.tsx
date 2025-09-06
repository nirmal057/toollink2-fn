import React, { useState, useEffect } from 'react';
import { AuthTokenManager } from '../utils/authTokenManager';
import { authService } from '../services/authService';

interface AuthDebugInfo {
    hasToken: boolean;
    hasUser: boolean;
    tokenExpired: boolean;
    tokenAge: number;
    userValid: boolean;
    serverReachable: boolean;
}

export const AuthDebugPanel: React.FC = () => {
    const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const gatherDebugInfo = async (): Promise<AuthDebugInfo> => {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        let user = null;

        try {
            user = userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            user = null;
        }

        const hasToken = !!token;
        const hasUser = !!user;
        const tokenExpired = token ? AuthTokenManager.isTokenExpired(token) : true;
        const tokenAge = token ? AuthTokenManager.getTokenAge(token) : 0;
        const userValid = !!(user?.id && user?.email && user?.role);

        // Test server connectivity
        let serverReachable = false;
        try {
            const response = await fetch('http://localhost:5001/health', {
                method: 'GET',
                timeout: 5000
            } as any);
            serverReachable = response.ok;
        } catch (e) {
            serverReachable = false;
        }

        return {
            hasToken,
            hasUser,
            tokenExpired,
            tokenAge,
            userValid,
            serverReachable
        };
    };

    const refreshDebugInfo = async () => {
        const info = await gatherDebugInfo();
        setDebugInfo(info);
    };

    const handleClearAuth = () => {
        AuthTokenManager.clearAuthData();
        refreshDebugInfo();
        alert('Authentication data cleared. Please refresh the page.');
    };

    const handleForceLogout = () => {
        AuthTokenManager.forceLogout();
    };

    const handleTestServer = async () => {
        try {
            const user = await authService.getCurrentUserFromServer();
            if (user) {
                alert('Server connection successful! User data retrieved.');
            } else {
                alert('Server connection failed or user not authenticated.');
            }
        } catch (error) {
            alert(`Server test failed: ${error}`);
        }
        refreshDebugInfo();
    };

    useEffect(() => {
        if (isVisible) {
            refreshDebugInfo();
        }
    }, [isVisible]);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999
        }}>
            {!isVisible ? (
                <button
                    onClick={() => setIsVisible(true)}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                    title="Auth Debug"
                >
                    🔍
                </button>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #007bff',
                    borderRadius: '8px',
                    padding: '15px',
                    minWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <strong>🔍 Auth Debug Panel</strong>
                        <button
                            onClick={() => setIsVisible(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer'
                            }}
                        >
                            ✖️
                        </button>
                    </div>

                    {debugInfo && (
                        <div>
                            <div>🔑 Has Token: {debugInfo.hasToken ? '✅' : '❌'}</div>
                            <div>👤 Has User: {debugInfo.hasUser ? '✅' : '❌'}</div>
                            <div>⏰ Token Expired: {debugInfo.tokenExpired ? '❌' : '✅'}</div>
                            <div>📅 Token Age: {debugInfo.tokenAge} minutes</div>
                            <div>✅ User Valid: {debugInfo.userValid ? '✅' : '❌'}</div>
                            <div>🌐 Server Reachable: {debugInfo.serverReachable ? '✅' : '❌'}</div>
                        </div>
                    )}

                    <div style={{
                        marginTop: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                    }}>
                        <button
                            onClick={refreshDebugInfo}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🔄 Refresh Info
                        </button>

                        <button
                            onClick={handleTestServer}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🧪 Test Server
                        </button>

                        <button
                            onClick={handleClearAuth}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#ffc107',
                                color: 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🗑️ Clear Auth Data
                        </button>

                        <button
                            onClick={handleForceLogout}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🚪 Force Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

