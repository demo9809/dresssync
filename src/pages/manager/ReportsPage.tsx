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
      <div className="flex items-center justify-center h-64" data-id="2bihfxups" data-path="src/pages/manager/ReportsPage.tsx">
        <div className="text-lg" data-id="g429mi09p" data-path="src/pages/manager/ReportsPage.tsx">Loading report data...</div>
      </div>);

  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64" data-id="7xxr17qx3" data-path="src/pages/manager/ReportsPage.tsx">
        <div className="text-lg" data-id="0kr8021nc" data-path="src/pages/manager/ReportsPage.tsx">No report data available</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="73gyn21nq" data-path="src/pages/manager/ReportsPage.tsx">
      <div className="flex items-center justify-between" data-id="zrgv32y2a" data-path="src/pages/manager/ReportsPage.tsx">
        <div data-id="6mosvizs4" data-path="src/pages/manager/ReportsPage.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="mbtf0vwdg" data-path="src/pages/manager/ReportsPage.tsx">Reports & Analytics</h1>
          <p className="text-gray-600" data-id="0pyrana2e" data-path="src/pages/manager/ReportsPage.tsx">Business insights and performance metrics</p>
        </div>
        <div className="flex space-x-4" data-id="2vhbz29ij" data-path="src/pages/manager/ReportsPage.tsx">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod} data-id="lh5dn4acq" data-path="src/pages/manager/ReportsPage.tsx">
            <SelectTrigger className="w-48" data-id="npm5zdmeq" data-path="src/pages/manager/ReportsPage.tsx">
              <SelectValue placeholder="Select period" data-id="ywiz9a4lw" data-path="src/pages/manager/ReportsPage.tsx" />
            </SelectTrigger>
            <SelectContent data-id="vfjjbimqu" data-path="src/pages/manager/ReportsPage.tsx">
              <SelectItem value="7" data-id="dg4cchavr" data-path="src/pages/manager/ReportsPage.tsx">Last 7 days</SelectItem>
              <SelectItem value="30" data-id="iz630gn23" data-path="src/pages/manager/ReportsPage.tsx">Last 30 days</SelectItem>
              <SelectItem value="90" data-id="ozrui8ey3" data-path="src/pages/manager/ReportsPage.tsx">Last 90 days</SelectItem>
              <SelectItem value="365" data-id="6jy7wyvch" data-path="src/pages/manager/ReportsPage.tsx">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} data-id="m2uinihnv" data-path="src/pages/manager/ReportsPage.tsx">
            <Download className="w-4 h-4 mr-2" data-id="ecbavm87a" data-path="src/pages/manager/ReportsPage.tsx" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="wmu7b432j" data-path="src/pages/manager/ReportsPage.tsx">
        <Card data-id="lpyb0rjzf" data-path="src/pages/manager/ReportsPage.tsx">
          <CardContent className="p-6" data-id="h2dane8vo" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="flex items-center" data-id="vp8g6dbcm" data-path="src/pages/manager/ReportsPage.tsx">
              <ShoppingCart className="h-8 w-8 text-blue-600" data-id="e3fdx1ohd" data-path="src/pages/manager/ReportsPage.tsx" />
              <div className="ml-4" data-id="bbbn5uwki" data-path="src/pages/manager/ReportsPage.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="fhysv6ygu" data-path="src/pages/manager/ReportsPage.tsx">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900" data-id="zpuai502i" data-path="src/pages/manager/ReportsPage.tsx">{reportData.totalOrders}</p>
                <div className="flex items-center mt-1" data-id="jb7cf4n8i" data-path="src/pages/manager/ReportsPage.tsx">
                  {reportData.monthlyGrowth >= 0 ?
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" data-id="y8jah1izm" data-path="src/pages/manager/ReportsPage.tsx" /> :

                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" data-id="r7stgx0zn" data-path="src/pages/manager/ReportsPage.tsx" />
                  }
                  <span className={`text-sm font-medium ${reportData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} data-id="dxdije63u" data-path="src/pages/manager/ReportsPage.tsx">
                    {Math.abs(reportData.monthlyGrowth)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="l3wx128ur" data-path="src/pages/manager/ReportsPage.tsx">
          <CardContent className="p-6" data-id="f5iiin2tq" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="flex items-center" data-id="ag6qmkj13" data-path="src/pages/manager/ReportsPage.tsx">
              <DollarSign className="h-8 w-8 text-green-600" data-id="nwzynlsmz" data-path="src/pages/manager/ReportsPage.tsx" />
              <div className="ml-4" data-id="gk1dd2axh" data-path="src/pages/manager/ReportsPage.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="saclroi5y" data-path="src/pages/manager/ReportsPage.tsx">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900" data-id="5sjb521lu" data-path="src/pages/manager/ReportsPage.tsx">₹{reportData.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1" data-id="qllg0mu3z" data-path="src/pages/manager/ReportsPage.tsx">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" data-id="p8wde7lys" data-path="src/pages/manager/ReportsPage.tsx" />
                  <span className="text-sm font-medium text-green-600" data-id="73sec9oy2" data-path="src/pages/manager/ReportsPage.tsx">12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="3paryvlrc" data-path="src/pages/manager/ReportsPage.tsx">
          <CardContent className="p-6" data-id="3wzi4fy9q" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="flex items-center" data-id="qw3zv46rf" data-path="src/pages/manager/ReportsPage.tsx">
              <Users className="h-8 w-8 text-purple-600" data-id="2v22s3fuy" data-path="src/pages/manager/ReportsPage.tsx" />
              <div className="ml-4" data-id="o1jxlsyos" data-path="src/pages/manager/ReportsPage.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="jgu6vkl0d" data-path="src/pages/manager/ReportsPage.tsx">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900" data-id="mn42kpga4" data-path="src/pages/manager/ReportsPage.tsx">{reportData.totalAgents}</p>
                <div className="flex items-center mt-1" data-id="khdt00elh" data-path="src/pages/manager/ReportsPage.tsx">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" data-id="jeynn0qy7" data-path="src/pages/manager/ReportsPage.tsx" />
                  <span className="text-sm font-medium text-green-600" data-id="jfddsznvg" data-path="src/pages/manager/ReportsPage.tsx">5.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="10mky086i" data-path="src/pages/manager/ReportsPage.tsx">
          <CardContent className="p-6" data-id="n8shsk9ei" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="flex items-center" data-id="zsz70a3j4" data-path="src/pages/manager/ReportsPage.tsx">
              <Package className="h-8 w-8 text-orange-600" data-id="7pd7x5cst" data-path="src/pages/manager/ReportsPage.tsx" />
              <div className="ml-4" data-id="gaqascds8" data-path="src/pages/manager/ReportsPage.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="yzrrsiky1" data-path="src/pages/manager/ReportsPage.tsx">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900" data-id="f0zi5g9ky" data-path="src/pages/manager/ReportsPage.tsx">₹{reportData.stockValue.toLocaleString()}</p>
                <div className="flex items-center mt-1" data-id="5lxdpdjp1" data-path="src/pages/manager/ReportsPage.tsx">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" data-id="bjiplnduz" data-path="src/pages/manager/ReportsPage.tsx" />
                  <span className="text-sm font-medium text-red-600" data-id="i5w47cd5e" data-path="src/pages/manager/ReportsPage.tsx">2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="mu9c7i6hq" data-path="src/pages/manager/ReportsPage.tsx">
        {/* Top Products */}
        <Card data-id="p0htldi2t" data-path="src/pages/manager/ReportsPage.tsx">
          <CardHeader data-id="2350uu3a0" data-path="src/pages/manager/ReportsPage.tsx">
            <CardTitle data-id="p21fqwwkh" data-path="src/pages/manager/ReportsPage.tsx">Top Selling Products</CardTitle>
            <CardDescription data-id="lpcbc8t7u" data-path="src/pages/manager/ReportsPage.tsx">Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent data-id="ocum7ywy5" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="space-y-4" data-id="jzdjvlqwt" data-path="src/pages/manager/ReportsPage.tsx">
              {reportData.topProducts.map((product, index) =>
              <div key={index} className="flex items-center justify-between" data-id="nqhzcspj2" data-path="src/pages/manager/ReportsPage.tsx">
                  <div data-id="5n57cqllw" data-path="src/pages/manager/ReportsPage.tsx">
                    <div className="font-medium" data-id="vnquob7zl" data-path="src/pages/manager/ReportsPage.tsx">{product.product_type}</div>
                    <div className="text-sm text-gray-500" data-id="ou6yrgwkp" data-path="src/pages/manager/ReportsPage.tsx">{product.color} • Qty: {product.quantity}</div>
                  </div>
                  <div className="text-right" data-id="rf77j6wty" data-path="src/pages/manager/ReportsPage.tsx">
                    <div className="font-medium" data-id="9f1sfqjxo" data-path="src/pages/manager/ReportsPage.tsx">₹{product.revenue.toLocaleString()}</div>
                    <Badge variant="secondary" className="text-xs" data-id="he66osizm" data-path="src/pages/manager/ReportsPage.tsx">
                      #{index + 1}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Trends */}
        <Card data-id="8rwjrs369" data-path="src/pages/manager/ReportsPage.tsx">
          <CardHeader data-id="gpiti3l9x" data-path="src/pages/manager/ReportsPage.tsx">
            <CardTitle data-id="ce9dbo929" data-path="src/pages/manager/ReportsPage.tsx">Order Trends</CardTitle>
            <CardDescription data-id="hbws96h1w" data-path="src/pages/manager/ReportsPage.tsx">Monthly order volume and revenue</CardDescription>
          </CardHeader>
          <CardContent data-id="ypruzw5jk" data-path="src/pages/manager/ReportsPage.tsx">
            <div className="space-y-4" data-id="dxi7nh4i7" data-path="src/pages/manager/ReportsPage.tsx">
              {reportData.orderTrends.map((trend, index) =>
              <div key={index} className="flex items-center justify-between" data-id="5x9mw0l6d" data-path="src/pages/manager/ReportsPage.tsx">
                  <div className="flex items-center space-x-4" data-id="a02tjpvgw" data-path="src/pages/manager/ReportsPage.tsx">
                    <div className="w-12 text-sm font-medium" data-id="qgwkunu0e" data-path="src/pages/manager/ReportsPage.tsx">{trend.month}</div>
                    <div className="flex-1" data-id="8l7jqgxny" data-path="src/pages/manager/ReportsPage.tsx">
                      <Progress value={trend.orders / 100 * 100} className="h-2" data-id="n46r9eykq" data-path="src/pages/manager/ReportsPage.tsx" />
                    </div>
                  </div>
                  <div className="text-right" data-id="wn6hol52a" data-path="src/pages/manager/ReportsPage.tsx">
                    <div className="font-medium" data-id="mwpcvot2a" data-path="src/pages/manager/ReportsPage.tsx">{trend.orders} orders</div>
                    <div className="text-sm text-gray-500" data-id="pt9fiycro" data-path="src/pages/manager/ReportsPage.tsx">₹{trend.revenue.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card data-id="u5uprw9cd" data-path="src/pages/manager/ReportsPage.tsx">
        <CardHeader data-id="e8040h571" data-path="src/pages/manager/ReportsPage.tsx">
          <CardTitle data-id="jczq255js" data-path="src/pages/manager/ReportsPage.tsx">Agent Performance</CardTitle>
          <CardDescription data-id="m9ct5l1t7" data-path="src/pages/manager/ReportsPage.tsx">Sales agent performance metrics and targets</CardDescription>
        </CardHeader>
        <CardContent data-id="b7jabp5gj" data-path="src/pages/manager/ReportsPage.tsx">
          <div className="overflow-x-auto" data-id="9oymsy7wr" data-path="src/pages/manager/ReportsPage.tsx">
            <Table data-id="evzf5197g" data-path="src/pages/manager/ReportsPage.tsx">
              <TableHeader data-id="ckku1dc22" data-path="src/pages/manager/ReportsPage.tsx">
                <TableRow data-id="6bxjzxh0v" data-path="src/pages/manager/ReportsPage.tsx">
                  <TableHead data-id="0657vgmd7" data-path="src/pages/manager/ReportsPage.tsx">Agent Name</TableHead>
                  <TableHead data-id="kd6y9yovp" data-path="src/pages/manager/ReportsPage.tsx">Orders</TableHead>
                  <TableHead data-id="q37ghwktu" data-path="src/pages/manager/ReportsPage.tsx">Revenue</TableHead>
                  <TableHead data-id="m91qght2d" data-path="src/pages/manager/ReportsPage.tsx">Target</TableHead>
                  <TableHead data-id="9ne2o2krb" data-path="src/pages/manager/ReportsPage.tsx">Achievement</TableHead>
                  <TableHead data-id="x3rd9o7wc" data-path="src/pages/manager/ReportsPage.tsx">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-id="urtfmbh3d" data-path="src/pages/manager/ReportsPage.tsx">
                {reportData.agentPerformance.map((agent, index) => {
                  const achievementPercentage = Math.round(agent.revenue / agent.target * 100);
                  return (
                    <TableRow key={index} data-id="jucmqfpn7" data-path="src/pages/manager/ReportsPage.tsx">
                      <TableCell data-id="ce17zqqcf" data-path="src/pages/manager/ReportsPage.tsx">
                        <div className="font-medium" data-id="m5svfcuwo" data-path="src/pages/manager/ReportsPage.tsx">{agent.agent_name}</div>
                      </TableCell>
                      <TableCell data-id="c9n9hbwa2" data-path="src/pages/manager/ReportsPage.tsx">
                        <Badge variant="secondary" data-id="ra7gbres9" data-path="src/pages/manager/ReportsPage.tsx">{agent.orders}</Badge>
                      </TableCell>
                      <TableCell data-id="xnn3zjayb" data-path="src/pages/manager/ReportsPage.tsx">₹{agent.revenue.toLocaleString()}</TableCell>
                      <TableCell data-id="7upt9y0sd" data-path="src/pages/manager/ReportsPage.tsx">₹{agent.target.toLocaleString()}</TableCell>
                      <TableCell data-id="xfmlth5m9" data-path="src/pages/manager/ReportsPage.tsx">
                        <div className="flex items-center space-x-2" data-id="5twp0ok0t" data-path="src/pages/manager/ReportsPage.tsx">
                          <Progress value={Math.min(achievementPercentage, 100)} className="w-20 h-2" data-id="dlwz93j88" data-path="src/pages/manager/ReportsPage.tsx" />
                          <span className="text-sm font-medium" data-id="swkebuh61" data-path="src/pages/manager/ReportsPage.tsx">{achievementPercentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-id="r7auyh285" data-path="src/pages/manager/ReportsPage.tsx">
                        <Badge
                          variant={
                          achievementPercentage >= 100 ? 'default' :
                          achievementPercentage >= 80 ? 'secondary' :
                          'outline'
                          } data-id="gu7beffdn" data-path="src/pages/manager/ReportsPage.tsx">

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
          <div className="text-center py-8" data-id="y9quge92c" data-path="src/pages/manager/ReportsPage.tsx">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" data-id="usk737qy3" data-path="src/pages/manager/ReportsPage.tsx" />
              <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="ti1csyyis" data-path="src/pages/manager/ReportsPage.tsx">No performance data</h3>
              <p className="mt-1 text-sm text-gray-500" data-id="j9prbpqo9" data-path="src/pages/manager/ReportsPage.tsx">No agent performance data available for the selected period.</p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default ReportsPage;