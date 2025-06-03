import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle } from
'lucide-react';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

interface AgentStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load agent-specific analytics
      const agentId = user?.ID?.toString() || user?.id || '';
      const analytics = await orderService.getSalesAnalytics(agentId);
      setStats(analytics);

      // Load upcoming deliveries for this agent
      const upcoming = await orderService.getUpcomingDeliveries(7, agentId);
      setUpcomingDeliveries(upcoming.slice(0, 5));

      // Load recent orders
      const orders = await orderService.getOrders(agentId);
      setRecentOrders(orders.slice(0, 5));

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
    title: 'My Orders',
    value: stats?.totalOrders || 0,
    icon: ShoppingCart,
    color: 'bg-blue-500',
    description: 'Total orders placed'
  },
  {
    title: 'Pending',
    value: stats?.pendingOrders || 0,
    icon: Clock,
    color: 'bg-yellow-500',
    description: 'Awaiting delivery'
  },
  {
    title: 'Completed',
    value: stats?.completedOrders || 0,
    icon: CheckCircle,
    color: 'bg-purple-500',
    description: 'Successfully delivered'
  }];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Sales Agent
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </span>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/agent/orders/new">
              <Button className="w-full flex items-center justify-center space-x-2 h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4" />
                <span>Create New Order</span>
              </Button>
            </Link>
            <Link to="/agent/orders">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-12">
                <ShoppingCart className="w-4 h-4" />
                <span>My Orders</span>
              </Button>
            </Link>
            <Link to="/agent/history">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-12">
                <Calendar className="w-4 h-4" />
                <span>Order History</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Delivery Reminders</span>
            </CardTitle>
            <CardDescription>Orders due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length === 0 ?
            <div className="text-center py-6 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No upcoming deliveries</p>
                <p className="text-sm">All caught up!</p>
              </div> :

            <div className="space-y-3">
                {upcomingDeliveries.map((order) => {
                const daysUntilDelivery = Math.ceil(
                  (new Date(order.delivery.deliveryDate).getTime() - new Date().getTime()) / (
                  1000 * 60 * 60 * 24)
                );

                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">
                          {order.quantity.total} × {order.product.type}
                        </p>
                        <p className="text-xs text-gray-500">Order: {order.id}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                        variant={daysUntilDelivery <= 2 ? "destructive" : "secondary"}
                        className="mb-1">

                          {daysUntilDelivery === 0 ? 'Today' :
                        daysUntilDelivery === 1 ? 'Tomorrow' :
                        `${daysUntilDelivery} days`}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(order.delivery.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>);

              })}
                <Link to="/agent/orders">
                  <Button variant="outline" className="w-full mt-3">
                    View All Orders
                  </Button>
                </Link>
              </div>
            }
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>Your latest order entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ?
            <div className="text-center py-6 text-gray-500">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No orders yet</p>
                <Link to="/agent/orders/new">
                  <Button className="mt-3" size="sm">
                    Create First Order
                  </Button>
                </Link>
              </div> :

            <div className="space-y-3">
                {recentOrders.map((order) =>
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.product.type} • {order.product.color}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                    variant={
                    order.delivery.status === 'Delivered' ? 'default' :
                    order.delivery.status === 'In Production' ? 'secondary' :
                    order.delivery.status === 'Shipped' ? 'outline' :
                    'destructive'
                    }
                    className="mb-1">

                        {order.delivery.status}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        ${order.payment.amount}
                      </p>
                    </div>
                  </div>
              )}
                <Link to="/agent/orders">
                  <Button variant="outline" className="w-full mt-3">
                    View All Orders
                  </Button>
                </Link>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>My Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Order Success Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats && stats.totalOrders > 0 ? Math.round(stats.completedOrders / stats.totalOrders * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats && stats.totalOrders > 0 ? stats.completedOrders / stats.totalOrders * 100 : 0}
                className="h-2" />

            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Average Order Value</span>
                <span className="text-sm font-bold text-gray-900">
                  ${stats?.averageOrderValue.toFixed(2) || '0.00'}
                </span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">This Month's Goal</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.min(100, Math.round((stats?.totalRevenue || 0) / 5000 * 100))}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (stats?.totalRevenue || 0) / 5000 * 100)}
                className="h-2" />

            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default AgentDashboard;