import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Minus, AlertTriangle, CheckCircle } from 'lucide-react';
import { productConfig } from '@/services/stockService';

interface SizeBreakdownProps {
  totalQuantity: number;
  sizeBreakdown: Record<string, number>;
  onSizeBreakdownChange: (breakdown: Record<string, number>) => void;
  availableStock?: Record<string, number>;
  disabled?: boolean;
}

const SizeBreakdown: React.FC<SizeBreakdownProps> = ({
  totalQuantity,
  sizeBreakdown,
  onSizeBreakdownChange,
  availableStock = {},
  disabled = false
}) => {
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize active sizes from existing breakdown
    const existingSizes = Object.keys(sizeBreakdown).filter(size => sizeBreakdown[size] > 0);
    if (existingSizes.length > 0) {
      setActiveSizes(existingSizes);
    } else if (activeSizes.length === 0) {
      // Add first size by default
      setActiveSizes(['M']);
    }
  }, []);

  useEffect(() => {
    validateSizes();
  }, [sizeBreakdown, totalQuantity, availableStock]);

  const validateSizes = () => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(sizeBreakdown).forEach(([size, quantity]) => {
      if (quantity < 0) {
        newErrors[size] = 'Quantity cannot be negative';
      } else if (availableStock[size] !== undefined && quantity > availableStock[size]) {
        newErrors[size] = `Only ${availableStock[size]} available in stock`;
      }
    });

    const currentTotal = Object.values(sizeBreakdown).reduce((sum, qty) => sum + qty, 0);
    if (currentTotal > totalQuantity) {
      newErrors.total = `Size total (${currentTotal}) exceeds order quantity (${totalQuantity})`;
    } else if (currentTotal < totalQuantity && totalQuantity > 0) {
      newErrors.total = `Size total (${currentTotal}) is less than order quantity (${totalQuantity})`;
    }

    setErrors(newErrors);
  };

  const addSize = (size: string) => {
    if (!activeSizes.includes(size)) {
      setActiveSizes([...activeSizes, size]);
      const newBreakdown = { ...sizeBreakdown, [size]: 0 };
      onSizeBreakdownChange(newBreakdown);
    }
  };

  const removeSize = (size: string) => {
    setActiveSizes(activeSizes.filter(s => s !== size));
    const newBreakdown = { ...sizeBreakdown };
    delete newBreakdown[size];
    onSizeBreakdownChange(newBreakdown);
  };

  const updateQuantity = (size: string, quantity: number) => {
    const newBreakdown = { ...sizeBreakdown, [size]: Math.max(0, quantity) };
    onSizeBreakdownChange(newBreakdown);
  };

  const autoDistribute = () => {
    if (activeSizes.length === 0 || totalQuantity === 0) return;
    
    const baseQuantity = Math.floor(totalQuantity / activeSizes.length);
    const remainder = totalQuantity % activeSizes.length;
    
    const newBreakdown: Record<string, number> = {};
    activeSizes.forEach((size, index) => {
      newBreakdown[size] = baseQuantity + (index < remainder ? 1 : 0);
    });
    
    onSizeBreakdownChange(newBreakdown);
  };

  const currentTotal = Object.values(sizeBreakdown).reduce((sum, qty) => sum + qty, 0);
  const isValid = Object.keys(errors).length === 0 && currentTotal === totalQuantity;
  const remainingToDistribute = totalQuantity - currentTotal;

  const getStockStatus = (size: string, quantity: number) => {
    const available = availableStock[size];
    if (available === undefined) return 'unknown';
    if (quantity > available) return 'insufficient';
    if (available - quantity <= 5) return 'low';
    return 'sufficient';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Size Breakdown</span>
          <div className="flex items-center space-x-2">
            {isValid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle size={14} className="mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle size={14} className="mr-1" />
                Check totals
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autoDistribute}
            disabled={disabled || activeSizes.length === 0 || totalQuantity === 0}
          >
            Auto Distribute
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {currentTotal}/{totalQuantity}</span>
            {remainingToDistribute !== 0 && (
              <span className={remainingToDistribute > 0 ? 'text-orange-600' : 'text-red-600'}>
                ({remainingToDistribute > 0 ? '+' : ''}{remainingToDistribute})
              </span>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {errors.total && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.total}</AlertDescription>
          </Alert>
        )}

        {/* Active Sizes */}
        <div className="space-y-3">
          {activeSizes.map((size) => {
            const quantity = sizeBreakdown[size] || 0;
            const available = availableStock[size];
            const stockStatus = getStockStatus(size, quantity);
            const hasError = errors[size];

            return (
              <div key={size} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <Label className="font-medium">Size {size}</Label>
                  {available !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {available} pieces
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(size, quantity - 1)}
                    disabled={disabled || quantity <= 0}
                  >
                    <Minus size={14} />
                  </Button>
                  
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => updateQuantity(size, parseInt(e.target.value) || 0)}
                    className={`w-20 text-center ${hasError ? 'border-red-500' : ''}`}
                    min="0"
                    disabled={disabled}
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(size, quantity + 1)}
                    disabled={disabled}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                {/* Stock Status Indicator */}
                {available !== undefined && (
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        stockStatus === 'sufficient' ? 'bg-green-500' :
                        stockStatus === 'low' ? 'bg-yellow-500' :
                        stockStatus === 'insufficient' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      title={
                        stockStatus === 'sufficient' ? 'Sufficient stock' :
                        stockStatus === 'low' ? 'Low stock' :
                        stockStatus === 'insufficient' ? 'Insufficient stock' :
                        'Stock unknown'
                      }
                    />
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSize(size)}
                  disabled={disabled || activeSizes.length <= 1}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>

                {hasError && (
                  <div className="text-xs text-red-600 mt-1">{hasError}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Size Dropdown */}
        <div className="flex flex-wrap gap-2">
          <Label className="text-sm font-medium text-gray-700">Add Size:</Label>
          {productConfig.sizes
            .filter(size => !activeSizes.includes(size))
            .map(size => (
              <Button
                key={size}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSize(size)}
                disabled={disabled}
                className="text-xs"
              >
                + {size}
              </Button>
            ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Sizes Selected:</span>
              <span className="ml-2">{activeSizes.length}</span>
            </div>
            <div>
              <span className="font-medium">Total Pieces:</span>
              <span className={`ml-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {currentTotal}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SizeBreakdown;