import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Users } from 'lucide-react';
import AgentPasswordManagement from '@/components/AgentPasswordManagement';

const PasswordManagement: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Password Management</h1>
          <p className="text-gray-600 mt-1">Manage agent passwords and access</p>
        </div>
        <Badge variant="default" className="w-fit">
          Manager Access
        </Badge>
      </div>

      {/* Password Management Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Agent Password Management</span>
          </CardTitle>
          <CardDescription>
            Reset passwords, manage agent access, and monitor login activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentPasswordManagement />
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordManagement;