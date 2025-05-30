import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, TrendingUp, DollarSign, Users, Package, Calendar,
  Download, FileText, PieChart, Activity, Target } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  agentPerformance: AgentPerformance[];
  salesByMonth: MonthlySales[];
  productAnalysis: ProductAnalysis[];
  revenueMetrics: RevenueMetrics;
}

interface AgentPerformance {
  agentId: number;
  agentName: string;
  totalSales: number;
  ordersCount: number;
  target: number;
  achievement: number;
  commission: number;
}

interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface ProductAnalysis {
  productType: string;
  totalSold: number;
  revenue: number;
  averagePrice: number;
  profitMargin: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingPayments: number;
  completedPayments: number;
  profitMargin: number;
}

const ReportsAndAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedAgent, setSelectedAgent] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedAgent]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);

      // Load orders data
      const { data: ordersData, error: ordersError } = await window.ezsite.apis.tablePage('11425', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (ordersError) throw ordersError;

      // Load agents data
      const { data: agentsData, error: agentsError } = await window.ezsite.apis.tablePage('11424', {
        PageNo: 1,
        PageSize: 100,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (agentsError) throw agentsError;

      // Load stock data
      const { data: stockData, error: stockError } = await window.ezsite.apis.tablePage('11426', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });

      if (stockError) throw stockError;

      // Process the data to generate reports
      const orders = ordersData.List || [];
      const agents = agentsData.List || [];
      const stock = stockData.List || [];

      // Calculate agent performance
      const agentPerformance: AgentPerformance[] = agents.map((agent) => {
        const agentOrders = orders.filter((order) => order.agent_id === agent.ID);
        const totalSales = agentOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const ordersCount = agentOrders.length;
        const achievement = agent.target_sales > 0 ? totalSales / agent.target_sales * 100 : 0;
        const commission = totalSales * (agent.commission_rate / 100);

        return {
          agentId: agent.ID,
          agentName: `${agent.first_name} ${agent.last_name}`,
          totalSales,
          ordersCount,
          target: agent.target_sales,
          achievement,
          commission
        };
      });

      // Calculate monthly sales (last 12 months)
      const salesByMonth: MonthlySales[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthOrders = orders.filter((order) => {
          const orderDate = new Date(order.delivery_date);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });

        const revenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const ordersCount = monthOrders.length;
        const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

        salesByMonth.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue,
          orders: ordersCount,
          averageOrderValue
        });
      }

      // Calculate product analysis
      const productMap = new Map();
      orders.forEach((order) => {
        const key = order.product_type;
        if (!productMap.has(key)) {
          productMap.set(key, {
            productType: key,
            totalSold: 0,
            revenue: 0,
            orders: []
          });
        }
        const product = productMap.get(key);
        product.totalSold += order.total_quantity;
        product.revenue += order.total_amount;
        product.orders.push(order);
      });

      const productAnalysis: ProductAnalysis[] = Array.from(productMap.values()).map((product) => {
        const averagePrice = product.totalSold > 0 ? product.revenue / product.totalSold : 0;
        // Calculate profit margin based on stock cost
        const stockItem = stock.find((s) => s.product_type === product.productType);
        const costPrice = stockItem ? stockItem.cost_per_unit : 0;
        const profitMargin = averagePrice > 0 && costPrice > 0 ? (averagePrice - costPrice) / averagePrice * 100 : 0;

        return {
          productType: product.productType,
          totalSold: product.totalSold,
          revenue: product.revenue,
          averagePrice,
          profitMargin
        };
      });

      // Calculate revenue metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingPayments = orders.
      filter((order) => order.payment_status === 'Pending' || order.payment_status === 'Partial').
      reduce((sum, order) => sum + (order.total_amount - order.paid_amount), 0);
      const completedPayments = orders.
      filter((order) => order.payment_status === 'Complete').
      reduce((sum, order) => sum + order.paid_amount, 0);

      const totalCost = orders.reduce((sum, order) => {
        const stockItem = stock.find((s) => s.product_type === order.product_type);
        const costPrice = stockItem ? stockItem.cost_per_unit : 0;
        return sum + costPrice * order.total_quantity;
      }, 0);
      const profitMargin = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue * 100 : 0;

      const revenueMetrics: RevenueMetrics = {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        pendingPayments,
        completedPayments,
        profitMargin
      };

      setReportData({
        agentPerformance,
        salesByMonth,
        productAnalysis,
        revenueMetrics
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${type} report...`
    });
    // In a real implementation, this would generate and download the report
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) =>
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            )}
          </div>
        </div>
      </div>);

  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No report data available</p>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport('comprehensive')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${reportData.revenueMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-10">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.revenueMetrics.totalOrders}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${reportData.revenueMetrics.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.revenueMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500 bg-opacity-10">
                <BarChart3 className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Agent Performance</span>
            </CardTitle>
            <CardDescription>Sales performance by agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.agentPerformance.map((agent) =>
              <div key={agent.agentId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{agent.agentName}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">${agent.totalSales.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{agent.ordersCount} orders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={Math.min(agent.achievement, 100)} className="flex-1" />
                    <span className="text-sm text-gray-600 w-12">
                      {agent.achievement.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: ${agent.target.toLocaleString()}</span>
                    <span>Commission: ${agent.commission.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Product Analysis</span>
            </CardTitle>
            <CardDescription>Performance by product type</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.productAnalysis.map((product) =>
                <TableRow key={product.productType}>
                    <TableCell className="font-medium">{product.productType}</TableCell>
                    <TableCell>{product.totalSold}</TableCell>
                    <TableCell>${product.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={product.profitMargin > 20 ? "default" : "secondary"}>
                        {product.profitMargin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Monthly Sales Trend</span>
          </CardTitle>
          <CardDescription>Sales performance over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.salesByMonth.map((month) =>
            <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${month.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Avg: ${month.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Payment Status</span>
          </CardTitle>
          <CardDescription>Overview of payment collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Completed Payments</span>
                  <span className="text-sm font-bold text-green-600">
                    ${reportData.revenueMetrics.completedPayments.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={reportData.revenueMetrics.completedPayments / reportData.revenueMetrics.totalRevenue * 100}
                  className="h-2" />

              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pending Payments</span>
                  <span className="text-sm font-bold text-yellow-600">
                    ${reportData.revenueMetrics.pendingPayments.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={reportData.revenueMetrics.pendingPayments / reportData.revenueMetrics.totalRevenue * 100}
                  className="h-2" />

              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">
                  {(reportData.revenueMetrics.completedPayments / reportData.revenueMetrics.totalRevenue * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Collection Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Quick Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => exportReport('agents')} variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Agent Performance Report
            </Button>
            <Button onClick={() => exportReport('products')} variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Product Analysis Report
            </Button>
            <Button onClick={() => exportReport('financial')} variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Financial Summary Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ReportsAndAnalytics;