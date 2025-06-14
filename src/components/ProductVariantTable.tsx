import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface ProductVariantTableProps {
  variants: ProductVariant[];
  colors: string[];
  sizes: string[];
  productType: string;
  stockData: any[];
  onUpdateVariant: (variantId: string, updates: Partial<ProductVariant>) => void;
  onRemoveVariant: (variantId: string) => void;
}

const ProductVariantTable: React.FC<ProductVariantTableProps> = ({
  variants,
  colors,
  sizes,
  productType,
  stockData,
  onUpdateVariant,
  onRemoveVariant
}) => {
  const getAvailableStock = (color: string, size: string): number => {
    const stockItem = stockData.find(
      (item) => item.product_type === productType &&
      item.color === color &&
      item.size === size
    );
    return stockItem ? stockItem.quantity : 0;
  };

  if (variants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items added yet. Click "Add Item" to get started.</p>
      </div>);

  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, index) => {
              const availableStock = getAvailableStock(variant.color, variant.size);
              const hasStockWarning = variant.quantity > availableStock && availableStock > 0;

              return (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    {index + 1}.
                  </TableCell>
                  
                  <TableCell>
                    <Select
                      value={variant.size}
                      onValueChange={(value) => onUpdateVariant(variant.id, { size: value })}>

                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) =>
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    <Select
                      value={variant.color}
                      onValueChange={(value) => onUpdateVariant(variant.id, { color: value })}>

                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) =>
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={variant.quantity || ''}
                      onChange={(e) => onUpdateVariant(variant.id, {
                        quantity: parseInt(e.target.value) || 0
                      })}
                      className={`w-20 ${hasStockWarning ? 'border-yellow-500' : ''}`}
                      placeholder="Qty" />

                    {hasStockWarning &&
                    <p className="text-xs text-yellow-600 mt-1">
                        Exceeds stock ({availableStock})
                      </p>
                    }
                  </TableCell>
                  
                  <TableCell>
                    {variant.size && variant.color ?
                    <Badge
                      variant={availableStock > 0 ? "secondary" : "destructive"}
                      className="text-xs">

                        {availableStock}
                      </Badge> :

                    <Badge variant="outline" className="text-xs">
                        -
                      </Badge>
                    }
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveVariant(variant.id)}
                      className="text-red-600 hover:text-red-700">

                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>);

            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary Row */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Total Items in this Product:</span>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {variants.reduce((sum, variant) => sum + variant.quantity, 0)}
          </Badge>
        </div>
      </div>
    </div>);

};

export default ProductVariantTable;