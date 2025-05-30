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
    'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'
  ];

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

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.territory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const activeAgents = agents.filter(agent => agent.status === 'Active').length;
  const inactiveAgents = agents.filter(agent => agent.status === 'Inactive').length;
  const suspendedAgents = agents.filter(agent => agent.status === 'Suspended').length;
  const avgCommissionRate = agents.length > 0 ? agents.reduce((sum, agent) => sum + agent.commission_rate, 0) / agents.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">Manage your sales agents and their territories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
              <DialogDescription>
                {editingAgent ? 'Update the agent details below.' : 'Add a new sales agent to your team.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="territory">Territory</Label>
                <Select value={formData.territory} onValueChange={(value) => setFormData(prev => ({ ...prev, territory: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {territories.map(territory => (
                      <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="target_sales">Target Sales (₹)</Label>
                  <Input
                    id="target_sales"
                    type="number"
                    value={formData.target_sales}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_sales: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingAgent && (
                <div>
                  <Label htmlFor="agent_code">Agent Code</Label>
                  <Input
                    id="agent_code"
                    value={formData.agent_code}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingAgent ? 'Update' : 'Add'} Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-green-600">{activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-orange-600">{inactiveAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Commission</p>
                <p className="text-2xl font-bold text-purple-600">{avgCommissionRate.toFixed(1)}%</p>
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
                  placeholder="Search by name, email, agent code, or territory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            Manage your sales team and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-gray-500">{agent.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.agent_code}</Badge>
                    </TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {agent.territory}
                      </div>
                    </TableCell>
                    <TableCell>{agent.commission_rate}%</TableCell>
                    <TableCell>₹{agent.target_sales.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          agent.status === 'Active' ? 'default' : 
                          agent.status === 'Inactive' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(agent.hire_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(agent)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(agent.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAgents.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Get started by adding your first agent.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentManagement;