import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import NetMovementModal from '../components/NetMovementModal';
import {
  TrendingUp,
  ShieldCheck,
  Archive,
  Lock,
  ArrowLeftRight,
  UserCheck,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import { CardHeading } from '../components/ui/ParityPrimitives';
import DashboardChart from '../components/DashboardChart';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Date defaults: 30 days ago to today
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    purchasesTotal: 0,
    transfersInTotal: 0,
    transfersOutTotal: 0
  });

  const [details, setDetails] = useState({
    purchasesList: [],
    transfersInList: [],
    transfersOutList: []
  });

  const [currentStockList, setCurrentStockList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch bases list
  useEffect(() => {
    const fetchBases = async () => {
      try {
        const res = await api.get('bases');
        setBases(res.data);
      } catch (err) {
        console.error('Error fetching bases:', err);
      }
    };
    fetchBases();
  }, []);

  // Set default base if user is BaseCommander
  useEffect(() => {
    if (user && user.role === 'BaseCommander' && user.baseId) {
      setSelectedBase(user.baseId._id);
    }
  }, [user]);

  // Main fetch data function
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate,
        endDate,
        baseId: selectedBase,
        assetType: selectedType
      };

      const response = await api.get('dashboard', { params });
      setMetrics(response.data.metrics);
      setDetails(response.data.details);
      setCurrentStockList(response.data.currentStockList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch tactical dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [startDate, endDate, selectedBase, selectedType, user]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-military-text">Tactical Logistics Dashboard</h1>
          <p className="text-sm text-military-textMuted mt-1">Real-time balances, deployments, and logistics movements oversight.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-military-textMuted">
          <span className="hidden sm:inline px-2 py-1 rounded border border-military-border bg-slate-900/30 font-mono">
            Node: {user?.role}
          </span>
          <span className="hidden md:inline px-2 py-1 rounded border border-military-border bg-slate-900/30 font-mono">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 px-4 py-2 bg-military-card text-military-text hover:bg-military-hover text-sm font-semibold rounded-lg border border-military-border transition-all duration-200 ${
            isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Filters Form Card */}
      <div className="p-6 glass border border-military-border rounded-xl">
        <h2 className="text-sm font-bold text-military-text uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-military-accent" />
          Command Filter Node
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Start Date
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> End Date
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent transition-colors"
            />
          </div>

          {/* Base Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Military Base
            </label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={user?.role === 'BaseCommander'}
            >
              {user?.role !== 'BaseCommander' && <option value="">All Bases / Command Wide</option>}
              {user?.role === 'BaseCommander' && user.baseId ? (
                <option value={user.baseId._id}>{user.baseId.name}</option>
              ) : (
                bases.map((base) => (
                  <option key={base._id} value={base._id}>{base.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Equipment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Equipment Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent transition-colors"
            >
              <option value="">All Asset Types</option>
              <option value="Weapon">Weapons</option>
              <option value="Vehicle">Vehicles</option>
              <option value="Ammunition">Ammunition</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Opening Balance */}
        <div className="p-6 bg-military-card border border-military-border rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Opening Balance</span>
            <Archive className="h-5 w-5 text-sky-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-military-text">{loading ? '...' : metrics.openingBalance}</span>
            <span className="text-xs text-military-textMuted">units</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500/30" />
        </div>

        {/* Card 2: Closing Balance */}
        <div className="p-6 bg-military-card border border-military-border rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Closing Balance</span>
            <Lock className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-military-text">{loading ? '...' : metrics.closingBalance}</span>
            <span className="text-xs text-military-textMuted">units</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/30" />
        </div>

        {/* Card 3: Net Movement (CLICKABLE) */}
        <div 
          onClick={() => !loading && setIsModalOpen(true)}
          className="p-6 bg-slate-900 border-2 border-dashed border-military-border hover:border-military-accent hover:shadow-military-accent/5 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military-accent uppercase tracking-wider flex items-center gap-1.5">
              Net Movement <span className="text-[10px] bg-military-accent/10 px-1.5 py-0.5 rounded font-semibold text-military-accent">LEDGER</span>
            </span>
            <ArrowLeftRight className="h-5 w-5 text-military-accent animate-pulse" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${metrics.netMovement > 0 ? 'text-emerald-400' : metrics.netMovement < 0 ? 'text-military-alert' : 'text-military-text'}`}>
              {loading ? '...' : (metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement)}
            </span>
            <span className="text-xs text-military-textMuted">via trans/purch</span>
          </div>
          <p className="text-[10px] text-military-textMuted mt-2 underline group-hover:text-military-text transition-colors">Click to inspect transaction breakdown</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-military-accent/50" />
        </div>

        {/* Card 4: Assigned Assets */}
        <div className="p-6 bg-military-card border border-military-border rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Assigned Assets</span>
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-military-text">{loading ? '...' : metrics.assigned}</span>
            <span className="text-xs text-military-textMuted">issued</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/30" />
        </div>

        {/* Card 5: Expended Assets */}
        <div className="p-6 bg-military-card border border-military-border rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-500 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military-textMuted uppercase tracking-wider">Expended Assets</span>
            <Trash2 className="h-5 w-5 text-military-alert" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-military-text">{loading ? '...' : metrics.expended}</span>
            <span className="text-xs text-military-textMuted">consumed</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-military-alert/30" />
        </div>

      </div>

      <DashboardChart loading={loading} metrics={metrics} dateRange={{ startDate, endDate }} />

      {/* Current Stock Ledger Section */}
      <div className="p-6 glass border border-military-border rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-military-text tracking-wide flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-military-accent" />
              Warehouse Stock Status
            </h2>
            <p className="text-xs text-military-textMuted mt-0.5">Current physical inventories available in warehouses across bases.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-military-textMuted">
            <span className="px-2 py-1 rounded border border-military-border bg-slate-900/30 font-mono">
              {startDate} → {endDate}
            </span>
          </div>
        </div>


        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-military-accent animate-spin mx-auto mb-3" />
            <p className="text-sm text-military-textMuted">Scanning inventory archives...</p>
          </div>
        ) : currentStockList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-military-border/50 rounded-lg">
            <p className="text-sm text-military-textMuted">No stock matching filters exists in database inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-military-border rounded-lg">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Equipment Item</th>
                  <th className="p-4">Base</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Unit Measure</th>
                  <th className="p-4 text-right">Initial Balance</th>
                  <th className="p-4 text-right pr-6">Current Stock Now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-military-border/40">
                {currentStockList.map((item) => (
                  <tr key={item._id} className="hover:bg-military-card/45 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-military-text">{item.assetId?.name}</td>
                    <td className="p-4 text-military-textMuted">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-military-alert/80" />
                        {item.baseId?.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        item.assetId?.type === 'Weapon' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : item.assetId?.type === 'Vehicle' 
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.assetId?.type}
                      </span>
                    </td>
                    <td className="p-4 text-military-textMuted font-mono text-xs">{item.assetId?.unit}</td>
                    <td className="p-4 text-right text-military-textMuted font-mono">{item.openingBalance}</td>
                    <td className={`p-4 text-right pr-6 font-mono font-bold ${
                      item.currentStock === 0 
                        ? 'text-red-500' 
                        : item.currentStock < 10 
                          ? 'text-military-alert' 
                          : 'text-military-accent'
                    }`}>
                      {item.currentStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Net Movement Pop-up Modal */}
      <NetMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        details={details}
        dateRange={{ startDate, endDate }}
      />
    </div>
  );
};

export default Dashboard;
