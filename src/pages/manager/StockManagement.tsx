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
      <div className="flex items-center justify-center h-64" data-id="f0schttag" data-path="src/pages/manager/StockManagement.tsx">
        <div className="text-lg" data-id="fykol13vn" data-path="src/pages/manager/StockManagement.tsx">Loading stock items...</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="pseo7q9w5" data-path="src/pages/manager/StockManagement.tsx">
      <div className="flex items-center justify-between" data-id="ui7ahxfh2" data-path="src/pages/manager/StockManagement.tsx">
        <div data-id="6oz4w3f6o" data-path="src/pages/manager/StockManagement.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="8fox2pklp" data-path="src/pages/manager/StockManagement.tsx">Stock Management</h1>
          <p className="text-gray-600" data-id="as1229i3d" data-path="src/pages/manager/StockManagement.tsx">Manage your inventory and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} data-id="27xeq6j99" data-path="src/pages/manager/StockManagement.tsx">
          <DialogTrigger asChild data-id="9ug9x0cts" data-path="src/pages/manager/StockManagement.tsx">
            <Button onClick={() => resetForm()} data-id="1v69fyya2" data-path="src/pages/manager/StockManagement.tsx">
              <Plus className="w-4 h-4 mr-2" data-id="jw3u3w5j7" data-path="src/pages/manager/StockManagement.tsx" />
              Add Stock Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-id="v84h8kp5o" data-path="src/pages/manager/StockManagement.tsx">
            <DialogHeader data-id="61ppbzd83" data-path="src/pages/manager/StockManagement.tsx">
              <DialogTitle data-id="1s23tx8eh" data-path="src/pages/manager/StockManagement.tsx">{editingItem ? 'Edit Stock Item' : 'Add New Stock Item'}</DialogTitle>
              <DialogDescription data-id="czmu91txp" data-path="src/pages/manager/StockManagement.tsx">
                {editingItem ? 'Update the stock item details below.' : 'Add a new item to your inventory.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto" data-id="7si2aqm8l" data-path="src/pages/manager/StockManagement.tsx">
              <div className="grid grid-cols-2 gap-4" data-id="iatkee97h" data-path="src/pages/manager/StockManagement.tsx">
                <div data-id="shxi4qyij" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="product_type" data-id="asss4ev9l" data-path="src/pages/manager/StockManagement.tsx">Product Type</Label>
                  <Select value={formData.product_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, product_type: value }))} data-id="4vueys8vc" data-path="src/pages/manager/StockManagement.tsx">
                    <SelectTrigger data-id="7xis80f32" data-path="src/pages/manager/StockManagement.tsx">
                      <SelectValue placeholder="Select product type" data-id="dkfv9hlf6" data-path="src/pages/manager/StockManagement.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="49m0skf39" data-path="src/pages/manager/StockManagement.tsx">
                      {productTypes.map((type) =>
                      <SelectItem key={type} value={type} data-id="qamzvrtdt" data-path="src/pages/manager/StockManagement.tsx">{type}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div data-id="9i7ut6okv" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="color" data-id="2bu9j9g2q" data-path="src/pages/manager/StockManagement.tsx">Color</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData((prev) => ({ ...prev, color: value }))} data-id="crg36zsff" data-path="src/pages/manager/StockManagement.tsx">
                    <SelectTrigger data-id="nkzfe1p7j" data-path="src/pages/manager/StockManagement.tsx">
                      <SelectValue placeholder="Select color" data-id="04ku6eku2" data-path="src/pages/manager/StockManagement.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="mud8oke4w" data-path="src/pages/manager/StockManagement.tsx">
                      {colors.map((color) =>
                      <SelectItem key={color} value={color} data-id="ixqycyagf" data-path="src/pages/manager/StockManagement.tsx">{color}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" data-id="1uul5cu98" data-path="src/pages/manager/StockManagement.tsx">
                <div data-id="dk1gd7gxo" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="neck_type" data-id="pchjktqrt" data-path="src/pages/manager/StockManagement.tsx">Neck Type</Label>
                  <Select value={formData.neck_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, neck_type: value }))} data-id="5hu3deqps" data-path="src/pages/manager/StockManagement.tsx">
                    <SelectTrigger data-id="pf6ul9oct" data-path="src/pages/manager/StockManagement.tsx">
                      <SelectValue placeholder="Select neck type" data-id="4fnv3d2k6" data-path="src/pages/manager/StockManagement.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="9tmghkyc7" data-path="src/pages/manager/StockManagement.tsx">
                      {neckTypes.map((type) =>
                      <SelectItem key={type} value={type} data-id="2v5onebkj" data-path="src/pages/manager/StockManagement.tsx">{type}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div data-id="8u220066b" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="size" data-id="k4d3r3p1j" data-path="src/pages/manager/StockManagement.tsx">Size</Label>
                  <Select value={formData.size} onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))} data-id="50rexsifx" data-path="src/pages/manager/StockManagement.tsx">
                    <SelectTrigger data-id="xd83bdchx" data-path="src/pages/manager/StockManagement.tsx">
                      <SelectValue placeholder="Select size" data-id="rddlkbb26" data-path="src/pages/manager/StockManagement.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="6jq0ypgcx" data-path="src/pages/manager/StockManagement.tsx">
                      {sizes.map((size) =>
                      <SelectItem key={size} value={size} data-id="0wixiz30h" data-path="src/pages/manager/StockManagement.tsx">{size}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" data-id="pmbyq1l2o" data-path="src/pages/manager/StockManagement.tsx">
                <div data-id="nr3axiuyl" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="quantity" data-id="dz3ywpsfh" data-path="src/pages/manager/StockManagement.tsx">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} data-id="2wi7bzvyn" data-path="src/pages/manager/StockManagement.tsx" />

                </div>
                <div data-id="f4ki8gkxz" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="min_threshold" data-id="c4afrpakr" data-path="src/pages/manager/StockManagement.tsx">Min Threshold</Label>
                  <Input
                    id="min_threshold"
                    type="number"
                    value={formData.min_threshold}
                    onChange={(e) => setFormData((prev) => ({ ...prev, min_threshold: parseInt(e.target.value) || 0 }))} data-id="bqciuef5q" data-path="src/pages/manager/StockManagement.tsx" />

                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" data-id="qy32qwog5" data-path="src/pages/manager/StockManagement.tsx">
                <div data-id="n6zmzge5w" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="cost_per_unit" data-id="nh33fmvk9" data-path="src/pages/manager/StockManagement.tsx">Cost per Unit</Label>
                  <Input
                    id="cost_per_unit"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))} data-id="jkp2dqqza" data-path="src/pages/manager/StockManagement.tsx" />

                </div>
                <div data-id="i90nbdwyv" data-path="src/pages/manager/StockManagement.tsx">
                  <Label htmlFor="selling_price" data-id="7jka794cw" data-path="src/pages/manager/StockManagement.tsx">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))} data-id="jlnxqmogd" data-path="src/pages/manager/StockManagement.tsx" />

                </div>
              </div>
              <div data-id="t8swlm31m" data-path="src/pages/manager/StockManagement.tsx">
                <Label htmlFor="batch_number" data-id="gipujzkec" data-path="src/pages/manager/StockManagement.tsx">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, batch_number: e.target.value }))} data-id="virg6o956" data-path="src/pages/manager/StockManagement.tsx" />

              </div>
              <div data-id="jrvlzqb9o" data-path="src/pages/manager/StockManagement.tsx">
                <Label htmlFor="supplier" data-id="ai66tbeyr" data-path="src/pages/manager/StockManagement.tsx">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))} data-id="nzl0t5xj0" data-path="src/pages/manager/StockManagement.tsx" />

              </div>
              <div data-id="mn26nbtl3" data-path="src/pages/manager/StockManagement.tsx">
                <Label htmlFor="purchase_date" data-id="cyw9cc698" data-path="src/pages/manager/StockManagement.tsx">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchase_date: e.target.value }))} data-id="d79o8mlks" data-path="src/pages/manager/StockManagement.tsx" />

              </div>
            </div>
            <DialogFooter data-id="8q1dhkya4" data-path="src/pages/manager/StockManagement.tsx">
              <Button variant="outline" onClick={resetForm} data-id="vj1xn5pir" data-path="src/pages/manager/StockManagement.tsx">Cancel</Button>
              <Button onClick={handleSave} data-id="vk3p4eib1" data-path="src/pages/manager/StockManagement.tsx">
                {editingItem ? 'Update' : 'Add'} Stock Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="k9mtu8eq6" data-path="src/pages/manager/StockManagement.tsx">
        <Card data-id="c8w0agzng" data-path="src/pages/manager/StockManagement.tsx">
          <CardContent className="p-6" data-id="eep8q56sa" data-path="src/pages/manager/StockManagement.tsx">
            <div className="flex items-center" data-id="6cy9hjqef" data-path="src/pages/manager/StockManagement.tsx">
              <Package className="h-8 w-8 text-blue-600" data-id="2k90ijbsn" data-path="src/pages/manager/StockManagement.tsx" />
              <div className="ml-4" data-id="0hjsp7shz" data-path="src/pages/manager/StockManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="f4zoiwgza" data-path="src/pages/manager/StockManagement.tsx">Total Items</p>
                <p className="text-2xl font-bold text-gray-900" data-id="xw6l3gqav" data-path="src/pages/manager/StockManagement.tsx">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="9lx5m7adf" data-path="src/pages/manager/StockManagement.tsx">
          <CardContent className="p-6" data-id="xy1mcn5q0" data-path="src/pages/manager/StockManagement.tsx">
            <div className="flex items-center" data-id="lz0sahpl2" data-path="src/pages/manager/StockManagement.tsx">
              <AlertTriangle className="h-8 w-8 text-orange-600" data-id="2cftxc6nh" data-path="src/pages/manager/StockManagement.tsx" />
              <div className="ml-4" data-id="4kfs3kcop" data-path="src/pages/manager/StockManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="mmm21zjna" data-path="src/pages/manager/StockManagement.tsx">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600" data-id="5h3y91avo" data-path="src/pages/manager/StockManagement.tsx">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="z6iz7rll5" data-path="src/pages/manager/StockManagement.tsx">
          <CardContent className="p-6" data-id="t1f64wsgi" data-path="src/pages/manager/StockManagement.tsx">
            <div className="flex items-center" data-id="7z0zd5kfq" data-path="src/pages/manager/StockManagement.tsx">
              <AlertTriangle className="h-8 w-8 text-red-600" data-id="ach0eism0" data-path="src/pages/manager/StockManagement.tsx" />
              <div className="ml-4" data-id="qih376swh" data-path="src/pages/manager/StockManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="f4rsdb1vw" data-path="src/pages/manager/StockManagement.tsx">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600" data-id="uw3ddzxuy" data-path="src/pages/manager/StockManagement.tsx">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="vm4o3l8b8" data-path="src/pages/manager/StockManagement.tsx">
          <CardContent className="p-6" data-id="o4t39vx6q" data-path="src/pages/manager/StockManagement.tsx">
            <div className="flex items-center" data-id="3raj83par" data-path="src/pages/manager/StockManagement.tsx">
              <Package className="h-8 w-8 text-green-600" data-id="u6dc2544c" data-path="src/pages/manager/StockManagement.tsx" />
              <div className="ml-4" data-id="4dhirn272" data-path="src/pages/manager/StockManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="amappt3jb" data-path="src/pages/manager/StockManagement.tsx">Total Value</p>
                <p className="text-2xl font-bold text-green-600" data-id="slnheaisq" data-path="src/pages/manager/StockManagement.tsx">₹{totalValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card data-id="k9z21bduh" data-path="src/pages/manager/StockManagement.tsx">
        <CardContent className="p-6" data-id="bm42kpqvb" data-path="src/pages/manager/StockManagement.tsx">
          <div className="flex flex-col sm:flex-row gap-4" data-id="02u4aqc54" data-path="src/pages/manager/StockManagement.tsx">
            <div className="flex-1" data-id="9mqtnxf3t" data-path="src/pages/manager/StockManagement.tsx">
              <div className="relative" data-id="dsd9l3z7g" data-path="src/pages/manager/StockManagement.tsx">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-id="259ldhr2f" data-path="src/pages/manager/StockManagement.tsx" />
                <Input
                  placeholder="Search by product type, color, batch number, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" data-id="9xmx02ecg" data-path="src/pages/manager/StockManagement.tsx" />

              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType} data-id="uzzfs6phh" data-path="src/pages/manager/StockManagement.tsx">
              <SelectTrigger className="w-48" data-id="xzmq3m5pc" data-path="src/pages/manager/StockManagement.tsx">
                <SelectValue placeholder="Filter by status" data-id="7grkvrnn4" data-path="src/pages/manager/StockManagement.tsx" />
              </SelectTrigger>
              <SelectContent data-id="0e70wk6xg" data-path="src/pages/manager/StockManagement.tsx">
                <SelectItem value="all" data-id="4ekvfk88a" data-path="src/pages/manager/StockManagement.tsx">All Items</SelectItem>
                <SelectItem value="low_stock" data-id="eim2tbkzo" data-path="src/pages/manager/StockManagement.tsx">Low Stock</SelectItem>
                <SelectItem value="out_of_stock" data-id="pjr6zrdar" data-path="src/pages/manager/StockManagement.tsx">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card data-id="2qikr6n11" data-path="src/pages/manager/StockManagement.tsx">
        <CardHeader data-id="j1vtsw3jt" data-path="src/pages/manager/StockManagement.tsx">
          <CardTitle data-id="fssee5n71" data-path="src/pages/manager/StockManagement.tsx">Stock Items</CardTitle>
          <CardDescription data-id="rerh7zn1j" data-path="src/pages/manager/StockManagement.tsx">
            Manage your inventory items and monitor stock levels
          </CardDescription>
        </CardHeader>
        <CardContent data-id="ag3jjqj34" data-path="src/pages/manager/StockManagement.tsx">
          <div className="overflow-x-auto" data-id="sf0j0s53b" data-path="src/pages/manager/StockManagement.tsx">
            <Table data-id="3tk9ln2va" data-path="src/pages/manager/StockManagement.tsx">
              <TableHeader data-id="rxt98rf6t" data-path="src/pages/manager/StockManagement.tsx">
                <TableRow data-id="yeineq9xa" data-path="src/pages/manager/StockManagement.tsx">
                  <TableHead data-id="f0rawt3yb" data-path="src/pages/manager/StockManagement.tsx">Product</TableHead>
                  <TableHead data-id="h6b0knoap" data-path="src/pages/manager/StockManagement.tsx">Color</TableHead>
                  <TableHead data-id="cgi891dvp" data-path="src/pages/manager/StockManagement.tsx">Size</TableHead>
                  <TableHead data-id="x9k39keuv" data-path="src/pages/manager/StockManagement.tsx">Quantity</TableHead>
                  <TableHead data-id="habw8mq6n" data-path="src/pages/manager/StockManagement.tsx">Status</TableHead>
                  <TableHead data-id="fmulq8g82" data-path="src/pages/manager/StockManagement.tsx">Cost</TableHead>
                  <TableHead data-id="lcflcbe63" data-path="src/pages/manager/StockManagement.tsx">Price</TableHead>
                  <TableHead data-id="ye9s85whw" data-path="src/pages/manager/StockManagement.tsx">Supplier</TableHead>
                  <TableHead data-id="9ljt4pytu" data-path="src/pages/manager/StockManagement.tsx">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-id="y3zrg07eb" data-path="src/pages/manager/StockManagement.tsx">
                {filteredItems.map((item) =>
                <TableRow key={item.id} data-id="azrp3nzu2" data-path="src/pages/manager/StockManagement.tsx">
                    <TableCell data-id="rqopax0ms" data-path="src/pages/manager/StockManagement.tsx">
                      <div data-id="m89w01bwk" data-path="src/pages/manager/StockManagement.tsx">
                        <div className="font-medium" data-id="wfj4yn98w" data-path="src/pages/manager/StockManagement.tsx">{item.product_type}</div>
                        <div className="text-sm text-gray-500" data-id="yyvu1oxsq" data-path="src/pages/manager/StockManagement.tsx">{item.neck_type}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="gde2t9as2" data-path="src/pages/manager/StockManagement.tsx">{item.color}</TableCell>
                    <TableCell data-id="j9an7oeyz" data-path="src/pages/manager/StockManagement.tsx">{item.size}</TableCell>
                    <TableCell data-id="nhlhpda27" data-path="src/pages/manager/StockManagement.tsx">
                      <Badge variant={item.quantity === 0 ? 'destructive' : item.quantity <= item.min_threshold ? 'outline' : 'secondary'} data-id="8foe3y8gh" data-path="src/pages/manager/StockManagement.tsx">
                        {item.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell data-id="bki5z7m71" data-path="src/pages/manager/StockManagement.tsx">
                      {item.quantity === 0 ?
                    <Badge variant="destructive" data-id="bhtljf25j" data-path="src/pages/manager/StockManagement.tsx">Out of Stock</Badge> :
                    item.quantity <= item.min_threshold ?
                    <Badge variant="outline" data-id="9z1t35wam" data-path="src/pages/manager/StockManagement.tsx">Low Stock</Badge> :

                    <Badge variant="secondary" data-id="jnm6nxyx8" data-path="src/pages/manager/StockManagement.tsx">In Stock</Badge>
                    }
                    </TableCell>
                    <TableCell data-id="2n8szvqr5" data-path="src/pages/manager/StockManagement.tsx">₹{item.cost_per_unit}</TableCell>
                    <TableCell data-id="r2b71q1qk" data-path="src/pages/manager/StockManagement.tsx">₹{item.selling_price}</TableCell>
                    <TableCell data-id="rsvdf4on8" data-path="src/pages/manager/StockManagement.tsx">{item.supplier}</TableCell>
                    <TableCell data-id="4gxq2dt87" data-path="src/pages/manager/StockManagement.tsx">
                      <div className="flex space-x-2" data-id="pmw8b1m3y" data-path="src/pages/manager/StockManagement.tsx">
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)} data-id="6rjrx867t" data-path="src/pages/manager/StockManagement.tsx">
                          <Edit className="w-4 h-4" data-id="f6kpj35qb" data-path="src/pages/manager/StockManagement.tsx" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} data-id="soq7oi2r6" data-path="src/pages/manager/StockManagement.tsx">
                          <Trash2 className="w-4 h-4" data-id="kvhf94b70" data-path="src/pages/manager/StockManagement.tsx" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredItems.length === 0 &&
          <div className="text-center py-8" data-id="ivlzjpegp" data-path="src/pages/manager/StockManagement.tsx">
              <Package className="mx-auto h-12 w-12 text-gray-400" data-id="mg8b4hpwd" data-path="src/pages/manager/StockManagement.tsx" />
              <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="aemqviex4" data-path="src/pages/manager/StockManagement.tsx">No stock items found</h3>
              <p className="mt-1 text-sm text-gray-500" data-id="2r0qw9k0q" data-path="src/pages/manager/StockManagement.tsx">
                {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by adding your first stock item.'}
              </p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default StockManagement;