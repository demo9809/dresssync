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
    { value: 'neck_type', label: 'Neck Types', icon: Shirt, color: 'bg-orange-500' }
  ];

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
      { config_type: 'neck_type', config_value: 'Crew Neck', display_order: 5 }
    ];

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
        c => c.config_type === formData.config_type && 
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
    return configs
      .filter(c => c.config_type === type)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getTypeConfig = (type: string) => {
    return configTypes.find(ct => ct.value === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading configurations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Configuration Manager</h2>
          <p className="text-gray-600">Manage product types, colors, sizes, and neck types</p>
        </div>
        <div className="flex space-x-2">
          {configs.length === 0 && (
            <Button onClick={initializeDefaultConfigs} variant="outline">
              Initialize Defaults
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData({ ...formData, config_type: activeTab }); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
                </DialogTitle>
                <DialogDescription>
                  {editingConfig ? 'Update the configuration details' : 'Add a new configuration item'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="config_type">Configuration Type</Label>
                  <Select 
                    value={formData.config_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, config_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {configTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="config_value">Value</Label>
                  <Input
                    id="config_value"
                    value={formData.config_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, config_value: e.target.value }))}
                    placeholder="Enter configuration value"
                  />
                </div>
                
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    placeholder="Display order"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSave}>
                  {editingConfig ? 'Update' : 'Add'} Configuration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {configTypes.map(type => {
          const typeConfigs = getConfigsByType(type.value);
          const activeCount = typeConfigs.filter(c => c.is_active).length;
          const Icon = type.icon;
          
          return (
            <Card key={type.value}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{type.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                    <p className="text-xs text-gray-500">{typeConfigs.length - activeCount} inactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {configTypes.map(type => (
            <TabsTrigger key={type.value} value={type.value}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {configTypes.map(type => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <type.icon className="w-5 h-5" />
                  <span>{type.label} Configuration</span>
                </CardTitle>
                <CardDescription>
                  Manage {type.label.toLowerCase()} options for products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getConfigsByType(type.value).map((config, index) => (
                      <TableRow key={config.ID}>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-500">#{config.display_order}</span>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => updateDisplayOrder(config.ID, config.display_order - 1)}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={() => updateDisplayOrder(config.ID, config.display_order + 1)}
                                disabled={index === getConfigsByType(type.value).length - 1}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{config.config_value}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={config.is_active ? "default" : "secondary"}>
                              {config.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Switch
                              checked={config.is_active}
                              onCheckedChange={(checked) => handleToggleActive(config.ID, checked)}
                              size="sm"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(config.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(config)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(config.ID)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {getConfigsByType(type.value).length === 0 && (
                  <div className="text-center py-8">
                    <type.icon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No {type.label.toLowerCase()}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first {type.label.toLowerCase().slice(0, -1)}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProductConfigurationManager;