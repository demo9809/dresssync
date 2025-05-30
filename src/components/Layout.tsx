import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  LogOut,
  Plus,
  History,
  Settings } from
'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account."
    });
    navigate('/login');
  };

  const managerNavItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: Home },
  { path: '/manager/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/manager/stock', label: 'Stock Management', icon: Package },
  { path: '/manager/agents', label: 'Agent Management', icon: Users },
  { path: '/manager/reports', label: 'Reports', icon: BarChart3 }];


  const agentNavItems = [
  { path: '/agent/dashboard', label: 'Dashboard', icon: Home },
  { path: '/agent/orders/new', label: 'New Order', icon: Plus },
  { path: '/agent/orders', label: 'My Orders', icon: ShoppingCart },
  { path: '/agent/history', label: 'Order History', icon: History }];


  const navItems = user?.role === 'manager' ? managerNavItems : agentNavItems;

  const NavContent = () =>
  <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DS</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">DressSync</h2>
            <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'} className="text-xs">
              {user?.role === 'manager' ? 'Manager' : 'Sales Agent'}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
            isActive ?
            'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' :
            'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }>

              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>);

      })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full flex items-center justify-center space-x-2">

          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <NavContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">DS</span>
              </div>
              <h1 className="font-bold text-lg text-gray-900">DressSync</h1>
            </div>
          </div>
          
          <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'}>
            {user?.role === 'manager' ? 'Manager' : 'Agent'}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="py-4 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>);

};

export default Layout;