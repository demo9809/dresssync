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
      <div className="space-y-6" data-id="6yu3shw6f" data-path="src/pages/manager/ManagerDashboard.tsx">
        <div className="animate-pulse" data-id="iozjhh702" data-path="src/pages/manager/ManagerDashboard.tsx">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" data-id="n2xe04vj7" data-path="src/pages/manager/ManagerDashboard.tsx"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-id="khy6f46t1" data-path="src/pages/manager/ManagerDashboard.tsx">
            {[...Array(4)].map((_, i) =>
            <div key={i} className="h-32 bg-gray-200 rounded-lg" data-id="npowdz4ea" data-path="src/pages/manager/ManagerDashboard.tsx"></div>
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
    title: 'Total Revenue',
    value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
    icon: DollarSign,
    color: 'bg-green-500',
    description: 'Total earnings'
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
    <div className="space-y-6" data-id="4h89i5aja" data-path="src/pages/manager/ManagerDashboard.tsx">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between" data-id="wh1mhname" data-path="src/pages/manager/ManagerDashboard.tsx">
        <div data-id="jp9t1zipw" data-path="src/pages/manager/ManagerDashboard.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="07t3apalt" data-path="src/pages/manager/ManagerDashboard.tsx">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1" data-id="qpgr1ekgr" data-path="src/pages/manager/ManagerDashboard.tsx">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0" data-id="ykdy7pib0" data-path="src/pages/manager/ManagerDashboard.tsx">
          <Badge variant="default" className="bg-blue-100 text-blue-800" data-id="yf5q27n84" data-path="src/pages/manager/ManagerDashboard.tsx">
            Manager Access
          </Badge>
          <Button onClick={loadDashboardData} variant="outline" size="sm" data-id="m95hzpw8m" data-path="src/pages/manager/ManagerDashboard.tsx">
            <RefreshCw className="w-4 h-4 mr-2" data-id="ikzzokchw" data-path="src/pages/manager/ManagerDashboard.tsx" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="86mlho903" data-path="src/pages/manager/ManagerDashboard.tsx">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden" data-id="1yt8ukcl3" data-path="src/pages/manager/ManagerDashboard.tsx">
              <CardContent className="p-6" data-id="9351olktg" data-path="src/pages/manager/ManagerDashboard.tsx">
                <div className="flex items-center justify-between" data-id="l9sdjm3j8" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <div data-id="bu4c6bi0d" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <p className="text-sm font-medium text-gray-600" data-id="sb30ty5iu" data-path="src/pages/manager/ManagerDashboard.tsx">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900" data-id="5mqi34paw" data-path="src/pages/manager/ManagerDashboard.tsx">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1" data-id="0uwu5z23h" data-path="src/pages/manager/ManagerDashboard.tsx">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`} data-id="n5msgbqxo" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} data-id="apzlspkv6" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  </div>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-id="jhvittfju" data-path="src/pages/manager/ManagerDashboard.tsx">
        <TabsList className="grid w-full grid-cols-7" data-id="6s1g42qme" data-path="src/pages/manager/ManagerDashboard.tsx">
          <TabsTrigger value="overview" data-id="cnaw3tw5k" data-path="src/pages/manager/ManagerDashboard.tsx">Overview</TabsTrigger>
          // <TabsTrigger value="orders" data-id="25bwx0gh9" data-path="src/pages/manager/ManagerDashboard.tsx">Orders</TabsTrigger>
          <TabsTrigger value="stock" data-id="boqj7h7yv" data-path="src/pages/manager/ManagerDashboard.tsx">Stock</TabsTrigger>
          <TabsTrigger value="agents" data-id="6er7shsps" data-path="src/pages/manager/ManagerDashboard.tsx">Agents</TabsTrigger>
          <TabsTrigger value="passwords" data-id="ivcpf9a5v" data-path="src/pages/manager/ManagerDashboard.tsx">Passwords</TabsTrigger>
          <TabsTrigger value="config" data-id="y3oi7e7aj" data-path="src/pages/manager/ManagerDashboard.tsx">Configuration</TabsTrigger>
          <TabsTrigger value="reports" data-id="us8e9sro4" data-path="src/pages/manager/ManagerDashboard.tsx">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6" data-id="7hdvshw8k" data-path="src/pages/manager/ManagerDashboard.tsx">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="n1lviqhru" data-path="src/pages/manager/ManagerDashboard.tsx">
            {/* Recent Orders */}
            <Card data-id="2x3742glv" data-path="src/pages/manager/ManagerDashboard.tsx">
              <CardHeader data-id="t59q1ic9b" data-path="src/pages/manager/ManagerDashboard.tsx">
                <CardTitle className="flex items-center space-x-2" data-id="28s0ubdal" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <ShoppingCart className="w-5 h-5" data-id="ccdw38bs9" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  <span data-id="0nt29smhe" data-path="src/pages/manager/ManagerDashboard.tsx">Recent Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent data-id="zzmjl6ofy" data-path="src/pages/manager/ManagerDashboard.tsx">
                <div className="space-y-3" data-id="w5yfn548u" data-path="src/pages/manager/ManagerDashboard.tsx">
                  {orders.slice(0, 5).map((order) =>
                  <div key={order.ID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-id="ie31ia0bn" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <div data-id="iptz4yuyo" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <p className="font-medium" data-id="zn3wr2q31" data-path="src/pages/manager/ManagerDashboard.tsx">{order.order_number}</p>
                        <p className="text-sm text-gray-600" data-id="5wabda5t6" data-path="src/pages/manager/ManagerDashboard.tsx">{order.customer_name}</p>
                      </div>
                      <div className="text-right" data-id="g137h5uu3" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <Badge variant={getStatusBadgeVariant(order.order_status)} data-id="jk9clnaz4" data-path="src/pages/manager/ManagerDashboard.tsx">
                          {order.order_status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1" data-id="7lg5v968e" data-path="src/pages/manager/ManagerDashboard.tsx">${order.total_amount}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card data-id="qwk76av1j" data-path="src/pages/manager/ManagerDashboard.tsx">
              <CardHeader data-id="zui3tw9qv" data-path="src/pages/manager/ManagerDashboard.tsx">
                <CardTitle className="flex items-center space-x-2" data-id="y5v4uuuyk" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" data-id="tan8dkuk4" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  <span data-id="c93r2e44t" data-path="src/pages/manager/ManagerDashboard.tsx">Low Stock Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent data-id="z7a246ere" data-path="src/pages/manager/ManagerDashboard.tsx">
                {lowStockItems.length === 0 ?
                <div className="text-center py-6 text-gray-500" data-id="1fa7hre36" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" data-id="wvk1npq0l" data-path="src/pages/manager/ManagerDashboard.tsx" />
                    <p data-id="78os7vdl5" data-path="src/pages/manager/ManagerDashboard.tsx">All items are well stocked!</p>
                  </div> :

                <div className="space-y-3" data-id="8e1a9pyui" data-path="src/pages/manager/ManagerDashboard.tsx">
                    {lowStockItems.slice(0, 5).map((item) =>
                  <div key={item.ID} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200" data-id="6z3k2zn9t" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <div data-id="tkr2qwpem" data-path="src/pages/manager/ManagerDashboard.tsx">
                          <p className="font-medium" data-id="9h0s7ftv7" data-path="src/pages/manager/ManagerDashboard.tsx">{item.product_type} - {item.color}</p>
                          <p className="text-sm text-gray-600" data-id="d9sck2lor" data-path="src/pages/manager/ManagerDashboard.tsx">Size {item.size}</p>
                        </div>
                        <div className="text-right" data-id="xsejmynvr" data-path="src/pages/manager/ManagerDashboard.tsx">
                          <p className="text-sm font-medium text-yellow-700" data-id="qa0tuf9am" data-path="src/pages/manager/ManagerDashboard.tsx">{item.quantity} left</p>
                          <p className="text-xs text-gray-500" data-id="870gbe4p8" data-path="src/pages/manager/ManagerDashboard.tsx">Min: {item.min_threshold}</p>
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
        <TabsContent value="orders" className="space-y-6" data-id="nw594r9zz" data-path="src/pages/manager/ManagerDashboard.tsx">
          <Card data-id="8d5yyd6g7" data-path="src/pages/manager/ManagerDashboard.tsx">
            <CardHeader data-id="z18697772" data-path="src/pages/manager/ManagerDashboard.tsx">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0" data-id="q4f44uy2n" data-path="src/pages/manager/ManagerDashboard.tsx">
                <CardTitle data-id="11oo53hoi" data-path="src/pages/manager/ManagerDashboard.tsx">Orders Management</CardTitle>
                <div className="flex items-center space-x-2" data-id="umuwrdo0z" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <div className="flex items-center space-x-2" data-id="bsmm796uz" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <Search className="w-4 h-4 text-gray-400" data-id="gobuprkpb" data-path="src/pages/manager/ManagerDashboard.tsx" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-48" data-id="56samqjp6" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus} data-id="x7wtg2to1" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <SelectTrigger className="w-40" data-id="49mzjmuqn" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <SelectValue placeholder="All Status" data-id="qjsqkucbb" data-path="src/pages/manager/ManagerDashboard.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="onnvbzn5v" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <SelectItem value="" data-id="0up5380ct" data-path="src/pages/manager/ManagerDashboard.tsx">All Status</SelectItem>
                      <SelectItem value="Pending" data-id="l583jx9js" data-path="src/pages/manager/ManagerDashboard.tsx">Pending</SelectItem>
                      <SelectItem value="In Production" data-id="dk9f3dbc6" data-path="src/pages/manager/ManagerDashboard.tsx">In Production</SelectItem>
                      <SelectItem value="Shipped" data-id="zozawh1x8" data-path="src/pages/manager/ManagerDashboard.tsx">Shipped</SelectItem>
                      <SelectItem value="Delivered" data-id="zehw8y682" data-path="src/pages/manager/ManagerDashboard.tsx">Delivered</SelectItem>
                      <SelectItem value="Cancelled" data-id="jjcitailh" data-path="src/pages/manager/ManagerDashboard.tsx">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent data-id="ggar6n1pq" data-path="src/pages/manager/ManagerDashboard.tsx">
              {filteredOrders.length === 0 ?
              <div className="text-center py-8" data-id="4m8byj7jn" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" data-id="3i0d93jec" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="kkz0mtnq2" data-path="src/pages/manager/ManagerDashboard.tsx">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500" data-id="4we868sor" data-path="src/pages/manager/ManagerDashboard.tsx">
                    {searchTerm || filterStatus ? 'Try adjusting your search or filter.' : 'Orders will appear here when agents create them.'}
                  </p>
                </div> :

              <div className="overflow-x-auto" data-id="md8xw3fl6" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <Table data-id="mpvoc95r5" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <TableHeader data-id="61b1uy8st" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <TableRow data-id="elp9f1sf7" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <TableHead data-id="zgpu5i37x" data-path="src/pages/manager/ManagerDashboard.tsx">Order #</TableHead>
                        <TableHead data-id="3qxpxwiqn" data-path="src/pages/manager/ManagerDashboard.tsx">Customer</TableHead>
                        <TableHead data-id="j6hrsty9y" data-path="src/pages/manager/ManagerDashboard.tsx">Product</TableHead>
                        <TableHead data-id="iesetw9c1" data-path="src/pages/manager/ManagerDashboard.tsx">Quantity</TableHead>
                        <TableHead data-id="y4my4m4es" data-path="src/pages/manager/ManagerDashboard.tsx">Amount</TableHead>
                        <TableHead data-id="2p2orvrj6" data-path="src/pages/manager/ManagerDashboard.tsx">Status</TableHead>
                        <TableHead data-id="zlvfrtret" data-path="src/pages/manager/ManagerDashboard.tsx">Delivery Date</TableHead>
                        <TableHead data-id="n2hcea3i7" data-path="src/pages/manager/ManagerDashboard.tsx">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-id="zuxbba4es" data-path="src/pages/manager/ManagerDashboard.tsx">
                      {filteredOrders.map((order) =>
                    <TableRow key={order.ID} data-id="x1velxnqt" data-path="src/pages/manager/ManagerDashboard.tsx">
                          <TableCell className="font-medium" data-id="32lzolevq" data-path="src/pages/manager/ManagerDashboard.tsx">
                            {order.order_number || `ORD-${order.ID}`}
                          </TableCell>
                          <TableCell data-id="f8832ipb2" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <div data-id="igbeg2k8j" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <div className="font-medium" data-id="exo9myd3r" data-path="src/pages/manager/ManagerDashboard.tsx">{order.customer_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500" data-id="9lenmk85l" data-path="src/pages/manager/ManagerDashboard.tsx">{order.customer_phone || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell data-id="r812bo7pz" data-path="src/pages/manager/ManagerDashboard.tsx">
                            {order.product_type} - {order.product_color}
                          </TableCell>
                          <TableCell data-id="kjk99asyh" data-path="src/pages/manager/ManagerDashboard.tsx">{order.total_quantity || 0}</TableCell>
                          <TableCell data-id="jdgu2u4em" data-path="src/pages/manager/ManagerDashboard.tsx">${(order.total_amount || 0).toFixed(2)}</TableCell>
                          <TableCell data-id="co00llut3" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <Badge variant={getStatusBadgeVariant(order.order_status)} data-id="j5yq7nflt" data-path="src/pages/manager/ManagerDashboard.tsx">
                              {order.order_status}
                            </Badge>
                          </TableCell>
                          <TableCell data-id="43xhwhnnw" data-path="src/pages/manager/ManagerDashboard.tsx">
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}
                          </TableCell>
                          <TableCell data-id="d8mhps61i" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <div className="flex items-center space-x-2" data-id="gyhttouve" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <Select onValueChange={(value) => updateOrderStatus(order.ID, value)} data-id="qahuubhe1" data-path="src/pages/manager/ManagerDashboard.tsx">
                                <SelectTrigger className="w-32" data-id="fdgaxnbx2" data-path="src/pages/manager/ManagerDashboard.tsx">
                                  <SelectValue placeholder="Update" data-id="bu415uzr3" data-path="src/pages/manager/ManagerDashboard.tsx" />
                                </SelectTrigger>
                                <SelectContent data-id="zb38xuzpp" data-path="src/pages/manager/ManagerDashboard.tsx">
                                  <SelectItem value="Pending" data-id="bgxkzt35v" data-path="src/pages/manager/ManagerDashboard.tsx">Pending</SelectItem>
                                  <SelectItem value="In Production" data-id="cliewf2yd" data-path="src/pages/manager/ManagerDashboard.tsx">In Production</SelectItem>
                                  <SelectItem value="Shipped" data-id="3prz5rmuh" data-path="src/pages/manager/ManagerDashboard.tsx">Shipped</SelectItem>
                                  <SelectItem value="Delivered" data-id="hwe6kqyyq" data-path="src/pages/manager/ManagerDashboard.tsx">Delivered</SelectItem>
                                  <SelectItem value="Cancelled" data-id="a2wspcud3" data-path="src/pages/manager/ManagerDashboard.tsx">Cancelled</SelectItem>
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
        <TabsContent value="stock" className="space-y-6" data-id="somflrgl2" data-path="src/pages/manager/ManagerDashboard.tsx">
          <Card data-id="rl95boa43" data-path="src/pages/manager/ManagerDashboard.tsx">
            <CardHeader data-id="7ewysyz3a" data-path="src/pages/manager/ManagerDashboard.tsx">
              <CardTitle data-id="dqrsxpau6" data-path="src/pages/manager/ManagerDashboard.tsx">Stock Management</CardTitle>
            </CardHeader>
            <CardContent data-id="8rw0ttv8v" data-path="src/pages/manager/ManagerDashboard.tsx">
              <Table data-id="g743zmmf1" data-path="src/pages/manager/ManagerDashboard.tsx">
                <TableHeader data-id="ynbezgnce" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <TableRow data-id="064so2j21" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <TableHead data-id="5mo8tt6wd" data-path="src/pages/manager/ManagerDashboard.tsx">Product</TableHead>
                    <TableHead data-id="fkgwid44f" data-path="src/pages/manager/ManagerDashboard.tsx">Color</TableHead>
                    <TableHead data-id="rqraez88o" data-path="src/pages/manager/ManagerDashboard.tsx">Size</TableHead>
                    <TableHead data-id="1iu3hbq7d" data-path="src/pages/manager/ManagerDashboard.tsx">Current Stock</TableHead>
                    <TableHead data-id="453sil48x" data-path="src/pages/manager/ManagerDashboard.tsx">Min Threshold</TableHead>
                    <TableHead data-id="exgkpw5uk" data-path="src/pages/manager/ManagerDashboard.tsx">Cost Price</TableHead>
                    <TableHead data-id="164dvbebg" data-path="src/pages/manager/ManagerDashboard.tsx">Selling Price</TableHead>
                    <TableHead data-id="d0naomfid" data-path="src/pages/manager/ManagerDashboard.tsx">Status</TableHead>
                    <TableHead data-id="39hh6np8z" data-path="src/pages/manager/ManagerDashboard.tsx">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-id="7fmqwkhrh" data-path="src/pages/manager/ManagerDashboard.tsx">
                  {stockItems.map((item) =>
                  <TableRow key={item.ID} data-id="fi9gw0xz7" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <TableCell className="font-medium" data-id="thab7ysah" data-path="src/pages/manager/ManagerDashboard.tsx">{item.product_type}</TableCell>
                      <TableCell data-id="1fobh6zwr" data-path="src/pages/manager/ManagerDashboard.tsx">{item.color}</TableCell>
                      <TableCell data-id="z1s7t8qum" data-path="src/pages/manager/ManagerDashboard.tsx">{item.size}</TableCell>
                      <TableCell data-id="eql63i3m0" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <span className={item.quantity <= item.min_threshold ? 'text-red-600 font-bold' : ''} data-id="sv21hol6g" data-path="src/pages/manager/ManagerDashboard.tsx">
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell data-id="9ah5w8div" data-path="src/pages/manager/ManagerDashboard.tsx">{item.min_threshold}</TableCell>
                      <TableCell data-id="lbh5v0yw9" data-path="src/pages/manager/ManagerDashboard.tsx">${item.cost_per_unit}</TableCell>
                      <TableCell data-id="kup562hjc" data-path="src/pages/manager/ManagerDashboard.tsx">${item.selling_price}</TableCell>
                      <TableCell data-id="1u8rub132" data-path="src/pages/manager/ManagerDashboard.tsx">
                        {item.quantity <= item.min_threshold ?
                      <Badge variant="destructive" data-id="hfsj1hhpp" data-path="src/pages/manager/ManagerDashboard.tsx">Low Stock</Badge> :

                      <Badge variant="default" data-id="q770947on" data-path="src/pages/manager/ManagerDashboard.tsx">In Stock</Badge>
                      }
                      </TableCell>
                      <TableCell data-id="i5t9jwb69" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <Dialog data-id="hk09ogdy2" data-path="src/pages/manager/ManagerDashboard.tsx">
                          <DialogTrigger asChild data-id="7gly6w5d0" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <Button variant="outline" size="sm" data-id="jnvj9v4ss" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <Edit className="w-4 h-4" data-id="efc0ozgx6" data-path="src/pages/manager/ManagerDashboard.tsx" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-id="v82iiw9ym" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <DialogHeader data-id="85894ezz5" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <DialogTitle data-id="8j5vcz00j" data-path="src/pages/manager/ManagerDashboard.tsx">Update Stock Quantity</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4" data-id="op0vugccl" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <div data-id="o4nt6vxu8" data-path="src/pages/manager/ManagerDashboard.tsx">
                                <Label data-id="yej3dsgml" data-path="src/pages/manager/ManagerDashboard.tsx">Product: {item.product_type} - {item.color} - {item.size}</Label>
                              </div>
                              <div data-id="4ydqfx5hz" data-path="src/pages/manager/ManagerDashboard.tsx">
                                <Label htmlFor="quantity" data-id="1ia84d6p5" data-path="src/pages/manager/ManagerDashboard.tsx">New Quantity</Label>
                                <Input
                                id="quantity"
                                type="number"
                                defaultValue={item.quantity}
                                onChange={(e) => {
                                  if (e.target.value && parseInt(e.target.value) >= 0) {
                                    updateStockQuantity(item.ID, parseInt(e.target.value));
                                  }
                                }} data-id="288aayvpj" data-path="src/pages/manager/ManagerDashboard.tsx" />

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
        <TabsContent value="agents" className="space-y-6" data-id="gs2yajsru" data-path="src/pages/manager/ManagerDashboard.tsx">
          <Card data-id="pw5bhwlbz" data-path="src/pages/manager/ManagerDashboard.tsx">
            <CardHeader data-id="llf68w1d4" data-path="src/pages/manager/ManagerDashboard.tsx">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0" data-id="6qwshb7qn" data-path="src/pages/manager/ManagerDashboard.tsx">
                <CardTitle data-id="plnptcg5w" data-path="src/pages/manager/ManagerDashboard.tsx">Agent Management</CardTitle>
                <div className="flex items-center space-x-2" data-id="2j01xbrjf" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <Search className="w-4 h-4 text-gray-400" data-id="0auvstuhn" data-path="src/pages/manager/ManagerDashboard.tsx" />
                  <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48" data-id="nqhwsf4v1" data-path="src/pages/manager/ManagerDashboard.tsx" />

                </div>
              </div>
            </CardHeader>
            <CardContent data-id="83nusdrjd" data-path="src/pages/manager/ManagerDashboard.tsx">
              <Table data-id="oafkr753j" data-path="src/pages/manager/ManagerDashboard.tsx">
                <TableHeader data-id="de67k9t7q" data-path="src/pages/manager/ManagerDashboard.tsx">
                  <TableRow data-id="1fxrppxvw" data-path="src/pages/manager/ManagerDashboard.tsx">
                    <TableHead data-id="0umznf33v" data-path="src/pages/manager/ManagerDashboard.tsx">Agent Code</TableHead>
                    <TableHead data-id="nx9t9yidq" data-path="src/pages/manager/ManagerDashboard.tsx">Name</TableHead>
                    <TableHead data-id="dfngk2svk" data-path="src/pages/manager/ManagerDashboard.tsx">Territory</TableHead>
                    <TableHead data-id="5wce5tnzg" data-path="src/pages/manager/ManagerDashboard.tsx">Phone</TableHead>
                    <TableHead data-id="u20gqj2ro" data-path="src/pages/manager/ManagerDashboard.tsx">Commission Rate</TableHead>
                    <TableHead data-id="dpd8w53gx" data-path="src/pages/manager/ManagerDashboard.tsx">Target Sales</TableHead>
                    <TableHead data-id="bjnhr1z80" data-path="src/pages/manager/ManagerDashboard.tsx">Status</TableHead>
                    <TableHead data-id="r42xr8gig" data-path="src/pages/manager/ManagerDashboard.tsx">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-id="um4oo99xu" data-path="src/pages/manager/ManagerDashboard.tsx">
                  {filteredAgents.map((agent) =>
                  <TableRow key={agent.ID} data-id="lpfq5fj1y" data-path="src/pages/manager/ManagerDashboard.tsx">
                      <TableCell className="font-medium" data-id="4rpdnurs4" data-path="src/pages/manager/ManagerDashboard.tsx">{agent.agent_code}</TableCell>
                      <TableCell data-id="ydh5ilsmc" data-path="src/pages/manager/ManagerDashboard.tsx">{agent.first_name} {agent.last_name}</TableCell>
                      <TableCell data-id="m0i5a6i4p" data-path="src/pages/manager/ManagerDashboard.tsx">{agent.territory}</TableCell>
                      <TableCell data-id="qqp7695cd" data-path="src/pages/manager/ManagerDashboard.tsx">{agent.phone}</TableCell>
                      <TableCell data-id="ppppuxa9k" data-path="src/pages/manager/ManagerDashboard.tsx">{agent.commission_rate}%</TableCell>
                      <TableCell data-id="x1hvp45jl" data-path="src/pages/manager/ManagerDashboard.tsx">${agent.target_sales.toLocaleString()}</TableCell>
                      <TableCell data-id="j1nymm8ia" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <Badge variant={getStatusBadgeVariant(agent.status)} data-id="ojr9rklqc" data-path="src/pages/manager/ManagerDashboard.tsx">
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-id="59uxqdb6w" data-path="src/pages/manager/ManagerDashboard.tsx">
                        <div className="flex items-center space-x-2" data-id="75bivkxiw" data-path="src/pages/manager/ManagerDashboard.tsx">
                          <Select onValueChange={(value) => updateAgentStatus(agent.ID, value)} data-id="8030qk1hb" data-path="src/pages/manager/ManagerDashboard.tsx">
                            <SelectTrigger className="w-24" data-id="ac1bgvxpz" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <SelectValue placeholder="Status" data-id="grd2yieg9" data-path="src/pages/manager/ManagerDashboard.tsx" />
                            </SelectTrigger>
                            <SelectContent data-id="dljd8ug6q" data-path="src/pages/manager/ManagerDashboard.tsx">
                              <SelectItem value="Active" data-id="gvzrt450h" data-path="src/pages/manager/ManagerDashboard.tsx">Active</SelectItem>
                              <SelectItem value="Inactive" data-id="0oram0ycc" data-path="src/pages/manager/ManagerDashboard.tsx">Inactive</SelectItem>
                              <SelectItem value="Suspended" data-id="097rkgz8o" data-path="src/pages/manager/ManagerDashboard.tsx">Suspended</SelectItem>
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
        <TabsContent value="passwords" className="space-y-6" data-id="381nud6tr" data-path="src/pages/manager/ManagerDashboard.tsx">
          <AgentPasswordManagement data-id="6y20xzuxr" data-path="src/pages/manager/ManagerDashboard.tsx" />
        </TabsContent>

        {/* Configuration Management Tab */}
        <TabsContent value="config" className="space-y-6" data-id="1q3vf2jcx" data-path="src/pages/manager/ManagerDashboard.tsx">
          <ProductConfigurationManager data-id="dwfg5zqmr" data-path="src/pages/manager/ManagerDashboard.tsx" />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6" data-id="y7aebzlyr" data-path="src/pages/manager/ManagerDashboard.tsx">
          <ReportsAndAnalytics data-id="ktosn991g" data-path="src/pages/manager/ManagerDashboard.tsx" />
        </TabsContent>
      </Tabs>
    </div>);

};

export default ManagerDashboard;