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
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [stockCheckCompleted, setStockCheckCompleted] = useState(false);
  const [stockAvailable, setStockAvailable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('customer');

  useEffect(() => {
    if (product.type && product.color && product.neckType) {
      loadAvailableStock();
    } else {
      setStockCheckCompleted(false);
      setStockAvailable(false);
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
      let hasStock = false;
      
      stock.forEach((item) => {
        stockMap[item.size] = item.quantity;
        if (item.quantity > 0) {
          hasStock = true;
        }
      });
      
      setAvailableStock(stockMap);
      setStockAvailable(hasStock);
      setStockCheckCompleted(true);
    } catch (error) {
      console.error('Error loading stock:', error);
      setStockCheckCompleted(true);
      setStockAvailable(false);
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

  const checkStockBeforeQuantity = async () => {
    if (!product.type || !product.color || !product.neckType) {
      toast({
        title: "Product Details Required",
        description: "Please select product type, color, and neck type before proceeding to quantity.",
        variant: "destructive"
      });
      return false;
    }

    if (orderType === 'Custom Order') {
      // Custom orders don't need stock check
      return true;
    }

    setIsCheckingStock(true);
    
    try {
      await loadAvailableStock();
      
      if (!stockAvailable) {
        toast({
          title: "No Stock Available",
          description: "There is no available stock for the selected product configuration. Please choose a different product or proceed with a Custom Order.",
          variant: "destructive"
        });
        setIsCheckingStock(false);
        return false;
      }
      
      const totalStock = Object.values(availableStock).reduce((sum, qty) => sum + qty, 0);
      
      toast({
        title: "Stock Check Complete",
        description: `Total available stock: ${totalStock} units across all sizes.`,
        variant: "default"
      });
      
      setIsCheckingStock(false);
      return true;
    } catch (error) {
      console.error('Error checking stock:', error);
      toast({
        title: "Stock Check Failed",
        description: "Unable to verify stock availability. Please try again.",
        variant: "destructive"
      });
      setIsCheckingStock(false);
      return false;
    }
  };

  const nextTab = async () => {
    const tabs = ['customer', 'product', 'quantity', 'delivery', 'payment'];
    const currentIndex = tabs.indexOf(currentTab);
    
    // If moving from product to quantity, check stock first
    if (currentTab === 'product' && tabs[currentIndex + 1] === 'quantity') {
      const canProceed = await checkStockBeforeQuantity();
      if (!canProceed) {
        return;
      }
    }
    
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-1">Enter customer and product details</p>
        </div>
        <Badge variant="secondary" className="mt-4 md:mt-0">
          Agent: {user?.name}
        </Badge>
      </div>

      {/* Duplicate Orders Warning */}
      {duplicateOrders.length > 0 &&
      <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Potential Duplicate Orders Found!</strong> 
            There are {duplicateOrders.length} existing order(s) for "{customer.name}" 
            with similar details. Please verify before proceeding.
          </AlertDescription>
        </Alert>
      }

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Order Details</span>
          </CardTitle>
          <CardDescription>Complete all sections to create the order</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="customer" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Customer</span>
              </TabsTrigger>
              <TabsTrigger value="product" className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Product</span>
              </TabsTrigger>
              <TabsTrigger value="quantity" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Quantity</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Delivery</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
            </TabsList>

            {/* Customer Information Tab */}
            <TabsContent value="customer" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customer.name}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                    className={errors.customerName ? 'border-red-500' : ''} />

                  {errors.customerName && <p className="text-sm text-red-600">{errors.customerName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customer.phone}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    className={errors.customerPhone ? 'border-red-500' : ''} />

                  {errors.customerPhone && <p className="text-sm text-red-600">{errors.customerPhone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerWhatsapp">WhatsApp Number *</Label>
                  <Input
                    id="customerWhatsapp"
                    value={customer.whatsapp}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+1234567890"
                    className={errors.customerWhatsapp ? 'border-red-500' : ''} />

                  {errors.customerWhatsapp && <p className="text-sm text-red-600">{errors.customerWhatsapp}</p>}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={customer.address.street}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="123 Main Street"
                    className={errors.customerStreet ? 'border-red-500' : ''} />

                  {errors.customerStreet && <p className="text-sm text-red-600">{errors.customerStreet}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={customer.address.city}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="New York"
                    className={errors.customerCity ? 'border-red-500' : ''} />

                  {errors.customerCity && <p className="text-sm text-red-600">{errors.customerCity}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={customer.address.state}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="NY"
                    className={errors.customerState ? 'border-red-500' : ''} />

                  {errors.customerState && <p className="text-sm text-red-600">{errors.customerState}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    value={customer.address.zipCode}
                    onChange={(e) => setCustomer((prev) => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="10001"
                    className={errors.customerZip ? 'border-red-500' : ''} />

                  {errors.customerZip && <p className="text-sm text-red-600">{errors.customerZip}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Product Information Tab */}
            <TabsContent value="product" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Select
                    value={product.type}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, type: value }))}>

                    <SelectTrigger className={errors.productType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productConfig.productTypes.map((type) =>
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productType && <p className="text-sm text-red-600">{errors.productType}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Color *</Label>
                  <Select
                    value={product.color}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, color: value }))}>

                    <SelectTrigger className={errors.productColor ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {productConfig.colors.map((color) =>
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productColor && <p className="text-sm text-red-600">{errors.productColor}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Neck Type *</Label>
                  <Select
                    value={product.neckType}
                    onValueChange={(value) => setProduct((prev) => ({ ...prev, neckType: value }))}>

                    <SelectTrigger className={errors.productNeck ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select neck type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productConfig.neckTypes.map((neck) =>
                      <SelectItem key={neck} value={neck}>{neck}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.productNeck && <p className="text-sm text-red-600">{errors.productNeck}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as typeof orderType)}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="From Stock">From Stock</SelectItem>
                    <SelectItem value="Custom Order">Custom Order</SelectItem>
                    <SelectItem value="Mixed Order">Mixed Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status Indicator */}
              {(orderType === 'From Stock' || orderType === 'Mixed Order') && product.type && product.color && product.neckType && (
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <div className="p-4 border rounded-lg">
                    {!stockCheckCompleted ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Checking stock availability...</span>
                      </div>
                    ) : stockAvailable ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Stock Available</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(availableStock).map(([size, qty]) => (
                            <div key={size} className={`flex justify-between p-2 rounded ${qty > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <span className="font-medium">{size}:</span>
                              <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>{qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">No Stock Available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={product.specialInstructions}
                  onChange={(e) => setProduct((prev) => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special requirements, logo placement, etc."
                  rows={3} />

              </div>
              
              <div className="space-y-2">
                <Label>File Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Upload logo or design files</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Choose Files
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Quantity & Size Breakdown Tab */}
            <TabsContent value="quantity" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="totalQuantity">Total Quantity *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  value={quantity.total}
                  onChange={(e) => setQuantity((prev) => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter total quantity"
                  min="1"
                  className={errors.quantity ? 'border-red-500' : ''} />

                {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
              </div>
              
              <SizeBreakdown
                totalQuantity={quantity.total}
                sizeBreakdown={quantity.sizeBreakdown}
                onSizeBreakdownChange={(breakdown) => setQuantity((prev) => ({ ...prev, sizeBreakdown: breakdown }))}
                availableStock={orderType === 'From Stock' || orderType === 'Mixed Order' ? availableStock : undefined} />

              
              {errors.sizeBreakdown &&
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.sizeBreakdown}</AlertDescription>
                </Alert>
              }
            </TabsContent>

            {/* Delivery Information Tab */}
            <TabsContent value="delivery" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={delivery.eventDate}
                    onChange={(e) => setDelivery((prev) => ({ ...prev, eventDate: e.target.value }))}
                    className={errors.eventDate ? 'border-red-500' : ''} />

                  {errors.eventDate && <p className="text-sm text-red-600">{errors.eventDate}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={delivery.deliveryDate}
                    onChange={(e) => setDelivery((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                    className={errors.deliveryDate ? 'border-red-500' : ''} />

                  {errors.deliveryDate && <p className="text-sm text-red-600">{errors.deliveryDate}</p>}
                  <p className="text-xs text-gray-500">Must be before event date</p>
                </div>
              </div>
            </TabsContent>

            {/* Payment Information Tab */}
            <TabsContent value="payment" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Total Amount ($) *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => setPayment((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className={errors.paymentAmount ? 'border-red-500' : ''} />

                  {errors.paymentAmount && <p className="text-sm text-red-600">{errors.paymentAmount}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentPaid">Amount Paid ($)</Label>
                  <Input
                    id="paymentPaid"
                    type="number"
                    step="0.01"
                    value={payment.paid}
                    onChange={(e) => setPayment((prev) => ({ ...prev, paid: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className={errors.paymentPaid ? 'border-red-500' : ''} />

                  {errors.paymentPaid && <p className="text-sm text-red-600">{errors.paymentPaid}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Pending: </span>
                      ${payment.pending.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                      payment.status === 'Complete' ? 'default' :
                      payment.status === 'Partial' ? 'secondary' :
                      'destructive'
                      }
                      className="mt-1">

                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={prevTab}
                disabled={currentTab === 'customer'}>

                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={nextTab}
                disabled={currentTab === 'payment' || isCheckingStock}>

                {isCheckingStock && currentTab === 'product' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Checking Stock...
                  </>
                ) : (
                  'Next'
                )}
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePreview}
                className="flex items-center space-x-2">

                <FileText className="w-4 h-4" />
                <span>Preview PDF</span>
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600">

                {isLoading ?
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </> :

                <>
                    <Save className="w-4 h-4" />
                    <span>Create Order</span>
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