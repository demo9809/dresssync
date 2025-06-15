// API Service to replace ezsite dependencies
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '/api';
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = typeof data === 'object' ? data.error : data;
        throw new Error(errorMessage || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Mock installation status for now
  async getInstallationStatus() {
    // For now, return that installation is not complete
    // In production, this would check the actual backend
    return { installed: false };
  }

  // Authentication methods
  async register(credentials: { email: string; password: string; name: string }) {
    try {
      // Mock implementation for now
      console.log('Register:', credentials);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      // Mock implementation for now
      console.log('Login:', credentials);
      
      // Simulate successful login
      const mockUser = {
        id: 1,
        email: credentials.email,
        name: 'Test User',
        role: credentials.email.includes('admin') ? 'manager' : 'agent'
      };
      
      const mockToken = 'mock-jwt-token';
      
      this.token = mockToken;
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async logout() {
    try {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async getUserInfo() {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          data: {
            ID: user.id,
            Email: user.email,
            Name: user.name,
            Role: user.role,
            CreateTime: new Date().toISOString()
          },
          error: null
        };
      }
      throw new Error('No user data found');
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  async sendResetPwdEmail(email: { email: string }) {
    try {
      console.log('Send reset password email:', email);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async resetPassword(resetInfo: { token: string; password: string }) {
    try {
      console.log('Reset password:', resetInfo);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // Table operations with mock data
  async tablePage(tableId: number, queryParams: any) {
    try {
      console.log('Table page request:', { tableId, queryParams });
      
      // Mock data based on table ID
      const mockData = this.getMockTableData(tableId, queryParams);
      
      return { data: mockData, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  private getMockTableData(tableId: number, queryParams: any) {
    const { PageSize = 10 } = queryParams;
    
    switch (tableId) {
      case 11424: // agents
        return {
          List: Array.from({ length: Math.min(PageSize, 5) }, (_, i) => ({
            ID: i + 1,
            agent_code: `AG${(i + 1).toString().padStart(3, '0')}`,
            first_name: `Agent${i + 1}`,
            last_name: 'Lastname',
            email: `agent${i + 1}@company.com`,
            phone: `+1234567890${i}`,
            territory: `Territory ${i + 1}`,
            status: 'Active',
            commission_rate: 5.0,
            target_sales: 10000.00
          })),
          VirtualCount: 25
        };
        
      case 11425: // orders
        return {
          List: Array.from({ length: Math.min(PageSize, 8) }, (_, i) => ({
            ID: i + 1,
            order_number: `ORD-${Date.now()}-${i + 1}`,
            customer_name: `Customer ${i + 1}`,
            customer_phone: `+1234567890${i}`,
            product_type: ['T-shirt', 'Jersey', 'Polo Shirt'][i % 3],
            product_color: ['White', 'Black', 'Blue'][i % 3],
            total_quantity: 50 + (i * 10),
            order_status: ['Pending', 'In Production', 'Shipped'][i % 3],
            total_amount: 500.00 + (i * 100),
            payment_status: ['Pending', 'Partial', 'Complete'][i % 3]
          })),
          VirtualCount: 42
        };
        
      case 11426: // stock_items
        return {
          List: Array.from({ length: Math.min(PageSize, 12) }, (_, i) => ({
            ID: i + 1,
            product_type: ['T-shirt', 'Jersey', 'Polo Shirt'][i % 3],
            color: ['White', 'Black', 'Blue', 'Red'][i % 4],
            size: ['S', 'M', 'L', 'XL'][i % 4],
            quantity: Math.floor(Math.random() * 100),
            min_threshold: 10
          })),
          VirtualCount: 50
        };
        
      case 11428: // product_config
        return {
          List: [
            { ID: 1, config_type: 'product_type', config_value: 'T-shirt', display_order: 1, is_active: true },
            { ID: 2, config_type: 'product_type', config_value: 'Jersey', display_order: 2, is_active: true },
            { ID: 3, config_type: 'color', config_value: 'White', display_order: 1, is_active: true },
            { ID: 4, config_type: 'color', config_value: 'Black', display_order: 2, is_active: true },
            { ID: 5, config_type: 'size', config_value: 'S', display_order: 1, is_active: true },
            { ID: 6, config_type: 'size', config_value: 'M', display_order: 2, is_active: true },
            { ID: 7, config_type: 'size', config_value: 'L', display_order: 3, is_active: true },
            { ID: 8, config_type: 'size', config_value: 'XL', display_order: 4, is_active: true }
          ],
          VirtualCount: 8
        };
        
      default:
        return { List: [], VirtualCount: 0 };
    }
  }

  async tableCreate(tableId: number, data: any) {
    try {
      console.log('Table create:', { tableId, data });
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async tableUpdate(tableId: number, data: any) {
    try {
      console.log('Table update:', { tableId, data });
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async tableDelete(tableId: number, params: { ID: number }) {
    try {
      console.log('Table delete:', { tableId, params });
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  // File upload
  async upload(fileInfo: { filename: string; file: File }) {
    try {
      console.log('File upload:', fileInfo.filename);
      
      // Mock successful upload
      return {
        data: {
          id: `file_${Date.now()}`,
          filename: fileInfo.filename,
          url: `/uploads/mock_${fileInfo.filename}`
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }

  // Email service
  async sendEmail(emailData: {
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      console.log('Send email:', emailData);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
}

// Create a global instance
const apiService = new ApiService();

// Make it available globally to replace window.ezsite.apis
declare global {
  interface Window {
    ezsite: {
      apis: typeof apiService;
    };
  }
}

window.ezsite = {
  apis: apiService
};

export default apiService;