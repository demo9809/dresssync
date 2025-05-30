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
import { Plus, Edit, Trash2, Users, Search, MapPin, Target, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: number;
  user_id: number;
  agent_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  territory: string;
  commission_rate: number;
  hire_date: string;
  status: string;
  target_sales: number;
}

const AgentManagement: React.FC = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    user_id: 0,
    agent_code: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    territory: '',
    commission_rate: 5,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    target_sales: 50000
  });

  const territories = [
  'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi',
  'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];


  const statusOptions = ['Active', 'Inactive', 'Suspended'];

  useEffect(() => {
    fetchAgents();
  }, []);

  const generateAgentCode = () => {
    const prefix = 'AG';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(11424, {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'id',
        IsAsc: false,
        Filters: []
      });

      if (error) throw error;
      setAgents(data.List || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Generate agent code if not editing
      const saveData = {
        ...formData,
        agent_code: editingAgent ? formData.agent_code : generateAgentCode()
      };

      if (editingAgent) {
        // Update existing agent
        const { error } = await window.ezsite.apis.tableUpdate(11424, {
          id: editingAgent.id,
          ...saveData
        });
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Agent updated successfully'
        });
      } else {
        // Create new agent
        const { error } = await window.ezsite.apis.tableCreate(11424, saveData);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Agent added successfully'
        });
      }

      resetForm();
      fetchAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to save agent',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const { error } = await window.ezsite.apis.tableDelete(11424, { id });
      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Agent deleted successfully'
      });
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: 0,
      agent_code: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      territory: '',
      commission_rate: 5,
      hire_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      target_sales: 50000
    });
    setEditingAgent(null);
    setIsAddDialogOpen(false);
  };

  const startEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      user_id: agent.user_id,
      agent_code: agent.agent_code,
      first_name: agent.first_name,
      last_name: agent.last_name,
      phone: agent.phone,
      email: agent.email,
      territory: agent.territory,
      commission_rate: agent.commission_rate,
      hire_date: agent.hire_date.split('T')[0],
      status: agent.status,
      target_sales: agent.target_sales
    });
    setIsAddDialogOpen(true);
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
    agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.territory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const activeAgents = agents.filter((agent) => agent.status === 'Active').length;
  const inactiveAgents = agents.filter((agent) => agent.status === 'Inactive').length;
  const suspendedAgents = agents.filter((agent) => agent.status === 'Suspended').length;
  const avgCommissionRate = agents.length > 0 ? agents.reduce((sum, agent) => sum + agent.commission_rate, 0) / agents.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-id="kj26gn8x0" data-path="src/pages/manager/AgentManagement.tsx">
        <div className="text-lg" data-id="qp2xaf54e" data-path="src/pages/manager/AgentManagement.tsx">Loading agents...</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="6gzzs8ade" data-path="src/pages/manager/AgentManagement.tsx">
      <div className="flex items-center justify-between" data-id="0v3ylant4" data-path="src/pages/manager/AgentManagement.tsx">
        <div data-id="9siskrufa" data-path="src/pages/manager/AgentManagement.tsx">
          <h1 className="text-3xl font-bold text-gray-900" data-id="fuh5bkjy4" data-path="src/pages/manager/AgentManagement.tsx">Agent Management</h1>
          <p className="text-gray-600" data-id="ncwqan9ws" data-path="src/pages/manager/AgentManagement.tsx">Manage your sales agents and their territories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} data-id="5zc45s54r" data-path="src/pages/manager/AgentManagement.tsx">
          <DialogTrigger asChild data-id="rjeqfl7ue" data-path="src/pages/manager/AgentManagement.tsx">
            <Button onClick={() => resetForm()} data-id="83qf75zqa" data-path="src/pages/manager/AgentManagement.tsx">
              <Plus className="w-4 h-4 mr-2" data-id="dc6ofgkpq" data-path="src/pages/manager/AgentManagement.tsx" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-id="n36pbk4jz" data-path="src/pages/manager/AgentManagement.tsx">
            <DialogHeader data-id="8m3v8yk32" data-path="src/pages/manager/AgentManagement.tsx">
              <DialogTitle data-id="5gml5yqxo" data-path="src/pages/manager/AgentManagement.tsx">{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
              <DialogDescription data-id="nvgq8r9py" data-path="src/pages/manager/AgentManagement.tsx">
                {editingAgent ? 'Update the agent details below.' : 'Add a new sales agent to your team.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto" data-id="qgbwhl8cf" data-path="src/pages/manager/AgentManagement.tsx">
              <div className="grid grid-cols-2 gap-4" data-id="r2phxbc93" data-path="src/pages/manager/AgentManagement.tsx">
                <div data-id="jw1kumf3l" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="first_name" data-id="i7jmsem0x" data-path="src/pages/manager/AgentManagement.tsx">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                    required data-id="tdqgozfa3" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
                <div data-id="vukqbmoja" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="last_name" data-id="n376peolg" data-path="src/pages/manager/AgentManagement.tsx">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                    required data-id="w3fmnoiru" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
              </div>
              <div data-id="lcuj0k6vw" data-path="src/pages/manager/AgentManagement.tsx">
                <Label htmlFor="email" data-id="xyfxkx2an" data-path="src/pages/manager/AgentManagement.tsx">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required data-id="ha5r915mt" data-path="src/pages/manager/AgentManagement.tsx" />

              </div>
              <div data-id="j74ludk2l" data-path="src/pages/manager/AgentManagement.tsx">
                <Label htmlFor="phone" data-id="4o9cwyhgy" data-path="src/pages/manager/AgentManagement.tsx">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  required data-id="dsnsqqia7" data-path="src/pages/manager/AgentManagement.tsx" />

              </div>
              <div data-id="a2d0oen5w" data-path="src/pages/manager/AgentManagement.tsx">
                <Label htmlFor="territory" data-id="qk443kiz3" data-path="src/pages/manager/AgentManagement.tsx">Territory</Label>
                <Select value={formData.territory} onValueChange={(value) => setFormData((prev) => ({ ...prev, territory: value }))} data-id="8d240kxuk" data-path="src/pages/manager/AgentManagement.tsx">
                  <SelectTrigger data-id="vg7b1iga1" data-path="src/pages/manager/AgentManagement.tsx">
                    <SelectValue placeholder="Select territory" data-id="yml4sb8jm" data-path="src/pages/manager/AgentManagement.tsx" />
                  </SelectTrigger>
                  <SelectContent data-id="htw14x6up" data-path="src/pages/manager/AgentManagement.tsx">
                    {territories.map((territory) =>
                    <SelectItem key={territory} value={territory} data-id="jsojr0uhc" data-path="src/pages/manager/AgentManagement.tsx">{territory}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4" data-id="09hvgzk3p" data-path="src/pages/manager/AgentManagement.tsx">
                <div data-id="mbn3x6a9s" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="commission_rate" data-id="xi869j1v4" data-path="src/pages/manager/AgentManagement.tsx">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))} data-id="bxi0uanof" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
                <div data-id="kidw5iwu1" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="target_sales" data-id="qxfrr12of" data-path="src/pages/manager/AgentManagement.tsx">Target Sales (₹)</Label>
                  <Input
                    id="target_sales"
                    type="number"
                    value={formData.target_sales}
                    onChange={(e) => setFormData((prev) => ({ ...prev, target_sales: parseInt(e.target.value) || 0 }))} data-id="vz19ntp0u" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" data-id="sn167hj35" data-path="src/pages/manager/AgentManagement.tsx">
                <div data-id="ppasnsafi" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="hire_date" data-id="bc8qrxosn" data-path="src/pages/manager/AgentManagement.tsx">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hire_date: e.target.value }))} data-id="opx42tw1s" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
                <div data-id="kzunbynh8" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="status" data-id="1x0kbpjml" data-path="src/pages/manager/AgentManagement.tsx">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))} data-id="tvmaitu3v" data-path="src/pages/manager/AgentManagement.tsx">
                    <SelectTrigger data-id="i7fwy42yg" data-path="src/pages/manager/AgentManagement.tsx">
                      <SelectValue placeholder="Select status" data-id="rhhbo4sx3" data-path="src/pages/manager/AgentManagement.tsx" />
                    </SelectTrigger>
                    <SelectContent data-id="b1zvrtrkh" data-path="src/pages/manager/AgentManagement.tsx">
                      {statusOptions.map((status) =>
                      <SelectItem key={status} value={status} data-id="0s2vjv2dy" data-path="src/pages/manager/AgentManagement.tsx">{status}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingAgent &&
              <div data-id="bsy0rup5c" data-path="src/pages/manager/AgentManagement.tsx">
                  <Label htmlFor="agent_code" data-id="4xfj1qida" data-path="src/pages/manager/AgentManagement.tsx">Agent Code</Label>
                  <Input
                  id="agent_code"
                  value={formData.agent_code}
                  disabled
                  className="bg-gray-100" data-id="y8ah6e5x9" data-path="src/pages/manager/AgentManagement.tsx" />

                </div>
              }
            </div>
            <DialogFooter data-id="6r1ju6f0l" data-path="src/pages/manager/AgentManagement.tsx">
              <Button variant="outline" onClick={resetForm} data-id="ljbxe73fd" data-path="src/pages/manager/AgentManagement.tsx">Cancel</Button>
              <Button onClick={handleSave} data-id="pa7iq4914" data-path="src/pages/manager/AgentManagement.tsx">
                {editingAgent ? 'Update' : 'Add'} Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-id="aqsfan4vb" data-path="src/pages/manager/AgentManagement.tsx">
        <Card data-id="1hx50b5q8" data-path="src/pages/manager/AgentManagement.tsx">
          <CardContent className="p-6" data-id="2nhjfwyn6" data-path="src/pages/manager/AgentManagement.tsx">
            <div className="flex items-center" data-id="ip10wnnew" data-path="src/pages/manager/AgentManagement.tsx">
              <Users className="h-8 w-8 text-blue-600" data-id="i0g1vaee6" data-path="src/pages/manager/AgentManagement.tsx" />
              <div className="ml-4" data-id="vd2dyka3e" data-path="src/pages/manager/AgentManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="rznv1qi3x" data-path="src/pages/manager/AgentManagement.tsx">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900" data-id="z3i5h5814" data-path="src/pages/manager/AgentManagement.tsx">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="j2ql649f9" data-path="src/pages/manager/AgentManagement.tsx">
          <CardContent className="p-6" data-id="lez34vpnq" data-path="src/pages/manager/AgentManagement.tsx">
            <div className="flex items-center" data-id="8e5zwwbox" data-path="src/pages/manager/AgentManagement.tsx">
              <Users className="h-8 w-8 text-green-600" data-id="smdmexsa0" data-path="src/pages/manager/AgentManagement.tsx" />
              <div className="ml-4" data-id="eszplxrla" data-path="src/pages/manager/AgentManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="wd7ggxemt" data-path="src/pages/manager/AgentManagement.tsx">Active Agents</p>
                <p className="text-2xl font-bold text-green-600" data-id="dviyyi9zs" data-path="src/pages/manager/AgentManagement.tsx">{activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="pxfa26i3m" data-path="src/pages/manager/AgentManagement.tsx">
          <CardContent className="p-6" data-id="qu27zxi84" data-path="src/pages/manager/AgentManagement.tsx">
            <div className="flex items-center" data-id="rwvv7wxic" data-path="src/pages/manager/AgentManagement.tsx">
              <Users className="h-8 w-8 text-orange-600" data-id="yfidxrem9" data-path="src/pages/manager/AgentManagement.tsx" />
              <div className="ml-4" data-id="or07idoao" data-path="src/pages/manager/AgentManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="zna4ycnly" data-path="src/pages/manager/AgentManagement.tsx">Inactive</p>
                <p className="text-2xl font-bold text-orange-600" data-id="k6yxsa9wx" data-path="src/pages/manager/AgentManagement.tsx">{inactiveAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="i0ub0q7wn" data-path="src/pages/manager/AgentManagement.tsx">
          <CardContent className="p-6" data-id="g24ys1753" data-path="src/pages/manager/AgentManagement.tsx">
            <div className="flex items-center" data-id="7l9isluzn" data-path="src/pages/manager/AgentManagement.tsx">
              <Target className="h-8 w-8 text-purple-600" data-id="91uyq3ieo" data-path="src/pages/manager/AgentManagement.tsx" />
              <div className="ml-4" data-id="0vp1tkd7p" data-path="src/pages/manager/AgentManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="dptp9oo05" data-path="src/pages/manager/AgentManagement.tsx">Avg Commission</p>
                <p className="text-2xl font-bold text-purple-600" data-id="f2his0o0d" data-path="src/pages/manager/AgentManagement.tsx">{avgCommissionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card data-id="xhtudfh5i" data-path="src/pages/manager/AgentManagement.tsx">
        <CardContent className="p-6" data-id="siwnpzc2c" data-path="src/pages/manager/AgentManagement.tsx">
          <div className="flex flex-col sm:flex-row gap-4" data-id="lv6bdwr78" data-path="src/pages/manager/AgentManagement.tsx">
            <div className="flex-1" data-id="hyge6expm" data-path="src/pages/manager/AgentManagement.tsx">
              <div className="relative" data-id="s3hk5bguf" data-path="src/pages/manager/AgentManagement.tsx">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" data-id="6xu4atest" data-path="src/pages/manager/AgentManagement.tsx" />
                <Input
                  placeholder="Search by name, email, agent code, or territory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" data-id="tefkrsiqc" data-path="src/pages/manager/AgentManagement.tsx" />

              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus} data-id="yvm9sj0c1" data-path="src/pages/manager/AgentManagement.tsx">
              <SelectTrigger className="w-48" data-id="njj86c1rs" data-path="src/pages/manager/AgentManagement.tsx">
                <SelectValue placeholder="Filter by status" data-id="gvae4f686" data-path="src/pages/manager/AgentManagement.tsx" />
              </SelectTrigger>
              <SelectContent data-id="7ggf6tf9e" data-path="src/pages/manager/AgentManagement.tsx">
                <SelectItem value="all" data-id="ujq00lxln" data-path="src/pages/manager/AgentManagement.tsx">All Statuses</SelectItem>
                <SelectItem value="Active" data-id="u91j4p9fl" data-path="src/pages/manager/AgentManagement.tsx">Active</SelectItem>
                <SelectItem value="Inactive" data-id="rv51h2z5s" data-path="src/pages/manager/AgentManagement.tsx">Inactive</SelectItem>
                <SelectItem value="Suspended" data-id="m439s0sby" data-path="src/pages/manager/AgentManagement.tsx">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card data-id="r46qfwu8t" data-path="src/pages/manager/AgentManagement.tsx">
        <CardHeader data-id="hwlc8vr5s" data-path="src/pages/manager/AgentManagement.tsx">
          <CardTitle data-id="brtmhy3mm" data-path="src/pages/manager/AgentManagement.tsx">Agents</CardTitle>
          <CardDescription data-id="3givv1bdv" data-path="src/pages/manager/AgentManagement.tsx">
            Manage your sales team and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent data-id="5nsv6i2q3" data-path="src/pages/manager/AgentManagement.tsx">
          <div className="overflow-x-auto" data-id="pszou74da" data-path="src/pages/manager/AgentManagement.tsx">
            <Table data-id="wjegyrnpr" data-path="src/pages/manager/AgentManagement.tsx">
              <TableHeader data-id="m4yzbeibk" data-path="src/pages/manager/AgentManagement.tsx">
                <TableRow data-id="k3ccisyvn" data-path="src/pages/manager/AgentManagement.tsx">
                  <TableHead data-id="0e8ftj6hv" data-path="src/pages/manager/AgentManagement.tsx">Agent</TableHead>
                  <TableHead data-id="2b7qykhjp" data-path="src/pages/manager/AgentManagement.tsx">Code</TableHead>
                  <TableHead data-id="y0akrgfg7" data-path="src/pages/manager/AgentManagement.tsx">Contact</TableHead>
                  <TableHead data-id="8xlt9v67k" data-path="src/pages/manager/AgentManagement.tsx">Territory</TableHead>
                  <TableHead data-id="3bmhtutkl" data-path="src/pages/manager/AgentManagement.tsx">Commission</TableHead>
                  <TableHead data-id="expon4v92" data-path="src/pages/manager/AgentManagement.tsx">Target</TableHead>
                  <TableHead data-id="u983a87fs" data-path="src/pages/manager/AgentManagement.tsx">Status</TableHead>
                  <TableHead data-id="fzs8eej7r" data-path="src/pages/manager/AgentManagement.tsx">Hire Date</TableHead>
                  <TableHead data-id="rebx0ya6v" data-path="src/pages/manager/AgentManagement.tsx">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-id="ngdcgh06g" data-path="src/pages/manager/AgentManagement.tsx">
                {filteredAgents.map((agent) =>
                <TableRow key={agent.id} data-id="s522yp23p" data-path="src/pages/manager/AgentManagement.tsx">
                    <TableCell data-id="zpy497396" data-path="src/pages/manager/AgentManagement.tsx">
                      <div data-id="u0mg5lysk" data-path="src/pages/manager/AgentManagement.tsx">
                        <div className="font-medium" data-id="j4x1jdt3i" data-path="src/pages/manager/AgentManagement.tsx">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-gray-500" data-id="d9suf1q46" data-path="src/pages/manager/AgentManagement.tsx">{agent.email}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="z9o7cmyi3" data-path="src/pages/manager/AgentManagement.tsx">
                      <Badge variant="outline" data-id="x59lak0gr" data-path="src/pages/manager/AgentManagement.tsx">{agent.agent_code}</Badge>
                    </TableCell>
                    <TableCell data-id="wez36z4kr" data-path="src/pages/manager/AgentManagement.tsx">{agent.phone}</TableCell>
                    <TableCell data-id="ax5sqtr96" data-path="src/pages/manager/AgentManagement.tsx">
                      <div className="flex items-center" data-id="z80ccke32" data-path="src/pages/manager/AgentManagement.tsx">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" data-id="72aj0eegf" data-path="src/pages/manager/AgentManagement.tsx" />
                        {agent.territory}
                      </div>
                    </TableCell>
                    <TableCell data-id="93jgokgko" data-path="src/pages/manager/AgentManagement.tsx">{agent.commission_rate}%</TableCell>
                    <TableCell data-id="kigrm3p6n" data-path="src/pages/manager/AgentManagement.tsx">₹{agent.target_sales.toLocaleString()}</TableCell>
                    <TableCell data-id="uq94uny9b" data-path="src/pages/manager/AgentManagement.tsx">
                      <Badge
                      variant={
                      agent.status === 'Active' ? 'default' :
                      agent.status === 'Inactive' ? 'secondary' :
                      'destructive'
                      } data-id="qzmdfri5c" data-path="src/pages/manager/AgentManagement.tsx">

                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-id="82qg8wasp" data-path="src/pages/manager/AgentManagement.tsx">
                      <div className="flex items-center" data-id="szhacafch" data-path="src/pages/manager/AgentManagement.tsx">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" data-id="9jxg9ssfl" data-path="src/pages/manager/AgentManagement.tsx" />
                        {new Date(agent.hire_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell data-id="dd2kcz0e8" data-path="src/pages/manager/AgentManagement.tsx">
                      <div className="flex space-x-2" data-id="qkheueaug" data-path="src/pages/manager/AgentManagement.tsx">
                        <Button variant="outline" size="sm" onClick={() => startEdit(agent)} data-id="vj1dx5omq" data-path="src/pages/manager/AgentManagement.tsx">
                          <Edit className="w-4 h-4" data-id="pp63bupyc" data-path="src/pages/manager/AgentManagement.tsx" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(agent.id)} data-id="9rt8gw8bh" data-path="src/pages/manager/AgentManagement.tsx">
                          <Trash2 className="w-4 h-4" data-id="xj2hfhkt7" data-path="src/pages/manager/AgentManagement.tsx" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredAgents.length === 0 &&
          <div className="text-center py-8" data-id="w3iyq7v9k" data-path="src/pages/manager/AgentManagement.tsx">
              <Users className="mx-auto h-12 w-12 text-gray-400" data-id="83km1g7x2" data-path="src/pages/manager/AgentManagement.tsx" />
              <h3 className="mt-2 text-sm font-medium text-gray-900" data-id="mntbsp1nu" data-path="src/pages/manager/AgentManagement.tsx">No agents found</h3>
              <p className="mt-1 text-sm text-gray-500" data-id="ugvml6sei" data-path="src/pages/manager/AgentManagement.tsx">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by adding your first agent.'}
              </p>
            </div>
          }
        </CardContent>
      </Card>
    </div>);

};

export default AgentManagement;