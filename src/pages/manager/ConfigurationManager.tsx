import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sliders, Settings } from 'lucide-react';
import ProductConfigurationManager from '@/components/ProductConfigurationManager';

const ConfigurationManager: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">Manage product types, colors, sizes, and system settings</p>
        </div>
        <Badge variant="default" className="w-fit">
          Manager Access
        </Badge>
      </div>

      {/* Configuration Management Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sliders className="w-5 h-5" />
            <span>Product Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure available product types, colors, sizes, and neck types for orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductConfigurationManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationManager;