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
  <div className="flex flex-col h-full" data-id="fbcb3n3yo" data-path="src/components/Layout.tsx">
      <div className="flex items-center justify-between p-4 border-b" data-id="lrl68ytxu" data-path="src/components/Layout.tsx">
        <div className="flex items-center space-x-3" data-id="dnltb91ai" data-path="src/components/Layout.tsx">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center" data-id="n3hq39ud1" data-path="src/components/Layout.tsx">
            <span className="text-white font-bold text-sm" data-id="zto6e9fhk" data-path="src/components/Layout.tsx">DS</span>
          </div>
          <div data-id="ehx9k4vjw" data-path="src/components/Layout.tsx">
            <h2 className="font-bold text-lg text-gray-900" data-id="vffdp0ahw" data-path="src/components/Layout.tsx">DressSync</h2>
            <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'} className="text-xs" data-id="2sqmzl1bf" data-path="src/components/Layout.tsx">
              {user?.role === 'manager' ? 'Manager' : 'Sales Agent'}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2" data-id="u1ohqqdmc" data-path="src/components/Layout.tsx">
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
            } data-id="v0tmb91bc" data-path="src/components/Layout.tsx">

              <Icon size={20} data-id="i2qqbe3kw" data-path="src/components/Layout.tsx" />
              <span className="font-medium" data-id="39aqptfzf" data-path="src/components/Layout.tsx">{item.label}</span>
            </Link>);

      })}
      </nav>

      <div className="p-4 border-t" data-id="5pod6y0g0" data-path="src/components/Layout.tsx">
        <div className="flex items-center space-x-3 mb-4" data-id="uew87xttt" data-path="src/components/Layout.tsx">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center" data-id="mpgf5urfh" data-path="src/components/Layout.tsx">
            <span className="text-white font-bold" data-id="isucramgv" data-path="src/components/Layout.tsx">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0" data-id="vc2k4n490" data-path="src/components/Layout.tsx">
            <p className="font-medium text-gray-900 truncate" data-id="8qwystd84" data-path="src/components/Layout.tsx">{user?.name}</p>
            <p className="text-sm text-gray-500 truncate" data-id="ph7ez149s" data-path="src/components/Layout.tsx">{user?.email}</p>
          </div>
        </div>
        
        <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full flex items-center justify-center space-x-2" data-id="rzht55fn7" data-path="src/components/Layout.tsx">

          <LogOut size={16} data-id="crujt0b2t" data-path="src/components/Layout.tsx" />
          <span data-id="bhwkdiq9i" data-path="src/components/Layout.tsx">Logout</span>
        </Button>
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-gray-50" data-id="0swvh34sw" data-path="src/components/Layout.tsx">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col" data-id="ztl95x0b0" data-path="src/components/Layout.tsx">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm" data-id="xri0xuztc" data-path="src/components/Layout.tsx">
          <NavContent data-id="w1yxdju2i" data-path="src/components/Layout.tsx" />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden" data-id="09tuzcuvx" data-path="src/components/Layout.tsx">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 shadow-sm" data-id="921r4dhzu" data-path="src/components/Layout.tsx">
          <div className="flex items-center space-x-3" data-id="ov7cqf8rh" data-path="src/components/Layout.tsx">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} data-id="k2ddeqh98" data-path="src/components/Layout.tsx">
              <SheetTrigger asChild data-id="1pziuhwsu" data-path="src/components/Layout.tsx">
                <Button variant="ghost" size="sm" className="lg:hidden" data-id="hwl309p80" data-path="src/components/Layout.tsx">
                  <Menu size={20} data-id="yegqlsr4p" data-path="src/components/Layout.tsx" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0" data-id="kzgchql06" data-path="src/components/Layout.tsx">
                <NavContent data-id="f8dyszbp9" data-path="src/components/Layout.tsx" />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center space-x-2" data-id="jdz9jluby" data-path="src/components/Layout.tsx">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center" data-id="9dy7oer78" data-path="src/components/Layout.tsx">
                <span className="text-white font-bold text-xs" data-id="icutmfhq6" data-path="src/components/Layout.tsx">DS</span>
              </div>
              <h1 className="font-bold text-lg text-gray-900" data-id="togyfgldo" data-path="src/components/Layout.tsx">DressSync</h1>
            </div>
          </div>
          
          <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'} data-id="64phwskou" data-path="src/components/Layout.tsx">
            {user?.role === 'manager' ? 'Manager' : 'Agent'}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72" data-id="prm8l5bb5" data-path="src/components/Layout.tsx">
        <main className="py-4 lg:py-8" data-id="nx8d4p71w" data-path="src/components/Layout.tsx">
          <div className="px-4 sm:px-6 lg:px-8" data-id="4jvzlwsb5" data-path="src/components/Layout.tsx">
            {children}
          </div>
        </main>
      </div>
    </div>);

};

export default Layout;