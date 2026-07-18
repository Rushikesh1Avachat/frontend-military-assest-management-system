import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ClipboardList,
  PlusCircle,
  Tag,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Calendar,
  FileText,
  TrendingDown,
  X,
  AlertOctagon,
  BarChart3
} from 'lucide-react';

const REASONS = [
  { value: 'Used', label: 'Used / Consumed', color: 'slate' },
  { value: 'Damaged', label: 'Damaged', color: 'amber' },
  { value: 'Destroyed', label: 'Destroyed', color: 'red' },
  { value: 'Expired', label: 'Expired', color: 'orange' }
];

const Expenditures = () => {
  const { user } = useAuth();

  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [checkingStock, setCheckingStock] = useState(false);
  const [availableStock, setAvailableStock] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [formData, setFormData] = useState({
    assetId: '',
    baseId: '',
    quantity: '',
    reason: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [filterBase, setFilterBase] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);

  const fetchOptions = async () => {
    try {
      const [assetsRes, basesRes] = await Promise.all([api.get('assets'), api.get('bases')]);
      setAssets(assetsRes.data);
      setBases(basesRes.data);

      if (user?.role === 'BaseCommander' && user.baseId) {
        setFormData((prev) => ({ ...prev, baseId: user.baseId._id }));
        setFilterBase(user.baseId._id);
      }
    } catch (err) {
      console.error('fetchOptions error:', err);
      toast.error('Failed to load options');
    }
  };

  useEffect(() => {
    if (user) fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchExpenditures = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterAssetType) params.assetType = filterAssetType;

      if (user?.role === 'BaseCommander') {
        params.baseId = user.baseId._id;
      } else if (filterBase) {
        params.baseId = filterBase;
      }

      const res = await api.get('expenditures', { params });
      setExpenditures(res.data);
    } catch (err) {
      console.error('fetchExpenditures error:', err);
      toast.error('Failed to load expenditure logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchExpenditures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStartDate, filterEndDate, filterAssetType, filterBase, user]);

  const checkStock = async () => {
    if (!formData.assetId || !formData.baseId) {
      setAvailableStock(null);
      setSelectedAsset(null);
      return;
    }

    setCheckingStock(true);
    try {
      const res = await api.get('inventory', {
        params: { assetId: formData.assetId, baseId: formData.baseId }
      });
      const inv = res.data?.[0];
      setAvailableStock(inv ? inv.currentStock : 0);
      setSelectedAsset(assets.find(a => a._id === formData.assetId) || null);
    } catch (err) {
      console.error('checkStock error:', err);
      setAvailableStock(0);
      setSelectedAsset(null);
    } finally {
      setCheckingStock(false);
    }
  };

  useEffect(() => {
    checkStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assetId, formData.baseId]);

  const getReasonColor = (reason) => {
    const found = REASONS.find(r => r.value === reason);
    if (!found) return 'slate';
    return found.color;
  };

  const getReasonBadgeClass = (reason) => {
    const color = getReasonColor(reason);
    const classes = {
      slate: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      red: 'bg-red-500/10 text-red-400 border border-red-500/20',
      orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    };
    return classes[color] || classes.slate;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSubmitAttempt = (e) => {
    e.preventDefault();

    if (!formData.assetId || !formData.baseId || !formData.quantity || !formData.reason) {
      const msg = 'Asset, Base, Quantity, and Reason are required.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      return;
    }

    if (availableStock !== null && Number(formData.quantity) > availableStock) {
      const msg = `Insufficient stock. Available stock is ${availableStock}.`;
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      return;
    }

    setPendingSubmit({ ...formData });
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    if (!pendingSubmit) return;

    setShowConfirm(false);
    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('expenditures', pendingSubmit);
      const asset = assets.find(a => a._id === pendingSubmit.assetId);
      const msg = `Expenditure of ${pendingSubmit.quantity} ${asset?.unit || 'units'} recorded and stock updated.`;
      setMessage({ type: 'success', text: msg });
      toast.success(msg);

      setFormData({
        assetId: '',
        baseId: user?.role === 'BaseCommander' ? user.baseId._id : '',
        quantity: '',
        reason: '',
        expenditureDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setSelectedAsset(null);
      setAvailableStock(null);
      fetchExpenditures();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while saving expenditure.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setPendingSubmit(null);
    }
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
    setPendingSubmit(null);
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterAssetType('');
    setFilterBase('');
    setSearchQuery('');
  };

  const hasActiveFilters = filterStartDate || filterEndDate || filterAssetType || filterBase || searchQuery;

  const filteredExpenditures = expenditures.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.assetId?.name?.toLowerCase().includes(query) ||
      item.baseId?.name?.toLowerCase().includes(query) ||
      item.reason?.toLowerCase().includes(query) ||
      item.expendedBy?.name?.toLowerCase().includes(query) ||
      item.remarks?.toLowerCase().includes(query)
    );
  });

  const totalExpended = expenditures.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-military-accent" />
          Authorize Stock Expenditure
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Record stock consumption, damage, or loss with full authorization tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              Record Expenditure
            </h2>

            <form onSubmit={handleSubmitAttempt} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Select Asset *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleFormChange('assetId', e.target.value)}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>{a.name} ({a.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Source Base *
                </label>
                <select
                  value={formData.baseId}
                  onChange={(e) => handleFormChange('baseId', e.target.value)}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent disabled:opacity-60"
                  disabled={user?.role === 'BaseCommander'}
                  required
                >
                  <option value="">Select Base</option>
                  {user?.role === 'BaseCommander' && user.baseId ? (
                    <option value={user.baseId._id}>{user.baseId.name}</option>
                  ) : (
                    bases.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))
                  )}
                </select>
              </div>

              {formData.assetId && formData.baseId && (
                <div className={`p-4 rounded-lg border ${
                  availableStock > 0
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-military-textMuted uppercase tracking-wider">Available Stock</span>
                    {checkingStock && <Loader2 className="h-4 w-4 text-military-accent animate-spin" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black font-mono ${
                      availableStock > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {availableStock !== null ? availableStock : '--'}
                    </span>
                    <span className="text-xs text-military-textMuted">units</span>
                  </div>
                  {selectedAsset && availableStock !== null && (
                    <div className="mt-2 text-[10px] text-military-textMuted">
                      After expenditure: <span className="font-bold text-military-text">{Math.max(0, availableStock - Number(formData.quantity || 0))} units</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" /> Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  max={availableStock || 999999}
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent ${
                    formData.quantity && availableStock !== null && Number(formData.quantity) > availableStock
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-military-border'
                  }`}
                  required
                />
                {formData.quantity && availableStock !== null && Number(formData.quantity) > availableStock && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertOctagon className="h-3 w-3" />
                    Exceeds available stock
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Reason *
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => handleFormChange('reason', e.target.value)}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                >
                  <option value="">Select Reason</option>
                  {REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Expenditure Date *
                </label>
                <input
                  type="date"
                  value={formData.expenditureDate}
                  onChange={(e) => handleFormChange('expenditureDate', e.target.value)}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Remarks
                </label>
                <textarea
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                  placeholder="Authorization notes, witness details, or incident report reference..."
                />
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-2.5 text-xs font-medium border ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  'Authorize Stock Expenditure'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-md font-bold text-military-text uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-military-accent" />
                  Expenditure Ledgers
                </h2>
                <p className="text-[10px] text-military-textMuted mt-1">
                  Total authorized expenditure in view: <span className="font-bold text-military-alert">{totalExpended} units</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-900/30 border border-military-border/50 rounded-lg">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">After Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1.5 text-xs text-military-text focus:outline-none focus:border-military-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Before Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1.5 text-xs text-military-text focus:outline-none focus:border-military-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Type</label>
                <select
                  value={filterAssetType}
                  onChange={(e) => setFilterAssetType(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1.5 text-xs text-military-text focus:outline-none focus:border-military-accent"
                >
                  <option value="">All Classification</option>
                  <option value="Weapon">Weapons</option>
                  <option value="Vehicle">Vehicles</option>
                  <option value="Ammunition">Ammunition</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Base</label>
                <select
                  value={filterBase}
                  onChange={(e) => setFilterBase(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1.5 text-xs text-military-text focus:outline-none focus:border-military-accent disabled:opacity-60"
                  disabled={user?.role === 'BaseCommander'}
                >
                  {user?.role !== 'BaseCommander' && <option value="">All Bases</option>}
                  {user?.role === 'BaseCommander' && user.baseId ? (
                    <option value={user.baseId._id}>{user.baseId.name}</option>
                  ) : (
                    bases.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)
                  )}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by asset, base, reason, officer, or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-military-border/40 rounded-lg px-4 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
              />
            </div>

            {hasActiveFilters && (
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] text-military-textMuted uppercase tracking-wider">
                  {filteredExpenditures.length} of {expenditures.length} records shown
                </span>
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-military-accent hover:text-military-accentHover uppercase tracking-wider font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-military-accent animate-spin mx-auto mb-2" />
                <p className="text-xs text-military-textMuted">Syncing secure expenditure logs...</p>
              </div>
            ) : filteredExpenditures.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-military-border/30 rounded-lg">
                <BarChart3 className="h-10 w-10 text-military-border mx-auto mb-3" />
                <p className="text-sm text-military-textMuted">
                  {hasActiveFilters ? 'No records match current filters.' : 'No expenditure records found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                      <th className="p-3 pl-4">Date</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Base</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Remarks</th>
                      <th className="p-3 pr-4">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-military-border/40">
                    {filteredExpenditures.map((item) => (
                      <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                        <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">
                          {new Date(item.expenditureDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-military-text">{item.assetId?.name}</div>
                          <div className="text-[10px] text-military-textMuted">{item.assetId?.type} / {item.assetId?.unit}</div>
                        </td>
                        <td className="p-3 text-military-textMuted text-xs">{item.baseId?.name}</td>
                        <td className="p-3 text-right font-mono font-bold text-military-alert">-{item.quantity}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getReasonBadgeClass(item.reason)}`}>
                            {item.reason}
                          </span>
                        </td>
                        <td className="p-3 text-military-textMuted text-xs max-w-[200px] truncate" title={item.remarks || ''}>
                          {item.remarks || '-'}
                        </td>
                        <td className="p-3 pr-4 text-xs text-military-textMuted truncate" title={item.expendedBy?.email}>
                          {item.expendedBy?.name || 'Officer'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && pendingSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-military-card border border-military-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-military-text flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-military-alert" />
                Confirm Expenditure
              </h3>
              <button
                onClick={cancelConfirm}
                className="text-military-textMuted hover:text-military-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-military-border/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-military-textMuted block">Asset</span>
                    <span className="text-military-text font-semibold">
                      {assets.find(a => a._id === pendingSubmit.assetId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-military-textMuted block">Base</span>
                    <span className="text-military-text font-semibold">
                      {bases.find(b => b._id === pendingSubmit.baseId)?.name || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-military-textMuted block">Quantity</span>
                    <span className="text-military-alert font-bold">{pendingSubmit.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-military-textMuted block">Reason</span>
                    <span className={`font-bold ${getReasonColor(pendingSubmit.reason) === 'red' ? 'text-red-400' : 'text-military-text'}`}>
                      {pendingSubmit.reason}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-military-textMuted block">Remaining Stock After</span>
                    <span className="text-military-accent font-bold">
                      {Math.max(0, (availableStock || 0) - Number(pendingSubmit.quantity))} units
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-military-textMuted">
                This action will permanently deduct stock and create an audit log entry.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 py-2 bg-slate-900 border border-military-border text-military-text hover:bg-slate-800 font-semibold rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 py-2 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  'Confirm Authorization'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenditures;
