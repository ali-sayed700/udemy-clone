import { Course } from './course.types';

export interface Order {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email?: string;
  };
  courses: Course[];
  paymentMethod: 'stripe' | 'paypal';
  paymentId: string;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: {
    myOrders: Order[];
  };
}

export interface OrderResponse {
  data: {
    order: Order;
  };
}
