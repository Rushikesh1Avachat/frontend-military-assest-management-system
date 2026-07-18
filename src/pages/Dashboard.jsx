import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import NetMovementModal from '../components/NetMovementModal';
import {
  Archive,
  Lock,
  ArrowLeftRight,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Truck,
  ShoppingCart,
  Users,
} from 'lucide-react';

import DashboardChart from '../components/DashboardChart';
import DashboardSummaryCard from '../components/DashboardSummaryCard';
import DashboardTable from '../components/DashboardTable';

const Dashboard = () => {
  const { user } = useAuth();

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

  useEffect(() => {
    if (user && user.role === 'BaseCommander' && user.baseId) {
      setSelectedBase(user.baseId._id);
    }
  }, [user]);

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
      setError('Failed to fetch dashboard data. Please try again.');
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

  const summaryCards = [
    {
      title: 'Opening Balance',
      value: metrics.openingBalance,
      icon: <Archive className="h-6 w-6 text-white" />,
      iconBg: 'bg-sky-600',
    },
    {
      title: 'Current Balance',
      value: metrics.closingBalance,
      icon: <Lock className="h-6 w-6 text-white" />,
      iconBg: 'bg-emerald-600',
    },
    {
      title: 'Net Movement',
      value: metrics.netMovement,
      icon: <ArrowLeftRight className="h-6 w-6 text-white" />,
      iconBg: 'bg-yellow-600',
      onClick: () => !loading && setIsModalOpen(true),
    },
    {
      title: 'Assigned',
      value: metrics.assigned,
      icon: <Users className="h-6 w-6 text-white" />,
      iconBg: 'bg-purple-600',
    },
    {
      title: 'Expended',
      value: metrics.expended,
      icon: <Trash2 className="h-6 w-6 text-white" />,
      iconBg: 'bg-red-600',
    },
    {
      title: 'Closing Balance',
      value: metrics.closingBalance,
      icon: <Lock className="h-6 w-6 text-white" />,
      iconBg: 'bg-indigo-600',
    },
  ];

  const transfersHeaders = ['Asset', 'From Base', 'To Base', 'Quantity', 'Date'];
  const transfersData = (details.transfersInList || []).map((item) => [
    item.assetId?.name || 'Unknown',
    item.fromBaseId?.name || 'External',
    item.toBaseId?.name || 'External',
    <span key={item._id} className="text-emerald-400 font-bold">+{item.quantity}</span>,
    item.transferDate ? new Date(item.transferDate).toLocaleDateString() : '',
  ]);

  const purchasesHeaders = ['Asset', 'Base', 'Quantity', 'Supplier', 'Date'];
  const purchasesData = (details.purchasesList || []).map((item) => [
    item.assetId?.name || 'Unknown',
    item.baseId?.name || 'Unknown',
    <span key={item._id} className="text-military-accent font-bold">+{item.quantity}</span>,
    item.supplier || '-',
    item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '',
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-military-text">Dashboard</h1>
          <p className="text-sm text-military-muted mt-1">Real-time balances, deployments, and logistics movements oversight.</p>
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

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-military-muted mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-military-muted mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-military-muted mb-1">Base</label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="input"
              disabled={user?.role === 'BaseCommander'}
            >
              <option value="">All Bases</option>
              {bases.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-military-muted mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={card.onClick ? 'cursor-pointer' : ''}
          >
            <DashboardSummaryCard
              title={card.title}
              value={loading ? '...' : card.value}
              icon={card.icon}
              iconBg={card.iconBg}
            />
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardChart loading={loading} metrics={metrics} dateRange={{ startDate, endDate }} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-military-text">Recent Transfers</h2>
          </div>
          <DashboardTable
            headers={transfersHeaders}
            data={transfersData}
            icon={<Truck className="h-5 w-5 text-military-muted" />}
            emptyMessage="No recent transfers"
          />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-military-text">Recent Purchases</h2>
          </div>
          <DashboardTable
            headers={purchasesHeaders}
            data={purchasesData}
            icon={<ShoppingCart className="h-5 w-5 text-military-muted" />}
            emptyMessage="No recent purchases"
          />
        </div>
      </div>

      {/* Net Movement Modal */}
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
