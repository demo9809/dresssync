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
  Package,
  ShoppingCart,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  TrendingUp } from
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
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
    calculateSummary();
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Loading orders for user:', user);

      // Fetch orders from the database
      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "id",
        "IsAsc": false,
        "Filters": user?.ID || user?.id ? [{
          "name": "agent_id",
          "op": "Equal",
          "value": parseInt(user.ID?.toString() || user.id || '0')
        }] : []
      });

      if (error) throw error;

      const ordersList = data?.List || [];
      console.log('Loaded orders:', ordersList);
      setOrders(ordersList);
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
      order.order_number?.toLowerCase().includes(query) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.product_type?.toLowerCase().includes(query) ||
      order.product_color?.toLowerCase().includes(query) ||
      order.id?.toString().includes(query)
      );
    }

    // Filter by order status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.order_status === statusFilter);
    }

    // Filter by payment status
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((order) => order.payment_status === paymentFilter);
    }

    // Sort by ID (newest first)
    filtered.sort((a, b) => (b.id || 0) - (a.id || 0));

    setFilteredOrders(filtered);
  };

  const calculateSummary = () => {
    const totalOrders = filteredOrders.length;
    const totalAmount = filteredOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const pendingOrders = filteredOrders.filter((order) =>
    order.order_status === 'Pending' || order.order_status === 'In Production'
    ).length;
    const completedOrders = filteredOrders.filter((order) =>
    order.order_status === 'Delivered'
    ).length;

    setSummary({ totalOrders, totalAmount, pendingOrders, completedOrders });
  };

  const handleDownloadPDF = async (order: any) => {
    try {
      console.log('Generating PDF for order:', order);

      // Load order items for PDF generation
      const { data: itemsData, error: itemsError } = await window.ezsite.apis.tablePage(17047, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "ID",
        "IsAsc": true,
        "Filters": [{
          "name": "order_id",
          "op": "Equal",
          "value": order.ID || order.id
        }]
      });

      if (itemsError) throw itemsError;

      const orderItems = itemsData?.List || [];
      console.log('Order items:', orderItems);

      // Create order data in the format expected by pdfService
      const orderForPdf = {
        id: order.ID || order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_whatsapp: order.customer_whatsapp,
        customer_address: order.customer_address,
        product_type: order.product_type,
        product_color: order.product_color,
        neck_type: order.neck_type || 'Round Neck',
        total_quantity: order.total_quantity,
        size_breakdown: order.size_breakdown,
        special_instructions: order.special_instructions,
        event_date: order.event_date,
        delivery_date: order.delivery_date,
        order_status: order.order_status,
        total_amount: order.total_amount,
        paid_amount: order.paid_amount,
        payment_status: order.payment_status,
        order_type: order.order_type
      };

      await pdfService.generateOrderPDF(orderForPdf);

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
    console.log('Viewing order:', order);
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

  const isMultiProductOrder = (order: any) => {
    return order.product_type === 'Multiple Products' || order.product_color === 'Mixed';
  };

  const formatCurrency = (amount: number | string) => {
    const num = parseFloat(amount?.toString() || '0');
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN');
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
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={loadOrders}
            className="flex items-center gap-2">

            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Link to="/agent/orders/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{summary.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{summary.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{summary.completedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-48">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredOrders.length > 0 &&
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              <span>Total value: {formatCurrency(summary.totalAmount)}</span>
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
                          ID: {order.id} • Created: {formatDate(order.created_date)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getStatusBadgeVariant(order.order_status)}>
                          {order.order_status}
                        </Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
                          Payment: {order.payment_status}
                        </Badge>
                        {isMultiProductOrder(order) &&
                    <Badge variant="outline" className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            Multi-Product
                          </Badge>
                    }
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          {isMultiProductOrder(order) ?
                      <>
                              <p className="text-sm font-medium">Multiple Products</p>
                              <p className="text-xs text-gray-500">Mixed colors & types</p>
                            </> :

                      <>
                              <p className="text-sm font-medium">{order.product_type}</p>
                              <p className="text-xs text-gray-500">
                                {order.product_color}
                              </p>
                            </>
                      }
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">
                            Delivery: {formatDate(order.delivery_date)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Event: {formatDate(order.event_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-gray-500">
                            {order.total_quantity} pieces
                          </p>
                          {parseFloat(order.paid_amount) > 0 &&
                      <p className="text-xs text-green-600">
                              Paid: {formatCurrency(order.paid_amount)}
                            </p>
                      }
                        </div>
                      </div>
                    </div>
                    
                    {/* Size Breakdown - only for single product orders */}
                    {!isMultiProductOrder(order) &&
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
                }

                    {/* Multi-product indicator */}
                    {isMultiProductOrder(order) &&
                <div className="mb-4">
                        <Badge variant="outline" className="text-xs">
                          View details to see all products and sizes
                        </Badge>
                      </div>
                }

                    {/* Special Instructions */}
                    {order.special_instructions &&
                <div className="mb-4">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Note:</span> {order.special_instructions}
                        </p>
                      </div>
                }
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

                      <Download className="w-4 h-4" />
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