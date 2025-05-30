import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { stockService } from '@/services/stockService';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load analytics
      const analytics = await orderService.getSalesAnalytics();
      setStats(analytics);
      
      // Load low stock items
      const lowStock = await stockService.getLowStockItems();
      setLowStockItems(lowStock.slice(0, 5)); // Show top 5
      
      // Load upcoming deliveries
      const upcoming = await orderService.getUpcomingDeliveries(7);
      setUpcomingDeliveries(upcoming.slice(0, 5)); // Show next 5
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
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
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Awaiting fulfillment'
    },
    {
      title: 'Completed Orders',
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      description: 'Successfully delivered'
    }
  ];

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
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center justify-center space-x-2 h-12">
              <ShoppingCart className="w-4 h-4" />
              <span>View All Orders</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
              <Package className="w-4 h-4" />
              <span>Manage Stock</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2 h-12">
              <Users className="w-4 h-4" />
              <span>Agent Management</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Low Stock Alerts</span>
            </CardTitle>
            <CardDescription>Items below minimum threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>All items are well stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productType} - {item.color}
                      </p>
                      <p className="text-sm text-gray-600">
                        Size {item.size} • {item.neckType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-700">
                        {item.quantity} left
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {item.minThreshold}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3">
                  View All Stock
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Upcoming Deliveries</span>
            </CardTitle>
            <CardDescription>Orders due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No upcoming deliveries</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeliveries.map((order) => {
                  const daysUntilDelivery = Math.ceil(
                    (new Date(order.delivery.deliveryDate).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {order.quantity.total} × {order.product.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={daysUntilDelivery <= 2 ? "destructive" : "secondary"}
                          className="mb-1"
                        >
                          {daysUntilDelivery === 0 ? 'Today' : 
                           daysUntilDelivery === 1 ? 'Tomorrow' : 
                           `${daysUntilDelivery} days`}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(order.delivery.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full mt-3">
                  View All Orders
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Order Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={stats ? (stats.completedOrders / stats.totalOrders) * 100 : 0} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Average Order Value</span>
                <span className="text-sm font-bold text-gray-900">
                  ${stats?.averageOrderValue.toFixed(2) || '0.00'}
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">On-time Delivery</span>
                <span className="text-sm font-bold text-gray-900">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;