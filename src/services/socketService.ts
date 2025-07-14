import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

class SocketService {
    private socket: Socket | null = null;
    private readonly serverUrl = 'http://localhost:3000';

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(this.serverUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connected to Socket.IO server');

            // Join admin room if user is admin
            const user = authService.getCurrentUser();
            if (user && user.role === 'admin') {
                this.socket?.emit('join-admin', user);
                console.log('👤 Joined admin room for real-time updates');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from Socket.IO server');
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Socket.IO connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            console.log('🔌 Socket.IO disconnected');
        }
    }

    // User management events
    onUserCreated(callback: (data: any) => void) {
        this.socket?.on('user-created', callback);
    }

    onUserUpdated(callback: (data: any) => void) {
        this.socket?.on('user-updated', callback);
    }

    onUserDeleted(callback: (data: any) => void) {
        this.socket?.on('user-deleted', callback);
    }

    // Remove listeners
    removeUserListeners() {
        this.socket?.off('user-created');
        this.socket?.off('user-updated');
        this.socket?.off('user-deleted');
    }

    // Check if connected
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Get socket instance
    getSocket(): Socket | null {
        return this.socket;
    }
}

export const socketService = new SocketService();
