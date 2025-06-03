import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ShoppingCart, DollarSign, Package, Users, TrendingUp, Clock, AlertTriangle,
  CheckCircle, BarChart3, Calendar, Plus, Edit, Trash2, Search, Eye,
  FileText, Filter, Download, RefreshCw } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReportsAndAnalytics from '@/components/ReportsAndAnalytics';
import AgentPasswordManagement from '@/components/AgentPasswordManagement';
import ProductConfigurationManager from '@/components/ProductConfigurationManager';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  totalAgents: number;
  activeAgents: number;
  lowStockItems: number;
}

interface Agent {
  ID: number;
  user_id: number;
  agent_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  territory: string;
  commission_rate: number;
  hire_date: string;
  status: string;
  target_sales: number;
}

interface Order {
  ID: number;
  order_number: string;
  agent_id: number;
  customer_name: string;
  customer_phone: string;
  product_type: string;
  product_color: string;
  total_quantity: number;
  order_status: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  delivery_date: string;
  order_type: string;
}

interface StockItem {
  ID: number;
  product_type: string;
  color: string;
  neck_type: string;
  size: string;
  quantity: number;
  min_threshold: number;
  cost_per_unit: number;
  selling_price: number;
  supplier: string;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (agents.length > 0 || orders.length > 0 || stockItems.length > 0) {
      calculateStats();
    }
  }, [agents, orders, stockItems]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
      loadAgents(),
      loadOrders(),
      loadStockItems()]
      );
      calculateStats();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11424', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setAgents(data.List || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11425', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setOrders(data.List || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadStockItems = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11426', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setStockItems(data.List || []);
    } catch (error) {
      console.error('Error loading stock items:', error);
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const pendingOrders = orders.filter((order) =>
    order.order_status === 'Pending' || order.order_status === 'In Production'
    ).length;
    const completedOrders = orders.filter((order) => order.order_status === 'Delivered').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalAgents = agents.length;
    const activeAgents = agents.filter((agent) => agent.status === 'Active').length;
    const lowStockItems = stockItems.filter((item) => item.quantity <= item.min_threshold).length;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue,
      totalAgents,
      activeAgents,
      lowStockItems
    });
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('11425', {
        ID: orderId,
        order_status: newStatus
      });
      if (error) throw error;

      await loadOrders();
      calculateStats();
      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      });
    }
  };

  const updateAgentStatus = async (agentId: number, newStatus: string) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('11424', {
        ID: agentId,
        status: newStatus
      });
      if (error) throw error;

      await loadAgents();
      calculateStats();
      toast({
        title: "Success",
        description: "Agent status updated successfully"
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update agent status"
      });
    }
  };

  const updateStockQuantity = async (stockId: number, newQuantity: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('11426', {
        ID: stockId,
        quantity: newQuantity
      });
      if (error) throw error;

      await loadStockItems();
      calculateStats();
      toast({
        title: "Success",
        description: "Stock quantity updated successfully"
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock quantity"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) =>
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            )}
          </div>
        </div>
      </div>);

  }

  const statCards = [
  {
    title: 'Total Orders',
    value: stats?.totalOrders || 0,
    icon: ShoppingCart,
    color: 'bg-blue-500',
    description: 'All time orders'
  },
  {
    title: 'Active Agents',
    value: `${stats?.activeAgents || 0}/${stats?.totalAgents || 0}`,
    icon: Users,
    color: 'bg-purple-500',
    description: 'Active agents'
  },
  {
    title: 'Low Stock Alerts',
    value: stats?.lowStockItems || 0,
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    description: 'Items need restocking'
  }];


  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':return 'default';
      case 'in production':return 'secondary';
      case 'shipped':return 'outline';
      case 'delivered':return 'default';
      case 'cancelled':return 'destructive';
      case 'active':return 'default';
      case 'inactive':return 'secondary';
      default:return 'outline';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm === '' ||
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || order.order_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = searchTerm === '' ||
    agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const lowStockItems = stockItems.filter((item) => item.quantity <= item.min_threshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Manager Access
          </Badge>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="passwords">Passwords</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) =>
                  <div key={order.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusBadgeVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">${order.total_amount}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span>Low Stock Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ?
                <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p>All items are well stocked!</p>
                  </div> :

                <div className="space-y-3">
                    {lowStockItems.slice(0, 5).map((item) =>
                  <div key={item.ID} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-medium">{item.product_type} - {item.color}</p>
                          <p className="text-sm text-gray-600">Size {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-700">{item.quantity} left</p>
                          <p className="text-xs text-gray-500">Min: {item.min_threshold}</p>
                        </div>
                      </div>
                  )}
                  </div>
                }
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Management Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>Orders Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Production">In Production</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ?
              <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus ? 'Try adjusting your search or filter.' : 'Orders will appear here when agents create them.'}
                  </p>
                </div> :

              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) =>
                    <TableRow key={order.ID}>
                          <TableCell className="font-medium">
                            {order.order_number || `ORD-${order.ID}`}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customer_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{order.customer_phone || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.product_type} - {order.product_color}
                          </TableCell>
                          <TableCell>{order.total_quantity || 0}</TableCell>
                          <TableCell>${(order.total_amount || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.order_status)}>
                              {order.order_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Select onValueChange={(value) => updateOrderStatus(order.ID, value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Update" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Production">In Production</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                  </Table>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Management Tab */}
        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Threshold</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.map((item) =>
                  <TableRow key={item.ID}>
                      <TableCell className="font-medium">{item.product_type}</TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>
                        <span className={item.quantity <= item.min_threshold ? 'text-red-600 font-bold' : ''}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.min_threshold}</TableCell>
                      <TableCell>${item.cost_per_unit}</TableCell>
                      <TableCell>${item.selling_price}</TableCell>
                      <TableCell>
                        {item.quantity <= item.min_threshold ?
                      <Badge variant="destructive">Low Stock</Badge> :

                      <Badge variant="default">In Stock</Badge>
                      }
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Stock Quantity</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Product: {item.product_type} - {item.color} - {item.size}</Label>
                              </div>
                              <div>
                                <Label htmlFor="quantity">New Quantity</Label>
                                <Input
                                id="quantity"
                                type="number"
                                defaultValue={item.quantity}
                                onChange={(e) => {
                                  if (e.target.value && parseInt(e.target.value) >= 0) {
                                    updateStockQuantity(item.ID, parseInt(e.target.value));
                                  }
                                }} />

                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Management Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>Agent Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48" />

                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Target Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) =>
                  <TableRow key={agent.ID}>
                      <TableCell className="font-medium">{agent.agent_code}</TableCell>
                      <TableCell>{agent.first_name} {agent.last_name}</TableCell>
                      <TableCell>{agent.territory}</TableCell>
                      <TableCell>{agent.phone}</TableCell>
                      <TableCell>{agent.commission_rate}%</TableCell>
                      <TableCell>${agent.target_sales.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(agent.status)}>
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select onValueChange={(value) => updateAgentStatus(agent.ID, value)}>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Management Tab */}
        <TabsContent value="passwords" className="space-y-6">
          <AgentPasswordManagement />
        </TabsContent>

        {/* Configuration Management Tab */}
        <TabsContent value="config" className="space-y-6">
          <ProductConfigurationManager />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsAndAnalytics />
        </TabsContent>
      </Tabs>
    </div>);

};

export default ManagerDashboard;