import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ArrowLeftRight,
  ClipboardList,
  History,
  LogOut,
  Menu,
  X,
  MapPin,
  ArrowLeft
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/settings': 'Bases',
  '/assets': 'Assets',
  '/purchases': 'Purchases',
  '/transfers': 'Transfers',
  '/assignments': 'Assignments',
  '/expenditures': 'Expenditures',
  '/audit-logs': 'Audit Logs',
};

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

  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || '';

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
        {/* Top bar with back navigation */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-military-border bg-[#0d1321]/95 backdrop-blur px-6 py-3 pl-16 md:pl-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg border border-military-border bg-[#2c3e50]/40 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:bg-[#2c3e50] hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {pageTitle && (
            <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              {pageTitle}
            </span>
          )}
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
