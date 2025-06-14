import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MultiProductOrderSection from '@/components/MultiProductOrderSection';

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

const ProductItemDemo: React.FC = () => {
  const [products, setProducts] = useState<ProductItemData[]>([
    {
      id: 'demo-product-1',
      productType: '',
      neckType: '',
      variants: [
        {
          id: 'demo-variant-1',
          size: '',
          color: '',
          quantity: 0
        }
      ]
    }
  ]);

  const handleProductsChange = (updatedProducts: ProductItemData[]) => {
    setProducts(updatedProducts);
  };

  const getTotalQuantity = () => {
    return products.reduce((total, product) => 
      total + product.variants.reduce((variantTotal, variant) => 
        variantTotal + (variant.quantity || 0), 0
      ), 0
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Item Component Demo</h1>
        <p className="text-gray-600">Test the Product Item component functionality as shown in the UI reference</p>
      </div>

      <div className="space-y-6">
        {/* Product Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiProductOrderSection
              products={products}
              onProductsChange={handleProductsChange}
            />
          </CardContent>
        </Card>

        {/* Current State Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-blue-800">Total Products</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{getTotalQuantity()}</div>
                  <div className="text-sm text-green-800">Total Quantity</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {products.reduce((sum, product) => sum + product.variants.length, 0)}
                  </div>
                  <div className="text-sm text-purple-800">Total Variants</div>
                </div>
              </div>

              {/* Raw Data Display */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Raw Product Data:</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(products, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Use the "Select Product type" and "Select Neck type" dropdowns to configure each product</p>
              <p>• Add size/color/quantity combinations using the variant rows</p>
              <p>• Click the "+" button to add more size/color/quantity combinations</p>
              <p>• Click the trash icon to remove individual variants or entire products</p>
              <p>• Use "Add Another Product" to create multiple product configurations</p>
              <p>• Watch the totals update in real-time as you make changes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductItemDemo;