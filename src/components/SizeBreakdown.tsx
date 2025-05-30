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
    const existingSizes = Object.keys(sizeBreakdown).filter((size) => sizeBreakdown[size] > 0);
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
    setActiveSizes(activeSizes.filter((s) => s !== size));
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
    <Card data-id="tpfghguj0" data-path="src/components/SizeBreakdown.tsx">
      <CardHeader data-id="sjvxja8dj" data-path="src/components/SizeBreakdown.tsx">
        <CardTitle className="flex items-center justify-between" data-id="0e5owznzg" data-path="src/components/SizeBreakdown.tsx">
          <span data-id="vv84ysxzz" data-path="src/components/SizeBreakdown.tsx">Size Breakdown</span>
          <div className="flex items-center space-x-2" data-id="rabvxd3ts" data-path="src/components/SizeBreakdown.tsx">
            {isValid ?
            <Badge variant="default" className="bg-green-100 text-green-800" data-id="aec223lkc" data-path="src/components/SizeBreakdown.tsx">
                <CheckCircle size={14} className="mr-1" data-id="1nwe99qh3" data-path="src/components/SizeBreakdown.tsx" />
                Valid
              </Badge> :

            <Badge variant="destructive" data-id="84q76o704" data-path="src/components/SizeBreakdown.tsx">
                <AlertTriangle size={14} className="mr-1" data-id="58qni6xs4" data-path="src/components/SizeBreakdown.tsx" />
                Check totals
              </Badge>
            }
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4" data-id="sy8zulh9e" data-path="src/components/SizeBreakdown.tsx">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2" data-id="p5qnf06u3" data-path="src/components/SizeBreakdown.tsx">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autoDistribute}
            disabled={disabled || activeSizes.length === 0 || totalQuantity === 0} data-id="xww5xboqm" data-path="src/components/SizeBreakdown.tsx">

            Auto Distribute
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600" data-id="yazhcn4yo" data-path="src/components/SizeBreakdown.tsx">
            <span data-id="a5wh3vo2z" data-path="src/components/SizeBreakdown.tsx">Total: {currentTotal}/{totalQuantity}</span>
            {remainingToDistribute !== 0 &&
            <span className={remainingToDistribute > 0 ? 'text-orange-600' : 'text-red-600'} data-id="72j65y3wm" data-path="src/components/SizeBreakdown.tsx">
                ({remainingToDistribute > 0 ? '+' : ''}{remainingToDistribute})
              </span>
            }
          </div>
        </div>

        {/* Error Messages */}
        {errors.total &&
        <Alert variant="destructive" data-id="yannn2vr5" data-path="src/components/SizeBreakdown.tsx">
            <AlertTriangle className="h-4 w-4" data-id="gan9gftui" data-path="src/components/SizeBreakdown.tsx" />
            <AlertDescription data-id="k59typn5d" data-path="src/components/SizeBreakdown.tsx">{errors.total}</AlertDescription>
          </Alert>
        }

        {/* Active Sizes */}
        <div className="space-y-3" data-id="7h2zom8o6" data-path="src/components/SizeBreakdown.tsx">
          {activeSizes.map((size) => {
            const quantity = sizeBreakdown[size] || 0;
            const available = availableStock[size];
            const stockStatus = getStockStatus(size, quantity);
            const hasError = errors[size];

            return (
              <div key={size} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50" data-id="nm4ww3o5l" data-path="src/components/SizeBreakdown.tsx">
                <div className="flex-1" data-id="imp0e33mc" data-path="src/components/SizeBreakdown.tsx">
                  <Label className="font-medium" data-id="ftduy9ihm" data-path="src/components/SizeBreakdown.tsx">Size {size}</Label>
                  {available !== undefined &&
                  <p className="text-xs text-gray-500 mt-1" data-id="8k9ok8x4n" data-path="src/components/SizeBreakdown.tsx">
                      Available: {available} pieces
                    </p>
                  }
                </div>
                
                <div className="flex items-center space-x-2" data-id="0v0tt01fz" data-path="src/components/SizeBreakdown.tsx">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(size, quantity - 1)}
                    disabled={disabled || quantity <= 0} data-id="ta14agrq5" data-path="src/components/SizeBreakdown.tsx">

                    <Minus size={14} data-id="5djdvzb19" data-path="src/components/SizeBreakdown.tsx" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => updateQuantity(size, parseInt(e.target.value) || 0)}
                    className={`w-20 text-center ${hasError ? 'border-red-500' : ''}`}
                    min="0"
                    disabled={disabled} data-id="atvd8ctfc" data-path="src/components/SizeBreakdown.tsx" />

                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(size, quantity + 1)}
                    disabled={disabled} data-id="pw5z4zeve" data-path="src/components/SizeBreakdown.tsx">

                    <Plus size={14} data-id="l99nhnzxx" data-path="src/components/SizeBreakdown.tsx" />
                  </Button>
                </div>

                {/* Stock Status Indicator */}
                {available !== undefined &&
                <div className="flex items-center" data-id="22s5c51v0" data-path="src/components/SizeBreakdown.tsx">
                    <div
                    className={`w-3 h-3 rounded-full ${
                    stockStatus === 'sufficient' ? 'bg-green-500' :
                    stockStatus === 'low' ? 'bg-yellow-500' :
                    stockStatus === 'insufficient' ? 'bg-red-500' :
                    'bg-gray-400'}`
                    }
                    title={
                    stockStatus === 'sufficient' ? 'Sufficient stock' :
                    stockStatus === 'low' ? 'Low stock' :
                    stockStatus === 'insufficient' ? 'Insufficient stock' :
                    'Stock unknown'
                    } data-id="sk1pshjul" data-path="src/components/SizeBreakdown.tsx" />

                  </div>
                }

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSize(size)}
                  disabled={disabled || activeSizes.length <= 1}
                  className="text-red-600 hover:text-red-700" data-id="ga6y73plw" data-path="src/components/SizeBreakdown.tsx">

                  Remove
                </Button>

                {hasError &&
                <div className="text-xs text-red-600 mt-1" data-id="cdwxs5p5k" data-path="src/components/SizeBreakdown.tsx">{hasError}</div>
                }
              </div>);

          })}
        </div>

        {/* Add Size Dropdown */}
        <div className="flex flex-wrap gap-2" data-id="88ou3d7ep" data-path="src/components/SizeBreakdown.tsx">
          <Label className="text-sm font-medium text-gray-700" data-id="5hq92wmgk" data-path="src/components/SizeBreakdown.tsx">Add Size:</Label>
          {productConfig.sizes.
          filter((size) => !activeSizes.includes(size)).
          map((size) =>
          <Button
            key={size}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addSize(size)}
            disabled={disabled}
            className="text-xs" data-id="r87c5w4mu" data-path="src/components/SizeBreakdown.tsx">

                + {size}
              </Button>
          )}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 mt-4" data-id="scgd2b1qq" data-path="src/components/SizeBreakdown.tsx">
          <div className="grid grid-cols-2 gap-4 text-sm" data-id="nm67gibmw" data-path="src/components/SizeBreakdown.tsx">
            <div data-id="1yeh6pv0x" data-path="src/components/SizeBreakdown.tsx">
              <span className="font-medium" data-id="n4iawul7m" data-path="src/components/SizeBreakdown.tsx">Sizes Selected:</span>
              <span className="ml-2" data-id="4rowh1cez" data-path="src/components/SizeBreakdown.tsx">{activeSizes.length}</span>
            </div>
            <div data-id="svfx1eiy9" data-path="src/components/SizeBreakdown.tsx">
              <span className="font-medium" data-id="fdc4q9ynd" data-path="src/components/SizeBreakdown.tsx">Total Pieces:</span>
              <span className={`ml-2 ${isValid ? 'text-green-600' : 'text-red-600'}`} data-id="48lttfnw0" data-path="src/components/SizeBreakdown.tsx">
                {currentTotal}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default SizeBreakdown;