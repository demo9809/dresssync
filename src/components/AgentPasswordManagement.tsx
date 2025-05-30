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
      const existingIndex = agentPasswords.findIndex((p) => p.agent_id === agent.ID);

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
      const existingIndex = agentPasswords.findIndex((p) => p.agent_id === agent.ID);

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
    const agentPassword = agentPasswords.find((p) => p.agent_id === agent.ID);
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
    return agentPasswords.find((p) => p.agent_id === agentId);
  };

  const filteredAgents = agents.filter((agent) =>
  agent.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  agent.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  agent.agent_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-id="ac34qehti" data-path="src/components/AgentPasswordManagement.tsx">
        <div className="text-lg" data-id="mcl5w4nme" data-path="src/components/AgentPasswordManagement.tsx">Loading agents...</div>
      </div>);

  }

  return (
    <div className="space-y-6" data-id="vuaztuvao" data-path="src/components/AgentPasswordManagement.tsx">
      <div className="flex items-center justify-between" data-id="71n3teoab" data-path="src/components/AgentPasswordManagement.tsx">
        <div data-id="4veyednfm" data-path="src/components/AgentPasswordManagement.tsx">
          <h2 className="text-2xl font-bold text-gray-900" data-id="o1p7yromc" data-path="src/components/AgentPasswordManagement.tsx">Agent Password Management</h2>
          <p className="text-gray-600" data-id="zsa7ewtw4" data-path="src/components/AgentPasswordManagement.tsx">Manage agent login credentials and passwords</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-id="ehngcohun" data-path="src/components/AgentPasswordManagement.tsx">
        <Card data-id="6ygn8m2bz" data-path="src/components/AgentPasswordManagement.tsx">
          <CardContent className="p-6" data-id="t0pm047f7" data-path="src/components/AgentPasswordManagement.tsx">
            <div className="flex items-center" data-id="swrryqll7" data-path="src/components/AgentPasswordManagement.tsx">
              <Shield className="h-8 w-8 text-blue-600" data-id="g595ive05" data-path="src/components/AgentPasswordManagement.tsx" />
              <div className="ml-4" data-id="01ufg2q9n" data-path="src/components/AgentPasswordManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="mwannqzed" data-path="src/components/AgentPasswordManagement.tsx">Total Agents</p>
                <p className="text-2xl font-bold text-gray-900" data-id="ehfoy8p5d" data-path="src/components/AgentPasswordManagement.tsx">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="55oy7hutz" data-path="src/components/AgentPasswordManagement.tsx">
          <CardContent className="p-6" data-id="mosob8f88" data-path="src/components/AgentPasswordManagement.tsx">
            <div className="flex items-center" data-id="r4j5vn6wv" data-path="src/components/AgentPasswordManagement.tsx">
              <Key className="h-8 w-8 text-green-600" data-id="f281e3eot" data-path="src/components/AgentPasswordManagement.tsx" />
              <div className="ml-4" data-id="6yihi4fs8" data-path="src/components/AgentPasswordManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="7d13adu41" data-path="src/components/AgentPasswordManagement.tsx">With Passwords</p>
                <p className="text-2xl font-bold text-green-600" data-id="10ovu17n5" data-path="src/components/AgentPasswordManagement.tsx">{agentPasswords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-id="clon1oxhm" data-path="src/components/AgentPasswordManagement.tsx">
          <CardContent className="p-6" data-id="rigx4ck72" data-path="src/components/AgentPasswordManagement.tsx">
            <div className="flex items-center" data-id="rq5mphd5p" data-path="src/components/AgentPasswordManagement.tsx">
              <RefreshCw className="h-8 w-8 text-yellow-600" data-id="itzbbrd47" data-path="src/components/AgentPasswordManagement.tsx" />
              <div className="ml-4" data-id="2rwi3ghvg" data-path="src/components/AgentPasswordManagement.tsx">
                <p className="text-sm font-medium text-gray-600" data-id="fj7xmebzn" data-path="src/components/AgentPasswordManagement.tsx">Need Password Reset</p>
                <p className="text-2xl font-bold text-yellow-600" data-id="c5c2hzcie" data-path="src/components/AgentPasswordManagement.tsx">
                  {agentPasswords.filter((p) => !p.password_changed).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card data-id="nwzlugrly" data-path="src/components/AgentPasswordManagement.tsx">
        <CardContent className="p-6" data-id="a16yighgq" data-path="src/components/AgentPasswordManagement.tsx">
          <div className="flex items-center space-x-2" data-id="kdausad8p" data-path="src/components/AgentPasswordManagement.tsx">
            <Input
              placeholder="Search agents by name, email, or agent code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1" data-id="krsxxtpbg" data-path="src/components/AgentPasswordManagement.tsx" />

          </div>
        </CardContent>
      </Card>

      {/* Agent Passwords Table */}
      <Card data-id="izsz8nvru" data-path="src/components/AgentPasswordManagement.tsx">
        <CardHeader data-id="txfi27ekx" data-path="src/components/AgentPasswordManagement.tsx">
          <CardTitle data-id="fwamyu7vx" data-path="src/components/AgentPasswordManagement.tsx">Agent Credentials</CardTitle>
          <CardDescription data-id="ncekn9zl5" data-path="src/components/AgentPasswordManagement.tsx">
            Manage login credentials for all agents
          </CardDescription>
        </CardHeader>
        <CardContent data-id="ris5o54bo" data-path="src/components/AgentPasswordManagement.tsx">
          <Table data-id="m1ykjroqo" data-path="src/components/AgentPasswordManagement.tsx">
            <TableHeader data-id="zwrxm1rzj" data-path="src/components/AgentPasswordManagement.tsx">
              <TableRow data-id="i959y2r62" data-path="src/components/AgentPasswordManagement.tsx">
                <TableHead data-id="mll77wjsi" data-path="src/components/AgentPasswordManagement.tsx">Agent</TableHead>
                <TableHead data-id="4nmtu3b3l" data-path="src/components/AgentPasswordManagement.tsx">Agent Code</TableHead>
                <TableHead data-id="wyvxzokxa" data-path="src/components/AgentPasswordManagement.tsx">Email</TableHead>
                <TableHead data-id="ydh3i2050" data-path="src/components/AgentPasswordManagement.tsx">Password Status</TableHead>
                <TableHead data-id="0y6q6vvvz" data-path="src/components/AgentPasswordManagement.tsx">Last Changed</TableHead>
                <TableHead data-id="ueruam5pg" data-path="src/components/AgentPasswordManagement.tsx">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-id="4xina4d4m" data-path="src/components/AgentPasswordManagement.tsx">
              {filteredAgents.map((agent) => {
                const agentPassword = getAgentPassword(agent.ID);
                return (
                  <TableRow key={agent.ID} data-id="qk9qnwdiq" data-path="src/components/AgentPasswordManagement.tsx">
                    <TableCell data-id="cwdxczm8d" data-path="src/components/AgentPasswordManagement.tsx">
                      <div data-id="nosptjbpq" data-path="src/components/AgentPasswordManagement.tsx">
                        <div className="font-medium" data-id="hgf93hyg7" data-path="src/components/AgentPasswordManagement.tsx">{agent.first_name} {agent.last_name}</div>
                        <div className="text-sm text-gray-500" data-id="ckybls9l0" data-path="src/components/AgentPasswordManagement.tsx">{agent.territory}</div>
                      </div>
                    </TableCell>
                    <TableCell data-id="f3wzbh2vm" data-path="src/components/AgentPasswordManagement.tsx">
                      <Badge variant="outline" data-id="25chphtqy" data-path="src/components/AgentPasswordManagement.tsx">{agent.agent_code}</Badge>
                    </TableCell>
                    <TableCell data-id="rijgfjydo" data-path="src/components/AgentPasswordManagement.tsx">{agent.email}</TableCell>
                    <TableCell data-id="dzd41ed45" data-path="src/components/AgentPasswordManagement.tsx">
                      {agentPassword ?
                      <Badge variant={agentPassword.password_changed ? "default" : "secondary"} data-id="mylum6t5u" data-path="src/components/AgentPasswordManagement.tsx">
                          {agentPassword.password_changed ? "Changed" : "Temporary"}
                        </Badge> :

                      <Badge variant="destructive" data-id="tkoo3f6qw" data-path="src/components/AgentPasswordManagement.tsx">No Password</Badge>
                      }
                    </TableCell>
                    <TableCell data-id="krs68cwja" data-path="src/components/AgentPasswordManagement.tsx">
                      {agentPassword?.last_password_change ?
                      new Date(agentPassword.last_password_change).toLocaleDateString() :
                      'Never'
                      }
                    </TableCell>
                    <TableCell data-id="ld0jnpitw" data-path="src/components/AgentPasswordManagement.tsx">
                      <div className="flex items-center space-x-2" data-id="elm1zaxmi" data-path="src/components/AgentPasswordManagement.tsx">
                        <Dialog data-id="a9jcb2iht" data-path="src/components/AgentPasswordManagement.tsx">
                          <DialogTrigger asChild data-id="ow5019pya" data-path="src/components/AgentPasswordManagement.tsx">
                            <Button variant="outline" size="sm" data-id="22444m6ot" data-path="src/components/AgentPasswordManagement.tsx">
                              <Key className="w-4 h-4 mr-1" data-id="yb20kqktv" data-path="src/components/AgentPasswordManagement.tsx" />
                              Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-id="ghxigzng9" data-path="src/components/AgentPasswordManagement.tsx">
                            <DialogHeader data-id="w2imguc8b" data-path="src/components/AgentPasswordManagement.tsx">
                              <DialogTitle data-id="b7zdoqbxb" data-path="src/components/AgentPasswordManagement.tsx">Manage Password - {agent.first_name} {agent.last_name}</DialogTitle>
                              <DialogDescription data-id="224ohjcid" data-path="src/components/AgentPasswordManagement.tsx">
                                Generate, view, or reset password for this agent
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4" data-id="dqmi16x2q" data-path="src/components/AgentPasswordManagement.tsx">
                              {agentPassword?.temp_password &&
                              <div data-id="syreczjm3" data-path="src/components/AgentPasswordManagement.tsx">
                                  <Label data-id="3j13mj51v" data-path="src/components/AgentPasswordManagement.tsx">Current Password</Label>
                                  <div className="flex items-center space-x-2" data-id="e29e5jttz" data-path="src/components/AgentPasswordManagement.tsx">
                                    <Input
                                    type={showPassword ? "text" : "password"}
                                    value={agentPassword.temp_password}
                                    readOnly data-id="h0w5hiesl" data-path="src/components/AgentPasswordManagement.tsx" />

                                    <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)} data-id="9l5xlulf0" data-path="src/components/AgentPasswordManagement.tsx">

                                      {showPassword ? <EyeOff className="w-4 h-4" data-id="dywb68mrd" data-path="src/components/AgentPasswordManagement.tsx" /> : <Eye className="w-4 h-4" data-id="u61da51zx" data-path="src/components/AgentPasswordManagement.tsx" />}
                                    </Button>
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(agentPassword.temp_password || '')} data-id="townj5r36" data-path="src/components/AgentPasswordManagement.tsx">

                                      <Copy className="w-4 h-4" data-id="7zvf1fjh8" data-path="src/components/AgentPasswordManagement.tsx" />
                                    </Button>
                                  </div>
                                </div>
                              }
                              
                              <div className="flex flex-col space-y-2" data-id="e7egubphe" data-path="src/components/AgentPasswordManagement.tsx">
                                <Button
                                  onClick={() => generatePasswordForAgent(agent)}
                                  disabled={isGenerating} data-id="dt1hzmvx3" data-path="src/components/AgentPasswordManagement.tsx">

                                  <RefreshCw className="w-4 h-4 mr-2" data-id="y9c5zv76w" data-path="src/components/AgentPasswordManagement.tsx" />
                                  Generate New Password
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  onClick={() => sendPasswordEmail(agent)}
                                  disabled={!agentPassword?.temp_password} data-id="z5qtuyhjk" data-path="src/components/AgentPasswordManagement.tsx">

                                  <Mail className="w-4 h-4 mr-2" data-id="glxkwxtjf" data-path="src/components/AgentPasswordManagement.tsx" />
                                  Send Email
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>);

              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Password Generation Dialog */}
      {selectedAgent && newPassword &&
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)} data-id="k2ut0r5b9" data-path="src/components/AgentPasswordManagement.tsx">
          <DialogContent data-id="l3aar6w1i" data-path="src/components/AgentPasswordManagement.tsx">
            <DialogHeader data-id="xz8002l8o" data-path="src/components/AgentPasswordManagement.tsx">
              <DialogTitle data-id="v4yw3htma" data-path="src/components/AgentPasswordManagement.tsx">Password Generated Successfully</DialogTitle>
              <DialogDescription data-id="vsfp0l2si" data-path="src/components/AgentPasswordManagement.tsx">
                New password for {selectedAgent.first_name} {selectedAgent.last_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4" data-id="bhemz39vw" data-path="src/components/AgentPasswordManagement.tsx">
              <Alert data-id="tybjw4nls" data-path="src/components/AgentPasswordManagement.tsx">
                <Shield className="h-4 w-4" data-id="nnqunm4rr" data-path="src/components/AgentPasswordManagement.tsx" />
                <AlertDescription data-id="dqkbqox4c" data-path="src/components/AgentPasswordManagement.tsx">
                  Please save this password securely. It will not be shown again in plain text.
                </AlertDescription>
              </Alert>
              
              <div data-id="vpsctbvu2" data-path="src/components/AgentPasswordManagement.tsx">
                <Label data-id="mds726ehx" data-path="src/components/AgentPasswordManagement.tsx">Generated Password</Label>
                <div className="flex items-center space-x-2" data-id="xs5ut6xkb" data-path="src/components/AgentPasswordManagement.tsx">
                  <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  readOnly
                  className="font-mono" data-id="b3a6vbalo" data-path="src/components/AgentPasswordManagement.tsx" />

                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)} data-id="ntbsece2z" data-path="src/components/AgentPasswordManagement.tsx">

                    {showPassword ? <EyeOff className="w-4 h-4" data-id="xhxxrnpks" data-path="src/components/AgentPasswordManagement.tsx" /> : <Eye className="w-4 h-4" data-id="ivergpf41" data-path="src/components/AgentPasswordManagement.tsx" />}
                  </Button>
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newPassword)} data-id="14ozyj4ms" data-path="src/components/AgentPasswordManagement.tsx">

                    <Copy className="w-4 h-4" data-id="io3l1a5eq" data-path="src/components/AgentPasswordManagement.tsx" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter data-id="tdzvz5365" data-path="src/components/AgentPasswordManagement.tsx">
              <Button variant="outline" onClick={() => setSelectedAgent(null)} data-id="3qr2tyy53" data-path="src/components/AgentPasswordManagement.tsx">
                Close
              </Button>
              <Button onClick={() => sendPasswordEmail(selectedAgent)} data-id="67gy8er01" data-path="src/components/AgentPasswordManagement.tsx">
                <Mail className="w-4 h-4 mr-2" data-id="lac5axhts" data-path="src/components/AgentPasswordManagement.tsx" />
                Send via Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    </div>);

};

export default AgentPasswordManagement;