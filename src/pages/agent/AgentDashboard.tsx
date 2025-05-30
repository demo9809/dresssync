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
  DollarSign,
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
      const analytics = await orderService.getSalesAnalytics(user?.id);
      setStats(analytics);

      // Load upcoming deliveries for this agent
      const upcoming = await orderService.getUpcomingDeliveries(7, user?.id);
      setUpcomingDeliveries(upcoming.slice(0, 5));

      // Load recent orders
      const orders = await orderService.getOrders(user?.id);
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-id="il4w2feor" data-path="src/pages/agent/AgentDashboard.tsx">
        <div className="animate-pulse" data-id="wk9sbqz9m" data-path="src/pages/agent/AgentDashboard.tsx">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" data-id="dnxn2r9at" data-path="src/pages/agent/AgentDashboard.tsx"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-id="ccfdlfn2b" data-path="src/pages/agent/AgentDashboard.tsx">
            {[...Array(4)].map((_, i) =>
            <div key={i} className="h-32 bg-gray-200 rounded-lg" data-id="xc4a0peff" data-path="src/pages/agent/AgentDashboard.tsx"></div>
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
    title: 'My Revenue',
    value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
    icon: DollarSign,
    color: 'bg-green-500',
    description: 'Total sales value'
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
    <div className="space-y-6" data-id="92ur61g34" data-path="src/pages/agent/AgentDashboard.tsx">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between" data-id="s22bq10iz" data-path="src/pages/agent/AgentDashboard.tsx">
        <div data-id="d2mxijpty" data-path="src/pages/agent/AgentDashboard.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="30yez4lem" data-path="src/pages/agent/AgentDashboard.tsx">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1" data-id="6ee793wuf" data-path="src/pages/agent/AgentDashboard.tsx">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0" data-id="rengeuq73" data-path="src/pages/agent/AgentDashboard.tsx">
          <Badge variant="secondary" className="bg-green-100 text-green-800" data-id="ejfm82qb9" data-path="src/pages/agent/AgentDashboard.tsx">
            Sales Agent
          </Badge>
          <span className="text-sm text-gray-500" data-id="t3espptkc" data-path="src/pages/agent/AgentDashboard.tsx">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-id="6i3yiek3p" data-path="src/pages/agent/AgentDashboard.tsx">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden" data-id="l63m9y8b3" data-path="src/pages/agent/AgentDashboard.tsx">
              <CardContent className="p-6" data-id="d0hvsk54t" data-path="src/pages/agent/AgentDashboard.tsx">
                <div className="flex items-center justify-between" data-id="9w5c3npkf" data-path="src/pages/agent/AgentDashboard.tsx">
                  <div data-id="vg7kc60ij" data-path="src/pages/agent/AgentDashboard.tsx">
                    <p className="text-sm font-medium text-gray-600" data-id="laiygqqs1" data-path="src/pages/agent/AgentDashboard.tsx">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900" data-id="d3f4peb00" data-path="src/pages/agent/AgentDashboard.tsx">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1" data-id="3b2ufn96c" data-path="src/pages/agent/AgentDashboard.tsx">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`} data-id="pozvhnxlk" data-path="src/pages/agent/AgentDashboard.tsx">
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} data-id="wvtnvwd8c" data-path="src/pages/agent/AgentDashboard.tsx" />
                  </div>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Quick Actions */}
      <Card data-id="4dkkrz2i1" data-path="src/pages/agent/AgentDashboard.tsx">
        <CardHeader data-id="x510pfe9s" data-path="src/pages/agent/AgentDashboard.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="ly3le5fyj" data-path="src/pages/agent/AgentDashboard.tsx">
            <Package className="w-5 h-5" data-id="bzabunb52" data-path="src/pages/agent/AgentDashboard.tsx" />
            <span data-id="4okakqffm" data-path="src/pages/agent/AgentDashboard.tsx">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent data-id="epsju3myg" data-path="src/pages/agent/AgentDashboard.tsx">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="7ye9bl93u" data-path="src/pages/agent/AgentDashboard.tsx">
            <Link to="/agent/orders/new" data-id="s0hv9kdev" data-path="src/pages/agent/AgentDashboard.tsx">
              <Button className="w-full flex items-center justify-center space-x-2 h-12 bg-gradient-to-r from-blue-600 to-purple-600" data-id="j1dxcdia7" data-path="src/pages/agent/AgentDashboard.tsx">
                <Plus className="w-4 h-4" data-id="mxf0pokvq" data-path="src/pages/agent/AgentDashboard.tsx" />
                <span data-id="e40y8vuot" data-path="src/pages/agent/AgentDashboard.tsx">Create New Order</span>
              </Button>
            </Link>
            <Link to="/agent/orders" data-id="5258q4c65" data-path="src/pages/agent/AgentDashboard.tsx">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-12" data-id="8avbl3trk" data-path="src/pages/agent/AgentDashboard.tsx">
                <ShoppingCart className="w-4 h-4" data-id="eku62ivkk" data-path="src/pages/agent/AgentDashboard.tsx" />
                <span data-id="0eomxrwpb" data-path="src/pages/agent/AgentDashboard.tsx">My Orders</span>
              </Button>
            </Link>
            <Link to="/agent/history" data-id="d63kncvps" data-path="src/pages/agent/AgentDashboard.tsx">
              <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-12" data-id="8nlpr8cq6" data-path="src/pages/agent/AgentDashboard.tsx">
                <Calendar className="w-4 h-4" data-id="lpbtvw5e9" data-path="src/pages/agent/AgentDashboard.tsx" />
                <span data-id="qxbtii4s2" data-path="src/pages/agent/AgentDashboard.tsx">Order History</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-id="kg7ros51r" data-path="src/pages/agent/AgentDashboard.tsx">
        {/* Upcoming Deliveries */}
        <Card data-id="qr4u5ixrs" data-path="src/pages/agent/AgentDashboard.tsx">
          <CardHeader data-id="9q3s1hv9h" data-path="src/pages/agent/AgentDashboard.tsx">
            <CardTitle className="flex items-center space-x-2" data-id="0yb4cjsgs" data-path="src/pages/agent/AgentDashboard.tsx">
              <AlertTriangle className="w-5 h-5 text-orange-500" data-id="iuh3wfvif" data-path="src/pages/agent/AgentDashboard.tsx" />
              <span data-id="wg83pgvjl" data-path="src/pages/agent/AgentDashboard.tsx">Delivery Reminders</span>
            </CardTitle>
            <CardDescription data-id="i1vtj1uuo" data-path="src/pages/agent/AgentDashboard.tsx">Orders due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent data-id="0ixfjpnhi" data-path="src/pages/agent/AgentDashboard.tsx">
            {upcomingDeliveries.length === 0 ?
            <div className="text-center py-6 text-gray-500" data-id="h3vj1e49v" data-path="src/pages/agent/AgentDashboard.tsx">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" data-id="qnjyypsds" data-path="src/pages/agent/AgentDashboard.tsx" />
                <p data-id="9xf0cjs5j" data-path="src/pages/agent/AgentDashboard.tsx">No upcoming deliveries</p>
                <p className="text-sm" data-id="hli8ip49b" data-path="src/pages/agent/AgentDashboard.tsx">All caught up!</p>
              </div> :

            <div className="space-y-3" data-id="j08siyej8" data-path="src/pages/agent/AgentDashboard.tsx">
                {upcomingDeliveries.map((order) => {
                const daysUntilDelivery = Math.ceil(
                  (new Date(order.delivery.deliveryDate).getTime() - new Date().getTime()) / (
                  1000 * 60 * 60 * 24)
                );

                return (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200" data-id="ldnfp3q8s" data-path="src/pages/agent/AgentDashboard.tsx">
                      <div data-id="7s67yura5" data-path="src/pages/agent/AgentDashboard.tsx">
                        <p className="font-medium text-gray-900" data-id="y42iksxw2" data-path="src/pages/agent/AgentDashboard.tsx">{order.customer.name}</p>
                        <p className="text-sm text-gray-600" data-id="behgxmtt8" data-path="src/pages/agent/AgentDashboard.tsx">
                          {order.quantity.total} × {order.product.type}
                        </p>
                        <p className="text-xs text-gray-500" data-id="1b6ob082s" data-path="src/pages/agent/AgentDashboard.tsx">Order: {order.id}</p>
                      </div>
                      <div className="text-right" data-id="uwbi7n20z" data-path="src/pages/agent/AgentDashboard.tsx">
                        <Badge
                        variant={daysUntilDelivery <= 2 ? "destructive" : "secondary"}
                        className="mb-1" data-id="0ravvkm76" data-path="src/pages/agent/AgentDashboard.tsx">

                          {daysUntilDelivery === 0 ? 'Today' :
                        daysUntilDelivery === 1 ? 'Tomorrow' :
                        `${daysUntilDelivery} days`}
                        </Badge>
                        <p className="text-xs text-gray-500" data-id="7ss4ep8fv" data-path="src/pages/agent/AgentDashboard.tsx">
                          {new Date(order.delivery.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>);

              })}
                <Link to="/agent/orders" data-id="yeiqc2w8q" data-path="src/pages/agent/AgentDashboard.tsx">
                  <Button variant="outline" className="w-full mt-3" data-id="ual55pm27" data-path="src/pages/agent/AgentDashboard.tsx">
                    View All Orders
                  </Button>
                </Link>
              </div>
            }
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card data-id="glvklmota" data-path="src/pages/agent/AgentDashboard.tsx">
          <CardHeader data-id="ky1f1j7jo" data-path="src/pages/agent/AgentDashboard.tsx">
            <CardTitle className="flex items-center space-x-2" data-id="e3czxghu1" data-path="src/pages/agent/AgentDashboard.tsx">
              <ShoppingCart className="w-5 h-5 text-blue-500" data-id="pn72pu751" data-path="src/pages/agent/AgentDashboard.tsx" />
              <span data-id="7mewhw6kp" data-path="src/pages/agent/AgentDashboard.tsx">Recent Orders</span>
            </CardTitle>
            <CardDescription data-id="b6zvu1997" data-path="src/pages/agent/AgentDashboard.tsx">Your latest order entries</CardDescription>
          </CardHeader>
          <CardContent data-id="nkkey4uzb" data-path="src/pages/agent/AgentDashboard.tsx">
            {recentOrders.length === 0 ?
            <div className="text-center py-6 text-gray-500" data-id="331iwu5sz" data-path="src/pages/agent/AgentDashboard.tsx">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" data-id="yc2a8s8pe" data-path="src/pages/agent/AgentDashboard.tsx" />
                <p data-id="7ij0szkjs" data-path="src/pages/agent/AgentDashboard.tsx">No orders yet</p>
                <Link to="/agent/orders/new" data-id="ndz70typ6" data-path="src/pages/agent/AgentDashboard.tsx">
                  <Button className="mt-3" size="sm" data-id="8fz52fc7f" data-path="src/pages/agent/AgentDashboard.tsx">
                    Create First Order
                  </Button>
                </Link>
              </div> :

            <div className="space-y-3" data-id="3mjk4dnkz" data-path="src/pages/agent/AgentDashboard.tsx">
                {recentOrders.map((order) =>
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200" data-id="g6qaglsxf" data-path="src/pages/agent/AgentDashboard.tsx">
                    <div data-id="34d8qyiig" data-path="src/pages/agent/AgentDashboard.tsx">
                      <p className="font-medium text-gray-900" data-id="z5uonn133" data-path="src/pages/agent/AgentDashboard.tsx">{order.customer.name}</p>
                      <p className="text-sm text-gray-600" data-id="ov5rjxguh" data-path="src/pages/agent/AgentDashboard.tsx">
                        {order.product.type} • {order.product.color}
                      </p>
                      <p className="text-xs text-gray-500" data-id="gl635carr" data-path="src/pages/agent/AgentDashboard.tsx">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right" data-id="ba722by2a" data-path="src/pages/agent/AgentDashboard.tsx">
                      <Badge
                    variant={
                    order.delivery.status === 'Delivered' ? 'default' :
                    order.delivery.status === 'In Production' ? 'secondary' :
                    order.delivery.status === 'Shipped' ? 'outline' :
                    'destructive'
                    }
                    className="mb-1" data-id="8f074va64" data-path="src/pages/agent/AgentDashboard.tsx">

                        {order.delivery.status}
                      </Badge>
                      <p className="text-xs text-gray-500" data-id="qnhrhi7rv" data-path="src/pages/agent/AgentDashboard.tsx">
                        ${order.payment.amount}
                      </p>
                    </div>
                  </div>
              )}
                <Link to="/agent/orders" data-id="ks54liwlg" data-path="src/pages/agent/AgentDashboard.tsx">
                  <Button variant="outline" className="w-full mt-3" data-id="2vxvkv0f4" data-path="src/pages/agent/AgentDashboard.tsx">
                    View All Orders
                  </Button>
                </Link>
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card data-id="kjbhasvfw" data-path="src/pages/agent/AgentDashboard.tsx">
        <CardHeader data-id="0jq24v5s9" data-path="src/pages/agent/AgentDashboard.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="011gu2hy8" data-path="src/pages/agent/AgentDashboard.tsx">
            <TrendingUp className="w-5 h-5 text-green-500" data-id="mpob596um" data-path="src/pages/agent/AgentDashboard.tsx" />
            <span data-id="s48ywvjyh" data-path="src/pages/agent/AgentDashboard.tsx">My Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent data-id="1a1dzdw11" data-path="src/pages/agent/AgentDashboard.tsx">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-id="w28y8e9ft" data-path="src/pages/agent/AgentDashboard.tsx">
            <div data-id="ml8o7151x" data-path="src/pages/agent/AgentDashboard.tsx">
              <div className="flex items-center justify-between mb-2" data-id="xpwl4ucap" data-path="src/pages/agent/AgentDashboard.tsx">
                <span className="text-sm font-medium text-gray-600" data-id="ic6wzcbko" data-path="src/pages/agent/AgentDashboard.tsx">Order Success Rate</span>
                <span className="text-sm font-bold text-gray-900" data-id="k8yqj1jwy" data-path="src/pages/agent/AgentDashboard.tsx">
                  {stats && stats.totalOrders > 0 ? Math.round(stats.completedOrders / stats.totalOrders * 100) : 0}%
                </span>
              </div>
              <Progress
                value={stats && stats.totalOrders > 0 ? stats.completedOrders / stats.totalOrders * 100 : 0}
                className="h-2" data-id="gvlzxaxjm" data-path="src/pages/agent/AgentDashboard.tsx" />

            </div>
            
            <div data-id="4utyxa0gb" data-path="src/pages/agent/AgentDashboard.tsx">
              <div className="flex items-center justify-between mb-2" data-id="xigyvhnrz" data-path="src/pages/agent/AgentDashboard.tsx">
                <span className="text-sm font-medium text-gray-600" data-id="k3cfziotw" data-path="src/pages/agent/AgentDashboard.tsx">Average Order Value</span>
                <span className="text-sm font-bold text-gray-900" data-id="h8jnw1zzh" data-path="src/pages/agent/AgentDashboard.tsx">
                  ${stats?.averageOrderValue.toFixed(2) || '0.00'}
                </span>
              </div>
              <Progress value={65} className="h-2" data-id="605rqp7i6" data-path="src/pages/agent/AgentDashboard.tsx" />
            </div>
            
            <div data-id="zqd11q0va" data-path="src/pages/agent/AgentDashboard.tsx">
              <div className="flex items-center justify-between mb-2" data-id="zdc1wmtwd" data-path="src/pages/agent/AgentDashboard.tsx">
                <span className="text-sm font-medium text-gray-600" data-id="cli8kpq11" data-path="src/pages/agent/AgentDashboard.tsx">This Month's Goal</span>
                <span className="text-sm font-bold text-gray-900" data-id="jd2fra1rk" data-path="src/pages/agent/AgentDashboard.tsx">
                  {Math.min(100, Math.round((stats?.totalRevenue || 0) / 5000 * 100))}%
                </span>
              </div>
              <Progress
                value={Math.min(100, (stats?.totalRevenue || 0) / 5000 * 100)}
                className="h-2" data-id="76cp7vy4g" data-path="src/pages/agent/AgentDashboard.tsx" />

            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default AgentDashboard;