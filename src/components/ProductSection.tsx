import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus } from 'lucide-react';
import { stockService, productConfig } from '@/services/stockService';

interface SizeQuantity {
  [size: string]: number;
}

interface ProductItem {
  id: string;
  productType: string;
  productColor: string;
  sizeBreakdown: SizeQuantity;
  totalQuantity: number;
  unitPrice: number;
  itemTotal: number;
}

interface ProductSectionProps {
  product: ProductItem;
  onUpdate: (product: ProductItem) => void;
  onRemove: (productId: string) => void;
  showRemove: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  product,
  onUpdate,
  onRemove,
  showRemove
}) => {
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);

  useEffect(() => {
    loadConfiguration();
    loadStockData();
  }, []);

  const loadConfiguration = async () => {
    try {
      const config = await productConfig.getConfiguration();
      setProductTypes(config.productTypes || []);
      setColors(config.colors || []);
      setSizes(config.sizes || []);
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const loadStockData = async () => {
    try {
      const stock = await stockService.getAllStock();
      setStockData(stock);
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  const getAvailableStock = (productType: string, color: string, size: string): number => {
    const stockItem = stockData.find(
      (item) => item.product_type === productType &&
      item.color === color &&
      item.size === size
    );
    return stockItem ? stockItem.quantity : 0;
  };

  const updateSizeQuantity = (size: string, quantity: number) => {
    const newSizeBreakdown = { ...product.sizeBreakdown };
    if (quantity > 0) {
      newSizeBreakdown[size] = quantity;
    } else {
      delete newSizeBreakdown[size];
    }

    const totalQuantity = Object.values(newSizeBreakdown).reduce((sum, qty) => sum + qty, 0);
    const itemTotal = totalQuantity * product.unitPrice;

    const updatedProduct = {
      ...product,
      sizeBreakdown: newSizeBreakdown,
      totalQuantity,
      itemTotal
    };

    onUpdate(updatedProduct);
  };

  const updateUnitPrice = (price: number) => {
    const itemTotal = product.totalQuantity * price;
    const updatedProduct = {
      ...product,
      unitPrice: price,
      itemTotal
    };
    onUpdate(updatedProduct);
  };

  const updateProductType = (productType: string) => {
    const updatedProduct = {
      ...product,
      productType,
      sizeBreakdown: {},
      totalQuantity: 0,
      itemTotal: 0
    };
    onUpdate(updatedProduct);
  };

  const updateProductColor = (productColor: string) => {
    const updatedProduct = {
      ...product,
      productColor,
      sizeBreakdown: {},
      totalQuantity: 0,
      itemTotal: 0
    };
    onUpdate(updatedProduct);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Product Item</CardTitle>
          {showRemove &&
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(product.id)}
            className="text-red-600 hover:text-red-700">

              <Trash2 className="h-4 w-4" />
            </Button>
          }
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Type and Color Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`product-type-${product.id}`}>Product Type</Label>
            <Select
              value={product.productType}
              onValueChange={updateProductType}>

              <SelectTrigger id={`product-type-${product.id}`}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) =>
                <SelectItem key={type} value={type}>{type}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`product-color-${product.id}`}>Color</Label>
            <Select
              value={product.productColor}
              onValueChange={updateProductColor}
              disabled={!product.productType}>

              <SelectTrigger id={`product-color-${product.id}`}>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) =>
                <SelectItem key={color} value={color}>{color}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Unit Price */}
        <div className="space-y-2">
          <Label htmlFor={`unit-price-${product.id}`}>Unit Price</Label>
          <Input
            id={`unit-price-${product.id}`}
            type="number"
            min="0"
            step="0.01"
            value={product.unitPrice || ''}
            onChange={(e) => updateUnitPrice(parseFloat(e.target.value) || 0)}
            placeholder="Enter unit price" />

        </div>

        {/* Size Breakdown */}
        {product.productType && product.productColor &&
        <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base font-medium">Size Breakdown</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sizes.map((size) => {
                const availableStock = getAvailableStock(product.productType, product.productColor, size);
                const currentQuantity = product.sizeBreakdown[size] || 0;

                return (
                  <div key={size} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{size}</Label>
                        <Badge variant="outline" className="text-xs">
                          Stock: {availableStock}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSizeQuantity(size, Math.max(0, currentQuantity - 1))}
                        disabled={currentQuantity <= 0}>

                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                        type="number"
                        min="0"
                        max={availableStock}
                        value={currentQuantity}
                        onChange={(e) => {
                          const qty = Math.min(parseInt(e.target.value) || 0, availableStock);
                          updateSizeQuantity(size, qty);
                        }}
                        className="w-16 text-center" />

                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSizeQuantity(size, Math.min(availableStock, currentQuantity + 1))}
                        disabled={currentQuantity >= availableStock}>

                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {currentQuantity > availableStock &&
                    <p className="text-xs text-red-600">
                          Exceeds available stock
                        </p>
                    }
                    </div>);

              })}
              </div>
            </div>
          </>
        }

        {/* Summary */}
        {product.totalQuantity > 0 &&
        <>
            <Separator />
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium">Total Quantity: </span>
                <Badge variant="secondary">{product.totalQuantity}</Badge>
              </div>
              <div>
                <span className="font-medium">Unit Price: </span>
                <Badge variant="secondary">₹{product.unitPrice.toFixed(2)}</Badge>
              </div>
              <div>
                <span className="font-medium">Item Total: </span>
                <Badge className="bg-green-100 text-green-800">₹{product.itemTotal.toFixed(2)}</Badge>
              </div>
            </div>
          </>
        }
      </CardContent>
    </Card>);

};

export default ProductSection;