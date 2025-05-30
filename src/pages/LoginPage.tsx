import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Lock, ShirtIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/agent/dashboard'} replace data-id="xu2g7wcw3" data-path="src/pages/LoginPage.tsx" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back to DressSync!"
        });
        // Navigation will be handled by the Navigate component above
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const fillDemoCredentials = (role: 'manager' | 'agent') => {
    if (role === 'manager') {
      setEmail('manager@dresssync.com');
      setPassword('manager123');
    } else {
      setEmail('agent@dresssync.com');
      setPassword('agent123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4" data-id="8ctyk9dsg" data-path="src/pages/LoginPage.tsx">
      <div className="w-full max-w-md" data-id="2c0lzbwrp" data-path="src/pages/LoginPage.tsx">
        {/* Header */}
        <div className="text-center mb-8" data-id="ih9wzexp8" data-path="src/pages/LoginPage.tsx">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4" data-id="nz6adduty" data-path="src/pages/LoginPage.tsx">
            <ShirtIcon className="w-8 h-8 text-white" data-id="i0j944ezl" data-path="src/pages/LoginPage.tsx" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-id="ua9bnseby" data-path="src/pages/LoginPage.tsx">DressSync</h1>
          <p className="text-gray-600" data-id="8x6vz4sfw" data-path="src/pages/LoginPage.tsx">Professional Apparel Management</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm" data-id="k1ae0abi5" data-path="src/pages/LoginPage.tsx">
          <CardHeader className="space-y-1 text-center" data-id="h4eyzmcpi" data-path="src/pages/LoginPage.tsx">
            <CardTitle className="text-2xl font-bold" data-id="j941n3ecc" data-path="src/pages/LoginPage.tsx">Sign In</CardTitle>
            <CardDescription data-id="fofqrzzn8" data-path="src/pages/LoginPage.tsx">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent data-id="gr2782y13" data-path="src/pages/LoginPage.tsx">
            <form onSubmit={handleSubmit} className="space-y-4" data-id="eqbf9n750" data-path="src/pages/LoginPage.tsx">
              {error &&
              <Alert variant="destructive" data-id="vclxvddy2" data-path="src/pages/LoginPage.tsx">
                  <AlertDescription data-id="sp46mpjoe" data-path="src/pages/LoginPage.tsx">{error}</AlertDescription>
                </Alert>
              }

              <div className="space-y-2" data-id="qnor510r3" data-path="src/pages/LoginPage.tsx">
                <Label htmlFor="email" data-id="jgtf78xtq" data-path="src/pages/LoginPage.tsx">Email</Label>
                <div className="relative" data-id="bdjhpvpnw" data-path="src/pages/LoginPage.tsx">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" data-id="1vx2g3hme" data-path="src/pages/LoginPage.tsx" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading} data-id="vrei3an20" data-path="src/pages/LoginPage.tsx" />

                </div>
              </div>

              <div className="space-y-2" data-id="h2598ccxp" data-path="src/pages/LoginPage.tsx">
                <Label htmlFor="password" data-id="3t4sjyady" data-path="src/pages/LoginPage.tsx">Password</Label>
                <div className="relative" data-id="2ko6cj8vt" data-path="src/pages/LoginPage.tsx">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" data-id="fo9nvxkjw" data-path="src/pages/LoginPage.tsx" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading} data-id="b018f029v" data-path="src/pages/LoginPage.tsx" />

                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading} data-id="ugy09bzo9" data-path="src/pages/LoginPage.tsx">

                {isLoading ?
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="r0e1mypri" data-path="src/pages/LoginPage.tsx" />
                    Signing in...
                  </> :

                'Sign In'
                }
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200" data-id="57mbhwymr" data-path="src/pages/LoginPage.tsx">
              <p className="text-sm text-gray-600 text-center mb-4" data-id="0jk1ytr9k" data-path="src/pages/LoginPage.tsx">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-3" data-id="fgkz8c0lg" data-path="src/pages/LoginPage.tsx">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('manager')}
                  disabled={isLoading}
                  className="flex flex-col items-center p-3 h-auto" data-id="xid6voy9i" data-path="src/pages/LoginPage.tsx">

                  <Badge variant="default" className="mb-1" data-id="ivrln03a8" data-path="src/pages/LoginPage.tsx">Manager</Badge>
                  <span className="text-xs text-gray-600" data-id="xnzophejw" data-path="src/pages/LoginPage.tsx">Full Access</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('agent')}
                  disabled={isLoading}
                  className="flex flex-col items-center p-3 h-auto" data-id="w3btopw3t" data-path="src/pages/LoginPage.tsx">

                  <Badge variant="secondary" className="mb-1" data-id="pycpidyh2" data-path="src/pages/LoginPage.tsx">Sales Agent</Badge>
                  <span className="text-xs text-gray-600" data-id="8udzoa4hn" data-path="src/pages/LoginPage.tsx">Order Management</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500" data-id="wef8o3a6z" data-path="src/pages/LoginPage.tsx">
          <p data-id="gyh1gytau" data-path="src/pages/LoginPage.tsx">&copy; 2024 DressSync. All rights reserved.</p>
        </div>
      </div>
    </div>);

};

export default LoginPage;