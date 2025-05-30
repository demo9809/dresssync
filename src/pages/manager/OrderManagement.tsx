import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit, Package, Search, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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

  const openViewDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
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
      <div className="flex items-center justify-center h-64" data-id="r8luxb81p" data-path="src/pages/manager/OrderManagement.tsx">
        <div className="text-lg" data-id="3lifif8b6" data-path="src/pages/manager/OrderManagement.tsx">Loading orders...</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="u8hy3myjo" data-path="src/pages/manager/OrderManagement.tsx">
      <div className="flex items-center justify-between" data-id="78l2wj7w2" data-path="src/pages/manager/OrderManagement.tsx">
        <div data-id="ain8evhhb" data-path="src/pages/manager/OrderManagement.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="6z9xjx7kp" data-path="src/pages/manager/OrderManagement.tsx">Order Management</h1>
          <p className="text-gray-600" data-id="5hkpvgnop" data-path="src/pages/manager/OrderManagement.tsx">Manage all customer orders and track their progress</p>
        </div>
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="g98cq9agb" data-path="src/pages/manager/OrderManagement.tsx">
        <Card data-id="j8feba5s0" data-path="src/pages/manager/OrderManagement.tsx">
          <CardContent className="p-6" data-id="mni94by35" data-path="src/pages/manager/OrderManagement.tsx">
            <div className="flex items-center" data-id="210t64gz2" data-path="src/pages/manager/OrderManagement.tsx">
              <Package className="h-8 w-8 text-blue-600" data-id="s5dacn10q" data-path="src/pages/manager/OrderManagement.tsx" />
              <div className="ml-4" data-id="697t6sze6" data-path="src/pages/manager/OrderManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="5sxyz8wf3" data-path="src/pages/manager/OrderManagement.tsx">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900" data-id="gcgl235zf" data-path="src/pages/manager/OrderManagement.tsx">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="criiagyvt" data-path="src/pages/manager/OrderManagement.tsx">
          <CardContent className="p-6" data-id="cwge7695w" data-path="src/pages/manager/OrderManagement.tsx">
            <div className="flex items-center" data-id="7bbv5oy7y" data-path="src/pages/manager/OrderManagement.tsx">
              <AlertCircle className="h-8 w-8 text-orange-600" data-id="01aad7k4i" data-path="src/pages/manager/OrderManagement.tsx" />
              <div className="ml-4" data-id="2ybm8o8q8" data-path="src/pages/manager/OrderManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="zwojqdlqu" data-path="src/pages/manager/OrderManagement.tsx">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600" data-id="s9edl6w31" data-path="src/pages/manager/OrderManagement.tsx">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="1k1vkwa8d" data-path="src/pages/manager/OrderManagement.tsx">
          <CardContent className="p-6" data-id="rsbseu5au" data-path="src/pages/manager/OrderManagement.tsx">
            <div className="flex items-center" data-id="y5mvn1xbc" data-path="src/pages/manager/OrderManagement.tsx">
              <DollarSign className="h-8 w-8 text-green-600" data-id="4yahtv8eu" data-path="src/pages/manager/OrderManagement.tsx" />
              <div className="ml-4" data-id="p1ftc5bpw" data-path="src/pages/manager/OrderManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="txt8iu1oi" data-path="src/pages/manager/OrderManagement.tsx">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600" data-id="5ni9xn5xu" data-path="src/pages/manager/OrderManagement.tsx">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="xnhd9umkt" data-path="src/pages/manager/OrderManagement.tsx">
          <CardContent className="p-6" data-id="cum4qlvth" data-path="src/pages/manager/OrderManagement.tsx">
            <div className="flex items-center" data-id="jc8iygpry" data-path="src/pages/manager/OrderManagement.tsx">
              <TrendingUp className="h-8 w-8 text-red-600" data-id="xgxlj6gok" data-path="src/pages/manager/OrderManagement.tsx" />
              <div className="ml-4" data-id="9wnjcve7z" data-path="src/pages/manager/OrderManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="vve9fu9z2" data-path="src/pages/manager/OrderManagement.tsx">Pending Payments</p>
                <p className="text-2xl font-bold text-red-600" data-id="fgv4jiekd" data-path="src/pages/manager/OrderManagement.tsx">{pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card data-id="uotfe0cds" data-path="src/pages/manager/OrderManagement.tsx">
        <CardContent className="p-6" data-id="p4yhrnj3f" data-path="src/pages/manager/OrderManagement.tsx">
          <div className="flex flex-col sm:flex-row gap-4" data-id="1wmzerd7v" data-path="src/pages/manager/OrderManagement.tsx">
            <div className="flex-1" data-id="pawsiidpd" data-path="src/pages/manager/OrderManagement.tsx">
              <div className="relative" data-id="ukgkgd6yy" data-path="src/pages/manager/OrderManagement.tsx">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-id="1zmbd855e" data-path="src/pages/manager/OrderManagement.tsx" />
                <Input
                  placeholder="Search by order number, customer name, phone, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" data-id="njv61bx0p" data-path="src/pages/manager/OrderManagement.tsx" />

              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus} data-id="nw28dlfq1" data-path="src/pages/manager/OrderManagement.tsx">
              <SelectTrigger className="w-48" data-id="9emp1mxll" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectValue placeholder="Filter by status" data-id="urbz23n67" data-path="src/pages/manager/OrderManagement.tsx" />
              </SelectTrigger>
              <SelectContent data-id="8y6u32lgw" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectItem value="all" data-id="qtmay0v6w" data-path="src/pages/manager/OrderManagement.tsx">All Statuses</SelectItem>
                {orderStatuses.map((status) =>
                <SelectItem key={status} value={status} data-id="nv1mx83k6" data-path="src/pages/manager/OrderManagement.tsx">{status}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment} data-id="wk17s6rep" data-path="src/pages/manager/OrderManagement.tsx">
              <SelectTrigger className="w-48" data-id="acngirubx" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectValue placeholder="Filter by payment" data-id="uu48kyn4g" data-path="src/pages/manager/OrderManagement.tsx" />
              </SelectTrigger>
              <SelectContent data-id="0r2thzetb" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectItem value="all" data-id="rwp3tamj3" data-path="src/pages/manager/OrderManagement.tsx">All Payments</SelectItem>
                {paymentStatuses.map((status) =>
                <SelectItem key={status} value={status} data-id="n7r2q0a9t" data-path="src/pages/manager/OrderManagement.tsx">{status}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card data-id="oxvktekeh" data-path="src/pages/manager/OrderManagement.tsx">
        <CardHeader data-id="k9blkoefp" data-path="src/pages/manager/OrderManagement.tsx">
          <CardTitle data-id="g1igfjlrb" data-path="src/pages/manager/OrderManagement.tsx">Orders</CardTitle>
          <CardDescription data-id="1jd742bjz" data-path="src/pages/manager/OrderManagement.tsx">
            View and manage all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent data-id="5qvony2ng" data-path="src/pages/manager/OrderManagement.tsx">
          <div className="overflow-x-auto" data-id="re4y1gtut" data-path="src/pages/manager/OrderManagement.tsx">
            <Table data-id="r8vsthsvi" data-path="src/pages/manager/OrderManagement.tsx">
              <TableHeader data-id="uej52uu58" data-path="src/pages/manager/OrderManagement.tsx">
                <TableRow data-id="bmnkm9gwp" data-path="src/pages/manager/OrderManagement.tsx">
                  <TableHead data-id="nb70pmuge" data-path="src/pages/manager/OrderManagement.tsx">Order #</TableHead>
                  <TableHead data-id="m1trfyfc6" data-path="src/pages/manager/OrderManagement.tsx">Customer</TableHead>
                  <TableHead data-id="xgb34y7b8" data-path="src/pages/manager/OrderManagement.tsx">Product</TableHead>
                  <TableHead data-id="sf6br1nwe" data-path="src/pages/manager/OrderManagement.tsx">Quantity</TableHead>
                  <TableHead data-id="ipswuecdx" data-path="src/pages/manager/OrderManagement.tsx">Amount</TableHead>
                  <TableHead data-id="e4202mu79" data-path="src/pages/manager/OrderManagement.tsx">Order Status</TableHead>
                  <TableHead data-id="ezljgead1" data-path="src/pages/manager/OrderManagement.tsx">Payment Status</TableHead>
                  <TableHead data-id="qbp2f05ln" data-path="src/pages/manager/OrderManagement.tsx">Delivery Date</TableHead>
                  <TableHead data-id="bjnkodxkr" data-path="src/pages/manager/OrderManagement.tsx">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-id="v0hkfzkl1" data-path="src/pages/manager/OrderManagement.tsx">
                {filteredOrders.map((order) =>
                <TableRow key={order.id} data-id="6cyd73r48" data-path="src/pages/manager/OrderManagement.tsx">
                    <TableCell data-id="56pvp5vmj" data-path="src/pages/manager/OrderManagement.tsx">
                      <div className="font-medium" data-id="6cgf63yoa" data-path="src/pages/manager/OrderManagement.tsx">{order.order_number}</div>
                      <div className="text-sm text-gray-500" data-id="c8jl8a06q" data-path="src/pages/manager/OrderManagement.tsx">{order.order_type}</div>
                    </TableCell>
                    <TableCell data-id="cdsrnwgcr" data-path="src/pages/manager/OrderManagement.tsx">
                      <div data-id="vm5l9emrt" data-path="src/pages/manager/OrderManagement.tsx">
                        <div className="font-medium" data-id="k2ft1vow5" data-path="src/pages/manager/OrderManagement.tsx">{order.customer_name}</div>
                        <div className="text-sm text-gray-500" data-id="f6ohi2zn9" data-path="src/pages/manager/OrderManagement.tsx">{order.customer_phone}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="ogquv9asu" data-path="src/pages/manager/OrderManagement.tsx">
                      <div data-id="pj58mqb80" data-path="src/pages/manager/OrderManagement.tsx">
                        <div className="font-medium" data-id="jcflpkslw" data-path="src/pages/manager/OrderManagement.tsx">{order.product_type}</div>
                        <div className="text-sm text-gray-500" data-id="4q6yssgxp" data-path="src/pages/manager/OrderManagement.tsx">{order.product_color} - {order.neck_type}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="t657pgnak" data-path="src/pages/manager/OrderManagement.tsx">
                      <Badge variant="secondary" data-id="01alvn2se" data-path="src/pages/manager/OrderManagement.tsx">{order.total_quantity}</Badge>
                    </TableCell>
                    <TableCell data-id="p7tzwi66u" data-path="src/pages/manager/OrderManagement.tsx">
                      <div data-id="helav3hyi" data-path="src/pages/manager/OrderManagement.tsx">
                        <div className="font-medium" data-id="ok8yt86f2" data-path="src/pages/manager/OrderManagement.tsx">₹{order.total_amount}</div>
                        <div className="text-sm text-gray-500" data-id="mh9967ga5" data-path="src/pages/manager/OrderManagement.tsx">Paid: ₹{order.paid_amount}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="8crcu4zgi" data-path="src/pages/manager/OrderManagement.tsx">
                      <Badge variant={getStatusColor(order.order_status)} data-id="2lyvp6epo" data-path="src/pages/manager/OrderManagement.tsx">
                        {order.order_status}
                      </Badge>
                    </TableCell>
                    <TableCell data-id="93sr1908b" data-path="src/pages/manager/OrderManagement.tsx">
                      <Badge variant={getPaymentColor(order.payment_status)} data-id="7ucazic43" data-path="src/pages/manager/OrderManagement.tsx">
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell data-id="48myspeo2" data-path="src/pages/manager/OrderManagement.tsx">
                      <div className="flex items-center" data-id="gj28w3t1g" data-path="src/pages/manager/OrderManagement.tsx">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" data-id="zkxqwet55" data-path="src/pages/manager/OrderManagement.tsx" />
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell data-id="j9afegfrv" data-path="src/pages/manager/OrderManagement.tsx">
                      <div className="flex space-x-2" data-id="vhuvixfb8" data-path="src/pages/manager/OrderManagement.tsx">
                        <Button variant="outline" size="sm" onClick={() => openViewDialog(order)} data-id="lcbsmy5o1" data-path="src/pages/manager/OrderManagement.tsx">
                          <Eye className="w-4 h-4" data-id="8b5jrsmfm" data-path="src/pages/manager/OrderManagement.tsx" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(order)} data-id="3e4c1qcv6" data-path="src/pages/manager/OrderManagement.tsx">
                          <Edit className="w-4 h-4" data-id="c7za81o4r" data-path="src/pages/manager/OrderManagement.tsx" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 &&
          <div className="text-center py-8" data-id="35ownlvt3" data-path="src/pages/manager/OrderManagement.tsx">
              <Package className="mx-auto h-12 w-12 text-gray-400" data-id="nph3qa6ce" data-path="src/pages/manager/OrderManagement.tsx" />
              <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="5eh9snc8o" data-path="src/pages/manager/OrderManagement.tsx">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500" data-id="0tcnm23zv" data-path="src/pages/manager/OrderManagement.tsx">
                {searchTerm || filterStatus !== 'all' || filterPayment !== 'all' ? 'Try adjusting your search or filters.' : 'No orders have been placed yet.'}
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} data-id="adtmwswnn" data-path="src/pages/manager/OrderManagement.tsx">
        <DialogContent className="sm:max-w-lg" data-id="la0a2edug" data-path="src/pages/manager/OrderManagement.tsx">
          <DialogHeader data-id="fzv8p6c9n" data-path="src/pages/manager/OrderManagement.tsx">
            <DialogTitle data-id="26550814b" data-path="src/pages/manager/OrderManagement.tsx">Order Details</DialogTitle>
            <DialogDescription data-id="47exszg0q" data-path="src/pages/manager/OrderManagement.tsx">
              Complete order information for #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder &&
          <div className="space-y-4 max-h-96 overflow-y-auto" data-id="hg3dl7asa" data-path="src/pages/manager/OrderManagement.tsx">
              <div className="grid grid-cols-2 gap-4" data-id="y8zutibrx" data-path="src/pages/manager/OrderManagement.tsx">
                <div data-id="5f2xos3f5" data-path="src/pages/manager/OrderManagement.tsx">
                  <h4 className="font-medium text-gray-900" data-id="qc28amlza" data-path="src/pages/manager/OrderManagement.tsx">Customer Information</h4>
                  <div className="mt-2 space-y-1 text-sm" data-id="bfh585bbx" data-path="src/pages/manager/OrderManagement.tsx">
                    <p data-id="ge7qnop22" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="6b7sxpkgn" data-path="src/pages/manager/OrderManagement.tsx">Name:</span> {selectedOrder.customer_name}</p>
                    <p data-id="jwrrox17p" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="nzb5xmtjv" data-path="src/pages/manager/OrderManagement.tsx">Phone:</span> {selectedOrder.customer_phone}</p>
                    <p data-id="lydp2fq0d" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="cb05tt8fs" data-path="src/pages/manager/OrderManagement.tsx">WhatsApp:</span> {selectedOrder.customer_whatsapp}</p>
                    <p data-id="46okf9u1u" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="x25ztquks" data-path="src/pages/manager/OrderManagement.tsx">Address:</span> {selectedOrder.customer_address}</p>
                  </div>
                </div>
                <div data-id="zhy10ma6u" data-path="src/pages/manager/OrderManagement.tsx">
                  <h4 className="font-medium text-gray-900" data-id="eirs1cznk" data-path="src/pages/manager/OrderManagement.tsx">Product Details</h4>
                  <div className="mt-2 space-y-1 text-sm" data-id="v9nx9q2mz" data-path="src/pages/manager/OrderManagement.tsx">
                    <p data-id="xqz289tv7" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="ocbmva653" data-path="src/pages/manager/OrderManagement.tsx">Type:</span> {selectedOrder.product_type}</p>
                    <p data-id="cjt2fw7ma" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="tiadt1ml1" data-path="src/pages/manager/OrderManagement.tsx">Color:</span> {selectedOrder.product_color}</p>
                    <p data-id="uu5lm06c9" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="bf7cc8sdm" data-path="src/pages/manager/OrderManagement.tsx">Neck:</span> {selectedOrder.neck_type}</p>
                    <p data-id="yubfkihre" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="zcu2m20tf" data-path="src/pages/manager/OrderManagement.tsx">Quantity:</span> {selectedOrder.total_quantity}</p>
                  </div>
                </div>
              </div>
              
              <div data-id="p7bot89vq" data-path="src/pages/manager/OrderManagement.tsx">
                <h4 className="font-medium text-gray-900" data-id="ilf8oalm1" data-path="src/pages/manager/OrderManagement.tsx">Size Breakdown</h4>
                <div className="mt-2 flex flex-wrap gap-2" data-id="pvqp2c290" data-path="src/pages/manager/OrderManagement.tsx">
                  {Object.entries(parseSizeBreakdown(selectedOrder.size_breakdown)).map(([size, qty]) =>
                <Badge key={size} variant="outline" data-id="h7ml6juni" data-path="src/pages/manager/OrderManagement.tsx">
                      {size}: {qty as number}
                    </Badge>
                )}
                </div>
              </div>

              <div data-id="kbtv00w68" data-path="src/pages/manager/OrderManagement.tsx">
                <h4 className="font-medium text-gray-900" data-id="0wzkejsdi" data-path="src/pages/manager/OrderManagement.tsx">Order Information</h4>
                <div className="mt-2 space-y-1 text-sm" data-id="s5lsotm8f" data-path="src/pages/manager/OrderManagement.tsx">
                  <p data-id="hvrb503r6" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="vnl81cpih" data-path="src/pages/manager/OrderManagement.tsx">Event Date:</span> {new Date(selectedOrder.event_date).toLocaleDateString()}</p>
                  <p data-id="m6wy77jc3" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="9n978jjge" data-path="src/pages/manager/OrderManagement.tsx">Delivery Date:</span> {new Date(selectedOrder.delivery_date).toLocaleDateString()}</p>
                  <p data-id="05ie8302k" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="ycpuvv48m" data-path="src/pages/manager/OrderManagement.tsx">Order Status:</span> <Badge variant={getStatusColor(selectedOrder.order_status)} data-id="msviyrktb" data-path="src/pages/manager/OrderManagement.tsx">{selectedOrder.order_status}</Badge></p>
                  <p data-id="bdq4po1w1" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="xfs20tdqw" data-path="src/pages/manager/OrderManagement.tsx">Payment Status:</span> <Badge variant={getPaymentColor(selectedOrder.payment_status)} data-id="j4bektax7" data-path="src/pages/manager/OrderManagement.tsx">{selectedOrder.payment_status}</Badge></p>
                </div>
              </div>

              <div data-id="8keg9m095" data-path="src/pages/manager/OrderManagement.tsx">
                <h4 className="font-medium text-gray-900" data-id="v55yx492s" data-path="src/pages/manager/OrderManagement.tsx">Pricing</h4>
                <div className="mt-2 space-y-1 text-sm" data-id="j23zscrfn" data-path="src/pages/manager/OrderManagement.tsx">
                  <p data-id="8e3y2tgkr" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="7u4m3qib8" data-path="src/pages/manager/OrderManagement.tsx">Total Amount:</span> ₹{selectedOrder.total_amount}</p>
                  <p data-id="sq7konrjd" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="rmpvnpdz1" data-path="src/pages/manager/OrderManagement.tsx">Paid Amount:</span> ₹{selectedOrder.paid_amount}</p>
                  <p data-id="cqepqevwv" data-path="src/pages/manager/OrderManagement.tsx"><span className="font-medium" data-id="qdw2b7h3r" data-path="src/pages/manager/OrderManagement.tsx">Balance:</span> ₹{selectedOrder.total_amount - selectedOrder.paid_amount}</p>
                </div>
              </div>

              {selectedOrder.special_instructions &&
            <div data-id="ng7mv7ew5" data-path="src/pages/manager/OrderManagement.tsx">
                  <h4 className="font-medium text-gray-900" data-id="l5i1up8nb" data-path="src/pages/manager/OrderManagement.tsx">Special Instructions</h4>
                  <p className="mt-2 text-sm text-gray-600" data-id="7bov1pxbm" data-path="src/pages/manager/OrderManagement.tsx">{selectedOrder.special_instructions}</p>
                </div>
            }
            </div>
          }
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} data-id="uhhex30xj" data-path="src/pages/manager/OrderManagement.tsx">
        <DialogContent className="sm:max-w-md" data-id="oui5ztjsq" data-path="src/pages/manager/OrderManagement.tsx">
          <DialogHeader data-id="5uwsy2gng" data-path="src/pages/manager/OrderManagement.tsx">
            <DialogTitle data-id="fklbtsagn" data-path="src/pages/manager/OrderManagement.tsx">Update Order</DialogTitle>
            <DialogDescription data-id="i6n0uyt8f" data-path="src/pages/manager/OrderManagement.tsx">
              Update order status and payment information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-id="xdr0u28ml" data-path="src/pages/manager/OrderManagement.tsx">
            <div data-id="gvmjllynu" data-path="src/pages/manager/OrderManagement.tsx">
              <label className="text-sm font-medium" data-id="reejbml78" data-path="src/pages/manager/OrderManagement.tsx">Order Status</label>
              <Select value={editData.order_status} onValueChange={(value) => setEditData((prev) => ({ ...prev, order_status: value }))} data-id="gxepcaxm8" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectTrigger data-id="n5jyuqvat" data-path="src/pages/manager/OrderManagement.tsx">
                  <SelectValue placeholder="Select order status" data-id="kajxqbf5u" data-path="src/pages/manager/OrderManagement.tsx" />
                </SelectTrigger>
                <SelectContent data-id="9wq8bvlte" data-path="src/pages/manager/OrderManagement.tsx">
                  {orderStatuses.map((status) =>
                  <SelectItem key={status} value={status} data-id="pdp21vn4q" data-path="src/pages/manager/OrderManagement.tsx">{status}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div data-id="xz76sdw8" data-path="src/pages/manager/OrderManagement.tsx">
              <label className="text-sm font-medium" data-id="yesmiqp1j" data-path="src/pages/manager/OrderManagement.tsx">Payment Status</label>
              <Select value={editData.payment_status} onValueChange={(value) => setEditData((prev) => ({ ...prev, payment_status: value }))} data-id="b6m4rs9ha" data-path="src/pages/manager/OrderManagement.tsx">
                <SelectTrigger data-id="g9l6q7mrc" data-path="src/pages/manager/OrderManagement.tsx">
                  <SelectValue placeholder="Select payment status" data-id="i17ewqyq8" data-path="src/pages/manager/OrderManagement.tsx" />
                </SelectTrigger>
                <SelectContent data-id="cyu8bvv4w" data-path="src/pages/manager/OrderManagement.tsx">
                  {paymentStatuses.map((status) =>
                  <SelectItem key={status} value={status} data-id="tsyo6yarx" data-path="src/pages/manager/OrderManagement.tsx">{status}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div data-id="yhsg97nxv" data-path="src/pages/manager/OrderManagement.tsx">
              <label className="text-sm font-medium" data-id="4uihp1359" data-path="src/pages/manager/OrderManagement.tsx">Paid Amount</label>
              <Input
                type="number"
                step="0.01"
                value={editData.paid_amount}
                onChange={(e) => setEditData((prev) => ({ ...prev, paid_amount: parseFloat(e.target.value) || 0 }))} data-id="kbb0mjxcx" data-path="src/pages/manager/OrderManagement.tsx" />

            </div>

            <div data-id="883mbpg3w" data-path="src/pages/manager/OrderManagement.tsx">
              <label className="text-sm font-medium" data-id="87c30h8y8" data-path="src/pages/manager/OrderManagement.tsx">Delivery Date</label>
              <Input
                type="date"
                value={editData.delivery_date}
                onChange={(e) => setEditData((prev) => ({ ...prev, delivery_date: e.target.value }))} data-id="w6cid99qa" data-path="src/pages/manager/OrderManagement.tsx" />

            </div>

            <div data-id="kkays89cq" data-path="src/pages/manager/OrderManagement.tsx">
              <label className="text-sm font-medium" data-id="moosy1zo2" data-path="src/pages/manager/OrderManagement.tsx">Special Instructions</label>
              <Textarea
                value={editData.special_instructions}
                onChange={(e) => setEditData((prev) => ({ ...prev, special_instructions: e.target.value }))}
                rows={3} data-id="m3017mbqf" data-path="src/pages/manager/OrderManagement.tsx" />

            </div>
          </div>
          <DialogFooter data-id="8m17dw18u" data-path="src/pages/manager/OrderManagement.tsx">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} data-id="1wvttpxvx" data-path="src/pages/manager/OrderManagement.tsx">Cancel</Button>
            <Button onClick={handleUpdateOrder} data-id="rty6yxb4s" data-path="src/pages/manager/OrderManagement.tsx">Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

export default OrderManagement;