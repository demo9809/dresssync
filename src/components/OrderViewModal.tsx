import React from 'react';
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
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  Shirt,
  Palette,
  Layers } from
'lucide-react';
import { pdfService } from '@/services/pdfService';
import { toast } from '@/hooks/use-toast';

interface OrderViewModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderViewModal: React.FC<OrderViewModalProps> = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const handleDownloadPDF = async () => {
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

  const handlePrintOrder = async () => {
    try {
      await pdfService.printOrderPDF(order);
      toast({
        title: "Printing Order",
        description: `Order ${order.order_number} is being prepared for printing.`
      });
    } catch (error) {
      console.error('Error printing order:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to print order. Please try again.",
        variant: "destructive"
      });
    }
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



  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseSizeBreakdown = (sizeBreakdownString: string) => {
    try {
      return JSON.parse(sizeBreakdownString || '{}');
    } catch {
      return {};
    }
  };

  const sizeBreakdown = parseSizeBreakdown(order.size_breakdown);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Order Details
              </DialogTitle>
              <p className="text-gray-600 mt-1">Order #{order.order_number}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintOrder}
                className="flex items-center gap-2">

                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="flex items-center gap-2">

                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customer_phone}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>

              {order.customer_whatsapp &&
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.customer_whatsapp}</p>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                  </div>
                </div>
              }

              {order.customer_address &&
              <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.customer_address}</p>
                    <p className="text-sm text-gray-500">Address</p>
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.product_type}</p>
                  <p className="text-sm text-gray-500">Product Type</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <Palette className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.product_color}</p>
                  <p className="text-sm text-gray-500">Color</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.neck_type}</p>
                  <p className="text-sm text-gray-500">Neck Type</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.order_type}</p>
                  <p className="text-sm text-gray-500">Order Type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Order Status & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Order Status:</span>
                <Badge variant={getStatusBadgeVariant(order.order_status)}>
                  {order.order_status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Event Date</p>
                    <p className="text-sm text-gray-600">{formatDate(order.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Delivery Date</p>
                    <p className="text-sm text-gray-600">{formatDate(order.delivery_date)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Order Number:</span>
                  <span className="font-bold text-gray-900">#{order.order_number}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Total Quantity:</span>
                  <span className="font-bold text-blue-600">{order.total_quantity} pieces</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Order Created:</span>
                  <span className="font-bold text-purple-600">{formatDate(order.created_at || order.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quantity Breakdown */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Quantity & Size Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">
                Total Quantity: {order.total_quantity} pieces
              </span>
            </div>

            {Object.keys(sizeBreakdown).length > 0 &&
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Object.entries(sizeBreakdown).map(([size, quantity]) =>
              <div key={size} className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                    <p className="text-xl font-bold text-gray-900">{quantity as number}</p>
                    <p className="text-sm font-medium text-gray-600">{size}</p>
                  </div>
              )}
              </div>
            }
          </CardContent>
        </Card>

        {/* Special Instructions */}
        {order.special_instructions &&
        <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Special Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-900">{order.special_instructions}</p>
              </div>
            </CardContent>
          </Card>
        }
      </DialogContent>
    </Dialog>);

};

export default OrderViewModal;