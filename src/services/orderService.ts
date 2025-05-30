export interface Customer {
  name: string;
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface SizeBreakdown {
  [size: string]: number;
}

export interface Order {
  id: string;
  customer: Customer;
  product: {
    type: string;
    color: string;
    neckType: string;
    specialInstructions?: string;
    fileUpload?: string;
  };
  quantity: {
    total: number;
    sizeBreakdown: SizeBreakdown;
  };
  delivery: {
    eventDate: string;
    deliveryDate: string;
    status: 'Pending' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  };
  payment: {
    amount: number;
    paid: number;
    pending: number;
    status: 'Pending' | 'Partial' | 'Complete';
  };
  orderType: 'From Stock' | 'Custom Order' | 'Mixed Order';
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock orders data
let mockOrders: Order[] = [
{
  id: 'ORD-001',
  customer: {
    name: 'ABC School',
    phone: '+1234567890',
    whatsapp: '+1234567890',
    address: {
      street: '123 School Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    }
  },
  product: {
    type: 'T-shirt',
    color: 'Navy Blue',
    neckType: 'Round Neck',
    specialInstructions: 'School logo on front, grade on back'
  },
  quantity: {
    total: 50,
    sizeBreakdown: {
      'S': 15,
      'M': 20,
      'L': 10,
      'XL': 5
    }
  },
  delivery: {
    eventDate: '2024-02-15',
    deliveryDate: '2024-02-10',
    status: 'In Production'
  },
  payment: {
    amount: 750,
    paid: 375,
    pending: 375,
    status: 'Partial'
  },
  orderType: 'From Stock',
  agentId: '2',
  createdAt: '2024-01-25T10:00:00Z',
  updatedAt: '2024-01-26T14:30:00Z'
},
{
  id: 'ORD-002',
  customer: {
    name: 'TechCorp Ltd',
    phone: '+1234567891',
    whatsapp: '+1234567891',
    address: {
      street: '456 Business Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    }
  },
  product: {
    type: 'Polo Shirt',
    color: 'White',
    neckType: 'Polo Collar',
    specialInstructions: 'Company logo embroidered'
  },
  quantity: {
    total: 25,
    sizeBreakdown: {
      'M': 10,
      'L': 10,
      'XL': 5
    }
  },
  delivery: {
    eventDate: '2024-02-20',
    deliveryDate: '2024-02-18',
    status: 'Pending'
  },
  payment: {
    amount: 875,
    paid: 0,
    pending: 875,
    status: 'Pending'
  },
  orderType: 'Custom Order',
  agentId: '2',
  createdAt: '2024-01-28T09:15:00Z',
  updatedAt: '2024-01-28T09:15:00Z'
}];


export const orderService = {
  // Get all orders (for manager) or agent-specific orders
  getOrders: async (agentId?: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (agentId) {
      return mockOrders.filter((order) => order.agentId === agentId);
    }
    return [...mockOrders];
  },

  // Get single order by ID
  getOrder: async (orderId: string): Promise<Order | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockOrders.find((order) => order.id === orderId) || null;
  },

  // Create new order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${String(mockOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockOrders.push(newOrder);
    return newOrder;
  },

  // Update order
  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const orderIndex = mockOrders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) return null;

    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return mockOrders[orderIndex];
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const orderIndex = mockOrders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) return false;

    mockOrders.splice(orderIndex, 1);
    return true;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['delivery']['status']): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const order = mockOrders.find((order) => order.id === orderId);
    if (!order) return false;

    order.delivery.status = status;
    order.updatedAt = new Date().toISOString();
    return true;
  },

  // Search orders
  searchOrders: async (query: string, agentId?: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let orders = agentId ? mockOrders.filter((order) => order.agentId === agentId) : mockOrders;

    if (!query.trim()) return orders;

    const lowerQuery = query.toLowerCase();
    return orders.filter((order) =>
    order.id.toLowerCase().includes(lowerQuery) ||
    order.customer.name.toLowerCase().includes(lowerQuery) ||
    order.product.type.toLowerCase().includes(lowerQuery) ||
    order.product.color.toLowerCase().includes(lowerQuery) ||
    order.delivery.status.toLowerCase().includes(lowerQuery)
    );
  },

  // Get orders by status
  getOrdersByStatus: async (status: Order['delivery']['status'], agentId?: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let orders = agentId ? mockOrders.filter((order) => order.agentId === agentId) : mockOrders;
    return orders.filter((order) => order.delivery.status === status);
  },

  // Get orders with upcoming delivery dates
  getUpcomingDeliveries: async (days: number = 7, agentId?: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    let orders = agentId ? mockOrders.filter((order) => order.agentId === agentId) : mockOrders;

    return orders.filter((order) => {
      const deliveryDate = new Date(order.delivery.deliveryDate);
      return deliveryDate >= today && deliveryDate <= futureDate &&
      order.delivery.status !== 'Delivered' && order.delivery.status !== 'Cancelled';
    });
  },

  // Get sales analytics
  getSalesAnalytics: async (agentId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    let orders = agentId ? mockOrders.filter((order) => order.agentId === agentId) : mockOrders;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.payment.amount, 0);
    const pendingOrders = orders.filter((order) =>
    order.delivery.status === 'Pending' || order.delivery.status === 'In Production'
    ).length;
    const completedOrders = orders.filter((order) => order.delivery.status === 'Delivered').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue
    };
  },

  // Check for duplicate orders
  checkForDuplicates: async (customerName: string, productType: string, eventDate: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockOrders.filter((order) =>
    order.customer.name.toLowerCase() === customerName.toLowerCase() &&
    order.product.type === productType &&
    order.delivery.eventDate === eventDate &&
    order.delivery.status !== 'Cancelled'
    );
  }
};