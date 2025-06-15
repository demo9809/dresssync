import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Phone, MapPin, Calendar, Package, Palette, Ruler, Eye, Printer } from 'lucide-react';
import { pdfService } from '@/services/pdfService';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  ID: number;
  order_id: number;
  product_type: string;
  product_color: string;
  size_breakdown: string;
  item_quantity: number;
  unit_price: number;
  item_total: number;
}

interface OrderViewModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, isOpen, onClose }) => {
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order?.ID) {
      loadOrderItems();
    }
  }, [isOpen, order]);

  const loadOrderItems = async () => {
    setLoading(true);
    try {
      console.log('Loading order items for order ID:', order.ID);

      const { data, error } = await window.ezsite.apis.tablePage(17047, {
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

      if (error) throw error;

      const items = data?.List || [];
      console.log('Loaded order items:', items);
      setOrderItems(items);
    } catch (error) {
      console.error('Error loading order items:', error);
      toast({
        title: "Error",
        description: "Failed to load order items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':return 'secondary';
      case 'in production':return 'default';
      case 'shipped':return 'secondary';
      case 'delivered':return 'default';
      case 'cancelled':return 'destructive';
      default:return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':return 'destructive';
      case 'partial':return 'secondary';
      case 'complete':return 'default';
      default:return 'secondary';
    }
  };

  const parseSizeBreakdown = (sizeBreakdownStr: string) => {
    try {
      return JSON.parse(sizeBreakdownStr || '{}');
    } catch {
      return {};
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = parseFloat(amount?.toString() || '0');
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generatePDF = async () => {
    try {
      console.log('Generating PDF for order:', order);
      console.log('Order items:', orderItems);

      if (orderItems.length > 0) {
        // Multi-product order
        const pdfContent = {
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.customer_address,
          orderItems: orderItems.map((item) => ({
            productType: item.product_type,
            productColor: item.product_color,
            sizeBreakdown: parseSizeBreakdown(item.size_breakdown),
            quantity: item.item_quantity,
            unitPrice: item.unit_price,
            total: item.item_total
          })),
          totalAmount: order.total_amount,
          eventDate: order.event_date,
          deliveryDate: order.delivery_date,
          specialInstructions: order.special_instructions
        };

        await pdfService.generateOrderPDF(pdfContent);
      } else {
        // Single product order
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
      }

      toast({
        title: "PDF Generated",
        description: "Order PDF has been downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const viewOrderHTML = () => {
    try {
      if (orderItems.length > 0) {
        // Multi-product order
        const pdfContent = {
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.customer_address,
          orderItems: orderItems.map((item) => ({
            productType: item.product_type,
            productColor: item.product_color,
            sizeBreakdown: parseSizeBreakdown(item.size_breakdown),
            quantity: item.item_quantity,
            unitPrice: item.unit_price,
            total: item.item_total
          })),
          totalAmount: order.total_amount,
          eventDate: order.event_date,
          deliveryDate: order.delivery_date,
          specialInstructions: order.special_instructions
        };

        pdfService.viewOrderHTML(pdfContent);
      } else {
        // Single product order
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

        pdfService.viewOrderHTML(orderForPdf);
      }
    } catch (error) {
      console.error('Error viewing order:', error);
      toast({
        title: "Error",
        description: "Failed to open order view",
        variant: "destructive"
      });
    }
  };

  const printOrder = async () => {
    try {
      if (orderItems.length > 0) {
        // Multi-product order
        const pdfContent = {
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          customerAddress: order.customer_address,
          orderItems: orderItems.map((item) => ({
            productType: item.product_type,
            productColor: item.product_color,
            sizeBreakdown: parseSizeBreakdown(item.size_breakdown),
            quantity: item.item_quantity,
            unitPrice: item.unit_price,
            total: item.item_total
          })),
          totalAmount: order.total_amount,
          eventDate: order.event_date,
          deliveryDate: order.delivery_date,
          specialInstructions: order.special_instructions
        };

        await pdfService.printOrderPDF(pdfContent);
      } else {
        // Single product order
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

        await pdfService.printOrderPDF(orderForPdf);
      }
    } catch (error) {
      console.error('Error printing order:', error);
      toast({
        title: "Error",
        description: "Failed to print order",
        variant: "destructive"
      });
    }
  };

  if (!order) return null;

  const isMultiProductOrder = orderItems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.order_number}</span>
            <div className="flex gap-2">
              <Button onClick={viewOrderHTML} size="sm" variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button onClick={printOrder} size="sm" variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button onClick={generatePDF} size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex flex-wrap gap-4">
            <Badge variant={getStatusBadgeVariant(order.order_status)} className="text-sm">
              Status: {order.order_status}
            </Badge>
            <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)} className="text-sm">
              Payment: {order.payment_status}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Type: {order.order_type}
            </Badge>
            {isMultiProductOrder &&
            <Badge variant="secondary" className="text-sm">
                Multi-Product Order
              </Badge>
            }
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Name: </span>
                {order.customer_name}
              </div>
              <div>
                <span className="font-medium">Phone: </span>
                {order.customer_phone}
              </div>
              {order.customer_whatsapp && order.customer_whatsapp !== order.customer_phone &&
              <div>
                  <span className="font-medium">WhatsApp: </span>
                  {order.customer_whatsapp}
                </div>
              }
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                <div>
                  <span className="font-medium">Address: </span>
                  {order.customer_address}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items {isMultiProductOrder ? `(${orderItems.length})` : '(1)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ?
              <div className="text-center py-4">Loading order items...</div> :
              isMultiProductOrder ?
              <div className="space-y-4">
                  {orderItems.map((item, index) => {
                  const sizeBreakdown = parseSizeBreakdown(item.size_breakdown);

                  return (
                    <div key={item.ID} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">Item {index + 1}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {formatCurrency(item.item_total)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Product:</span>
                            <span>{item.product_type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Color:</span>
                            <span>{item.product_color}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Quantity:</span>
                            <span>{item.item_quantity}</span>
                          </div>
                        </div>

                        {Object.keys(sizeBreakdown).length > 0 &&
                      <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Ruler className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">Size Breakdown:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(sizeBreakdown).map(([size, quantity]) =>
                          <Badge key={size} variant="outline" className="text-xs">
                                  {size}: {quantity}
                                </Badge>
                          )}
                            </div>
                          </div>
                      }

                        <div className="mt-3 text-sm text-gray-600">
                          <span>Unit Price: {formatCurrency(item.unit_price)} × {item.item_quantity} = {formatCurrency(item.item_total)}</span>
                        </div>
                      </div>);

                })}
                </div> :

              // Single product order
              <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Product:</span>
                      <span>{order.product_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Color:</span>
                      <span>{order.product_color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Quantity:</span>
                      <span>{order.total_quantity}</span>
                    </div>
                  </div>

                  {order.size_breakdown &&
                <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Size Breakdown:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(parseSizeBreakdown(order.size_breakdown)).map(([size, quantity]) =>
                    <Badge key={size} variant="outline" className="text-xs">
                            {size}: {quantity}
                          </Badge>
                    )}
                      </div>
                    </div>
                }
                </div>
              }
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Event Date: </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(order.event_date)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Delivery Date: </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    {formatDate(order.delivery_date)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-medium">
                    {isMultiProductOrder ?
                    orderItems.reduce((sum, item) => sum + item.item_quantity, 0) :
                    order.total_quantity
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="font-medium">{formatCurrency(order.paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Balance:</span>
                  <span className="text-red-600">
                    {formatCurrency((parseFloat(order.total_amount) || 0) - (parseFloat(order.paid_amount) || 0))}
                  </span>
                </div>
              </div>

              {order.special_instructions &&
              <>
                  <Separator />
                  <div>
                    <span className="font-medium">Special Instructions:</span>
                    <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">
                      {order.special_instructions}
                    </p>
                  </div>
                </>
              }
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>);

};

export default OrderViewModal;