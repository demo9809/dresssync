import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Eye, EyeOff, RefreshCw, Mail, Lock, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  ID: number;
  agent_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  territory: string;
}

interface AgentPassword {
  agent_id: number;
  password: string;
  temp_password?: string;
  password_changed: boolean;
  last_password_change: string;
}

const AgentPasswordManagement: React.FC = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentPasswords, setAgentPasswords] = useState<AgentPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    loadAgents();
    loadAgentPasswords();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('11424', {
        PageNo: 1,
        PageSize: 1000,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: []
      });
      if (error) throw error;
      setAgents(data.List || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAgentPasswords = async () => {
    // In a real system, you would have a separate password table
    // For now, we'll simulate it with localStorage
    const stored = localStorage.getItem('agent_passwords');
    if (stored) {
      setAgentPasswords(JSON.parse(stored));
    }
  };

  const saveAgentPasswords = (passwords: AgentPassword[]) => {
    localStorage.setItem('agent_passwords', JSON.stringify(passwords));
    setAgentPasswords(passwords);
  };

  const generateRandomPassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const generatePasswordForAgent = async (agent: Agent) => {
    setIsGenerating(true);
    try {
      const newPass = generateRandomPassword();
      const existingIndex = agentPasswords.findIndex(p => p.agent_id === agent.ID);
      
      const updatedPasswords = [...agentPasswords];
      if (existingIndex >= 0) {
        updatedPasswords[existingIndex] = {
          ...updatedPasswords[existingIndex],
          temp_password: newPass,
          password_changed: false,
          last_password_change: new Date().toISOString()
        };
      } else {
        updatedPasswords.push({
          agent_id: agent.ID,
          password: newPass,
          temp_password: newPass,
          password_changed: false,
          last_password_change: new Date().toISOString()
        });
      }

      saveAgentPasswords(updatedPasswords);
      setNewPassword(newPass);
      setSelectedAgent(agent);

      toast({
        title: 'Password Generated',
        description: `Temporary password generated for ${agent.first_name} ${agent.last_name}`
      });
    } catch (error) {
      console.error('Error generating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate password',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPassword = async (agent: Agent, customPassword?: string) => {
    try {
      const password = customPassword || generateRandomPassword();
      const existingIndex = agentPasswords.findIndex(p => p.agent_id === agent.ID);
      
      const updatedPasswords = [...agentPasswords];
      if (existingIndex >= 0) {
        updatedPasswords[existingIndex] = {
          ...updatedPasswords[existingIndex],
          password: password,
          temp_password: password,
          password_changed: false,
          last_password_change: new Date().toISOString()
        };
      } else {
        updatedPasswords.push({
          agent_id: agent.ID,
          password: password,
          temp_password: password,
          password_changed: false,
          last_password_change: new Date().toISOString()
        });
      }

      saveAgentPasswords(updatedPasswords);

      toast({
        title: 'Password Reset',
        description: `Password reset for ${agent.first_name} ${agent.last_name}`
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive'
      });
    }
  };

  const sendPasswordEmail = async (agent: Agent) => {
    const agentPassword = agentPasswords.find(p => p.agent_id === agent.ID);
    if (!agentPassword?.temp_password) {
      toast({
        title: 'No Password',
        description: 'Please generate a password first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await window.ezsite.apis.sendEmail({
        from: 'support@ezsite.ai',
        to: [agent.email],
        subject: 'Your DressSync Account Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to DressSync</h2>
            <p>Dear ${agent.first_name} ${agent.last_name},</p>
            <p>Your account has been created with the following credentials:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> ${agent.email}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px; border-radius: 3px;">${agentPassword.temp_password}</code></p>
              <p><strong>Agent Code:</strong> ${agent.agent_code}</p>
            </div>
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            <p>You can access the system at: <a href="${window.location.origin}/login">${window.location.origin}/login</a></p>
            <p>If you have any questions, please contact your manager.</p>
            <p>Best regards,<br>DressSync Team</p>
          </div>
        `
      });

      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: `Login credentials sent to ${agent.email}`
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Email Error',
        description: 'Failed to send password email',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Password copied to clipboard'
    });
  };

  const getAgentPassword = (agentId: number) => {
    return agentPasswords.find(p => p.agent_id === agentId);
  };

  const filteredAgents = agents.filter(agent => 
    agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Agent Password Management</h2>
          <p className="text-gray-600">Manage agent login credentials and passwords</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
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
              <Key className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Passwords</p>
                <p className="text-2xl font-bold text-green-600">{agentPasswords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Password Reset</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {agentPasswords.filter(p => !p.password_changed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search agents by name, email, or agent code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Passwords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Credentials</CardTitle>
          <CardDescription>
            Manage login credentials for all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Agent Code</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password Status</TableHead>
                <TableHead>Last Changed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => {
                const agentPassword = getAgentPassword(agent.ID);
                return (
                  <TableRow key={agent.ID}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-gray-500">{agent.territory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{agent.agent_code}</Badge>
                    </TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>
                      {agentPassword ? (
                        <Badge variant={agentPassword.password_changed ? "default" : "secondary"}>
                          {agentPassword.password_changed ? "Changed" : "Temporary"}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">No Password</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {agentPassword?.last_password_change ? 
                        new Date(agentPassword.last_password_change).toLocaleDateString() : 
                        'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Key className="w-4 h-4 mr-1" />
                              Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Password - {agent.first_name} {agent.last_name}</DialogTitle>
                              <DialogDescription>
                                Generate, view, or reset password for this agent
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {agentPassword?.temp_password && (
                                <div>
                                  <Label>Current Password</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      value={agentPassword.temp_password}
                                      readOnly
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyToClipboard(agentPassword.temp_password || '')}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  onClick={() => generatePasswordForAgent(agent)}
                                  disabled={isGenerating}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Generate New Password
                                </Button>
                                
                                <Button 
                                  variant="outline"
                                  onClick={() => sendPasswordEmail(agent)}
                                  disabled={!agentPassword?.temp_password}
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Password Generation Dialog */}
      {selectedAgent && newPassword && (
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Password Generated Successfully</DialogTitle>
              <DialogDescription>
                New password for {selectedAgent.first_name} {selectedAgent.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Please save this password securely. It will not be shown again in plain text.
                </AlertDescription>
              </Alert>
              
              <div>
                <Label>Generated Password</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newPassword)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                Close
              </Button>
              <Button onClick={() => sendPasswordEmail(selectedAgent)}>
                <Mail className="w-4 h-4 mr-2" />
                Send via Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AgentPasswordManagement;