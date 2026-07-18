import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  ShoppingBag,
  ArrowLeftRight,
  ClipboardList,
  History,
  LogOut,
  Menu,
  X,
  MapPin
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ];

    if (user?.role === 'Admin') {
      return [
        ...baseItems,
        { name: 'Users', href: '/settings', icon: Shield },
        { name: 'Bases', href: '/settings', icon: MapPin },
        { name: 'Assets', href: '/assets', icon: ClipboardList },
        { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
        { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight },
        { name: 'Assignments', href: '/assignments', icon: ClipboardList },
        { name: 'Expenditures', href: '/expenditures', icon: ClipboardList },
        { name: 'Audit Logs', href: '/audit-logs', icon: History },
      ];
    } else if (user?.role === 'BaseCommander') {
      return [
        ...baseItems,
        { name: 'Assignments', href: '/assignments', icon: ClipboardList },
        { name: 'Expenditures', href: '/expenditures', icon: ClipboardList },
      ];
    } else if (user?.role === 'LogisticsOfficer') {
      return [
        ...baseItems,
        { name: 'Purchases', href: '/purchases', icon: ShoppingBag },
        { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-military-bg">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-military-primary p-2 rounded-lg text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0d1321] border-r border-military-border transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-8">Military Asset</h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#2c3e50] text-white font-medium'
                      : 'text-gray-300 hover:text-white hover:bg-[#2c3e50]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-military-border">
            <div className="text-sm mb-4">
              <p className="text-gray-400">User</p>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-xs text-military-primary">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
