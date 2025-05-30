export interface StockItem {
  id: string;
  productType: string;
  color: string;
  neckType: string;
  size: string;
  quantity: number;
  minThreshold: number;
  costPerUnit: number;
  batchNumber?: string;
  purchaseDate?: string;
  supplier?: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
}

// Mock stock data
const mockStock: StockItem[] = [
{
  id: '1',
  productType: 'T-shirt',
  color: 'Navy Blue',
  neckType: 'Round Neck',
  size: 'S',
  quantity: 25,
  minThreshold: 10,
  costPerUnit: 15.50,
  batchNumber: 'B001',
  purchaseDate: '2024-01-15',
  supplier: 'TextileCorp'
},
{
  id: '2',
  productType: 'T-shirt',
  color: 'Navy Blue',
  neckType: 'Round Neck',
  size: 'M',
  quantity: 30,
  minThreshold: 15,
  costPerUnit: 15.50,
  batchNumber: 'B001',
  purchaseDate: '2024-01-15',
  supplier: 'TextileCorp'
},
{
  id: '3',
  productType: 'T-shirt',
  color: 'Navy Blue',
  neckType: 'Round Neck',
  size: 'L',
  quantity: 15,
  minThreshold: 10,
  costPerUnit: 15.50,
  batchNumber: 'B001',
  purchaseDate: '2024-01-15',
  supplier: 'TextileCorp'
},
{
  id: '4',
  productType: 'T-shirt',
  color: 'Navy Blue',
  neckType: 'Round Neck',
  size: 'XL',
  quantity: 10,
  minThreshold: 8,
  costPerUnit: 15.50,
  batchNumber: 'B001',
  purchaseDate: '2024-01-15',
  supplier: 'TextileCorp'
},
{
  id: '5',
  productType: 'Jersey',
  color: 'Red',
  neckType: 'V-Neck',
  size: 'M',
  quantity: 20,
  minThreshold: 12,
  costPerUnit: 22.00,
  batchNumber: 'B002',
  purchaseDate: '2024-01-20',
  supplier: 'SportWear Inc'
}];


let stockMovements: StockMovement[] = [];

export const stockService = {
  // Get all stock items
  getAllStock: async (): Promise<StockItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockStock];
  },

  // Get stock for specific product combination
  getStock: async (productType: string, color: string, neckType: string): Promise<StockItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStock.filter((item) =>
    item.productType === productType &&
    item.color === color &&
    item.neckType === neckType
    );
  },

  // Check availability for order
  checkAvailability: async (
  productType: string,
  color: string,
  neckType: string,
  sizeBreakdown: Record<string, number>)
  : Promise<{available: boolean;shortfall: Record<string, number>;}> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stock = mockStock.filter((item) =>
    item.productType === productType &&
    item.color === color &&
    item.neckType === neckType
    );

    const shortfall: Record<string, number> = {};
    let available = true;

    for (const [size, requestedQty] of Object.entries(sizeBreakdown)) {
      const stockItem = stock.find((item) => item.size === size);
      const availableQty = stockItem?.quantity || 0;

      if (requestedQty > availableQty) {
        shortfall[size] = requestedQty - availableQty;
        available = false;
      }
    }

    return { available, shortfall };
  },

  // Reserve stock for order
  reserveStock: async (
  orderId: string,
  productType: string,
  color: string,
  neckType: string,
  sizeBreakdown: Record<string, number>)
  : Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real app, this would create reservations in the database
    console.log('Stock reserved for order:', orderId, sizeBreakdown);
    return true;
  },

  // Update stock quantities (after order fulfillment)
  updateStock: async (
  productType: string,
  color: string,
  neckType: string,
  sizeBreakdown: Record<string, number>,
  operation: 'reduce' | 'increase' = 'reduce')
  : Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    for (const [size, quantity] of Object.entries(sizeBreakdown)) {
      const stockIndex = mockStock.findIndex((item) =>
      item.productType === productType &&
      item.color === color &&
      item.neckType === neckType &&
      item.size === size
      );

      if (stockIndex !== -1) {
        if (operation === 'reduce') {
          mockStock[stockIndex].quantity = Math.max(0, mockStock[stockIndex].quantity - quantity);
        } else {
          mockStock[stockIndex].quantity += quantity;
        }

        // Record movement
        stockMovements.push({
          id: Date.now().toString(),
          stockItemId: mockStock[stockIndex].id,
          type: operation === 'reduce' ? 'out' : 'in',
          quantity,
          reason: operation === 'reduce' ? 'Order fulfillment' : 'Stock replenishment',
          timestamp: new Date().toISOString(),
          userId: 'system'
        });
      }
    }
  },

  // Add new stock
  addStock: async (stockItem: Omit<StockItem, 'id'>): Promise<StockItem> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newItem: StockItem = {
      ...stockItem,
      id: Date.now().toString()
    };

    mockStock.push(newItem);

    // Record movement
    stockMovements.push({
      id: Date.now().toString(),
      stockItemId: newItem.id,
      type: 'in',
      quantity: stockItem.quantity,
      reason: 'New stock addition',
      timestamp: new Date().toISOString(),
      userId: 'manager'
    });

    return newItem;
  },

  // Get low stock items
  getLowStockItems: async (): Promise<StockItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStock.filter((item) => item.quantity <= item.minThreshold);
  },

  // Get stock movements
  getStockMovements: async (): Promise<StockMovement[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...stockMovements].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
};

// Product configuration - now dynamic from database
export const productConfig = {
  // Get product types from database
  getProductTypes: async (): Promise<string[]> => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11428', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'display_order',
        IsAsc: true,
        Filters: [
          { name: 'config_type', op: 'Equal', value: 'product_type' },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });
      if (error) throw error;
      return data.List?.map((item: any) => item.config_value) || [];
    } catch (error) {
      console.error('Error fetching product types:', error);
      return ['T-shirt', 'Jersey', 'Uniform', 'Polo Shirt', 'Hoodie']; // Fallback
    }
  },

  // Get colors from database
  getColors: async (): Promise<string[]> => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11428', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'display_order',
        IsAsc: true,
        Filters: [
          { name: 'config_type', op: 'Equal', value: 'color' },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });
      if (error) throw error;
      return data.List?.map((item: any) => item.config_value) || [];
    } catch (error) {
      console.error('Error fetching colors:', error);
      return ['Navy Blue', 'Red', 'Black', 'White', 'Royal Blue', 'Green']; // Fallback
    }
  },

  // Get neck types from database
  getNeckTypes: async (): Promise<string[]> => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11428', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'display_order',
        IsAsc: true,
        Filters: [
          { name: 'config_type', op: 'Equal', value: 'neck_type' },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });
      if (error) throw error;
      return data.List?.map((item: any) => item.config_value) || [];
    } catch (error) {
      console.error('Error fetching neck types:', error);
      return ['Round Neck', 'V-Neck', 'Polo Collar', 'Henley']; // Fallback
    }
  },

  // Get sizes from database
  getSizes: async (): Promise<string[]> => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11428', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'display_order',
        IsAsc: true,
        Filters: [
          { name: 'config_type', op: 'Equal', value: 'size' },
          { name: 'is_active', op: 'Equal', value: true }
        ]
      });
      if (error) throw error;
      return data.List?.map((item: any) => item.config_value) || [];
    } catch (error) {
      console.error('Error fetching sizes:', error);
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']; // Fallback
    }
  },

  // Legacy static arrays for backward compatibility
  productTypes: ['T-shirt', 'Jersey', 'Uniform', 'Polo Shirt', 'Hoodie'],
  colors: ['Navy Blue', 'Red', 'Black', 'White', 'Royal Blue', 'Green', 'Yellow'],
  neckTypes: ['Round Neck', 'V-Neck', 'Polo Collar', 'Henley', 'Crew Neck'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
};