import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import ProductItem from '@/components/ProductItem';

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

interface MultiProductOrderSectionProps {
  products: ProductItemData[];
  onProductsChange: (products: ProductItemData[]) => void;
}

const MultiProductOrderSection: React.FC<MultiProductOrderSectionProps> = ({
  products,
  onProductsChange
}) => {
  const addProduct = () => {
    const newProduct: ProductItemData = {
      id: `product-${Date.now()}-${Math.random()}`,
      productType: '',
      neckType: '',
      variants: [
      {
        id: `variant-${Date.now()}-${Math.random()}`,
        size: '',
        color: '',
        quantity: 0
      }]

    };

    onProductsChange([...products, newProduct]);
  };

  const updateProduct = (updatedProduct: ProductItemData) => {
    onProductsChange(
      products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const removeProduct = (productId: string) => {
    if (products.length > 1) {
      onProductsChange(products.filter((product) => product.id !== productId));
    }
  };

  const getTotalQuantity = () => {
    return products.reduce((total, product) =>
    total + product.variants.reduce((variantTotal, variant) =>
    variantTotal + (variant.quantity || 0), 0
    ), 0
    );
  };

  const getValidProducts = () => {
    return products.filter((product) =>
    product.productType &&
    product.variants.some((variant) =>
    variant.size && variant.color && variant.quantity > 0
    )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Product Configuration</h2>
              <p className="text-sm text-gray-600">
                Configure multiple products for this order
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {getValidProducts().length} Product{getValidProducts().length !== 1 ? 's' : ''} Configured
            </div>
            <div className="text-xs text-gray-600">
              Total: {getTotalQuantity()} items
            </div>
          </div>
        </div>
      </Card>

      {/* Product Items */}
      <div className="space-y-4">
        {products.map((product, index) =>
        <ProductItem
          key={product.id}
          data={product}
          onUpdate={updateProduct}
          onRemove={removeProduct}
          index={index} />

        )}
      </div>

      {/* Add Product Button */}
      <div className="flex justify-center">
        <Button
          onClick={addProduct}
          variant="outline"
          className="border-dashed border-2 border-blue-300 text-blue-600 hover:text-blue-800 hover:bg-blue-50 hover:border-blue-400 py-3 px-6">

          <Plus className="h-4 w-4 mr-2" />
          Add Another Product
        </Button>
      </div>

      {/* Summary */}
      {getTotalQuantity() > 0 &&
      <Card className="p-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {getValidProducts().map((product, index) =>
          <div key={product.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {product.productType} {product.neckType && `(${product.neckType})`}
                </span>
                <span className="font-medium">
                  {product.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0)} items
                </span>
              </div>
          )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-medium">
                <span>Total Quantity</span>
                <span>{getTotalQuantity()} items</span>
              </div>
            </div>
          </div>
        </Card>
      }
    </div>);

};

export default MultiProductOrderSection;