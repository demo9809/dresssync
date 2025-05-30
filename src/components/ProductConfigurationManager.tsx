import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Palette, Package, Ruler, Shirt, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductConfig {
  ID: number;
  config_type: string;
  config_value: string;
  display_order: number;
  is_active: boolean;
  created_date: string;
}

const ProductConfigurationManager: React.FC = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ProductConfig | null>(null);
  const [activeTab, setActiveTab] = useState('product_type');
  const [formData, setFormData] = useState({
    config_type: 'product_type',
    config_value: '',
    display_order: 0,
    is_active: true
  });

  const configTypes = [
  { value: 'product_type', label: 'Product Types', icon: Package, color: 'bg-blue-500' },
  { value: 'color', label: 'Colors', icon: Palette, color: 'bg-green-500' },
  { value: 'size', label: 'Sizes', icon: Ruler, color: 'bg-purple-500' },
  { value: 'neck_type', label: 'Neck Types', icon: Shirt, color: 'bg-orange-500' }];


  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await window.ezsite.apis.tablePage('11428', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'display_order',
        IsAsc: true,
        Filters: []
      });
      if (error) throw error;
      setConfigs(data.List || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product configurations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultConfigs = async () => {
    const defaultConfigs = [
    // Product Types
    { config_type: 'product_type', config_value: 'T-shirt', display_order: 1 },
    { config_type: 'product_type', config_value: 'Jersey', display_order: 2 },
    { config_type: 'product_type', config_value: 'Uniform', display_order: 3 },
    { config_type: 'product_type', config_value: 'Polo Shirt', display_order: 4 },
    { config_type: 'product_type', config_value: 'Hoodie', display_order: 5 },

    // Colors
    { config_type: 'color', config_value: 'Navy Blue', display_order: 1 },
    { config_type: 'color', config_value: 'Red', display_order: 2 },
    { config_type: 'color', config_value: 'Black', display_order: 3 },
    { config_type: 'color', config_value: 'White', display_order: 4 },
    { config_type: 'color', config_value: 'Royal Blue', display_order: 5 },
    { config_type: 'color', config_value: 'Green', display_order: 6 },
    { config_type: 'color', config_value: 'Yellow', display_order: 7 },

    // Sizes
    { config_type: 'size', config_value: 'XS', display_order: 1 },
    { config_type: 'size', config_value: 'S', display_order: 2 },
    { config_type: 'size', config_value: 'M', display_order: 3 },
    { config_type: 'size', config_value: 'L', display_order: 4 },
    { config_type: 'size', config_value: 'XL', display_order: 5 },
    { config_type: 'size', config_value: 'XXL', display_order: 6 },
    { config_type: 'size', config_value: 'XXXL', display_order: 7 },

    // Neck Types
    { config_type: 'neck_type', config_value: 'Round Neck', display_order: 1 },
    { config_type: 'neck_type', config_value: 'V-Neck', display_order: 2 },
    { config_type: 'neck_type', config_value: 'Polo Collar', display_order: 3 },
    { config_type: 'neck_type', config_value: 'Henley', display_order: 4 },
    { config_type: 'neck_type', config_value: 'Crew Neck', display_order: 5 }];


    try {
      for (const config of defaultConfigs) {
        await window.ezsite.apis.tableCreate('11428', {
          ...config,
          is_active: true,
          created_date: new Date().toISOString()
        });
      }
      toast({
        title: 'Success',
        description: 'Default configurations initialized'
      });
      loadConfigs();
    } catch (error) {
      console.error('Error initializing configs:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize default configurations',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.config_value.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a configuration value',
          variant: 'destructive'
        });
        return;
      }

      // Check for duplicates
      const existingConfig = configs.find(
        (c) => c.config_type === formData.config_type &&
        c.config_value.toLowerCase() === formData.config_value.toLowerCase() &&
        c.ID !== editingConfig?.ID
      );

      if (existingConfig) {
        toast({
          title: 'Error',
          description: 'This configuration value already exists',
          variant: 'destructive'
        });
        return;
      }

      const saveData = {
        ...formData,
        created_date: editingConfig ? editingConfig.created_date : new Date().toISOString()
      };

      if (editingConfig) {
        const { error } = await window.ezsite.apis.tableUpdate('11428', {
          ID: editingConfig.ID,
          ...saveData
        });
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Configuration updated successfully'
        });
      } else {
        const { error } = await window.ezsite.apis.tableCreate('11428', saveData);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Configuration added successfully'
        });
      }

      resetForm();
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete('11428', { ID: id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Configuration deleted successfully'
      });
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('11428', {
        ID: id,
        is_active: isActive
      });
      if (error) throw error;

      toast({
        title: 'Success',
        description: `Configuration ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      loadConfigs();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    }
  };

  const updateDisplayOrder = async (id: number, newOrder: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('11428', {
        ID: id,
        display_order: newOrder
      });
      if (error) throw error;
      loadConfigs();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update display order',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      config_type: activeTab,
      config_value: '',
      display_order: 0,
      is_active: true
    });
    setEditingConfig(null);
    setIsAddDialogOpen(false);
  };

  const startEdit = (config: ProductConfig) => {
    setEditingConfig(config);
    setFormData({
      config_type: config.config_type,
      config_value: config.config_value,
      display_order: config.display_order,
      is_active: config.is_active
    });
    setIsAddDialogOpen(true);
  };

  const getConfigsByType = (type: string) => {
    return configs.
    filter((c) => c.config_type === type).
    sort((a, b) => a.display_order - b.display_order);
  };

  const getTypeConfig = (type: string) => {
    return configTypes.find((ct) => ct.value === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-id="uncvvx803" data-path="src/components/ProductConfigurationManager.tsx">
        <div className="text-lg" data-id="o10a6nnj5" data-path="src/components/ProductConfigurationManager.tsx">Loading configurations...</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="denxcxp85" data-path="src/components/ProductConfigurationManager.tsx">
      <div className="flex items-center justify-between" data-id="icbnb2b4n" data-path="src/components/ProductConfigurationManager.tsx">
        <div data-id="r99mkhh4x" data-path="src/components/ProductConfigurationManager.tsx">
          <h2 className="text-2xl font-bold text-gray-900" data-id="9ltc3ddkc" data-path="src/components/ProductConfigurationManager.tsx">Product Configuration Manager</h2>
          <p className="text-gray-600" data-id="1l4nf2xip" data-path="src/components/ProductConfigurationManager.tsx">Manage product types, colors, sizes, and neck types</p>
        </div>
        <div className="flex space-x-2" data-id="hcxc42k4u" data-path="src/components/ProductConfigurationManager.tsx">
          {configs.length === 0 &&
          <Button onClick={initializeDefaultConfigs} variant="outline" data-id="j15fhx3bo" data-path="src/components/ProductConfigurationManager.tsx">
              Initialize Defaults
            </Button>
          }
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} data-id="o6inqa0ep" data-path="src/components/ProductConfigurationManager.tsx">
            <DialogTrigger asChild data-id="n9fasn0my" data-path="src/components/ProductConfigurationManager.tsx">
              <Button onClick={() => {setFormData({ ...formData, config_type: activeTab });resetForm();}} data-id="k74iylvar" data-path="src/components/ProductConfigurationManager.tsx">
                <Plus className="w-4 h-4 mr-2" data-id="36brrfqzr" data-path="src/components/ProductConfigurationManager.tsx" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent data-id="qr0s88b3z" data-path="src/components/ProductConfigurationManager.tsx">
              <DialogHeader data-id="r80j4mmaa" data-path="src/components/ProductConfigurationManager.tsx">
                <DialogTitle data-id="np6jaczg6" data-path="src/components/ProductConfigurationManager.tsx">
                  {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
                </DialogTitle>
                <DialogDescription data-id="yjl43w5ak" data-path="src/components/ProductConfigurationManager.tsx">
                  {editingConfig ? 'Update the configuration details' : 'Add a new configuration item'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4" data-id="5kworo774" data-path="src/components/ProductConfigurationManager.tsx">
                <div data-id="5zcbrl35j" data-path="src/components/ProductConfigurationManager.tsx">
                  <Label htmlFor="config_type" data-id="32hrj43aj" data-path="src/components/ProductConfigurationManager.tsx">Configuration Type</Label>
                  <Select
                    value={formData.config_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, config_type: value }))} data-id="kux8za1zs" data-path="src/components/ProductConfigurationManager.tsx">

                    <SelectTrigger data-id="83gpzhiug" data-path="src/components/ProductConfigurationManager.tsx">
                      <SelectValue placeholder="Select type" data-id="pmsohzhfq" data-path="src/components/ProductConfigurationManager.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="jsxnip6bk" data-path="src/components/ProductConfigurationManager.tsx">
                      {configTypes.map((type) =>
                      <SelectItem key={type.value} value={type.value} data-id="ajh7zctur" data-path="src/components/ProductConfigurationManager.tsx">
                          {type.label}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div data-id="ii7j2kg4p" data-path="src/components/ProductConfigurationManager.tsx">
                  <Label htmlFor="config_value" data-id="msptqztml" data-path="src/components/ProductConfigurationManager.tsx">Value</Label>
                  <Input
                    id="config_value"
                    value={formData.config_value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, config_value: e.target.value }))}
                    placeholder="Enter configuration value" data-id="e95iqt0kl" data-path="src/components/ProductConfigurationManager.tsx" />

                </div>
                
                <div data-id="mbnw0amb8" data-path="src/components/ProductConfigurationManager.tsx">
                  <Label htmlFor="display_order" data-id="dl1cymlef" data-path="src/components/ProductConfigurationManager.tsx">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    placeholder="Display order" data-id="fmayuls9w" data-path="src/components/ProductConfigurationManager.tsx" />

                </div>
                
                <div className="flex items-center space-x-2" data-id="3dj72esdc" data-path="src/components/ProductConfigurationManager.tsx">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))} data-id="ooumtsubn" data-path="src/components/ProductConfigurationManager.tsx" />

                  <Label htmlFor="is_active" data-id="awip5h705" data-path="src/components/ProductConfigurationManager.tsx">Active</Label>
                </div>
              </div>
              <DialogFooter data-id="heikpsghd" data-path="src/components/ProductConfigurationManager.tsx">
                <Button variant="outline" onClick={resetForm} data-id="2sv2v3zo8" data-path="src/components/ProductConfigurationManager.tsx">Cancel</Button>
                <Button onClick={handleSave} data-id="aoffk3har" data-path="src/components/ProductConfigurationManager.tsx">
                  {editingConfig ? 'Update' : 'Add'} Configuration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="vnuuwmj10" data-path="src/components/ProductConfigurationManager.tsx">
        {configTypes.map((type) => {
          const typeConfigs = getConfigsByType(type.value);
          const activeCount = typeConfigs.filter((c) => c.is_active).length;
          const Icon = type.icon;

          return (
            <Card key={type.value} data-id="ib0kc0r14" data-path="src/components/ProductConfigurationManager.tsx">
              <CardContent className="p-6" data-id="4g91xw8az" data-path="src/components/ProductConfigurationManager.tsx">
                <div className="flex items-center" data-id="ix50gmbst" data-path="src/components/ProductConfigurationManager.tsx">
                  <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`} data-id="5wb29uqr6" data-path="src/components/ProductConfigurationManager.tsx">
                    <Icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} data-id="gfwpdppu6" data-path="src/components/ProductConfigurationManager.tsx" />
                  </div>
                  <div className="ml-4" data-id="g79of02f7" data-path="src/components/ProductConfigurationManager.tsx">
                    <p className="text-sm font-medium text-gray-600" data-id="fclomyzx6" data-path="src/components/ProductConfigurationManager.tsx">{type.label}</p>
                    <p className="text-2xl font-bold text-gray-900" data-id="zjnroy22v" data-path="src/components/ProductConfigurationManager.tsx">{activeCount}</p>
                    <p className="text-xs text-gray-500" data-id="9xboh9l34" data-path="src/components/ProductConfigurationManager.tsx">{typeConfigs.length - activeCount} inactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-id="203gixi7r" data-path="src/components/ProductConfigurationManager.tsx">
        <TabsList className="grid w-full grid-cols-4" data-id="xmqqia4a3" data-path="src/components/ProductConfigurationManager.tsx">
          {configTypes.map((type) =>
          <TabsTrigger key={type.value} value={type.value} data-id="z30p7krmb" data-path="src/components/ProductConfigurationManager.tsx">
              {type.label}
            </TabsTrigger>
          )}
        </TabsList>

        {configTypes.map((type) =>
        <TabsContent key={type.value} value={type.value} className="space-y-4" data-id="0rbwrjrxi" data-path="src/components/ProductConfigurationManager.tsx">
            <Card data-id="v8u7foxgc" data-path="src/components/ProductConfigurationManager.tsx">
              <CardHeader data-id="yjlunheaa" data-path="src/components/ProductConfigurationManager.tsx">
                <CardTitle className="flex items-center space-x-2" data-id="cenve245z" data-path="src/components/ProductConfigurationManager.tsx">
                  <type.icon className="w-5 h-5" data-id="kbg0tlu4c" data-path="src/components/ProductConfigurationManager.tsx" />
                  <span data-id="ajwbt640g" data-path="src/components/ProductConfigurationManager.tsx">{type.label} Configuration</span>
                </CardTitle>
                <CardDescription data-id="ryx2gq340" data-path="src/components/ProductConfigurationManager.tsx">
                  Manage {type.label.toLowerCase()} options for products
                </CardDescription>
              </CardHeader>
              <CardContent data-id="lean6hcsb" data-path="src/components/ProductConfigurationManager.tsx">
                <Table data-id="mwlcq7so5" data-path="src/components/ProductConfigurationManager.tsx">
                  <TableHeader data-id="5dq8efrne" data-path="src/components/ProductConfigurationManager.tsx">
                    <TableRow data-id="alfcaxv38" data-path="src/components/ProductConfigurationManager.tsx">
                      <TableHead data-id="n4mhff3pe" data-path="src/components/ProductConfigurationManager.tsx">Order</TableHead>
                      <TableHead data-id="5lphzzqyt" data-path="src/components/ProductConfigurationManager.tsx">Value</TableHead>
                      <TableHead data-id="y4u443662" data-path="src/components/ProductConfigurationManager.tsx">Status</TableHead>
                      <TableHead data-id="e5dii9pn6" data-path="src/components/ProductConfigurationManager.tsx">Created Date</TableHead>
                      <TableHead data-id="ycub04ua2" data-path="src/components/ProductConfigurationManager.tsx">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-id="a78iywh5c" data-path="src/components/ProductConfigurationManager.tsx">
                    {getConfigsByType(type.value).map((config, index) =>
                  <TableRow key={config.ID} data-id="27evmcmud" data-path="src/components/ProductConfigurationManager.tsx">
                        <TableCell data-id="6572tb7i0" data-path="src/components/ProductConfigurationManager.tsx">
                          <div className="flex items-center space-x-1" data-id="dvhkrrq9i" data-path="src/components/ProductConfigurationManager.tsx">
                            <span className="text-sm text-gray-500" data-id="hk5cvdyvj" data-path="src/components/ProductConfigurationManager.tsx">#{config.display_order}</span>
                            <div className="flex flex-col" data-id="ampqhq2y6" data-path="src/components/ProductConfigurationManager.tsx">
                              <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => updateDisplayOrder(config.ID, config.display_order - 1)}
                            disabled={index === 0} data-id="57mhvcq23" data-path="src/components/ProductConfigurationManager.tsx">

                                <ArrowUp className="w-3 h-3" data-id="zcleaym2x" data-path="src/components/ProductConfigurationManager.tsx" />
                              </Button>
                              <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => updateDisplayOrder(config.ID, config.display_order + 1)}
                            disabled={index === getConfigsByType(type.value).length - 1} data-id="48eiblk2z" data-path="src/components/ProductConfigurationManager.tsx">

                                <ArrowDown className="w-3 h-3" data-id="df0osdfqu" data-path="src/components/ProductConfigurationManager.tsx" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium" data-id="ggi6it2ge" data-path="src/components/ProductConfigurationManager.tsx">{config.config_value}</TableCell>
                        <TableCell data-id="n48bqbwg2" data-path="src/components/ProductConfigurationManager.tsx">
                          <div className="flex items-center space-x-2" data-id="jkjg5q5oq" data-path="src/components/ProductConfigurationManager.tsx">
                            <Badge variant={config.is_active ? "default" : "secondary"} data-id="ilp0g1da0" data-path="src/components/ProductConfigurationManager.tsx">
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Switch
                          checked={config.is_active}
                          onCheckedChange={(checked) => handleToggleActive(config.ID, checked)}
                          size="sm" data-id="hpzlgdk8n" data-path="src/components/ProductConfigurationManager.tsx" />

                          </div>
                        </TableCell>
                        <TableCell data-id="a1gxbhe0m" data-path="src/components/ProductConfigurationManager.tsx">
                          {new Date(config.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-id="blk71lkoz" data-path="src/components/ProductConfigurationManager.tsx">
                          <div className="flex items-center space-x-2" data-id="oi03e78tv" data-path="src/components/ProductConfigurationManager.tsx">
                            <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(config)} data-id="y4m6pqn1a" data-path="src/components/ProductConfigurationManager.tsx">

                              <Edit className="w-4 h-4" data-id="l0pxoe1nv" data-path="src/components/ProductConfigurationManager.tsx" />
                            </Button>
                            <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(config.ID)} data-id="48mbdts10" data-path="src/components/ProductConfigurationManager.tsx">

                              <Trash2 className="w-4 h-4" data-id="ez001pmi9" data-path="src/components/ProductConfigurationManager.tsx" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  )}
                  </TableBody>
                </Table>
                
                {getConfigsByType(type.value).length === 0 &&
              <div className="text-center py-8" data-id="15345k55a" data-path="src/components/ProductConfigurationManager.tsx">
                    <type.icon className="mx-auto h-12 w-12 text-gray-400" data-id="tkpq9er7d" data-path="src/components/ProductConfigurationManager.tsx" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="pqs8lbwqc" data-path="src/components/ProductConfigurationManager.tsx">No {type.label.toLowerCase()}</h3>
                    <p className="mt-1 text-sm text-gray-500" data-id="6y1759urp" data-path="src/components/ProductConfigurationManager.tsx">
                      Get started by adding your first {type.label.toLowerCase().slice(0, -1)}.
                    </p>
                  </div>
              }
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>);

};

export default ProductConfigurationManager;