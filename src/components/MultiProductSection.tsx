import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Plus, ChevronDown, ChevronRight, ShoppingCart } from 'lucide-react';
import ProductVariantTable from '@/components/ProductVariantTable';
import { stockService, productConfig } from '@/services/stockService';

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  quantity: number;
}

interface ProductItem {
  id: string;
  productType: string;
  neckType: string;
  unitPrice: number;
  variants: ProductVariant[];
  totalQuantity: number;
  itemTotal: number;
  isExpanded: boolean;
}

interface MultiProductSectionProps {
  products: ProductItem[];
  onUpdate: (products: ProductItem[]) => void;
}

const MultiProductSection: React.FC<MultiProductSectionProps> = ({
  products,
  onUpdate
}) => {
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [neckTypes, setNeckTypes] = useState<string[]>([]);
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
      setNeckTypes(config.neckTypes || ['Round', 'V-Neck', 'Collar', 'Polo']);
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

  const generateProductId = () => {
    return `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateVariantId = () => {
    return `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNewProduct = () => {
    const newProduct: ProductItem = {
      id: generateProductId(),
      productType: '',
      neckType: '',
      unitPrice: 0,
      variants: [],
      totalQuantity: 0,
      itemTotal: 0,
      isExpanded: true
    };

    const updatedProducts = [...products, newProduct];
    onUpdate(updatedProducts);
  };

  const removeProduct = (productId: string) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      onUpdate(updatedProducts);
    }
  };

  const updateProduct = (productId: string, updates: Partial<ProductItem>) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        const updatedProduct = { ...product, ...updates };

        // Recalculate totals
        updatedProduct.totalQuantity = updatedProduct.variants.reduce((sum, variant) => sum + variant.quantity, 0);
        updatedProduct.itemTotal = updatedProduct.totalQuantity * updatedProduct.unitPrice;

        return updatedProduct;
      }
      return product;
    });

    onUpdate(updatedProducts);
  };

  const toggleProductExpansion = (productId: string) => {
    updateProduct(productId, {
      isExpanded: !products.find((p) => p.id === productId)?.isExpanded
    });
  };

  const addVariantToProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newVariant: ProductVariant = {
      id: generateVariantId(),
      size: '',
      color: '',
      quantity: 0
    };

    const updatedVariants = [...product.variants, newVariant];
    updateProduct(productId, { variants: updatedVariants });
  };

  const updateVariant = (productId: string, variantId: string, updates: Partial<ProductVariant>) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedVariants = product.variants.map((variant) =>
    variant.id === variantId ? { ...variant, ...updates } : variant
    );

    updateProduct(productId, { variants: updatedVariants });
  };

  const removeVariant = (productId: string, variantId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedVariants = product.variants.filter((variant) => variant.id !== variantId);
    updateProduct(productId, { variants: updatedVariants });
  };

  const getAvailableStock = (productType: string, color: string, size: string): number => {
    const stockItem = stockData.find(
      (item) => item.product_type === productType &&
      item.color === color &&
      item.size === size
    );
    return stockItem ? stockItem.quantity : 0;
  };

  const getTotalQuantity = () => {
    return products.reduce((sum, product) => sum + product.totalQuantity, 0);
  };

  const getTotalAmount = () => {
    return products.reduce((sum, product) => sum + product.itemTotal, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Product Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Products ({products.length})
          </h3>
          <p className="text-sm text-gray-600">Configure multiple product types with variants</p>
        </div>
        <Button
          type="button"
          onClick={addNewProduct}
          className="flex items-center gap-2">

          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.map((product, index) =>
        <Card key={product.id} className="border-l-4 border-l-blue-500">
            <Collapsible
            open={product.isExpanded}
            onOpenChange={() => toggleProductExpansion(product.id)}>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto font-semibold text-left">
                      <div className="flex items-center gap-2">
                        {product.isExpanded ?
                      <ChevronDown className="h-4 w-4" /> :
                      <ChevronRight className="h-4 w-4" />
                      }
                        <span>
                          {String.fromCharCode(65 + index)}. {product.productType || 'New Product'} 
                          {product.neckType && ` - ${product.neckType}`}
                        </span>
                        {product.totalQuantity > 0 &&
                      <Badge variant="secondary" className="ml-2">
                            {product.totalQuantity} items
                          </Badge>
                      }
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <div className="flex items-center gap-2">
                    {product.itemTotal > 0 &&
                  <Badge className="bg-green-100 text-green-800">
                        ₹{product.itemTotal.toFixed(2)}
                      </Badge>
                  }
                    {products.length > 1 &&
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-700">

                        <Trash2 className="h-4 w-4" />
                      </Button>
                  }
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Product Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Product Type *</Label>
                      <Select
                      value={product.productType}
                      onValueChange={(value) => updateProduct(product.id, {
                        productType: value,
                        variants: [] // Reset variants when product type changes
                      })}>

                        <SelectTrigger>
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
                      <Label>Neck Type *</Label>
                      <Select
                      value={product.neckType}
                      onValueChange={(value) => updateProduct(product.id, { neckType: value })}
                      disabled={!product.productType}>

                        <SelectTrigger>
                          <SelectValue placeholder="Select neck type" />
                        </SelectTrigger>
                        <SelectContent>
                          {neckTypes.map((type) =>
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                        )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price (₹) *</Label>
                      <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.unitPrice || ''}
                      onChange={(e) => updateProduct(product.id, {
                        unitPrice: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Enter unit price" />

                    </div>
                  </div>

                  {/* Product Variants */}
                  {product.productType && product.neckType && product.unitPrice > 0 &&
                <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Items:</Label>
                          <Button
                        type="button"
                        size="sm"
                        onClick={() => addVariantToProduct(product.id)}
                        className="flex items-center gap-2">

                            <Plus className="h-4 w-4" />
                            Add Item
                          </Button>
                        </div>
                        
                        <ProductVariantTable
                      variants={product.variants}
                      colors={colors}
                      sizes={sizes}
                      productType={product.productType}
                      stockData={stockData}
                      onUpdateVariant={(variantId, updates) =>
                      updateVariant(product.id, variantId, updates)
                      }
                      onRemoveVariant={(variantId) =>
                      removeVariant(product.id, variantId)
                      } />

                      </div>
                    </>
                }

                  {/* Product Summary */}
                  {product.totalQuantity > 0 &&
                <>
                      <Separator />
                      <div className="bg-gray-50 p-3 rounded-lg">
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
                            <span className="font-medium">Subtotal: </span>
                            <Badge className="bg-green-100 text-green-800">
                              ₹{product.itemTotal.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </>
                }
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>

      {/* Overall Summary */}
      {getTotalQuantity() > 0 &&
      <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-medium text-blue-900">Total Products: </span>
                <Badge className="bg-blue-100 text-blue-800">{products.length}</Badge>
              </div>
              <div>
                <span className="font-medium text-blue-900">Total Items: </span>
                <Badge className="bg-blue-100 text-blue-800">{getTotalQuantity()}</Badge>
              </div>
              <div>
                <span className="font-medium text-blue-900">Grand Total: </span>
                <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
                  ₹{getTotalAmount().toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      }
    </div>);

};

export default MultiProductSection;