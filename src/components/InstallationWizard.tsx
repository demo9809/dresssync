import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, Database, User, Settings, Wrench } from 'lucide-react';

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string;}>;
  completed: boolean;
}

interface DatabaseConfig {
  dbType: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  sqlitePath: string;
  ssl: boolean;
}

interface AdminUser {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AppConfig {
  port: string;
  frontendUrl: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
}

const InstallationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [installationProgress, setInstallationProgress] = useState(0);

  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    dbType: 'sqlite',
    host: 'localhost',
    port: '5432',
    database: 'textile_manager',
    username: '',
    password: '',
    sqlitePath: './data/database.sqlite',
    ssl: false
  });

  const [adminUser, setAdminUser] = useState<AdminUser>({
    name: 'Administrator',
    email: 'admin@company.com',
    password: 'admin123',
    confirmPassword: 'admin123'
  });

  const [appConfig, setAppConfig] = useState<AppConfig>({
    port: '3001',
    frontendUrl: window.location.origin,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: ''
  });

  const steps: InstallationStep[] = [
  {
    id: 'database',
    title: 'Database Configuration',
    description: 'Configure your database connection',
    icon: Database,
    completed: false
  },
  {
    id: 'admin',
    title: 'Admin User',
    description: 'Create the administrator account',
    icon: User,
    completed: false
  },
  {
    id: 'settings',
    title: 'Application Settings',
    description: 'Configure application preferences',
    icon: Settings,
    completed: false
  },
  {
    id: 'install',
    title: 'Installation',
    description: 'Complete the installation process',
    icon: Wrench,
    completed: false
  }];


  const testDatabaseConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate database test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess('Database connection successful!');
    } catch (err) {
      setError('Database connection failed');
    } finally {
      setLoading(false);
    }
  };

  const performInstallation = async () => {
    setLoading(true);
    setError('');
    setInstallationProgress(0);

    try {
      // Simulate installation progress
      const progressSteps = [20, 40, 60, 80, 100];

      for (const progress of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setInstallationProgress(progress);
      }

      setSuccess('Installation completed successfully!');

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setError('Installation failed. Please check your configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Database
        if (dbConfig.dbType === 'sqlite') {
          return dbConfig.sqlitePath.length > 0;
        }
        return dbConfig.host && dbConfig.database && dbConfig.username;

      case 1: // Admin User
        return adminUser.name && adminUser.email && adminUser.password &&
        adminUser.password === adminUser.confirmPassword &&
        adminUser.password.length >= 6;

      case 2: // App Settings
        return appConfig.port && appConfig.frontendUrl;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError('');
      setSuccess('');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
      setSuccess('');
    }
  };

  const renderDatabaseStep = () =>
  <div className="space-y-6">
      <div>
        <Label htmlFor="dbType">Database Type</Label>
        <Select value={dbConfig.dbType} onValueChange={(value) => setDbConfig({ ...dbConfig, dbType: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sqlite">SQLite (Recommended for small deployments)</SelectItem>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dbConfig.dbType === 'sqlite' ?
    <div>
          <Label htmlFor="sqlitePath">Database File Path</Label>
          <Input
        id="sqlitePath"
        value={dbConfig.sqlitePath}
        onChange={(e) => setDbConfig({ ...dbConfig, sqlitePath: e.target.value })}
        placeholder="./data/database.sqlite" />

        </div> :

    <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="host">Host</Label>
              <Input
            id="host"
            value={dbConfig.host}
            onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
            placeholder="localhost" />

            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
            id="port"
            value={dbConfig.port}
            onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
            placeholder={dbConfig.dbType === 'postgresql' ? '5432' : '3306'} />

            </div>
          </div>
          
          <div>
            <Label htmlFor="database">Database Name</Label>
            <Input
          id="database"
          value={dbConfig.database}
          onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
          placeholder="textile_manager" />

          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
            id="username"
            value={dbConfig.username}
            onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
            placeholder="Username" />

            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
            id="password"
            type="password"
            value={dbConfig.password}
            onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
            placeholder="Password" />

            </div>
          </div>
        </>
    }

      <Button
      onClick={testDatabaseConnection}
      disabled={loading || !validateCurrentStep()}
      className="w-full">

        {loading ?
      <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing Connection...
          </> :

      'Test Database Connection'
      }
      </Button>
    </div>;


  const renderAdminStep = () =>
  <div className="space-y-6">
      <div>
        <Label htmlFor="adminName">Full Name</Label>
        <Input
        id="adminName"
        value={adminUser.name}
        onChange={(e) => setAdminUser({ ...adminUser, name: e.target.value })}
        placeholder="Administrator Name" />

      </div>
      
      <div>
        <Label htmlFor="adminEmail">Email Address</Label>
        <Input
        id="adminEmail"
        type="email"
        value={adminUser.email}
        onChange={(e) => setAdminUser({ ...adminUser, email: e.target.value })}
        placeholder="admin@company.com" />

      </div>
      
      <div>
        <Label htmlFor="adminPassword">Password</Label>
        <Input
        id="adminPassword"
        type="password"
        value={adminUser.password}
        onChange={(e) => setAdminUser({ ...adminUser, password: e.target.value })}
        placeholder="Minimum 6 characters" />

      </div>
      
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
        id="confirmPassword"
        type="password"
        value={adminUser.confirmPassword}
        onChange={(e) => setAdminUser({ ...adminUser, confirmPassword: e.target.value })}
        placeholder="Confirm your password" />

      </div>
      
      {adminUser.password && adminUser.confirmPassword && adminUser.password !== adminUser.confirmPassword &&
    <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Passwords do not match</AlertDescription>
        </Alert>
    }
    </div>;


  const renderSettingsStep = () =>
  <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="appPort">Application Port</Label>
          <Input
          id="appPort"
          value={appConfig.port}
          onChange={(e) => setAppConfig({ ...appConfig, port: e.target.value })}
          placeholder="3001" />

        </div>
        <div>
          <Label htmlFor="frontendUrl">Frontend URL</Label>
          <Input
          id="frontendUrl"
          value={appConfig.frontendUrl}
          onChange={(e) => setAppConfig({ ...appConfig, frontendUrl: e.target.value })}
          placeholder="http://localhost:3001" />

        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Configuration (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
            id="smtpHost"
            value={appConfig.smtpHost}
            onChange={(e) => setAppConfig({ ...appConfig, smtpHost: e.target.value })}
            placeholder="smtp.gmail.com" />

          </div>
          <div>
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
            id="smtpPort"
            value={appConfig.smtpPort}
            onChange={(e) => setAppConfig({ ...appConfig, smtpPort: e.target.value })}
            placeholder="587" />

          </div>
        </div>
        
        <div>
          <Label htmlFor="smtpUser">SMTP Username</Label>
          <Input
          id="smtpUser"
          value={appConfig.smtpUser}
          onChange={(e) => setAppConfig({ ...appConfig, smtpUser: e.target.value })}
          placeholder="your-email@gmail.com" />

        </div>
        
        <div>
          <Label htmlFor="smtpPassword">SMTP Password</Label>
          <Input
          id="smtpPassword"
          type="password"
          value={appConfig.smtpPassword}
          onChange={(e) => setAppConfig({ ...appConfig, smtpPassword: e.target.value })}
          placeholder="App password or SMTP password" />

        </div>
        
        <div>
          <Label htmlFor="smtpFrom">From Email</Label>
          <Input
          id="smtpFrom"
          value={appConfig.smtpFrom}
          onChange={(e) => setAppConfig({ ...appConfig, smtpFrom: e.target.value })}
          placeholder="noreply@company.com" />

        </div>
      </div>
    </div>;


  const renderInstallStep = () =>
  <div className="space-y-6 text-center">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Ready to Install</h3>
        <p className="text-gray-600">
          Review your configuration and click "Install" to complete the setup.
        </p>
      </div>
      
      <div className="space-y-4 text-left">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Database Configuration</h4>
          <p><strong>Type:</strong> {dbConfig.dbType}</p>
          {dbConfig.dbType === 'sqlite' ?
        <p><strong>Path:</strong> {dbConfig.sqlitePath}</p> :

        <>
              <p><strong>Host:</strong> {dbConfig.host}:{dbConfig.port}</p>
              <p><strong>Database:</strong> {dbConfig.database}</p>
            </>
        }
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Administrator</h4>
          <p><strong>Name:</strong> {adminUser.name}</p>
          <p><strong>Email:</strong> {adminUser.email}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Application Settings</h4>
          <p><strong>Port:</strong> {appConfig.port}</p>
          <p><strong>Frontend URL:</strong> {appConfig.frontendUrl}</p>
        </div>
      </div>
      
      {installationProgress > 0 &&
    <div className="space-y-2">
          <Progress value={installationProgress} className="w-full" />
          <p className="text-sm text-gray-600">
            Installation Progress: {installationProgress}%
          </p>
        </div>
    }
      
      <Button
      onClick={performInstallation}
      disabled={loading}
      className="w-full"
      size="lg">

        {loading ?
      <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Installing...
          </> :

      'Install Application'
      }
      </Button>
    </div>;


  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDatabaseStep();
      case 1:
        return renderAdminStep();
      case 2:
        return renderSettingsStep();
      case 3:
        return renderInstallStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Textile Manager Setup
          </h1>
          <p className="text-gray-600">
            Welcome! Let's get your textile management system configured.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ?
                    'bg-green-500 text-white' :
                    isActive ?
                    'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'}`
                    }>

                    {isCompleted ?
                    <CheckCircle className="w-6 h-6" /> :

                    <StepIcon className="w-6 h-6" />
                    }
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>);

            })}
          </div>
        </div>
        
        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error &&
            <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            }
            
            {success &&
            <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            }
            
            {renderStepContent()}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        {currentStep < steps.length - 1 &&
        <div className="flex justify-between">
            <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline">

              Previous
            </Button>
            <Button
            onClick={nextStep}
            disabled={!validateCurrentStep()}>

              Next
            </Button>
          </div>
        }
      </div>
    </div>);

};

export default InstallationWizard;