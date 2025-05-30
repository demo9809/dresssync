import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Plus,
  FileText,
  Eye,
  Filter,
  Calendar,
  DollarSign,
  Package } from
'lucide-react';
import { orderService, Order } from '@/services/orderService';
import { pdfService } from '@/services/pdfService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const agentOrders = await orderService.getOrders(user?.id);
      setOrders(agentOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) =>
      order.id.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.product.type.toLowerCase().includes(query) ||
      order.product.color.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.delivery.status === statusFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const handleDownloadPDF = async (order: Order) => {
    try {
      await pdfService.downloadOrderPDF(order);
      toast({
        title: "PDF Downloaded",
        description: `Order ${order.id} details have been downloaded.`
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: Order['delivery']['status']) => {
    switch (status) {
      case 'Delivered':return 'default';
      case 'Shipped':return 'secondary';
      case 'In Production':return 'outline';
      case 'Pending':return 'destructive';
      case 'Cancelled':return 'destructive';
      default:return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: Order['payment']['status']) => {
    switch (status) {
      case 'Complete':return 'default';
      case 'Partial':return 'secondary';
      case 'Pending':return 'destructive';
      default:return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-id="0ce4nndp1" data-path="src/pages/agent/OrderList.tsx">
        <div className="animate-pulse" data-id="5cqbwcoug" data-path="src/pages/agent/OrderList.tsx">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" data-id="zeyetax7j" data-path="src/pages/agent/OrderList.tsx"></div>
          {[...Array(5)].map((_, i) =>
          <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4" data-id="os1b78bao" data-path="src/pages/agent/OrderList.tsx"></div>
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="3onvzcq1m" data-path="src/pages/agent/OrderList.tsx">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between" data-id="qtbjgamaf" data-path="src/pages/agent/OrderList.tsx">
        <div data-id="ox1cfwr0g" data-path="src/pages/agent/OrderList.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="s5k3pb7ye" data-path="src/pages/agent/OrderList.tsx">My Orders</h1>
          <p className="text-gray-600 mt-1" data-id="g8x1ss953" data-path="src/pages/agent/OrderList.tsx">Manage and track your customer orders</p>
        </div>
        <Link to="/agent/orders/new" data-id="a5n59e62p" data-path="src/pages/agent/OrderList.tsx">
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600" data-id="z30kxsnj9" data-path="src/pages/agent/OrderList.tsx">
            <Plus className="w-4 h-4 mr-2" data-id="7o84vg185" data-path="src/pages/agent/OrderList.tsx" />
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card data-id="u78b97q7c" data-path="src/pages/agent/OrderList.tsx">
        <CardContent className="p-4" data-id="s6w4btazo" data-path="src/pages/agent/OrderList.tsx">
          <div className="flex flex-col md:flex-row gap-4" data-id="ndbfpzx1e" data-path="src/pages/agent/OrderList.tsx">
            <div className="flex-1" data-id="5ff8pns41" data-path="src/pages/agent/OrderList.tsx">
              <div className="relative" data-id="5rz1j6yuv" data-path="src/pages/agent/OrderList.tsx">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" data-id="nv0szjdfp" data-path="src/pages/agent/OrderList.tsx" />
                <Input
                  placeholder="Search orders by ID, customer name, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10" data-id="8ess5nkzg" data-path="src/pages/agent/OrderList.tsx" />

              </div>
            </div>
            
            <div className="flex gap-2" data-id="cckt7g3gt" data-path="src/pages/agent/OrderList.tsx">
              <Select value={statusFilter} onValueChange={setStatusFilter} data-id="65jehhr81" data-path="src/pages/agent/OrderList.tsx">
                <SelectTrigger className="w-48" data-id="kxl8kj6op" data-path="src/pages/agent/OrderList.tsx">
                  <Filter className="w-4 h-4 mr-2" data-id="je1mbcd1y" data-path="src/pages/agent/OrderList.tsx" />
                  <SelectValue placeholder="Filter by status" data-id="9ezylkk7a" data-path="src/pages/agent/OrderList.tsx" />
                </SelectTrigger>
                <SelectContent data-id="tua3j3p6r" data-path="src/pages/agent/OrderList.tsx">
                  <SelectItem value="all" data-id="o3di44xgo" data-path="src/pages/agent/OrderList.tsx">All Status</SelectItem>
                  <SelectItem value="Pending" data-id="m3z29vw2d" data-path="src/pages/agent/OrderList.tsx">Pending</SelectItem>
                  <SelectItem value="In Production" data-id="vuy9p59sn" data-path="src/pages/agent/OrderList.tsx">In Production</SelectItem>
                  <SelectItem value="Shipped" data-id="y05z3xwaf" data-path="src/pages/agent/OrderList.tsx">Shipped</SelectItem>
                  <SelectItem value="Delivered" data-id="e26465kg0" data-path="src/pages/agent/OrderList.tsx">Delivered</SelectItem>
                  <SelectItem value="Cancelled" data-id="icgimgu9v" data-path="src/pages/agent/OrderList.tsx">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredOrders.length > 0 &&
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600" data-id="szcx57an7" data-path="src/pages/agent/OrderList.tsx">
              <span data-id="s0l8zs2zx" data-path="src/pages/agent/OrderList.tsx">Showing {filteredOrders.length} of {orders.length} orders</span>
              <span data-id="x9xdtnioi" data-path="src/pages/agent/OrderList.tsx">Total value: ${filteredOrders.reduce((sum, order) => sum + order.payment.amount, 0).toLocaleString()}</span>
            </div>
          }
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ?
      <Card data-id="us0u0mk72" data-path="src/pages/agent/OrderList.tsx">
          <CardContent className="text-center py-12" data-id="nm5g0536w" data-path="src/pages/agent/OrderList.tsx">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" data-id="yw12ofdam" data-path="src/pages/agent/OrderList.tsx" />
            <h3 className="text-lg font-medium text-gray-900 mb-2" data-id="03a32hm8u" data-path="src/pages/agent/OrderList.tsx">
              {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
            </h3>
            <p className="text-gray-600 mb-6" data-id="mffmqat6o" data-path="src/pages/agent/OrderList.tsx">
              {orders.length === 0 ?
            'Start creating orders to track your sales' :
            'Try adjusting your search or filter criteria'
            }
            </p>
            {orders.length === 0 &&
          <Link to="/agent/orders/new" data-id="3cvjztnhb" data-path="src/pages/agent/OrderList.tsx">
                <Button data-id="p4vtqn7ph" data-path="src/pages/agent/OrderList.tsx">
                  <Plus className="w-4 h-4 mr-2" data-id="e2jc65cea" data-path="src/pages/agent/OrderList.tsx" />
                  Create First Order
                </Button>
              </Link>
          }
          </CardContent>
        </Card> :

      <div className="space-y-4" data-id="w5t7g0dcz" data-path="src/pages/agent/OrderList.tsx">
          {filteredOrders.map((order) =>
        <Card key={order.id} className="hover:shadow-md transition-shadow" data-id="4otwb6sc4" data-path="src/pages/agent/OrderList.tsx">
              <CardContent className="p-6" data-id="gm5oa8na8" data-path="src/pages/agent/OrderList.tsx">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between" data-id="ajrkqj5na" data-path="src/pages/agent/OrderList.tsx">
                  <div className="flex-1" data-id="50nrhzu4n" data-path="src/pages/agent/OrderList.tsx">
                    <div className="flex items-start justify-between mb-4" data-id="ockto9fjf" data-path="src/pages/agent/OrderList.tsx">
                      <div data-id="hib7j6wz3" data-path="src/pages/agent/OrderList.tsx">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1" data-id="ujfxhqxzj" data-path="src/pages/agent/OrderList.tsx">
                          {order.customer.name}
                        </h3>
                        <p className="text-sm text-gray-600" data-id="bz97ytkaf" data-path="src/pages/agent/OrderList.tsx">Order ID: {order.id}</p>
                        <p className="text-sm text-gray-500" data-id="qx5ia14gd" data-path="src/pages/agent/OrderList.tsx">
                          Created: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2" data-id="fqdpssf5f" data-path="src/pages/agent/OrderList.tsx">
                        <Badge variant={getStatusBadgeVariant(order.delivery.status)} data-id="q1woukzld" data-path="src/pages/agent/OrderList.tsx">
                          {order.delivery.status}
                        </Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(order.payment.status)} data-id="imyyn3sod" data-path="src/pages/agent/OrderList.tsx">
                          Payment: {order.payment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" data-id="8eoqg8i4e" data-path="src/pages/agent/OrderList.tsx">
                      <div className="flex items-center space-x-2" data-id="k2r2azx2k" data-path="src/pages/agent/OrderList.tsx">
                        <Package className="w-4 h-4 text-gray-400" data-id="xgdz5opbt" data-path="src/pages/agent/OrderList.tsx" />
                        <div data-id="h6fxex4mh" data-path="src/pages/agent/OrderList.tsx">
                          <p className="text-sm font-medium" data-id="mfrpcglv6" data-path="src/pages/agent/OrderList.tsx">{order.product.type}</p>
                          <p className="text-xs text-gray-500" data-id="6sz191ngo" data-path="src/pages/agent/OrderList.tsx">
                            {order.product.color} • {order.product.neckType}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2" data-id="u48ccibve" data-path="src/pages/agent/OrderList.tsx">
                        <Calendar className="w-4 h-4 text-gray-400" data-id="7jlfd3p70" data-path="src/pages/agent/OrderList.tsx" />
                        <div data-id="75wwd3bou" data-path="src/pages/agent/OrderList.tsx">
                          <p className="text-sm font-medium" data-id="f59b3s2xd" data-path="src/pages/agent/OrderList.tsx">
                            Delivery: {new Date(order.delivery.deliveryDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500" data-id="iqustsdzk" data-path="src/pages/agent/OrderList.tsx">
                            Event: {new Date(order.delivery.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2" data-id="pkmyzsb0r" data-path="src/pages/agent/OrderList.tsx">
                        <DollarSign className="w-4 h-4 text-gray-400" data-id="3io970uyp" data-path="src/pages/agent/OrderList.tsx" />
                        <div data-id="nk7fnmphh" data-path="src/pages/agent/OrderList.tsx">
                          <p className="text-sm font-medium" data-id="j9cl4qbnb" data-path="src/pages/agent/OrderList.tsx">${order.payment.amount}</p>
                          <p className="text-xs text-gray-500" data-id="ez09qihzw" data-path="src/pages/agent/OrderList.tsx">
                            {order.quantity.total} pieces
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Size Breakdown */}
                    <div className="flex flex-wrap gap-2 mb-4" data-id="v6pbxqon7" data-path="src/pages/agent/OrderList.tsx">
                      {Object.entries(order.quantity.sizeBreakdown).map(([size, qty]) =>
                  <Badge key={size} variant="outline" className="text-xs" data-id="lleo70gdm" data-path="src/pages/agent/OrderList.tsx">
                          {size}: {qty}
                        </Badge>
                  )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6" data-id="tluxiip1v" data-path="src/pages/agent/OrderList.tsx">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2" data-id="t8dr7808a" data-path="src/pages/agent/OrderList.tsx">
                      <Eye className="w-4 h-4" data-id="dy3bf5m8h" data-path="src/pages/agent/OrderList.tsx" />
                      <span data-id="6gsg6dhwf" data-path="src/pages/agent/OrderList.tsx">View</span>
                    </Button>
                    
                    <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleDownloadPDF(order)} data-id="sluxog3oo" data-path="src/pages/agent/OrderList.tsx">

                      <FileText className="w-4 h-4" data-id="z1u7w38k1" data-path="src/pages/agent/OrderList.tsx" />
                      <span data-id="yn0dqsn9s" data-path="src/pages/agent/OrderList.tsx">PDF</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}
        </div>
      }
    </div>);

};

export default OrderList;