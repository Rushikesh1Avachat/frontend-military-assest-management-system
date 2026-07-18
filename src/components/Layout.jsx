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
  User as UserIcon,
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

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['Admin', 'BaseCommander', 'LogisticsOfficer']
    },
    {
      name: 'Purchases',
      path: '/purchases',
      icon: ShoppingBag,
      roles: ['Admin', 'BaseCommander', 'LogisticsOfficer']
    },
    {
      name: 'Transfers',
      path: '/transfers',
      icon: ArrowLeftRight,
      roles: ['Admin', 'BaseCommander', 'LogisticsOfficer']
    },
    {
      name: 'Assignments',
      path: '/assignments',
      icon: ClipboardList,
      roles: ['Admin', 'BaseCommander']
    },
    {
      name: 'Expenditures',
      path: '/expenditures',
      icon: ClipboardList,
      roles: ['Admin', 'BaseCommander', 'LogisticsOfficer']
    },
    {
      name: 'Assets',
      path: '/assets',
      icon: ClipboardList,
      roles: ['Admin', 'BaseCommander', 'LogisticsOfficer']
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: History,
      roles: ['Admin']
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: History,
      roles: ['Admin']
    }
  ];


  // Filter navigation items by current user role
  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-military-bg">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-military-border flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-military-border bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-military-accent animate-pulse" />
            <span className="font-extrabold text-lg tracking-wider text-military-text">
              MAMS <span className="text-military-accent">CORE</span>
            </span>
          </div>
          <button 
            className="md:hidden text-military-textMuted hover:text-military-text"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Identity Widget */}
        <div className="p-5 border-b border-military-border bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-military-border flex items-center justify-center text-military-accent border border-military-accent/30 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-medium text-sm text-military-text truncate">{user?.name}</h4>
              <p className="text-xs text-military-accent font-semibold tracking-wide uppercase mt-0.5">{user?.role}</p>
            </div>
          </div>
          {user?.baseId && (
            <div className="mt-3 flex items-center gap-2 text-xs text-military-textMuted bg-military-bg/60 p-2 rounded border border-military-border/50">
              <MapPin className="h-3.5 w-3.5 text-military-alert" />
              <span className="truncate">{user.baseId.name}</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 group ${
                  isActive 
                    ? 'bg-military-accent text-white font-bold shadow-md shadow-military-accent/20' 
                    : 'text-white/90 hover:text-white hover:bg-military-card/50'

                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-white group-hover:text-white'
                }`} />

                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Widget */}
        <div className="p-4 border-t border-military-border bg-slate-900/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-military-border glass-header sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-military-text hover:text-military-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-xs text-military-textMuted font-mono uppercase tracking-widest">Tactical Network Online</span>
              <span className="text-sm font-semibold text-military-text">Security Clearance Level: {user?.role}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-military-textMuted font-mono">{new Date().toLocaleDateString()} | Active Command Node</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-military-accent animate-ping" />
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
