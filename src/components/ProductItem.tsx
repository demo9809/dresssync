import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { productConfig } from '@/services/stockService';

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

interface ProductItemProps {
  data?: ProductItemData;
  onUpdate: (data: ProductItemData) => void;
  onRemove: (id: string) => void;
  index: number;
}

const ProductItem: React.FC<ProductItemProps> = ({
  data,
  onUpdate,
  onRemove,
  index
}) => {
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [neckTypes, setNeckTypes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [productItem, setProductItem] = useState<ProductItemData>({
    id: data?.id || `product-${Date.now()}-${Math.random()}`,
    productType: data?.productType || '',
    neckType: data?.neckType || '',
    variants: data?.variants || [
      {
        id: `variant-${Date.now()}-${Math.random()}`,
        size: '',
        color: '',
        quantity: 0
      }
    ]
  });

  useEffect(() => {
    loadProductConfig();
  }, []);

  useEffect(() => {
    onUpdate(productItem);
  }, [productItem, onUpdate]);

  const loadProductConfig = async () => {
    try {
      setLoading(true);
      const config = await productConfig.getConfiguration();
      
      setProductTypes(config.productTypes || []);
      setNeckTypes(config.neckTypes || []);
      setColors(config.colors || []);
      setSizes(config.sizes || []);
    } catch (error) {
      console.error('Error loading product config:', error);
      // Use fallback static data
      setProductTypes(productConfig.productTypes);
      setNeckTypes(productConfig.neckTypes);
      setColors(productConfig.colors);
      setSizes(productConfig.sizes);
    } finally {
      setLoading(false);
    }
  };

  const updateProductItem = (field: keyof ProductItemData, value: any) => {
    setProductItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
    setProductItem(prev => ({
      ...prev,
      variants: prev.variants.map(variant =>
        variant.id === variantId
          ? { ...variant, [field]: value }
          : variant
      )
    }));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `variant-${Date.now()}-${Math.random()}`,
      size: '',
      color: '',
      quantity: 0
    };

    setProductItem(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
  };

  const removeVariant = (variantId: string) => {
    if (productItem.variants.length > 1) {
      setProductItem(prev => ({
        ...prev,
        variants: prev.variants.filter(variant => variant.id !== variantId)
      }));
    }
  };

  const handleRemoveProduct = () => {
    onRemove(productItem.id);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Product Item
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveProduct}
          className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Product Type and Neck Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Select value={productItem.productType} onValueChange={(value) => updateProductItem('productType', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Product type" />
            </SelectTrigger>
            <SelectContent>
              {productTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={productItem.neckType} onValueChange={(value) => updateProductItem('neckType', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Neck type" />
            </SelectTrigger>
            <SelectContent>
              {neckTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        {productItem.variants.map((variant, variantIndex) => (
          <div key={variant.id} className="flex items-center gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Size */}
              <Select value={variant.size} onValueChange={(value) => updateVariant(variant.id, 'size', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Color */}
              <Select value={variant.color} onValueChange={(value) => updateVariant(variant.id, 'color', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quantity */}
              <Input
                type="number"
                placeholder="Quantity"
                value={variant.quantity || ''}
                onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                min="0"
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Remove Variant Button */}
              {productItem.variants.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {/* Add Variant Button (only on last row) */}
              {variantIndex === productItem.variants.length - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {productItem.variants.some(v => v.quantity > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Quantity: </span>
            {productItem.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0)}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductItem;