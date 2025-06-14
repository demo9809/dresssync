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
import { FileText, Download, Phone, MapPin, Calendar, Package, Palette, Ruler } from 'lucide-react';
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
      const { data, error } = await window.ezsite.apis.tablePage(17047, {
        "PageNo": 1,
        "PageSize": 100,
        "OrderByField": "ID",
        "IsAsc": true,
        "Filters": [
        {
          "name": "order_id",
          "op": "Equal",
          "value": order.ID
        }]

      });

      if (error) throw error;
      setOrderItems(data?.List || []);
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
    return new Date(dateString).toLocaleDateString();
  };

  const generatePDF = async () => {
    try {
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
        eventDate: formatDate(order.event_date),
        deliveryDate: formatDate(order.delivery_date),
        specialInstructions: order.special_instructions
      };

      await pdfService.generateOrderPDF(pdfContent);

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

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.order_number}</span>
            <Button onClick={generatePDF} size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
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
                Order Items ({orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ?
              <div className="text-center py-4">Loading order items...</div> :
              orderItems.length > 0 ?
              <div className="space-y-4">
                  {orderItems.map((item, index) => {
                  const sizeBreakdown = parseSizeBreakdown(item.size_breakdown);

                  return (
                    <div key={item.ID} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">Item {index + 1}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            ₹{item.item_total.toFixed(2)}
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
                          <span>Unit Price: ₹{item.unit_price.toFixed(2)} × {item.item_quantity} = ₹{item.item_total.toFixed(2)}</span>
                        </div>
                      </div>);

                })}
                </div> :

              <div className="text-center py-4 text-gray-500">
                  No order items found
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
                  <span className="font-medium">{order.total_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="font-medium">₹{parseFloat(order.paid_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Balance:</span>
                  <span className="text-red-600">
                    ₹{(parseFloat(order.total_amount) - parseFloat(order.paid_amount)).toFixed(2)}
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