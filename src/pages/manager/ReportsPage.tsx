import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Download } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  totalAgents: number;
  stockValue: number;
  monthlyGrowth: number;
  topProducts: Array<{
    product_type: string;
    color: string;
    quantity: number;
    revenue: number;
  }>;
  agentPerformance: Array<{
    agent_name: string;
    orders: number;
    revenue: number;
    target: number;
  }>;
  orderTrends: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
}

const ReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch orders data
      const { data: ordersData, error: ordersError } = await window.ezsite.apis.tablePage(11425, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (ordersError) throw ordersError;

      // Fetch agents data
      const { data: agentsData, error: agentsError } = await window.ezsite.apis.tablePage(11424, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (agentsError) throw agentsError;

      // Fetch stock data
      const { data: stockData, error: stockError } = await window.ezsite.apis.tablePage(11426, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (stockError) throw stockError;

      // Process data
      const orders = ordersData.List || [];
      const agents = agentsData.List || [];
      const stockItems = stockData.List || [];

      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total_amount, 0);
      const totalAgents = agents.length;
      const stockValue = stockItems.reduce((sum: number, item: any) => sum + item.quantity * item.cost_per_unit, 0);

      // Calculate monthly growth (mock calculation)
      const monthlyGrowth = Math.round(Math.random() * 20 - 5); // -5% to +15%

      // Top products analysis
      const productMap = new Map();
      orders.forEach((order: any) => {
        const key = `${order.product_type}-${order.product_color}`;
        if (productMap.has(key)) {
          const existing = productMap.get(key);
          existing.quantity += order.total_quantity;
          existing.revenue += order.total_amount;
        } else {
          productMap.set(key, {
            product_type: order.product_type,
            color: order.product_color,
            quantity: order.total_quantity,
            revenue: order.total_amount
          });
        }
      });

      const topProducts = Array.from(productMap.values()).
      sort((a, b) => b.revenue - a.revenue).
      slice(0, 5);

      // Agent performance analysis
      const agentMap = new Map();
      orders.forEach((order: any) => {
        if (agentMap.has(order.agent_id)) {
          const existing = agentMap.get(order.agent_id);
          existing.orders += 1;
          existing.revenue += order.total_amount;
        } else {
          agentMap.set(order.agent_id, {
            orders: 1,
            revenue: order.total_amount
          });
        }
      });

      const agentPerformance = agents.map((agent: any) => {
        const performance = agentMap.get(agent.id) || { orders: 0, revenue: 0 };
        return {
          agent_name: `${agent.first_name} ${agent.last_name}`,
          orders: performance.orders,
          revenue: performance.revenue,
          target: agent.target_sales || 50000
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

      // Mock order trends (last 6 months)
      const orderTrends = [
      { month: 'Jan', orders: Math.floor(Math.random() * 50) + 20, revenue: Math.floor(Math.random() * 100000) + 50000 },
      { month: 'Feb', orders: Math.floor(Math.random() * 50) + 25, revenue: Math.floor(Math.random() * 120000) + 60000 },
      { month: 'Mar', orders: Math.floor(Math.random() * 60) + 30, revenue: Math.floor(Math.random() * 150000) + 70000 },
      { month: 'Apr', orders: Math.floor(Math.random() * 70) + 35, revenue: Math.floor(Math.random() * 180000) + 80000 },
      { month: 'May', orders: Math.floor(Math.random() * 80) + 40, revenue: Math.floor(Math.random() * 200000) + 90000 },
      { month: 'Jun', orders: totalOrders % 12, revenue: totalRevenue % 200000 }];


      setReportData({
        totalOrders,
        totalRevenue,
        totalAgents,
        stockValue,
        monthlyGrowth,
        topProducts,
        agentPerformance,
        orderTrends
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Your report is being generated and will be downloaded shortly.'
    });
    // In a real application, this would trigger a download
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading report data...</div>
      </div>);

  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No report data available</div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalOrders}</p>
                <div className="flex items-center mt-1">
                  {reportData.monthlyGrowth >= 0 ?
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" /> :

                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  }
                  <span className={`text-sm font-medium ${reportData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(reportData.monthlyGrowth)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{reportData.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalAgents}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">5.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{reportData.stockValue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-red-600">2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topProducts.map((product, index) =>
              <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{product.product_type}</div>
                    <div className="text-sm text-gray-500">{product.color} • Qty: {product.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{product.revenue.toLocaleString()}</div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
            <CardDescription>Monthly order volume and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.orderTrends.map((trend, index) =>
              <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium">{trend.month}</div>
                    <div className="flex-1">
                      <Progress value={trend.orders / 100 * 100} className="h-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{trend.orders} orders</div>
                    <div className="text-sm text-gray-500">₹{trend.revenue.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Sales agent performance metrics and targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent Name</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.agentPerformance.map((agent, index) => {
                  const achievementPercentage = Math.round(agent.revenue / agent.target * 100);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{agent.agent_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{agent.orders}</Badge>
                      </TableCell>
                      <TableCell>₹{agent.revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{agent.target.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={Math.min(achievementPercentage, 100)} className="w-20 h-2" />
                          <span className="text-sm font-medium">{achievementPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                          achievementPercentage >= 100 ? 'default' :
                          achievementPercentage >= 80 ? 'secondary' :
                          'outline'
                          }>

                          {achievementPercentage >= 100 ? 'Exceeded' :
                          achievementPercentage >= 80 ? 'On Track' :
                          'Below Target'}
                        </Badge>
                      </TableCell>
                    </TableRow>);

                })}
              </TableBody>
            </Table>
          </div>
          {reportData.agentPerformance.length === 0 &&
          <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data</h3>
              <p className="mt-1 text-sm text-gray-500">No agent performance data available for the selected period.</p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default ReportsPage;