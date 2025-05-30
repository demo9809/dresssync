import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  FileText,
  Upload,
  User,
  Package,
  Calendar,
  DollarSign } from
'lucide-react';
import SizeBreakdown from '@/components/SizeBreakdown';
import { orderService, Order, Customer, SizeBreakdown as SizeBreakdownType } from '@/services/orderService';
import { stockService, productConfig } from '@/services/stockService';
import { pdfService } from '@/services/pdfService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    phone: '',
    whatsapp: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [product, setProduct] = useState({
    type: '',
    color: '',
    neckType: '',
    specialInstructions: '',
    fileUpload: ''
  });

  const [quantity, setQuantity] = useState({
    total: 0,
    sizeBreakdown: {} as SizeBreakdownType
  });

  const [delivery, setDelivery] = useState({
    eventDate: '',
    deliveryDate: '',
    status: 'Pending' as const
  });

  const [payment, setPayment] = useState({
    amount: 0,
    paid: 0,
    pending: 0,
    status: 'Pending' as const
  });

  const [orderType, setOrderType] = useState<'From Stock' | 'Custom Order' | 'Mixed Order'>('From Stock');

  // State management
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  const [duplicateOrders, setDuplicateOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('customer');

  useEffect(() => {
    if (product.type && product.color && product.neckType) {
      loadAvailableStock();
    }
  }, [product.type, product.color, product.neckType]);

  useEffect(() => {
    if (customer.name && product.type && delivery.eventDate) {
      checkForDuplicates();
    }
  }, [customer.name, product.type, delivery.eventDate]);

  useEffect(() => {
    // Calculate pending payment when amount or paid changes
    setPayment((prev) => ({
      ...prev,
      pending: prev.amount - prev.paid,
      status: prev.paid === 0 ? 'Pending' : prev.paid >= prev.amount ? 'Complete' : 'Partial'
    }));
  }, [payment.amount, payment.paid]);

  const loadAvailableStock = async () => {
    try {
      const stock = await stockService.getStock(product.type, product.color, product.neckType);
      const stockMap: Record<string, number> = {};
      stock.forEach((item) => {
        stockMap[item.size] = item.quantity;
      });
      setAvailableStock(stockMap);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const checkForDuplicates = async () => {
    try {
      const duplicates = await orderService.checkForDuplicates(
        customer.name,
        product.type,
        delivery.eventDate
      );
      setDuplicateOrders(duplicates);
    } catch (error) {
      console.error('Error checking duplicates:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Customer validation
    if (!customer.name.trim()) newErrors.customerName = 'Customer name is required';
    if (!customer.phone.trim()) newErrors.customerPhone = 'Phone number is required';
    if (!customer.whatsapp.trim()) newErrors.customerWhatsapp = 'WhatsApp number is required';
    if (!customer.address.street.trim()) newErrors.customerStreet = 'Street address is required';
    if (!customer.address.city.trim()) newErrors.customerCity = 'City is required';
    if (!customer.address.state.trim()) newErrors.customerState = 'State is required';
    if (!customer.address.zipCode.trim()) newErrors.customerZip = 'Zip code is required';

    // Product validation
    if (!product.type) newErrors.productType = 'Product type is required';
    if (!product.color) newErrors.productColor = 'Product color is required';
    if (!product.neckType) newErrors.productNeck = 'Neck type is required';

    // Quantity validation
    if (quantity.total <= 0) newErrors.quantity = 'Total quantity must be greater than 0';

    const sizeTotal = Object.values(quantity.sizeBreakdown).reduce((sum, qty) => sum + qty, 0);
    if (sizeTotal !== quantity.total) {
      newErrors.sizeBreakdown = 'Size breakdown must equal total quantity';
    }

    // Delivery validation
    if (!delivery.eventDate) newErrors.eventDate = 'Event date is required';
    if (!delivery.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';

    const eventDate = new Date(delivery.eventDate);
    const deliveryDate = new Date(delivery.deliveryDate);
    if (deliveryDate >= eventDate) {
      newErrors.deliveryDate = 'Delivery date must be before event date';
    }

    // Payment validation
    if (payment.amount <= 0) newErrors.paymentAmount = 'Payment amount must be greater than 0';
    if (payment.paid < 0) newErrors.paymentPaid = 'Paid amount cannot be negative';
    if (payment.paid > payment.amount) newErrors.paymentPaid = 'Paid amount cannot exceed total amount';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields and fix any errors.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check stock availability for 'From Stock' orders
      if (orderType === 'From Stock' || orderType === 'Mixed Order') {
        const availability = await stockService.checkAvailability(
          product.type,
          product.color,
          product.neckType,
          quantity.sizeBreakdown
        );

        if (!availability.available) {
          toast({
            title: "Insufficient Stock",
            description: "Some sizes are not available in sufficient quantities.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Create order
      const orderData = {
        customer,
        product,
        quantity,
        delivery,
        payment,
        orderType,
        agentId: user!.id
      };

      const newOrder = await orderService.createOrder(orderData);

      // Update stock for 'From Stock' orders
      if (orderType === 'From Stock') {
        await stockService.updateStock(
          product.type,
          product.color,
          product.neckType,
          quantity.sizeBreakdown,
          'reduce'
        );
      }

      toast({
        title: "Order Created Successfully",
        description: `Order ${newOrder.id} has been created and saved.`
      });

      // Navigate to order details or orders list
      navigate('/agent/orders');

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error Creating Order",
        description: "There was an error creating the order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before generating preview.",
        variant: "destructive"
      });
      return;
    }

    const previewOrder: Order = {
      id: 'PREVIEW',
      customer,
      product,
      quantity,
      delivery,
      payment,
      orderType,
      agentId: user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await pdfService.printOrderPDF(previewOrder);
  };

  const nextTab = () => {
    const tabs = ['customer', 'product', 'quantity', 'delivery', 'payment'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ['customer', 'product', 'quantity', 'delivery', 'payment'];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="space-y-6" data-id="2jf6kcy8w" data-path="src/pages/agent/NewOrder.tsx">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between" data-id="hano105mq" data-path="src/pages/agent/NewOrder.tsx">
        <div data-id="j8ys3pwf6" data-path="src/pages/agent/NewOrder.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="kc4j1no0s" data-path="src/pages/agent/NewOrder.tsx">Create New Order</h1>
          <p className="text-gray-600 mt-1" data-id="5pkkq7g3m" data-path="src/pages/agent/NewOrder.tsx">Enter customer and product details</p>
        </div>
        <Badge variant="secondary" className="mt-4 md:mt-0" data-id="pd1fmj6vt" data-path="src/pages/agent/NewOrder.tsx">
          Agent: {user?.name}
        </Badge>
      </div>

      {/* Duplicate Orders Warning */}
      {duplicateOrders.length > 0 &&
      <Alert variant="destructive" data-id="u8s1rb5ml" data-path="src/pages/agent/NewOrder.tsx">
          <AlertTriangle className="h-4 w-4" data-id="exxkinodn" data-path="src/pages/agent/NewOrder.tsx" />
          <AlertDescription data-id="9kbhamyfr" data-path="src/pages/agent/NewOrder.tsx">
            <strong data-id="qggsymwz4" data-path="src/pages/agent/NewOrder.tsx">Potential Duplicate Orders Found!</strong> 
            There are {duplicateOrders.length} existing order(s) for "{customer.name}" 
            with similar details. Please verify before proceeding.
          </AlertDescription>
        </Alert>
      }

      {/* Order Form */}
      <Card data-id="7vz21jcu9" data-path="src/pages/agent/NewOrder.tsx">
        <CardHeader data-id="njvdzhuuv" data-path="src/pages/agent/NewOrder.tsx">
          <CardTitle className="flex items-center space-x-2" data-id="yua8wl87o" data-path="src/pages/agent/NewOrder.tsx">
            <Package className="w-5 h-5" data-id="e2cuzxdgv" data-path="src/pages/agent/NewOrder.tsx" />
            <span data-id="mpzwxgv9c" data-path="src/pages/agent/NewOrder.tsx">Order Details</span>
          </CardTitle>
          <CardDescription data-id="198vaqoay" data-path="src/pages/agent/NewOrder.tsx">Complete all sections to create the order</CardDescription>
        </CardHeader>
        
        <CardContent data-id="uc2rthjyd" data-path="src/pages/agent/NewOrder.tsx">
          <Tabs value={currentTab} onValueChange={setCurrentTab} data-id="qlgrtya3b" data-path="src/pages/agent/NewOrder.tsx">
            <TabsList className="grid w-full grid-cols-5" data-id="zh53jvgml" data-path="src/pages/agent/NewOrder.tsx">
              <TabsTrigger value="customer" className="flex items-center space-x-2" data-id="lsrihdqmm" data-path="src/pages/agent/NewOrder.tsx">
                <User className="w-4 h-4" data-id="26ka4bp9g" data-path="src/pages/agent/NewOrder.tsx" />
                <span className="hidden sm:inline" data-id="nf59hmuog" data-path="src/pages/agent/NewOrder.tsx">Customer</span>
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center space-x-2" data-id="s73f2huwb" data-path="src/pages/agent/NewOrder.tsx">
                <Package className="w-4 h-4" data-id="ouft78mwh" data-path="src/pages/agent/NewOrder.tsx" />
                <span className="hidden sm:inline" data-id="lrql6ul2r" data-path="src/pages/agent/NewOrder.tsx">Product</span>
              </TabsTrigger>
              <TabsTrigger value="quantity" className="flex items-center space-x-2" data-id="xp8odsy4v" data-path="src/pages/agent/NewOrder.tsx">
                <CheckCircle className="w-4 h-4" data-id="7xvrqqnx0" data-path="src/pages/agent/NewOrder.tsx" />
                <span className="hidden sm:inline" data-id="dbdk84sur" data-path="src/pages/agent/NewOrder.tsx">Quantity</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center space-x-2" data-id="j9xsqjsgz" data-path="src/pages/agent/NewOrder.tsx">
                <Calendar className="w-4 h-4" data-id="kvaouf5qo" data-path="src/pages/agent/NewOrder.tsx" />
                <span className="hidden sm:inline" data-id="gbxi2s0hb" data-path="src/pages/agent/NewOrder.tsx">Delivery</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2" data-id="g368iaj2a" data-path="src/pages/agent/NewOrder.tsx">
                <DollarSign className="w-4 h-4" data-id="f8irgzldm" data-path="src/pages/agent/NewOrder.tsx" />
                <span className="hidden sm:inline" data-id="ay4d5waa4" data-path="src/pages/agent/NewOrder.tsx">Payment</span>
              </TabsTrigger>
            </TabsList>

            {/* Customer Information Tab */}
            <TabsContent value="customer" className="space-y-4 mt-6" data-id="exhsbv04y" data-path="src/pages/agent/NewOrder.tsx">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="ps1x9wibg" data-path="src/pages/agent/NewOrder.tsx">
                <div className="space-y-2" data-id="iovd83pst" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="customerName" data-id="c4zf8c0z7" data-path="src/pages/agent/NewOrder.tsx">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customer.name}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                    className={errors.customerName ? 'border-red-500' : ''} data-id="86yd4imxq" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerName && <p className="text-sm text-red-600" data-id="t0pqteajq" data-path="src/pages/agent/NewOrder.tsx">{errors.customerName}</p>}
                </div>
                
                <div className="space-y-2" data-id="2pnjbnz8r" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="customerPhone" data-id="pebus7if1" data-path="src/pages/agent/NewOrder.tsx">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customer.phone}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    className={errors.customerPhone ? 'border-red-500' : ''} data-id="fup0rp6vz" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerPhone && <p className="text-sm text-red-600" data-id="3sltnl976" data-path="src/pages/agent/NewOrder.tsx">{errors.customerPhone}</p>}
                </div>
                
                <div className="space-y-2" data-id="qmp34eq67" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="customerWhatsapp" data-id="7iw5vxajz" data-path="src/pages/agent/NewOrder.tsx">WhatsApp Number *</Label>
                  <Input
                    id="customerWhatsapp"
                    value={customer.whatsapp}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+1234567890"
                    className={errors.customerWhatsapp ? 'border-red-500' : ''} data-id="uz2y0gn1o" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerWhatsapp && <p className="text-sm text-red-600" data-id="v6wyu6qsh" data-path="src/pages/agent/NewOrder.tsx">{errors.customerWhatsapp}</p>}
                </div>
              </div>
              
              <Separator data-id="az9x8x6tm" data-path="src/pages/agent/NewOrder.tsx" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="tji202bxp" data-path="src/pages/agent/NewOrder.tsx">
                <div className="space-y-2" data-id="s41lltagr" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="street" data-id="i0gz7fm4f" data-path="src/pages/agent/NewOrder.tsx">Street Address *</Label>
                  <Input
                    id="street"
                    value={customer.address.street}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="123 Main Street"
                    className={errors.customerStreet ? 'border-red-500' : ''} data-id="ceyw6c6yq" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerStreet && <p className="text-sm text-red-600" data-id="0um38nt9j" data-path="src/pages/agent/NewOrder.tsx">{errors.customerStreet}</p>}
                </div>
                
                <div className="space-y-2" data-id="wri1nimnx" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="city" data-id="y82ad5nbx" data-path="src/pages/agent/NewOrder.tsx">City *</Label>
                  <Input
                    id="city"
                    value={customer.address.city}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="New York"
                    className={errors.customerCity ? 'border-red-500' : ''} data-id="te1qxsb0y" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerCity && <p className="text-sm text-red-600" data-id="gc8i3yiaf" data-path="src/pages/agent/NewOrder.tsx">{errors.customerCity}</p>}
                </div>
                
                <div className="space-y-2" data-id="gf6viu1s4" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="state" data-id="0rxj8dd2h" data-path="src/pages/agent/NewOrder.tsx">State *</Label>
                  <Input
                    id="state"
                    value={customer.address.state}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="NY"
                    className={errors.customerState ? 'border-red-500' : ''} data-id="gm818uaz2" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerState && <p className="text-sm text-red-600" data-id="89lya5hxq" data-path="src/pages/agent/NewOrder.tsx">{errors.customerState}</p>}
                </div>
                
                <div className="space-y-2" data-id="h55rynakf" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="zipCode" data-id="y2pa8skwv" data-path="src/pages/agent/NewOrder.tsx">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    value={customer.address.zipCode}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="10001"
                    className={errors.customerZip ? 'border-red-500' : ''} data-id="hf766knp7" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.customerZip && <p className="text-sm text-red-600" data-id="bwv927m26" data-path="src/pages/agent/NewOrder.tsx">{errors.customerZip}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Product Information Tab */}
            <TabsContent value="product" className="space-y-4 mt-6" data-id="51f5sqhfc" data-path="src/pages/agent/NewOrder.tsx">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="endr43esk" data-path="src/pages/agent/NewOrder.tsx">
                <div className="space-y-2" data-id="zjsu2bo5y" data-path="src/pages/agent/NewOrder.tsx">
                  <Label data-id="6so9kq3f4" data-path="src/pages/agent/NewOrder.tsx">Product Type *</Label>
                  <Select
                    value={product.type}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, type: value }))} data-id="2tkln1prl" data-path="src/pages/agent/NewOrder.tsx">

                    <SelectTrigger className={errors.productType ? 'border-red-500' : ''} data-id="td98ev4qt" data-path="src/pages/agent/NewOrder.tsx">
                      <SelectValue placeholder="Select product type" data-id="m0rnoihrq" data-path="src/pages/agent/NewOrder.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="0fjfdk9cv" data-path="src/pages/agent/NewOrder.tsx">
                      {productConfig.productTypes.map((type) =>
                      <SelectItem key={type} value={type} data-id="gkp7sp0gu" data-path="src/pages/agent/NewOrder.tsx">{type}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productType && <p className="text-sm text-red-600" data-id="icpzl4jch" data-path="src/pages/agent/NewOrder.tsx">{errors.productType}</p>}
                </div>
                
                <div className="space-y-2" data-id="qotmbizb9" data-path="src/pages/agent/NewOrder.tsx">
                  <Label data-id="bkim4bk45" data-path="src/pages/agent/NewOrder.tsx">Color *</Label>
                  <Select
                    value={product.color}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, color: value }))} data-id="bdyqlupiy" data-path="src/pages/agent/NewOrder.tsx">

                    <SelectTrigger className={errors.productColor ? 'border-red-500' : ''} data-id="slth2mk8h" data-path="src/pages/agent/NewOrder.tsx">
                      <SelectValue placeholder="Select color" data-id="hj7ug7062" data-path="src/pages/agent/NewOrder.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="h74ecke5m" data-path="src/pages/agent/NewOrder.tsx">
                      {productConfig.colors.map((color) =>
                      <SelectItem key={color} value={color} data-id="ibfktcgvz" data-path="src/pages/agent/NewOrder.tsx">{color}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productColor && <p className="text-sm text-red-600" data-id="fv7zh7l54" data-path="src/pages/agent/NewOrder.tsx">{errors.productColor}</p>}
                </div>
                
                <div className="space-y-2" data-id="nc1lduuev" data-path="src/pages/agent/NewOrder.tsx">
                  <Label data-id="h64ovikuu" data-path="src/pages/agent/NewOrder.tsx">Neck Type *</Label>
                  <Select
                    value={product.neckType}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, neckType: value }))} data-id="gp5fg93fm" data-path="src/pages/agent/NewOrder.tsx">

                    <SelectTrigger className={errors.productNeck ? 'border-red-500' : ''} data-id="195algk1f" data-path="src/pages/agent/NewOrder.tsx">
                      <SelectValue placeholder="Select neck type" data-id="ebnbrbeht" data-path="src/pages/agent/NewOrder.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="7u8l0yzt3" data-path="src/pages/agent/NewOrder.tsx">
                      {productConfig.neckTypes.map((neck) =>
                      <SelectItem key={neck} value={neck} data-id="oaus76pb8" data-path="src/pages/agent/NewOrder.tsx">{neck}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productNeck && <p className="text-sm text-red-600" data-id="436486i7u" data-path="src/pages/agent/NewOrder.tsx">{errors.productNeck}</p>}
                </div>
              </div>
              
              <div className="space-y-2" data-id="99inp8a7o" data-path="src/pages/agent/NewOrder.tsx">
                <Label data-id="q4snyu2f1" data-path="src/pages/agent/NewOrder.tsx">Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as typeof orderType)} data-id="65tr0k2z5" data-path="src/pages/agent/NewOrder.tsx">

                  <SelectTrigger data-id="hunqktvzp" data-path="src/pages/agent/NewOrder.tsx">
                    <SelectValue data-id="euf4tp15s" data-path="src/pages/agent/NewOrder.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="0ladqdvfo" data-path="src/pages/agent/NewOrder.tsx">
                    <SelectItem value="From Stock" data-id="r1n7jfven" data-path="src/pages/agent/NewOrder.tsx">From Stock</SelectItem>
                    <SelectItem value="Custom Order" data-id="wc438sfky" data-path="src/pages/agent/NewOrder.tsx">Custom Order</SelectItem>
                    <SelectItem value="Mixed Order" data-id="0md7iqwb7" data-path="src/pages/agent/NewOrder.tsx">Mixed Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2" data-id="o3b0mh2or" data-path="src/pages/agent/NewOrder.tsx">
                <Label htmlFor="specialInstructions" data-id="bhflbq95e" data-path="src/pages/agent/NewOrder.tsx">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={product.specialInstructions}
                  onChange={(e) => setProduct((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special requirements, logo placement, etc."
                  rows={3} data-id="mqfgsjxuu" data-path="src/pages/agent/NewOrder.tsx" />

              </div>
              
              <div className="space-y-2" data-id="eg6jhcugi" data-path="src/pages/agent/NewOrder.tsx">
                <Label data-id="n9g4744f4" data-path="src/pages/agent/NewOrder.tsx">File Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center" data-id="qu9epjqbu" data-path="src/pages/agent/NewOrder.tsx">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" data-id="cc2jkit1a" data-path="src/pages/agent/NewOrder.tsx" />
                  <p className="text-sm text-gray-600" data-id="mejd8cgz8" data-path="src/pages/agent/NewOrder.tsx">Upload logo or design files</p>
                  <Button variant="outline" size="sm" className="mt-2" data-id="k5qqht4zv" data-path="src/pages/agent/NewOrder.tsx">
                    Choose Files
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Quantity & Size Breakdown Tab */}
            <TabsContent value="quantity" className="space-y-4 mt-6" data-id="cv4htkx8w" data-path="src/pages/agent/NewOrder.tsx">
              <div className="space-y-2" data-id="0cldry8ul" data-path="src/pages/agent/NewOrder.tsx">
                <Label htmlFor="totalQuantity" data-id="jtqa8vte3" data-path="src/pages/agent/NewOrder.tsx">Total Quantity *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  value={quantity.total}
                  onChange={(e) => setQuantity((prev) => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter total quantity"
                  min="1"
                  className={errors.quantity ? 'border-red-500' : ''} data-id="apcuu7z9k" data-path="src/pages/agent/NewOrder.tsx" />

                {errors.quantity && <p className="text-sm text-red-600" data-id="b3bkt6nu8" data-path="src/pages/agent/NewOrder.tsx">{errors.quantity}</p>}
              </div>
              
              <SizeBreakdown
                totalQuantity={quantity.total}
                sizeBreakdown={quantity.sizeBreakdown}
                onSizeBreakdownChange={(breakdown) => setQuantity((prev) => ({ ...prev, sizeBreakdown: breakdown }))}
                availableStock={orderType === 'From Stock' || orderType === 'Mixed Order' ? availableStock : undefined} data-id="5knqc6n0d" data-path="src/pages/agent/NewOrder.tsx" />

              
              {errors.sizeBreakdown &&
              <Alert variant="destructive" data-id="0cv31w3ud" data-path="src/pages/agent/NewOrder.tsx">
                  <AlertTriangle className="h-4 w-4" data-id="5l7h3mday" data-path="src/pages/agent/NewOrder.tsx" />
                  <AlertDescription data-id="7pxfve7cj" data-path="src/pages/agent/NewOrder.tsx">{errors.sizeBreakdown}</AlertDescription>
                </Alert>
              }
            </TabsContent>

            {/* Delivery Information Tab */}
            <TabsContent value="delivery" className="space-y-4 mt-6" data-id="rxrawx07z" data-path="src/pages/agent/NewOrder.tsx">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-id="ctmg3ocp3" data-path="src/pages/agent/NewOrder.tsx">
                <div className="space-y-2" data-id="dngsl5v43" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="eventDate" data-id="yxtiqqz65" data-path="src/pages/agent/NewOrder.tsx">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={delivery.eventDate}
                    onChange={(e) => setDelivery((prev) => ({ ...prev, eventDate: e.target.value }))}
                    className={errors.eventDate ? 'border-red-500' : ''} data-id="efxytdnku" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.eventDate && <p className="text-sm text-red-600" data-id="ye1frehkr" data-path="src/pages/agent/NewOrder.tsx">{errors.eventDate}</p>}
                </div>
                
                <div className="space-y-2" data-id="wlzmy2nwu" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="deliveryDate" data-id="gp7ivtao4" data-path="src/pages/agent/NewOrder.tsx">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={delivery.deliveryDate}
                    onChange={(e) => setDelivery((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                    className={errors.deliveryDate ? 'border-red-500' : ''} data-id="ty783a4ed" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.deliveryDate && <p className="text-sm text-red-600" data-id="7e1pen5ns" data-path="src/pages/agent/NewOrder.tsx">{errors.deliveryDate}</p>}
                  <p className="text-xs text-gray-500" data-id="99e79b0jl" data-path="src/pages/agent/NewOrder.tsx">Must be before event date</p>
                </div>
              </div>
            </TabsContent>

            {/* Payment Information Tab */}
            <TabsContent value="payment" className="space-y-4 mt-6" data-id="1rmnpcfv4" data-path="src/pages/agent/NewOrder.tsx">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="rx7c8skmi" data-path="src/pages/agent/NewOrder.tsx">
                <div className="space-y-2" data-id="8qkf7arf8" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="paymentAmount" data-id="w6828bdwu" data-path="src/pages/agent/NewOrder.tsx">Total Amount ($) *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => setPayment((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className={errors.paymentAmount ? 'border-red-500' : ''} data-id="j8dychi7g" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.paymentAmount && <p className="text-sm text-red-600" data-id="3hlzweytr" data-path="src/pages/agent/NewOrder.tsx">{errors.paymentAmount}</p>}
                </div>
                
                <div className="space-y-2" data-id="e0o62zehd" data-path="src/pages/agent/NewOrder.tsx">
                  <Label htmlFor="paymentPaid" data-id="bemiutrqh" data-path="src/pages/agent/NewOrder.tsx">Amount Paid ($)</Label>
                  <Input
                    id="paymentPaid"
                    type="number"
                    step="0.01"
                    value={payment.paid}
                    onChange={(e) => setPayment((prev) => ({ ...prev, paid: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className={errors.paymentPaid ? 'border-red-500' : ''} data-id="hwkr98utp" data-path="src/pages/agent/NewOrder.tsx" />

                  {errors.paymentPaid && <p className="text-sm text-red-600" data-id="9cpsh0xrs" data-path="src/pages/agent/NewOrder.tsx">{errors.paymentPaid}</p>}
                </div>
                
                <div className="space-y-2" data-id="5qxj3dwiu" data-path="src/pages/agent/NewOrder.tsx">
                  <Label data-id="82e3c6og2" data-path="src/pages/agent/NewOrder.tsx">Payment Status</Label>
                  <div className="p-3 bg-gray-50 rounded-lg" data-id="isxkluy82" data-path="src/pages/agent/NewOrder.tsx">
                    <p className="text-sm" data-id="zhvjcw3dz" data-path="src/pages/agent/NewOrder.tsx">
                      <span className="font-medium" data-id="xu7rlvx7g" data-path="src/pages/agent/NewOrder.tsx">Pending: </span>
                      ${payment.pending.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                      payment.status === 'Complete' ? 'default' :
                      payment.status === 'Partial' ? 'secondary' :
                      'destructive'
                      }
                      className="mt-1" data-id="soqgc05k6" data-path="src/pages/agent/NewOrder.tsx">

                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t space-y-4 sm:space-y-0" data-id="0c5cehl84" data-path="src/pages/agent/NewOrder.tsx">
            <div className="flex space-x-2" data-id="xg2b8r8k2" data-path="src/pages/agent/NewOrder.tsx">
              <Button
                type="button"
                variant="outline"
                onClick={prevTab}
                disabled={currentTab === 'customer'} data-id="4xfpq28gl" data-path="src/pages/agent/NewOrder.tsx">

                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={nextTab}
                disabled={currentTab === 'payment'} data-id="x0ut0fzac" data-path="src/pages/agent/NewOrder.tsx">

                Next
              </Button>
            </div>
            
            <div className="flex space-x-2" data-id="z9xdq88nn" data-path="src/pages/agent/NewOrder.tsx">
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePreview}
                className="flex items-center space-x-2" data-id="vrk2rcmxo" data-path="src/pages/agent/NewOrder.tsx">

                <FileText className="w-4 h-4" data-id="nj9umpxeu" data-path="src/pages/agent/NewOrder.tsx" />
                <span data-id="tnu9t4s14" data-path="src/pages/agent/NewOrder.tsx">Preview PDF</span>
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600" data-id="rkavm5573" data-path="src/pages/agent/NewOrder.tsx">

                {isLoading ?
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" data-id="qrk5leno3" data-path="src/pages/agent/NewOrder.tsx" />
                    <span data-id="vhrjdw1ok" data-path="src/pages/agent/NewOrder.tsx">Creating...</span>
                  </> :

                <>
                    <Save className="w-4 h-4" data-id="g6e03xdew" data-path="src/pages/agent/NewOrder.tsx" />
                    <span data-id="rzxn0dtka" data-path="src/pages/agent/NewOrder.tsx">Create Order</span>
                  </>
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default NewOrder;