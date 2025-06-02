import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit, Package, Search, Calendar, DollarSign, TrendingUp, AlertCircle, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrderViewModal from '@/components/OrderViewModal';
import { pdfService } from '@/services/pdfService';

interface Order {
  id: number;
  order_number: string;
  agent_id: number;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_address: string;
  product_type: string;
  product_color: string;
  neck_type: string;
  total_quantity: number;
  size_breakdown: string;
  special_instructions: string;
  event_date: string;
  delivery_date: string;
  order_status: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  order_type: string;
}

const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    order_status: '',
    payment_status: '',
    paid_amount: 0,
    delivery_date: '',
    special_instructions: ''
  });

  const orderStatuses = ['Pending', 'Confirmed', 'In Production', 'Ready for Delivery', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['Pending', 'Partial', 'Complete'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11425, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setOrders(data.List || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await window.ezsite.apis.tableUpdate(11425, {
        id: selectedOrder.id,
        ...editData
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order updated successfully'
      });

      setIsEditDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  const openViewModal = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleDownloadPDF = async (order: Order) => {
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

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditData({
      order_status: order.order_status,
      payment_status: order.payment_status,
      paid_amount: order.paid_amount,
      delivery_date: order.delivery_date.split('T')[0],
      special_instructions: order.special_instructions
    });
    setIsEditDialogOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm) ||
    order.product_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.payment_status === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':return 'outline';
      case 'Confirmed':return 'secondary';
      case 'In Production':return 'default';
      case 'Ready for Delivery':return 'default';
      case 'Shipped':return 'default';
      case 'Delivered':return 'default';
      case 'Cancelled':return 'destructive';
      default:return 'outline';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Pending':return 'outline';
      case 'Partial':return 'outline';
      case 'Complete':return 'default';
      default:return 'outline';
    }
  };

  const parseSizeBreakdown = (sizeBreakdown: string) => {
    try {
      return JSON.parse(sizeBreakdown || '{}');
    } catch {
      return {};
    }
  };

  // Calculate summary statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.order_status === 'Pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingPayments = orders.filter((order) => order.payment_status !== 'Complete').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading orders...</div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Manage all customer orders and track their progress</p>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-red-600">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number, customer name, phone, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((status) =>
                <SelectItem key={status} value={status}>{status}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {paymentStatuses.map((status) =>
                <SelectItem key={status} value={status}>{status}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            View and manage all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) =>
                <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-gray-500">{order.order_type}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.product_type}</div>
                        <div className="text-sm text-gray-500">{order.product_color} - {order.neck_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.total_quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{order.total_amount}</div>
                        <div className="text-sm text-gray-500">Paid: ₹{order.paid_amount}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openViewModal(order)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(order)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 &&
          <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterPayment !== 'all' ? 'Try adjusting your search or filters.' : 'No orders have been placed yet.'}
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* Order View Modal */}
      <OrderViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)} />


      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
            <DialogDescription>
              Update order status and payment information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order Status</label>
              <Select value={editData.order_status} onValueChange={(value) => setEditData((prev) => ({ ...prev, order_status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order status" />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) =>
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={editData.payment_status} onValueChange={(value) => setEditData((prev) => ({ ...prev, payment_status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) =>
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Paid Amount</label>
              <Input
                type="number"
                step="0.01"
                value={editData.paid_amount}
                onChange={(e) => setEditData((prev) => ({ ...prev, paid_amount: parseFloat(e.target.value) || 0 }))} />

            </div>

            <div>
              <label className="text-sm font-medium">Delivery Date</label>
              <Input
                type="date"
                value={editData.delivery_date}
                onChange={(e) => setEditData((prev) => ({ ...prev, delivery_date: e.target.value }))} />

            </div>

            <div>
              <label className="text-sm font-medium">Special Instructions</label>
              <Textarea
                value={editData.special_instructions}
                onChange={(e) => setEditData((prev) => ({ ...prev, special_instructions: e.target.value }))}
                rows={3} />

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateOrder}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

export default OrderManagement;