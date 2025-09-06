// Customer approval notification service
class CustomerApprovalNotificationService {
  private static readonly STORAGE_KEY = 'toollink-approval-notifications';

  // Get pending customer approvals from backend
  static async getPendingCustomerNotifications(userRole: string): Promise<any[]> {
    // Only show to cashiers and admins
    if (!['admin', 'cashier'].includes(userRole)) {
      return [];
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];

      const response = await fetch('http://localhost:5001/api/auth/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pendingUsers = data.users || [];

        // Convert to notification format
        return pendingUsers.map((user: any) => ({
          id: `approval-${user.id}`,
          type: 'customer-approval',
          title: 'New Customer Awaiting Approval',
          message: `${user.fullName} (${user.email}) has registered and needs approval`,
          timestamp: user.createdAt,
          read: this.isNotificationRead(user.id),
          userId: user.id,
          userEmail: user.email,
          userFullName: user.fullName
        }));
      }
    } catch (error) {
      console.error('Error fetching pending customers:', error);
    }

    return [];
  }

  // Get pending customer approval count
  static async getPendingCustomerCount(userRole: string): Promise<number> {
    // Only show to cashiers and admins
    if (!['admin', 'cashier'].includes(userRole)) {
      return 0;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return 0;

      const response = await fetch('http://localhost:5001/api/auth/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      }
    } catch (error) {
      console.error('Error fetching pending customer count:', error);
    }

    return 0;
  }

  // Check if notification has been read
  static isNotificationRead(userId: number): boolean {
    const readNotifications = this.getReadNotifications();
    return readNotifications.includes(userId);
  }

  // Mark notification as read
  static markNotificationRead(userId: number): void {
    const readNotifications = this.getReadNotifications();
    if (!readNotifications.includes(userId)) {
      readNotifications.push(userId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(readNotifications));
    }
  }

  // Get list of read notification user IDs
  private static getReadNotifications(): number[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear read status when user is approved (cleanup)
  static clearNotificationForUser(userId: number): void {
    const readNotifications = this.getReadNotifications();
    const filtered = readNotifications.filter(id => id !== userId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

export { CustomerApprovalNotificationService };
