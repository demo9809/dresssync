import React, { useEffect, useState } from 'react';
import InstallationWizard from '@/components/InstallationWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

const InstallationPage: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      // For demo purposes, we'll assume installation is not complete
      // In production, this would check the actual backend
      const result = await window.ezsite.apis.getInstallationStatus();
      setIsInstalled(result.installed);
    } catch (error) {
      console.error('Failed to check installation status:', error);
      setIsInstalled(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Checking installation status...</span>
          </CardContent>
        </Card>
      </div>);

  }

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Installation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your Textile Manager system is already installed and configured.
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full">

              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>);

  }

  return <InstallationWizard />;
};

export default InstallationPage;