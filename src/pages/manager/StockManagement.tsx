import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Package, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StockItem {
  id: number;
  product_type: string;
  color: string;
  neck_type: string;
  size: string;
  quantity: number;
  min_threshold: number;
  cost_per_unit: number;
  selling_price: number;
  batch_number: string;
  supplier: string;
  purchase_date: string;
}

const StockManagement: React.FC = () => {
  const { toast } = useToast();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    product_type: '',
    color: '',
    neck_type: '',
    size: '',
    quantity: 0,
    min_threshold: 10,
    cost_per_unit: 0,
    selling_price: 0,
    batch_number: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const productTypes = ['T-Shirt', 'Jersey', 'Polo Shirt', 'Tank Top', 'Hoodie', 'Sweatshirt'];
  const colors = ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Gray', 'Navy', 'Maroon'];
  const neckTypes = ['Round Neck', 'V-Neck', 'Collar', 'Polo Collar', 'Henley', 'Scoop Neck'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11426, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setStockItems(data.List || []);
    } catch (error) {
      console.error('Error fetching stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stock items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const { error } = await window.ezsite.apis.tableUpdate(11426, {
          id: editingItem.id,
          ...formData
        });
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Stock item updated successfully'
        });
      } else {
        // Create new item
        const { error } = await window.ezsite.apis.tableCreate(11426, formData);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Stock item added successfully'
        });
      }

      resetForm();
      fetchStockItems();
    } catch (error) {
      console.error('Error saving stock item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save stock item',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(11426, { id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stock item deleted successfully'
      });
      fetchStockItems();
    } catch (error) {
      console.error('Error deleting stock item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stock item',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      product_type: '',
      color: '',
      neck_type: '',
      size: '',
      quantity: 0,
      min_threshold: 10,
      cost_per_unit: 0,
      selling_price: 0,
      batch_number: '',
      supplier: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  const startEdit = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      product_type: item.product_type,
      color: item.color,
      neck_type: item.neck_type,
      size: item.size,
      quantity: item.quantity,
      min_threshold: item.min_threshold,
      cost_per_unit: item.cost_per_unit,
      selling_price: item.selling_price,
      batch_number: item.batch_number,
      supplier: item.supplier,
      purchase_date: item.purchase_date.split('T')[0]
    });
    setIsAddDialogOpen(true);
  };

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
    item.product_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' ||
    filterType === 'low_stock' && item.quantity <= item.min_threshold ||
    filterType === 'out_of_stock' && item.quantity === 0;

    return matchesSearch && matchesFilter;
  });

  const lowStockCount = stockItems.filter((item) => item.quantity <= item.min_threshold).length;
  const outOfStockCount = stockItems.filter((item) => item.quantity === 0).length;
  const totalValue = stockItems.reduce((sum, item) => sum + item.quantity * item.cost_per_unit, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading stock items...</div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Manage your inventory and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the stock item details below.' : 'Add a new item to your inventory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product_type">Product Type</Label>
                  <Select value={formData.product_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, product_type: value }))}>
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
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) =>
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neck_type">Neck Type</Label>
                  <Select value={formData.neck_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, neck_type: value }))}>
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
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) =>
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} />

                </div>
                <div>
                  <Label htmlFor="min_threshold">Min Threshold</Label>
                  <Input
                    id="min_threshold"
                    type="number"
                    value={formData.min_threshold}
                    onChange={(e) => setFormData((prev) => ({ ...prev, min_threshold: parseInt(e.target.value) || 0 }))} />

                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))} />

                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))} />

                </div>
              </div>
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batch_number: e.target.value }))} />

              </div>
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))} />

              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))} />

              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingItem ? 'Update' : 'Add'} Stock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₹{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by product type, color, batch number, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
          <CardDescription>
            Manage your inventory items and monitor stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) =>
                <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_type}</div>
                        <div className="text-sm text-gray-500">{item.neck_type}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.color}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>
                      <Badge variant={item.quantity === 0 ? 'destructive' : item.quantity <= item.min_threshold ? 'outline' : 'secondary'}>
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity === 0 ?
                    <Badge variant="destructive">Out of Stock</Badge> :
                    item.quantity <= item.min_threshold ?
                    <Badge variant="outline">Low Stock</Badge> :

                    <Badge variant="secondary">In Stock</Badge>
                    }
                    </TableCell>
                    <TableCell>₹{item.cost_per_unit}</TableCell>
                    <TableCell>₹{item.selling_price}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredItems.length === 0 &&
          <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stock items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by adding your first stock item.'}
              </p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default StockManagement;