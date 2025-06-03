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

  const [pricing, setPricing] = useState({
    pricePerUnit: 0,
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    totalAmount: 0
  });

  const [orderType, setOrderType] = useState<'From Stock' | 'Custom Order' | 'Mixed Order'>('From Stock');

  // State management
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({});
  const [duplicateOrders, setDuplicateOrders] = useState<Order[]>([]);
  const [neckTypes, setNeckTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [stockCheckCompleted, setStockCheckCompleted] = useState(false);
  const [stockAvailable, setStockAvailable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('customer');

  useEffect(() => {
    // Load neck types on component mount
    const loadNeckTypes = async () => {
      try {
        const types = await productConfig.getNeckTypes();
        setNeckTypes(types);
      } catch (error) {
        console.error('Error loading neck types:', error);
        // Use fallback values
        setNeckTypes(productConfig.neckTypes);
      }
    };

    loadNeckTypes();
  }, []);

  useEffect(() => {
    if (product.type && product.color) {
      loadAvailableStock();
    } else {
      setStockCheckCompleted(false);
      setStockAvailable(false);
    }
  }, [product.type, product.color]);

  useEffect(() => {
    if (customer.name && product.type && delivery.eventDate) {
      checkForDuplicates();
    }
  }, [customer.name, product.type, delivery.eventDate]);

  // Calculate pricing automatically
  useEffect(() => {
    const calculatePricing = () => {
      let pricePerUnit = 0;

      // Set default pricing based on order type and product type
      if (product.type && quantity.total > 0) {
        switch (orderType) {
          case 'From Stock':
            // Lower price for stock items
            pricePerUnit = product.type === 'T-shirt' ? 15 :
            product.type === 'Jersey' ? 25 :
            product.type === 'Polo' ? 20 : 18;
            break;
          case 'Custom Order':
            // Higher price for custom orders
            pricePerUnit = product.type === 'T-shirt' ? 25 :
            product.type === 'Jersey' ? 35 :
            product.type === 'Polo' ? 30 : 28;
            break;
          case 'Mixed Order':
            // Medium price for mixed orders
            pricePerUnit = product.type === 'T-shirt' ? 20 :
            product.type === 'Jersey' ? 30 :
            product.type === 'Polo' ? 25 : 23;
            break;
        }

        // Bulk discount
        if (quantity.total >= 100) {
          pricePerUnit *= 0.9; // 10% discount for 100+ items
        } else if (quantity.total >= 50) {
          pricePerUnit *= 0.95; // 5% discount for 50+ items
        }
      }

      const subtotal = pricePerUnit * quantity.total;
      const discountAmount = subtotal * (pricing.discountPercentage / 100);
      const totalAmount = subtotal - discountAmount;

      setPricing((prev) => ({
        ...prev,
        pricePerUnit: Math.round(pricePerUnit * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      }));

      // Update payment amount
      setPayment((prev) => ({
        ...prev,
        amount: Math.round(totalAmount * 100) / 100
      }));
    };

    calculatePricing();
  }, [product.type, quantity.total, orderType]);

  // Separate effect for discount changes to avoid infinite loop
  useEffect(() => {
    if (pricing.subtotal > 0) {
      const discountAmount = pricing.subtotal * (pricing.discountPercentage / 100);
      const totalAmount = pricing.subtotal - discountAmount;

      setPricing((prev) => ({
        ...prev,
        discountAmount: Math.round(discountAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      }));

      setPayment((prev) => ({
        ...prev,
        amount: Math.round(totalAmount * 100) / 100
      }));
    }
  }, [pricing.discountPercentage, pricing.subtotal]);

  // Separate effect for price per unit changes
  useEffect(() => {
    if (pricing.pricePerUnit > 0 && quantity.total > 0) {
      const subtotal = pricing.pricePerUnit * quantity.total;
      const discountAmount = subtotal * (pricing.discountPercentage / 100);
      const totalAmount = subtotal - discountAmount;

      setPricing((prev) => ({
        ...prev,
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      }));

      setPayment((prev) => ({
        ...prev,
        amount: Math.round(totalAmount * 100) / 100
      }));
    }
  }, [pricing.pricePerUnit, quantity.total, pricing.discountPercentage]);

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
      const stock = await stockService.getStock(product.type, product.color);
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
    if (!product.neckType) newErrors.neckType = 'Neck type is required';

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

    // Basic pricing validation (removed payment validation)
    if (pricing.pricePerUnit <= 0) newErrors.pricePerUnit = 'Price per unit must be greater than 0';
    if (pricing.discountPercentage < 0 || pricing.discountPercentage > 100) {
      newErrors.discountPercentage = 'Discount must be between 0 and 100%';
    }

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
        agentId: user!.ID?.toString() || user!.id || ''
      };

      const newOrder = await orderService.createOrder(orderData);

      // Update stock for 'From Stock' orders
      if (orderType === 'From Stock') {
        await stockService.updateStock(
          product.type,
          product.color,
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

  const handleGeneratePreview = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before generating preview.",
        variant: "destructive"
      });
      return;
    }

    try {
      const previewOrder: Order = {
        id: 'PREVIEW',
        customer,
        product,
        quantity,
        delivery,
        payment,
        orderType,
        agentId: user!.ID?.toString() || user!.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      pdfService.viewOrderHTML(previewOrder);
      toast({
        title: "Preview Generated",
        description: "Order preview opened in new window."
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate preview. Please try again.",
        variant: "destructive"
      });
    }
  };

  const checkStockBeforeQuantity = async () => {
    if (!product.type || !product.color) {
      toast({
        title: "Product Details Required",
        description: "Please select product type and color before proceeding to quantity.",
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
    const tabs = ['customer', 'product', 'quantity', 'delivery'];
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
    const tabs = ['customer', 'product', 'quantity', 'delivery'];
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
          {/* Order Progress Summary - Always Visible */}
          {quantity.total > 0 &&
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-semibold ml-1">{product.type} - {product.color}{product.neckType ? ` (${product.neckType})` : ''}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Qty:</span>
                    <span className="font-semibold ml-1">{quantity.total} units</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold ml-1">{orderType}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {customer.name && `Customer: ${customer.name}`}
                </div>
              </div>
            </div>
          }
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
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
                <span className="hidden sm:inline">Quantity & Delivery</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Summary</span>
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
                    onChange={(e) => {
                      const phoneValue = e.target.value;
                      setCustomer((prev) => ({
                        ...prev,
                        phone: phoneValue,
                        // Auto-fill WhatsApp with phone number if WhatsApp is empty
                        whatsapp: prev.whatsapp === '' ? phoneValue : prev.whatsapp
                      }));
                    }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <SelectTrigger className={errors.neckType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select neck type" />
                    </SelectTrigger>
                    <SelectContent>
                      {neckTypes.map((neckType) =>
                      <SelectItem key={neckType} value={neckType}>{neckType}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.neckType && <p className="text-sm text-red-600">{errors.neckType}</p>}
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
              {(orderType === 'From Stock' || orderType === 'Mixed Order') && product.type && product.color &&
              <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <div className="p-4 border rounded-lg">
                    {!stockCheckCompleted ?
                  <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Checking stock availability...</span>
                      </div> :
                  stockAvailable ?
                  <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Stock Available</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {Object.entries(availableStock).map(([size, qty]) =>
                      <div key={size} className={`flex justify-between p-2 rounded ${qty > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                              <span className="font-medium">{size}:</span>
                              <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>{qty}</span>
                            </div>
                      )}
                        </div>
                      </div> :
                  <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">No Stock Available</span>
                      </div>
                  }
                  </div>
                </div>
              }
              
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



            {/* Delivery Information Tab - now moved to quantity tab */}
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

              {/* Delivery Information in Quantity Tab */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
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
              </div>
            </TabsContent>

            {/* Order Summary Tab */}
            <TabsContent value="delivery" className="space-y-6 mt-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">WhatsApp:</span>
                          <span className="font-medium">{customer.whatsapp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right">
                            {customer.address.street}, {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Product Type:</span>
                          <span className="font-medium">{product.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Color:</span>
                          <span className="font-medium">{product.color}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Neck Type:</span>
                          <span className="font-medium">{product.neckType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Type:</span>
                          <span className="font-medium">{orderType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Quantity:</span>
                          <span className="font-medium">{quantity.total} units</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Size Breakdown */}
                {Object.keys(quantity.sizeBreakdown).length > 0 &&
                <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-3">Size Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {Object.entries(quantity.sizeBreakdown).map(([size, qty]) =>
                    <div key={size} className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                          <p className="text-xl font-bold text-gray-900">{qty}</p>
                          <p className="text-sm font-medium text-gray-600">{size}</p>
                        </div>
                    )}
                    </div>
                  </div>
                }
                
                {/* Delivery Information */}
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Date:</span>
                      <span className="font-medium">{delivery.eventDate ? new Date(delivery.eventDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Date:</span>
                      <span className="font-medium">{delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Special Instructions */}
                {product.specialInstructions &&
                <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-3">Special Instructions</h4>
                    <p className="text-sm text-gray-700">{product.specialInstructions}</p>
                  </div>
                }
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              {currentTab !== 'customer' &&
              <Button
                type="button"
                variant="outline"
                onClick={prevTab}>
                  Previous
                </Button>
              }
              
              {currentTab !== 'delivery' &&
              <Button
                type="button"
                variant="outline"
                onClick={nextTab}
                disabled={isCheckingStock}>
                  {isCheckingStock && currentTab === 'product' ?
                <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      Checking Stock...
                    </> :
                'Next'
                }
                </Button>
              }
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
              
              {currentTab === 'delivery' &&
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
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default NewOrder;