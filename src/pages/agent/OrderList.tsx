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
import { pdfService } from '@/services/pdfService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import OrderViewModal from '@/components/OrderViewModal';

const OrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Fetch orders from the database
      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": user?.id ? [{
          "name": "agent_id",
          "op": "Equal",
          "value": parseInt(user.id)
        }] : []
      });

      if (error) throw error;
      setOrders(data?.List || []);
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
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.product_type.toLowerCase().includes(query) ||
      order.product_color.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.order_status === statusFilter);
    }

    // Sort by ID (newest first)
    filtered.sort((a, b) => b.id - a.id);

    setFilteredOrders(filtered);
  };

  const handleDownloadPDF = async (order: any) => {
    try {
      await pdfService.generateOrderPDF(order);
      toast({
        title: "PDF Generated",
        description: `Order ${order.order_number} PDF has been downloaded successfully.`
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':return 'default';
      case 'shipped':return 'secondary';
      case 'in production':return 'outline';
      case 'pending':return 'destructive';
      case 'cancelled':return 'destructive';
      default:return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'complete':return 'default';
      case 'partial':return 'secondary';
      case 'pending':return 'destructive';
      default:return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) =>
          <div key={i} className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          )}
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track your customer orders</p>
        </div>
        <Link to="/agent/orders/new">
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, customer name, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10" />

              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredOrders.length > 0 &&
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              <span>Total value: ${filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString()}</span>
            </div>
          }
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ?
      <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 ?
            'Start creating orders to track your sales' :
            'Try adjusting your search or filter criteria'
            }
            </p>
            {orders.length === 0 &&
          <Link to="/agent/orders/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Order
                </Button>
              </Link>
          }
          </CardContent>
        </Card> :

      <div className="space-y-4">
          {filteredOrders.map((order) =>
        <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {order.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">Order: {order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          ID: {order.id}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusBadgeVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                          Payment: {order.payment_status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{order.product_type}</p>
                          <p className="text-xs text-gray-500">
                            {order.product_color} • {order.neck_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Event: {new Date(order.event_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">${order.total_amount}</p>
                          <p className="text-xs text-gray-500">
                            {order.total_quantity} pieces
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Size Breakdown */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(() => {
                    try {
                      const sizeBreakdown = JSON.parse(order.size_breakdown || '{}');
                      return Object.entries(sizeBreakdown).map(([size, qty]) =>
                      <Badge key={size} variant="outline" className="text-xs">
                              {size}: {qty as number}
                            </Badge>
                      );
                    } catch {
                      return <Badge variant="outline" className="text-xs">No size breakdown</Badge>;
                    }
                  })()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleViewOrder(order)}>

                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Button>
                    
                    <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => handleDownloadPDF(order)}>

                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}
        </div>
      }
      
      {/* Order View Modal */}
      <OrderViewModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal} />

    </div>);


};

export default OrderList;