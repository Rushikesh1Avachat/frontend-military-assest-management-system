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
  TrendingDown
} from 'lucide-react';

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

  const fetchOptions = async () => {
    try {
      const [assetsRes, basesRes] = await Promise.all([api.get('/assets'), api.get('/bases')]);
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

      const res = await api.get('/expenditures', { params });
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
      return;
    }

    setCheckingStock(true);
    try {
      const res = await api.get('/inventory', {
        params: { assetId: formData.assetId, baseId: formData.baseId }
      });
      const inv = res.data?.[0];
      setAvailableStock(inv ? inv.currentStock : 0);
    } catch (err) {
      console.error('checkStock error:', err);
      setAvailableStock(0);
    } finally {
      setCheckingStock(false);
    }
  };

  useEffect(() => {
    checkStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assetId, formData.baseId]);

  const handleSubmit = async (e) => {
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

    setSubmitting(true);
    setMessage(null);

    try {
      await api.post('/expenditures', formData);
      const msg = 'Expenditure recorded and stock updated.';
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
      fetchExpenditures();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while saving expenditure.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-military-accent" />
          Expenditures
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Record stock consumption, reasons, and updated inventory levels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              Record Expenditure
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Select Asset *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
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
                <div className="p-3 bg-slate-900/60 border border-military-border/50 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-military-textMuted">Available Base Stock:</span>
                  {checkingStock ? (
                    <Loader2 className="h-3.5 w-3.5 text-military-accent animate-spin" />
                  ) : (
                    <span className={`font-bold font-mono ${availableStock > 0 ? 'text-military-accent' : 'text-red-400'}`}>
                      {availableStock} units
                    </span>
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Reason *
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="Used">Used</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Expenditure Date *
                </label>
                <input
                  type="date"
                  value={formData.expenditureDate}
                  onChange={(e) => setFormData({ ...formData, expenditureDate: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                  placeholder="Optional remarks"
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
                disabled={submitting || (availableStock !== null && Number(formData.quantity) > availableStock)}
                className="w-full py-2.5 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Recording...
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
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-military-accent" />
              Expenditure Ledgers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-900/30 border border-military-border/50 rounded-lg">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">After Date</label>
                <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Before Date</label>
                <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Type</label>
                <select value={filterAssetType} onChange={(e) => setFilterAssetType(e.target.value)} className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text">
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
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text focus:outline-none disabled:opacity-60"
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

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-military-accent animate-spin mx-auto mb-2" />
                <p className="text-xs text-military-textMuted">Syncing secure expenditure logs...</p>
              </div>
            ) : expenditures.length === 0 ? (
              <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                No matching expenditure logs found.
              </p>
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
                      <th className="p-3 pr-4">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-military-border/40">
                    {expenditures.map((item) => (
                      <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                        <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">{new Date(item.expenditureDate).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold text-military-text">{item.assetId?.name}</td>
                        <td className="p-3 text-military-textMuted text-xs">{item.baseId?.name}</td>
                        <td className="p-3 text-right font-mono font-bold text-military-alert">-{item.quantity}</td>
                        <td className="p-3 text-military-textMuted text-xs">{item.reason}</td>
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
    </div>
  );
};

export default Expenditures;

