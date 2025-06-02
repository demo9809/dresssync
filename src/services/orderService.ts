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
    try {
      const filters = agentId ? [{
        "name": "agent_id",
        "op": "Equal" as const,
        "value": parseInt(agentId)
      }] : [];

      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": filters
      });

      if (error) throw error;
      
      // Convert database format to Order interface
      const orders = (data?.List || []).map(convertDbToOrder);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Get single order by ID
  getOrder: async (orderId: string): Promise<Order | null> => {
    try {
      // Try to parse as number first, if it fails, search by order_number
      const numericId = parseInt(orderId);
      let filters;
      
      if (!isNaN(numericId)) {
        filters = [{
          "name": "id",
          "op": "Equal" as const,
          "value": numericId
        }];
      } else {
        filters = [{
          "name": "order_number",
          "op": "Equal" as const,
          "value": orderId
        }];
      }

      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 1,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": filters
      });

      if (error) throw error;
      
      const orders = data?.List || [];
      if (orders.length === 0) return null;
      
      return convertDbToOrder(orders[0]);
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Create new order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    try {
      // Generate order number
      const orderCount = await getOrderCount();
      const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;
      
      const dbData = {
        order_number: orderNumber,
        agent_id: parseInt(orderData.agentId),
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        customer_whatsapp: orderData.customer.whatsapp,
        customer_address: `${orderData.customer.address.street}, ${orderData.customer.address.city}, ${orderData.customer.address.state} ${orderData.customer.address.zipCode}`,
        product_type: orderData.product.type,
        product_color: orderData.product.color,
        total_quantity: orderData.quantity.total,
        size_breakdown: JSON.stringify(orderData.quantity.sizeBreakdown),
        special_instructions: orderData.product.specialInstructions || '',
        event_date: orderData.delivery.eventDate,
        delivery_date: orderData.delivery.deliveryDate,
        order_status: orderData.delivery.status,
        total_amount: orderData.payment.amount,
        paid_amount: orderData.payment.paid,
        payment_status: orderData.payment.status,
        order_type: orderData.orderType
      };

      const { error } = await window.ezsite.apis.tableCreate(11425, dbData);
      if (error) throw error;

      // Return the created order in the expected format
      const newOrder: Order = {
        id: orderNumber,
        customer: orderData.customer,
        product: orderData.product,
        quantity: orderData.quantity,
        delivery: orderData.delivery,
        payment: orderData.payment,
        orderType: orderData.orderType,
        agentId: orderData.agentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error}`);
    }
  },

  // Update order
  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
    try {
      // First get the existing order
      const existingOrder = await orderService.getOrder(orderId);
      if (!existingOrder) return null;

      // Get the numeric ID - if orderId is not a number, find it from the existing order
      const numericId = !isNaN(parseInt(orderId)) ? parseInt(orderId) : 
                        await getOrderIdByOrderNumber(orderId);
      
      if (!numericId) {
        console.error('Could not find numeric ID for order:', orderId);
        return null;
      }

      // Convert updates to database format
      const dbUpdates: any = {
        id: numericId
      };

      if (updates.customer) {
        if (updates.customer.name !== undefined) dbUpdates.customer_name = updates.customer.name;
        if (updates.customer.phone !== undefined) dbUpdates.customer_phone = updates.customer.phone;
        if (updates.customer.whatsapp !== undefined) dbUpdates.customer_whatsapp = updates.customer.whatsapp;
        if (updates.customer.address) {
          dbUpdates.customer_address = `${updates.customer.address.street}, ${updates.customer.address.city}, ${updates.customer.address.state} ${updates.customer.address.zipCode}`;
        }
      }
      
      if (updates.product) {
        if (updates.product.type !== undefined) dbUpdates.product_type = updates.product.type;
        if (updates.product.color !== undefined) dbUpdates.product_color = updates.product.color;
        if (updates.product.specialInstructions !== undefined) dbUpdates.special_instructions = updates.product.specialInstructions;
      }
      
      if (updates.quantity) {
        if (updates.quantity.total !== undefined) dbUpdates.total_quantity = updates.quantity.total;
        if (updates.quantity.sizeBreakdown !== undefined) dbUpdates.size_breakdown = JSON.stringify(updates.quantity.sizeBreakdown);
      }
      
      if (updates.delivery) {
        if (updates.delivery.eventDate !== undefined) dbUpdates.event_date = updates.delivery.eventDate;
        if (updates.delivery.deliveryDate !== undefined) dbUpdates.delivery_date = updates.delivery.deliveryDate;
        if (updates.delivery.status !== undefined) dbUpdates.order_status = updates.delivery.status;
      }
      
      if (updates.payment) {
        if (updates.payment.amount !== undefined) dbUpdates.total_amount = updates.payment.amount;
        if (updates.payment.paid !== undefined) dbUpdates.paid_amount = updates.payment.paid;
        if (updates.payment.status !== undefined) dbUpdates.payment_status = updates.payment.status;
      }
      
      if (updates.orderType !== undefined) dbUpdates.order_type = updates.orderType;

      const { error } = await window.ezsite.apis.tableUpdate(11425, dbUpdates);
      if (error) throw error;

      // Return updated order
      return await orderService.getOrder(orderId);
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<boolean> => {
    try {
      // Get the numeric ID - if orderId is not a number, find it from the database
      const numericId = !isNaN(parseInt(orderId)) ? parseInt(orderId) : 
                        await getOrderIdByOrderNumber(orderId);
      
      if (!numericId) {
        console.error('Could not find numeric ID for order:', orderId);
        return false;
      }

      const { error } = await window.ezsite.apis.tableDelete(11425, { id: numericId });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: Order['delivery']['status']): Promise<boolean> => {
    try {
      // Get the numeric ID - if orderId is not a number, find it from the database
      const numericId = !isNaN(parseInt(orderId)) ? parseInt(orderId) : 
                        await getOrderIdByOrderNumber(orderId);
      
      if (!numericId) {
        console.error('Could not find numeric ID for order:', orderId);
        return false;
      }

      const { error } = await window.ezsite.apis.tableUpdate(11425, {
        id: numericId,
        order_status: status
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  },

  // Search orders
  searchOrders: async (query: string, agentId?: string): Promise<Order[]> => {
    try {
      const filters: any[] = [];
      
      if (agentId) {
        filters.push({
          "name": "agent_id",
          "op": "Equal" as const,
          "value": parseInt(agentId)
        });
      }

      // If there's a query, we'll need to fetch all and filter client-side
      // as database doesn't support complex OR queries
      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 1000,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": filters
      });

      if (error) throw error;
      
      let orders = (data?.List || []).map(convertDbToOrder);
      
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        orders = orders.filter((order) =>
          order.id.toLowerCase().includes(lowerQuery) ||
          order.customer.name.toLowerCase().includes(lowerQuery) ||
          order.product.type.toLowerCase().includes(lowerQuery) ||
          order.product.color.toLowerCase().includes(lowerQuery) ||
          order.delivery.status.toLowerCase().includes(lowerQuery)
        );
      }
      
      return orders;
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  },

  // Get orders by status
  getOrdersByStatus: async (status: Order['delivery']['status'], agentId?: string): Promise<Order[]> => {
    try {
      const filters: any[] = [
        {
          "name": "order_status",
          "op": "Equal" as const,
          "value": status
        }
      ];
      
      if (agentId) {
        filters.push({
          "name": "agent_id",
          "op": "Equal" as const,
          "value": parseInt(agentId)
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 1000,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": filters
      });

      if (error) throw error;
      
      return (data?.List || []).map(convertDbToOrder);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  },

  // Get orders with upcoming delivery dates
  getUpcomingDeliveries: async (days: number = 7, agentId?: string): Promise<Order[]> => {
    try {
      const today = new Date();
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
      
      const filters: any[] = [];
      
      if (agentId) {
        filters.push({
          "name": "agent_id",
          "op": "Equal" as const,
          "value": parseInt(agentId)
        });
      }

      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 1000,
        "OrderByField": "delivery_date",
        "IsAsc": true,
        "Filters": filters
      });

      if (error) throw error;
      
      const orders = (data?.List || []).map(convertDbToOrder);
      
      return orders.filter((order) => {
        const deliveryDate = new Date(order.delivery.deliveryDate);
        return deliveryDate >= today && deliveryDate <= futureDate &&
               order.delivery.status !== 'Delivered' && order.delivery.status !== 'Cancelled';
      });
    } catch (error) {
      console.error('Error fetching upcoming deliveries:', error);
      return [];
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (agentId?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    averageOrderValue: number;
  }> => {
    try {
      const orders = await orderService.getOrders(agentId);
      
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
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageOrderValue: 0
      };
    }
  },

  // Check for duplicate orders
  checkForDuplicates: async (customerName: string, productType: string, eventDate: string): Promise<Order[]> => {
    try {
      const filters = [
        {
          "name": "customer_name",
          "op": "Equal" as const,
          "value": customerName
        },
        {
          "name": "product_type",
          "op": "Equal" as const,
          "value": productType
        },
        {
          "name": "event_date",
          "op": "Equal" as const,
          "value": eventDate
        }
      ];

      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": filters
      });

      if (error) throw error;
      
      const orders = (data?.List || []).map(convertDbToOrder);
      return orders.filter(order => order.delivery.status !== 'Cancelled');
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  }
};

// Helper function to convert database record to Order interface
function convertDbToOrder(dbRecord: any): Order {
  let sizeBreakdown = {};
  try {
    sizeBreakdown = JSON.parse(dbRecord.size_breakdown || '{}');
  } catch (e) {
    console.warn('Failed to parse size breakdown:', dbRecord.size_breakdown);
  }

  // Parse customer address
  const addressParts = (dbRecord.customer_address || '').split(', ');
  const address = {
    street: addressParts[0] || '',
    city: addressParts[1] || '',
    state: addressParts[2]?.split(' ')[0] || '',
    zipCode: addressParts[2]?.split(' ')[1] || ''
  };

  return {
    id: dbRecord.order_number || dbRecord.id?.toString() || '',
    customer: {
      name: dbRecord.customer_name || '',
      phone: dbRecord.customer_phone || '',
      whatsapp: dbRecord.customer_whatsapp || '',
      address
    },
    product: {
      type: dbRecord.product_type || '',
      color: dbRecord.product_color || '',
      neckType: dbRecord.neck_type || 'Round Neck',
      specialInstructions: dbRecord.special_instructions || ''
    },
    quantity: {
      total: dbRecord.total_quantity || 0,
      sizeBreakdown
    },
    delivery: {
      eventDate: dbRecord.event_date || '',
      deliveryDate: dbRecord.delivery_date || '',
      status: dbRecord.order_status || 'Pending'
    },
    payment: {
      amount: dbRecord.total_amount || 0,
      paid: dbRecord.paid_amount || 0,
      pending: (dbRecord.total_amount || 0) - (dbRecord.paid_amount || 0),
      status: dbRecord.payment_status || 'Pending'
    },
    orderType: dbRecord.order_type || 'Custom Order',
    agentId: dbRecord.agent_id?.toString() || '',
    createdAt: dbRecord.created_date || new Date().toISOString(),
    updatedAt: dbRecord.updated_date || new Date().toISOString()
  };
}

// Helper function to get order count for generating order numbers
async function getOrderCount(): Promise<number> {
  try {
    const { data, error } = await window.ezsite.apis.tablePage(11425, {
      "PageNo": 1,
      "PageSize": 1,
      "OrderByField": "id",
      "IsAsc": false,
      "Filters": []
    });

    if (error) throw error;
    return data?.VirtualCount || 0;
  } catch (error) {
    console.error('Error getting order count:', error);
    return 0;
  }
}

// Helper function to get numeric ID by order number
async function getOrderIdByOrderNumber(orderNumber: string): Promise<number | null> {
  try {
    const { data, error } = await window.ezsite.apis.tablePage(11425, {
      "PageNo": 1,
      "PageSize": 1,
      "OrderByField": "id",
      "IsAsc": false,
      "Filters": [{
        "name": "order_number",
        "op": "Equal" as const,
        "value": orderNumber
      }]
    });

    if (error) throw error;
    
    const orders = data?.List || [];
    return orders.length > 0 ? orders[0].id : null;
  } catch (error) {
    console.error('Error getting order ID by order number:', error);
    return null;
  }
}