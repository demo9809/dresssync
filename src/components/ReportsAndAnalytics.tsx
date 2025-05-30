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
      <div className="space-y-6" data-id="pof3lrtc2" data-path="src/components/ReportsAndAnalytics.tsx">
        <div className="animate-pulse" data-id="4eszh1uzy" data-path="src/components/ReportsAndAnalytics.tsx">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" data-id="exz54lmpn" data-path="src/components/ReportsAndAnalytics.tsx"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-id="oo0lt5v04" data-path="src/components/ReportsAndAnalytics.tsx">
            {[...Array(6)].map((_, i) =>
            <div key={i} className="h-48 bg-gray-200 rounded-lg" data-id="5szg9hq2c" data-path="src/components/ReportsAndAnalytics.tsx"></div>
            )}
          </div>
        </div>
      </div>);

  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64" data-id="wsy7prmvb" data-path="src/components/ReportsAndAnalytics.tsx">
        <p className="text-gray-500" data-id="dfu0cvymy" data-path="src/components/ReportsAndAnalytics.tsx">No report data available</p>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="mdmqnb4om" data-path="src/components/ReportsAndAnalytics.tsx">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0" data-id="z9xmcdxmv" data-path="src/components/ReportsAndAnalytics.tsx">
        <div data-id="3kmsxa3is" data-path="src/components/ReportsAndAnalytics.tsx">
          <h2 className="text-2xl font-bold text-gray-900" data-id="4gv7xw4bq" data-path="src/components/ReportsAndAnalytics.tsx">Reports & Analytics</h2>
          <p className="text-gray-600" data-id="6czcccqwx" data-path="src/components/ReportsAndAnalytics.tsx">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3" data-id="9tfg3z5ez" data-path="src/components/ReportsAndAnalytics.tsx">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod} data-id="l703i0y4p" data-path="src/components/ReportsAndAnalytics.tsx">
            <SelectTrigger className="w-40" data-id="maysx0y1v" data-path="src/components/ReportsAndAnalytics.tsx">
              <SelectValue data-id="1d456zp3h" data-path="src/components/ReportsAndAnalytics.tsx" />
            </SelectTrigger>
            <SelectContent data-id="r3rcyq0i2" data-path="src/components/ReportsAndAnalytics.tsx">
              <SelectItem value="week" data-id="sz35bdjxt" data-path="src/components/ReportsAndAnalytics.tsx">This Week</SelectItem>
              <SelectItem value="month" data-id="hm3brev0x" data-path="src/components/ReportsAndAnalytics.tsx">This Month</SelectItem>
              <SelectItem value="quarter" data-id="h6mwfoakl" data-path="src/components/ReportsAndAnalytics.tsx">This Quarter</SelectItem>
              <SelectItem value="year" data-id="skdjysy2l" data-path="src/components/ReportsAndAnalytics.tsx">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport('comprehensive')} variant="outline" data-id="d0d3emf6h" data-path="src/components/ReportsAndAnalytics.tsx">
            <Download className="w-4 h-4 mr-2" data-id="10v2zwtbj" data-path="src/components/ReportsAndAnalytics.tsx" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="55xwp26l9" data-path="src/components/ReportsAndAnalytics.tsx">
        <Card data-id="fxao9nxj2" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardContent className="p-6" data-id="dorkbwsvm" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="flex items-center justify-between" data-id="cy7ij3anp" data-path="src/components/ReportsAndAnalytics.tsx">
              <div data-id="nfirpyc3x" data-path="src/components/ReportsAndAnalytics.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="yj62dwwkx" data-path="src/components/ReportsAndAnalytics.tsx">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900" data-id="e9a5irsql" data-path="src/components/ReportsAndAnalytics.tsx">
                  ${reportData.revenueMetrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500 bg-opacity-10" data-id="9gzolo1jw" data-path="src/components/ReportsAndAnalytics.tsx">
                <DollarSign className="w-6 h-6 text-green-500" data-id="crbwwx0zz" data-path="src/components/ReportsAndAnalytics.tsx" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="gilc0myqn" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardContent className="p-6" data-id="jvt9ng27r" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="flex items-center justify-between" data-id="swcsk49pu" data-path="src/components/ReportsAndAnalytics.tsx">
              <div data-id="skno4kr8m" data-path="src/components/ReportsAndAnalytics.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="vgoxgi02t" data-path="src/components/ReportsAndAnalytics.tsx">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900" data-id="2175tg65z" data-path="src/components/ReportsAndAnalytics.tsx">
                  {reportData.revenueMetrics.totalOrders}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500 bg-opacity-10" data-id="jzvsy5zg1" data-path="src/components/ReportsAndAnalytics.tsx">
                <Package className="w-6 h-6 text-blue-500" data-id="y7kai1uc7" data-path="src/components/ReportsAndAnalytics.tsx" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="gfcee4qv7" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardContent className="p-6" data-id="5a2econky" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="flex items-center justify-between" data-id="6d9ct94q1" data-path="src/components/ReportsAndAnalytics.tsx">
              <div data-id="kw6umbl2a" data-path="src/components/ReportsAndAnalytics.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="bxvnyahfq" data-path="src/components/ReportsAndAnalytics.tsx">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900" data-id="2u5o3bpfx" data-path="src/components/ReportsAndAnalytics.tsx">
                  ${reportData.revenueMetrics.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500 bg-opacity-10" data-id="6cciguhx3" data-path="src/components/ReportsAndAnalytics.tsx">
                <TrendingUp className="w-6 h-6 text-purple-500" data-id="l85zjh102" data-path="src/components/ReportsAndAnalytics.tsx" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="m3hqtp2ga" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardContent className="p-6" data-id="3t62il7ct" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="flex items-center justify-between" data-id="y1aujqxc2" data-path="src/components/ReportsAndAnalytics.tsx">
              <div data-id="f135tr6br" data-path="src/components/ReportsAndAnalytics.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="sxfaqwa7g" data-path="src/components/ReportsAndAnalytics.tsx">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900" data-id="xbfeaoif3" data-path="src/components/ReportsAndAnalytics.tsx">
                  {reportData.revenueMetrics.profitMargin.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500 bg-opacity-10" data-id="e3h3n7s0y" data-path="src/components/ReportsAndAnalytics.tsx">
                <BarChart3 className="w-6 h-6 text-yellow-500" data-id="bmd3aywdd" data-path="src/components/ReportsAndAnalytics.tsx" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="2ggciz2f7" data-path="src/components/ReportsAndAnalytics.tsx">
        {/* Agent Performance */}
        <Card data-id="wplpo40ef" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardHeader data-id="84zufhh42" data-path="src/components/ReportsAndAnalytics.tsx">
            <CardTitle className="flex items-center space-x-2" data-id="eavrrci9u" data-path="src/components/ReportsAndAnalytics.tsx">
              <Users className="w-5 h-5" data-id="qrjb06c2q" data-path="src/components/ReportsAndAnalytics.tsx" />
              <span data-id="7xgqg6z5d" data-path="src/components/ReportsAndAnalytics.tsx">Agent Performance</span>
            </CardTitle>
            <CardDescription data-id="popgpit6r" data-path="src/components/ReportsAndAnalytics.tsx">Sales performance by agent</CardDescription>
          </CardHeader>
          <CardContent data-id="yhhc7ephl" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="space-y-4" data-id="vxdy7ubai" data-path="src/components/ReportsAndAnalytics.tsx">
              {reportData.agentPerformance.map((agent) =>
              <div key={agent.agentId} className="space-y-2" data-id="9xen3ej8u" data-path="src/components/ReportsAndAnalytics.tsx">
                  <div className="flex justify-between items-center" data-id="tft2ubnic" data-path="src/components/ReportsAndAnalytics.tsx">
                    <span className="font-medium" data-id="4sgdf9o57" data-path="src/components/ReportsAndAnalytics.tsx">{agent.agentName}</span>
                    <div className="text-right" data-id="htqryrkhn" data-path="src/components/ReportsAndAnalytics.tsx">
                      <p className="text-sm font-medium" data-id="d6jan6fm7" data-path="src/components/ReportsAndAnalytics.tsx">${agent.totalSales.toLocaleString()}</p>
                      <p className="text-xs text-gray-500" data-id="eo4qfyuxy" data-path="src/components/ReportsAndAnalytics.tsx">{agent.ordersCount} orders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2" data-id="6kryivkph" data-path="src/components/ReportsAndAnalytics.tsx">
                    <Progress value={Math.min(agent.achievement, 100)} className="flex-1" data-id="a96snxw84" data-path="src/components/ReportsAndAnalytics.tsx" />
                    <span className="text-sm text-gray-600 w-12" data-id="44llpjdz9" data-path="src/components/ReportsAndAnalytics.tsx">
                      {agent.achievement.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500" data-id="t6cp1uf7f" data-path="src/components/ReportsAndAnalytics.tsx">
                    <span data-id="sm5ntvmg2" data-path="src/components/ReportsAndAnalytics.tsx">Target: ${agent.target.toLocaleString()}</span>
                    <span data-id="wi6kgsfdo" data-path="src/components/ReportsAndAnalytics.tsx">Commission: ${agent.commission.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Analysis */}
        <Card data-id="ajyji4unt" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardHeader data-id="h5agp6xxd" data-path="src/components/ReportsAndAnalytics.tsx">
            <CardTitle className="flex items-center space-x-2" data-id="1nnhfuhgx" data-path="src/components/ReportsAndAnalytics.tsx">
              <PieChart className="w-5 h-5" data-id="xpkfmnmie" data-path="src/components/ReportsAndAnalytics.tsx" />
              <span data-id="vbq02i5ha" data-path="src/components/ReportsAndAnalytics.tsx">Product Analysis</span>
            </CardTitle>
            <CardDescription data-id="8f4pwj2io" data-path="src/components/ReportsAndAnalytics.tsx">Performance by product type</CardDescription>
          </CardHeader>
          <CardContent data-id="d2ve8bblr" data-path="src/components/ReportsAndAnalytics.tsx">
            <Table data-id="08l1tur11" data-path="src/components/ReportsAndAnalytics.tsx">
              <TableHeader data-id="03buql0y0" data-path="src/components/ReportsAndAnalytics.tsx">
                <TableRow data-id="fgm8wql1o" data-path="src/components/ReportsAndAnalytics.tsx">
                  <TableHead data-id="ba6eyxd0r" data-path="src/components/ReportsAndAnalytics.tsx">Product</TableHead>
                  <TableHead data-id="hv7y2drg7" data-path="src/components/ReportsAndAnalytics.tsx">Sold</TableHead>
                  <TableHead data-id="skkj9oczo" data-path="src/components/ReportsAndAnalytics.tsx">Revenue</TableHead>
                  <TableHead data-id="nuw2hknra" data-path="src/components/ReportsAndAnalytics.tsx">Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-id="ct7w0sp96" data-path="src/components/ReportsAndAnalytics.tsx">
                {reportData.productAnalysis.map((product) =>
                <TableRow key={product.productType} data-id="gxjwwqw7j" data-path="src/components/ReportsAndAnalytics.tsx">
                    <TableCell className="font-medium" data-id="t7zkpewbw" data-path="src/components/ReportsAndAnalytics.tsx">{product.productType}</TableCell>
                    <TableCell data-id="o3ebq0sq2" data-path="src/components/ReportsAndAnalytics.tsx">{product.totalSold}</TableCell>
                    <TableCell data-id="mv0pl3idd" data-path="src/components/ReportsAndAnalytics.tsx">${product.revenue.toLocaleString()}</TableCell>
                    <TableCell data-id="sim6l40az" data-path="src/components/ReportsAndAnalytics.tsx">
                      <Badge variant={product.profitMargin > 20 ? "default" : "secondary"} data-id="jsjw4xgp9" data-path="src/components/ReportsAndAnalytics.tsx">
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
      <Card data-id="w497gik3b" data-path="src/components/ReportsAndAnalytics.tsx">
        <CardHeader data-id="yw3fzeyxp" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="wxkb5y679" data-path="src/components/ReportsAndAnalytics.tsx">
            <Calendar className="w-5 h-5" data-id="vrb9sxq82" data-path="src/components/ReportsAndAnalytics.tsx" />
            <span data-id="se7wk4g4j" data-path="src/components/ReportsAndAnalytics.tsx">Monthly Sales Trend</span>
          </CardTitle>
          <CardDescription data-id="8nvmhy3hl" data-path="src/components/ReportsAndAnalytics.tsx">Sales performance over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent data-id="joxw69jl4" data-path="src/components/ReportsAndAnalytics.tsx">
          <div className="space-y-4" data-id="ywzw8uvug" data-path="src/components/ReportsAndAnalytics.tsx">
            {reportData.salesByMonth.map((month) =>
            <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-id="fjcxngtz7" data-path="src/components/ReportsAndAnalytics.tsx">
                <div data-id="uz94utpgq" data-path="src/components/ReportsAndAnalytics.tsx">
                  <p className="font-medium" data-id="juxuapfxz" data-path="src/components/ReportsAndAnalytics.tsx">{month.month}</p>
                  <p className="text-sm text-gray-600" data-id="5tua0vn6f" data-path="src/components/ReportsAndAnalytics.tsx">{month.orders} orders</p>
                </div>
                <div className="text-right" data-id="x79pm6nsn" data-path="src/components/ReportsAndAnalytics.tsx">
                  <p className="font-medium" data-id="iz5bfg99i" data-path="src/components/ReportsAndAnalytics.tsx">${month.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600" data-id="3fenvl6tp" data-path="src/components/ReportsAndAnalytics.tsx">
                    Avg: ${month.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card data-id="bajcept4g" data-path="src/components/ReportsAndAnalytics.tsx">
        <CardHeader data-id="xhmetlv1r" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="04lsa3afj" data-path="src/components/ReportsAndAnalytics.tsx">
            <Activity className="w-5 h-5" data-id="1kynud88m" data-path="src/components/ReportsAndAnalytics.tsx" />
            <span data-id="f47xz7dsm" data-path="src/components/ReportsAndAnalytics.tsx">Payment Status</span>
          </CardTitle>
          <CardDescription data-id="z68c7h88u" data-path="src/components/ReportsAndAnalytics.tsx">Overview of payment collections</CardDescription>
        </CardHeader>
        <CardContent data-id="or172p089" data-path="src/components/ReportsAndAnalytics.tsx">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-id="nic9pem6l" data-path="src/components/ReportsAndAnalytics.tsx">
            <div className="space-y-4" data-id="fo9vpk7hj" data-path="src/components/ReportsAndAnalytics.tsx">
              <div data-id="q761y0hk9" data-path="src/components/ReportsAndAnalytics.tsx">
                <div className="flex justify-between items-center mb-2" data-id="cq3z57wi9" data-path="src/components/ReportsAndAnalytics.tsx">
                  <span className="text-sm font-medium" data-id="fz4aky8li" data-path="src/components/ReportsAndAnalytics.tsx">Completed Payments</span>
                  <span className="text-sm font-bold text-green-600" data-id="0dorfuhfl" data-path="src/components/ReportsAndAnalytics.tsx">
                    ${reportData.revenueMetrics.completedPayments.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={reportData.revenueMetrics.completedPayments / reportData.revenueMetrics.totalRevenue * 100}
                  className="h-2" data-id="sutwfpy9c" data-path="src/components/ReportsAndAnalytics.tsx" />

              </div>
              <div data-id="tqoigtnv3" data-path="src/components/ReportsAndAnalytics.tsx">
                <div className="flex justify-between items-center mb-2" data-id="3yp4dxzeh" data-path="src/components/ReportsAndAnalytics.tsx">
                  <span className="text-sm font-medium" data-id="vu3t4pf7y" data-path="src/components/ReportsAndAnalytics.tsx">Pending Payments</span>
                  <span className="text-sm font-bold text-yellow-600" data-id="aie08rhmi" data-path="src/components/ReportsAndAnalytics.tsx">
                    ${reportData.revenueMetrics.pendingPayments.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={reportData.revenueMetrics.pendingPayments / reportData.revenueMetrics.totalRevenue * 100}
                  className="h-2" data-id="20w1vjhj1" data-path="src/components/ReportsAndAnalytics.tsx" />

              </div>
            </div>
            <div className="flex items-center justify-center" data-id="pyz12nr88" data-path="src/components/ReportsAndAnalytics.tsx">
              <div className="text-center" data-id="qahdb5muh" data-path="src/components/ReportsAndAnalytics.tsx">
                <p className="text-3xl font-bold text-gray-900" data-id="4bj0k9394" data-path="src/components/ReportsAndAnalytics.tsx">
                  {(reportData.revenueMetrics.completedPayments / reportData.revenueMetrics.totalRevenue * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600" data-id="xqaltt1g0" data-path="src/components/ReportsAndAnalytics.tsx">Collection Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Options */}
      <Card data-id="ecmlvyzeq" data-path="src/components/ReportsAndAnalytics.tsx">
        <CardHeader data-id="brxpnf6nh" data-path="src/components/ReportsAndAnalytics.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="3da53vl7b" data-path="src/components/ReportsAndAnalytics.tsx">
            <FileText className="w-5 h-5" data-id="m9wvjsjbg" data-path="src/components/ReportsAndAnalytics.tsx" />
            <span data-id="yjlj3l5ad" data-path="src/components/ReportsAndAnalytics.tsx">Quick Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent data-id="ufdzetacx" data-path="src/components/ReportsAndAnalytics.tsx">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="zh3ptflbo" data-path="src/components/ReportsAndAnalytics.tsx">
            <Button onClick={() => exportReport('agents')} variant="outline" className="justify-start" data-id="c4qthphg7" data-path="src/components/ReportsAndAnalytics.tsx">
              <Download className="w-4 h-4 mr-2" data-id="do5ydcpex" data-path="src/components/ReportsAndAnalytics.tsx" />
              Agent Performance Report
            </Button>
            <Button onClick={() => exportReport('products')} variant="outline" className="justify-start" data-id="e4ig66vos" data-path="src/components/ReportsAndAnalytics.tsx">
              <Download className="w-4 h-4 mr-2" data-id="0sa8jly7o" data-path="src/components/ReportsAndAnalytics.tsx" />
              Product Analysis Report
            </Button>
            <Button onClick={() => exportReport('financial')} variant="outline" className="justify-start" data-id="obue7fov3" data-path="src/components/ReportsAndAnalytics.tsx">
              <Download className="w-4 h-4 mr-2" data-id="tolgakc7w" data-path="src/components/ReportsAndAnalytics.tsx" />
              Financial Summary Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default ReportsAndAnalytics;