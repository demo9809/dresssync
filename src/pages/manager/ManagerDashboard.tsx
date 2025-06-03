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
  Package, AlertTriangle, CheckCircle, Edit, RefreshCw } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';


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



interface StockItem {
  ID: number;
  product_type: string;
  color: string;
  size: string;
  quantity: number;
  min_threshold: number;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (stockItems.length > 0) {
      calculateStats();
    }
  }, [stockItems]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await loadStockItems();
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
    const lowStockItems = stockItems.filter((item) => item.quantity <= item.min_threshold).length;
    const totalStockItems = stockItems.length;
    const inStockItems = stockItems.filter((item) => item.quantity > item.min_threshold).length;

    setStats({
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0,
      totalAgents: 0,
      activeAgents: 0,
      lowStockItems
    });
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
    title: 'Total Stock Items',
    value: stockItems.length || 0,
    icon: Package,
    color: 'bg-blue-500',
    description: 'All stock items'
  },
  {
    title: 'In Stock Items',
    value: stockItems.filter((item) => item.quantity > item.min_threshold).length || 0,
    icon: CheckCircle,
    color: 'bg-green-500',
    description: 'Well stocked items'
  },
  {
    title: 'Low Stock Alerts',
    value: stats?.lowStockItems || 0,
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    description: 'Items need restocking'
  }];






  const lowStockItems = stockItems.filter((item) => item.quantity <= item.min_threshold);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center justify-between lg:justify-end space-x-3">
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Manager Access
          </Badge>
          <Button onClick={loadDashboardData} variant="outline" size="sm" className="touch-target">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
        <TabsList className="grid w-full grid-cols-2 gap-1">
          <TabsTrigger value="overview" className="text-xs lg:text-sm px-2 lg:px-4">Overview</TabsTrigger>
          <TabsTrigger value="stock" className="text-xs lg:text-sm px-2 lg:px-4">Stock</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            {/* Stock Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Stock Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Well Stocked Items</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {stockItems.filter((item) => item.quantity > item.min_threshold).length}
                    </p>
                    <p className="text-sm text-green-600">Items above minimum threshold</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">Low Stock Items</h3>
                    <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
                    <p className="text-sm text-yellow-600">Items need restocking</p>
                  </div>
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
                    {lowStockItems.slice(0, 10).map((item) =>
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


      </Tabs>
    </div>);

};

export default ManagerDashboard;