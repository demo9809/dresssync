import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calendar, User, ShoppingCart, FileText } from 'lucide-react';
import MultiProductOrderSection from '@/components/MultiProductOrderSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface ProductItemData {
  id: string;
  productType: string;
  neckType: string;
  variants: ProductVariant[];
}

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  eventDate: string;
  deliveryDate: string;
  specialInstructions: string;
  products: ProductItemData[];
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
      const initialProduct: ProductItemData = {
        id: `product-${Date.now()}-${Math.random()}`,
        productType: '',
        neckType: '',
        variants: [
          {
            id: `variant-${Date.now()}-${Math.random()}`,
            size: '',
            color: '',
            quantity: 0
          }
        ]
      };
      setFormData(prev => ({ ...prev, products: [initialProduct] }));
    }
  }, []);

  useEffect(() => {
    // Calculate total amount whenever products change
    const totalQuantity = formData.products.reduce((sum, product) => 
      sum + product.variants.reduce((variantSum, variant) => 
        variantSum + (variant.quantity || 0), 0
      ), 0
    );
    
    // For now, we'll use a base price calculation
    // In a real app, you'd get pricing from your product configuration
    const estimatedPrice = totalQuantity * 25; // $25 per item as base price
    setFormData(prev => ({ ...prev, totalAmount: estimatedPrice }));
  }, [formData.products]);

  const handleProductsChange = (updatedProducts: ProductItemData[]) => {
    setFormData(prev => ({ ...prev, products: updatedProducts }));
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
      const productLabel = `Product ${index + 1}`;

      if (!product.productType) {
        newErrors.push(`${productLabel}: Product type is required`);
      }

      if (product.variants.length === 0) {
        newErrors.push(`${productLabel}: At least one variant is required`);
      }

      product.variants.forEach((variant, vIndex) => {
        const variantLabel = `${productLabel} Variant ${vIndex + 1}`;
        if (!variant.size) {
          newErrors.push(`${variantLabel}: Size is required`);
        }
        if (!variant.color) {
          newErrors.push(`${variantLabel}: Color is required`);
        }
        if (variant.quantity <= 0) {
          newErrors.push(`${variantLabel}: Quantity must be greater than 0`);
        }
      });
    });

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

      // Calculate total quantity
      const totalQuantity = formData.products.reduce((sum, product) => 
        sum + product.variants.reduce((variantSum, variant) => 
          variantSum + (variant.quantity || 0), 0
        ), 0
      );

      // Create the main order
      const orderData = {
        order_number: orderNumber,
        agent_id: user?.ID || 0,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_whatsapp: formData.customerWhatsapp || formData.customerPhone,
        customer_address: formData.customerAddress,
        product_type: 'Multiple Products',
        product_color: 'Mixed',
        total_quantity: totalQuantity,
        size_breakdown: JSON.stringify({}),
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
        "Filters": [{
          "name": "order_number",
          "op": "Equal",
          "value": orderNumber
        }]
      });

      if (fetchError) throw fetchError;

      const createdOrder = ordersData?.List?.[0];
      if (!createdOrder) throw new Error('Failed to retrieve created order');

      // Create order items for each product and its variants
      for (const product of formData.products) {
        // Create a consolidated size breakdown for the product
        const sizeBreakdown: {[key: string]: number} = {};

        product.variants.forEach((variant) => {
          const key = `${variant.size}-${variant.color}`;
          sizeBreakdown[key] = (sizeBreakdown[key] || 0) + variant.quantity;
        });

        const productQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
        const unitPrice = 25; // Base price, should come from product configuration
        const itemTotal = productQuantity * unitPrice;

        const orderItemData = {
          order_id: createdOrder.ID,
          product_type: `${product.productType}${product.neckType ? ` (${product.neckType})` : ''}`,
          product_color: product.variants.map(v => v.color).join(', '),
          size_breakdown: JSON.stringify(sizeBreakdown),
          item_quantity: productQuantity,
          unit_price: unitPrice,
          item_total: itemTotal
        };

        const { error: itemError } = await window.ezsite.apis.tableCreate(17047, orderItemData);
        if (itemError) throw itemError;
      }

      toast({
        title: "Order Created Successfully",
        description: `Order ${orderNumber} has been created with ${formData.products.length} product type(s)`
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Order</h1>
        <p className="text-gray-600">Create a comprehensive order with multiple product types and variants</p>
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerWhatsapp">WhatsApp Number</Label>
                  <Input
                    id="customerWhatsapp"
                    value={formData.customerWhatsapp}
                    onChange={(e) => handleInputChange('customerWhatsapp', e.target.value)}
                    placeholder="Enter WhatsApp number (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Customer Address *</Label>
                  <Textarea
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    placeholder="Enter complete customer address"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <MultiProductOrderSection
              products={formData.products}
              onProductsChange={handleProductsChange}
            />
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date *</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select
                    value={formData.orderType}
                    onValueChange={(value) => handleInputChange('orderType', value)}
                  >
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
                    rows={3}
                  />
                </div>

                {/* Order Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                  <div className="text-sm text-gray-600">
                    <p>Total Items: {formData.products.reduce((sum, product) => 
                      sum + product.variants.reduce((variantSum, variant) => 
                        variantSum + (variant.quantity || 0), 0
                      ), 0
                    )}</p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      Estimated Total: ${formData.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/agent/orders')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || formData.totalAmount <= 0}>
            {loading ? 'Creating Order...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;