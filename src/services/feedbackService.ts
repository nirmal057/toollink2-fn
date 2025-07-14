
export interface Feedback {
  id: number;
  orderId: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  replied: boolean;
  isPublic?: boolean; // New field to determine if feedback should show on landing page
  category?: 'construction' | 'delivery' | 'service' | 'inventory';
  customerRole?: string;
}

// Mock feedback data that can be used across the application
export const mockFeedback: Feedback[] = [
  {
    id: 1,
    orderId: 'ORD-7892',
    customer: 'Alex Fernando',
    rating: 5,
    comment: 'ToolLink has transformed how we manage our cement deliveries. Real-time tracking has improved our customer satisfaction significantly.',
    date: '2023-07-20T14:30:00',
    helpful: 12,
    notHelpful: 2,
    replied: true,
    isPublic: true,
    category: 'delivery',
    customerRole: 'Construction Manager'
  },
  {
    id: 2,
    orderId: 'ORD-7891',
    customer: 'Saman Perera',
    rating: 5,
    comment: 'The inventory management system is incredible. We\'ve reduced waste and improved our ordering efficiency by 40%.',
    date: '2023-07-19T10:15:00',
    helpful: 8,
    notHelpful: 1,
    replied: true,
    isPublic: true,
    category: 'inventory',
    customerRole: 'Warehouse Owner'
  },
  {
    id: 3,
    orderId: 'ORD-7890',
    customer: 'Maya Rajapaksa',
    rating: 5,
    comment: 'Easy to use platform with excellent customer support. Our delivery scheduling has never been more organized.',
    date: '2023-07-18T16:20:00',
    helpful: 15,
    notHelpful: 0,
    replied: true,
    isPublic: true,
    category: 'service',
    customerRole: 'Project Coordinator'
  },
  {
    id: 4,
    orderId: 'ORD-7889',
    customer: 'Rajith Silva',
    rating: 4,
    comment: 'Good service overall, but delivery was slightly delayed. The tracking system helped us stay informed.',
    date: '2023-07-17T09:45:00',
    helpful: 6,
    notHelpful: 1,
    replied: true,
    isPublic: false,
    category: 'delivery',
    customerRole: 'Site Manager'
  },
  {
    id: 5,
    orderId: 'ORD-7888',
    customer: 'Priya Mendis',
    rating: 5,
    comment: 'Outstanding platform! The automated scheduling feature has saved us countless hours.',
    date: '2023-07-16T11:30:00',
    helpful: 9,
    notHelpful: 0,
    replied: true,
    isPublic: true,
    category: 'service',
    customerRole: 'Operations Manager'
  },
  {
    id: 6,
    orderId: 'ORD-7887',
    customer: 'Chamara Perera',
    rating: 3,
    comment: 'The system works well but could use better mobile interface. Overall satisfied with the service.',
    date: '2023-07-15T13:15:00',
    helpful: 4,
    notHelpful: 2,
    replied: false,
    isPublic: false,
    category: 'service',
    customerRole: 'Customer'
  }
];

export class FeedbackService {
  private static feedback: Feedback[] = [...mockFeedback];

  // Get all feedback
  static getAllFeedback(): Feedback[] {
    return this.feedback;
  }

  // Get public feedback for testimonials
  static getPublicFeedback(): Feedback[] {
    return this.feedback.filter(f => f.isPublic && f.rating >= 4);
  }

  // Get feedback by rating
  static getFeedbackByRating(minRating: number): Feedback[] {
    return this.feedback.filter(f => f.rating >= minRating);
  }

  // Add new feedback
  static addFeedback(feedback: Omit<Feedback, 'id'>): Feedback {
    const newFeedback: Feedback = {
      ...feedback,
      id: Math.max(...this.feedback.map(f => f.id)) + 1,
      date: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
      replied: false
    };
    this.feedback.push(newFeedback);
    return newFeedback;
  }

  // Update feedback
  static updateFeedback(id: number, updates: Partial<Feedback>): Feedback | null {
    const index = this.feedback.findIndex(f => f.id === id);
    if (index === -1) return null;
    
    this.feedback[index] = { ...this.feedback[index], ...updates };
    return this.feedback[index];
  }

  // Mark feedback as replied
  static markAsReplied(id: number): boolean {
    const feedback = this.feedback.find(f => f.id === id);
    if (feedback) {
      feedback.replied = true;
      return true;
    }
    return false;
  }

  // Get average rating
  static getAverageRating(): number {
    if (this.feedback.length === 0) return 0;
    const sum = this.feedback.reduce((acc, f) => acc + f.rating, 0);
    return Math.round((sum / this.feedback.length) * 10) / 10;
  }

  // Get feedback statistics
  static getStats() {
    const total = this.feedback.length;
    const positive = this.feedback.filter(f => f.rating >= 4).length;
    const replied = this.feedback.filter(f => f.replied).length;
    
    return {
      total,
      averageRating: this.getAverageRating(),
      positivePercentage: total > 0 ? Math.round((positive / total) * 100) : 0,
      responseRate: total > 0 ? Math.round((replied / total) * 100) : 0
    };
  }

  // Get initials from customer name
  static getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
}
