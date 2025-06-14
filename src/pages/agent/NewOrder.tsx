import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, FileText, AlertCircle, Calendar, Phone, MapPin, User } from 'lucide-react';
import ProductSection from '@/components/ProductSection';
import { orderService } from '@/services/orderService';
import { pdfService } from '@/services/pdfService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProductItem {
  id: string;
  productType: string;
  productColor: string;
  sizeBreakdown: {[size: string]: number;};
  totalQuantity: number;
  unitPrice: number;
  itemTotal: number;
}

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  eventDate: string;
  deliveryDate: string;
  specialInstructions: string;
  products: ProductItem[];
  totalAmount: number;
  orderType: string;
}

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
    customerAddress: '',
    eventDate: '',
    deliveryDate: '',
    specialInstructions: '',
    products: [],
    totalAmount: 0,
    orderType: 'Custom Order'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with one empty product
    if (formData.products.length === 0) {
      addNewProduct();
    }
  }, []);

  useEffect(() => {
    // Calculate total amount whenever products change
    const totalAmount = formData.products.reduce((sum, product) => sum + product.itemTotal, 0);
    setFormData((prev) => ({ ...prev, totalAmount }));
  }, [formData.products]);

  const generateProductId = () => {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNewProduct = () => {
    const newProduct: ProductItem = {
      id: generateProductId(),
      productType: '',
      productColor: '',
      sizeBreakdown: {},
      totalQuantity: 0,
      unitPrice: 0,
      itemTotal: 0
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };

  const updateProduct = (updatedProduct: ProductItem) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
      )
    }));
  };

  const removeProduct = (productId: string) => {
    if (formData.products.length > 1) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((product) => product.id !== productId)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.customerName.trim()) {
      newErrors.push('Customer name is required');
    }

    if (!formData.customerPhone.trim()) {
      newErrors.push('Customer phone is required');
    }

    if (!formData.customerAddress.trim()) {
      newErrors.push('Customer address is required');
    }

    if (!formData.eventDate) {
      newErrors.push('Event date is required');
    }

    if (!formData.deliveryDate) {
      newErrors.push('Delivery date is required');
    }

    // Validate products
    if (formData.products.length === 0) {
      newErrors.push('At least one product is required');
    }

    formData.products.forEach((product, index) => {
      if (!product.productType) {
        newErrors.push(`Product ${index + 1}: Product type is required`);
      }
      if (!product.productColor) {
        newErrors.push(`Product ${index + 1}: Product color is required`);
      }
      if (product.totalQuantity === 0) {
        newErrors.push(`Product ${index + 1}: At least one size quantity is required`);
      }
      if (product.unitPrice <= 0) {
        newErrors.push(`Product ${index + 1}: Unit price must be greater than 0`);
      }
    });

    if (formData.totalAmount <= 0) {
      newErrors.push('Order total must be greater than 0');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;

      // Create the main order
      const orderData = {
        order_number: orderNumber,
        agent_id: user?.ID || 0,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_whatsapp: formData.customerWhatsapp || formData.customerPhone,
        customer_address: formData.customerAddress,
        product_type: 'Multiple Products', // Indicator for multi-product order
        product_color: 'Mixed', // Indicator for mixed colors
        total_quantity: formData.products.reduce((sum, p) => sum + p.totalQuantity, 0),
        size_breakdown: JSON.stringify({}), // Will be handled in order_items
        special_instructions: formData.specialInstructions,
        event_date: new Date(formData.eventDate).toISOString(),
        delivery_date: new Date(formData.deliveryDate).toISOString(),
        order_status: 'Pending',
        total_amount: formData.totalAmount,
        paid_amount: 0,
        payment_status: 'Pending',
        order_type: formData.orderType
      };

      // Create order in database
      const { error: orderError } = await window.ezsite.apis.tableCreate(11425, orderData);
      if (orderError) throw orderError;

      // Get the created order to get its ID
      const { data: ordersData, error: fetchError } = await window.ezsite.apis.tablePage(11425, {
        "PageNo": 1,
        "PageSize": 1,
        "OrderByField": "ID",
        "IsAsc": false,
        "Filters": [
        {
          "name": "order_number",
          "op": "Equal",
          "value": orderNumber
        }]

      });

      if (fetchError) throw fetchError;

      const createdOrder = ordersData?.List?.[0];
      if (!createdOrder) throw new Error('Failed to retrieve created order');

      // Create order items
      for (const product of formData.products) {
        const orderItemData = {
          order_id: createdOrder.ID,
          product_type: product.productType,
          product_color: product.productColor,
          size_breakdown: JSON.stringify(product.sizeBreakdown),
          item_quantity: product.totalQuantity,
          unit_price: product.unitPrice,
          item_total: product.itemTotal
        };

        const { error: itemError } = await window.ezsite.apis.tableCreate(17047, orderItemData);
        if (itemError) throw itemError;
      }

      toast({
        title: "Order Created Successfully",
        description: `Order ${orderNumber} has been created successfully`
      });

      // Navigate to order list
      navigate('/agent/orders');

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getTotalQuantity = () => {
    return formData.products.reduce((sum, product) => sum + product.totalQuantity, 0);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
        <p className="text-gray-600">Create a comprehensive order with multiple products</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Info
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Enter customer name"
                      required />

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Enter phone number"
                      required />

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerWhatsapp">WhatsApp Number</Label>
                  <Input
                    id="customerWhatsapp"
                    value={formData.customerWhatsapp}
                    onChange={(e) => handleInputChange('customerWhatsapp', e.target.value)}
                    placeholder="Enter WhatsApp number (optional)" />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Customer Address *</Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    placeholder="Enter complete customer address"
                    required />

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Products ({formData.products.length})
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addNewProduct}
                    className="flex items-center gap-2">

                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.products.map((product, index) =>
                  <ProductSection
                    key={product.id}
                    product={product}
                    onUpdate={updateProduct}
                    onRemove={removeProduct}
                    showRemove={formData.products.length > 1} />

                  )}
                </div>

                {/* Order Summary */}
                {formData.products.some((p) => p.totalQuantity > 0) &&
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Summary</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Products: </span>
                        <Badge variant="secondary">{formData.products.length}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Total Quantity: </span>
                        <Badge variant="secondary">{getTotalQuantity()}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Total Amount: </span>
                        <Badge className="bg-green-100 text-green-800">
                          ₹{formData.totalAmount.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      required />

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      required />

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select
                    value={formData.orderType}
                    onValueChange={(value) => handleInputChange('orderType', value)}>

                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Custom Order">Custom Order</SelectItem>
                      <SelectItem value="From Stock">From Stock</SelectItem>
                      <SelectItem value="Mixed Order">Mixed Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Enter any special instructions for this order"
                    rows={3} />

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {errors.length > 0 &&
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) =>
              <div key={index}>• {error}</div>
              )}
              </div>
            </AlertDescription>
          </Alert>
        }

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/agent/orders')}
            disabled={loading}>

            Cancel
          </Button>
          <Button type="submit" disabled={loading || formData.totalAmount <= 0}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>);

};

export default NewOrder;