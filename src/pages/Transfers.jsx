import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 

  ArrowLeftRight, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Tag, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingDown
} from 'lucide-react';

const Transfers = () => {
  const { user } = useAuth();
  
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Real-time stock display
  const [sourceStock, setSourceStock] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    fromBaseId: '',
    toBaseId: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  // Filters State
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [filterBase, setFilterBase] = useState('');

  const [message, setMessage] = useState(null);

  // Initialize dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [assetsRes, basesRes] = await Promise.all([
          api.get('/assets'),
          api.get('/bases')
        ]);
        setAssets(assetsRes.data);
        setBases(basesRes.data);

        // Pre-fill source base if Base Commander
        if (user && user.role === 'BaseCommander' && user.baseId) {
          setFormData(prev => ({ ...prev, fromBaseId: user.baseId._id }));
          setFilterBase(user.baseId._id);
        }
      } catch (err) {
        console.error('Error fetching dependency options:', err);
      }
    };
    fetchOptions();
  }, [user]);

  // Fetch real-time available stock at source base
  useEffect(() => {
    const checkStock = async () => {
      if (formData.assetId && formData.fromBaseId) {
        setCheckingStock(true);
        try {
          const res = await api.get('/inventory', {
            params: {
              baseId: formData.fromBaseId,
              assetId: formData.assetId
            }
          });
          if (res.data && res.data.length > 0) {
            setSourceStock(res.data[0].currentStock);
          } else {
            setSourceStock(0);
          }
        } catch (err) {
          console.error('Error checking stock level:', err);
          setSourceStock(0);
        } finally {
          setCheckingStock(false);
        }
      } else {
        setSourceStock(null);
      }
    };
    checkStock();
  }, [formData.assetId, formData.fromBaseId]);

  // Fetch Transfers History
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterAssetType) params.assetType = filterAssetType;
      
      // Override/lock base filter if BaseCommander
      if (user?.role === 'BaseCommander') {
        params.baseId = user.baseId._id;
      } else if (filterBase) {
        params.baseId = filterBase;
      }

      const res = await api.get('/transfers', { params });
      setTransfers(res.data);
    } catch (err) {
      console.error('Error loading transfers logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransfers();
    }
  }, [filterStartDate, filterEndDate, filterAssetType, filterBase, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Basic Validations
    if (!formData.assetId || !formData.fromBaseId || !formData.toBaseId || !formData.quantity) {
      const msg = 'All asterisk fields are required.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    if (formData.fromBaseId === formData.toBaseId) {
      const msg = 'Source and destination bases must be different.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    if (sourceStock !== null && Number(formData.quantity) > sourceStock) {
      const msg = `Insufficient stock at source base. Only ${sourceStock} available.`;
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/api/transfers', formData);
      const msg = `Transfer of ${formData.quantity} asset unit(s) authorized and logged.`;
      setMessage({ type: 'success', text: msg });
      toast.success(msg);
      
      // Reset fields (preserve source base if Base Commander)
      setFormData({
        assetId: '',
        fromBaseId: user?.role === 'BaseCommander' ? user.baseId._id : '',
        toBaseId: '',
        quantity: '',
        transferDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setSourceStock(null);
      fetchTransfers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while saving transfer records.';
      setMessage({ 
        type: 'error', 
        text: msg 
      });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
          <ArrowLeftRight className="h-8 w-8 text-military-accent" />
          Tactical Asset Transfers
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Safely authorize and log transfer details between different base command nodes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              Transfer Order
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Asset Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Equipment Asset *
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                >
                  <option value="">Select Equipment</option>
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>{asset.name} ({asset.unit})</option>
                  ))}
                </select>
              </div>

              {/* Source Base Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Source Base *
                </label>
                <select
                  value={formData.fromBaseId}
                  onChange={(e) => setFormData({ ...formData, fromBaseId: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent disabled:opacity-60"
                  disabled={user?.role === 'BaseCommander'}
                  required
                >
                  <option value="">Select Source Base</option>
                  {user?.role === 'BaseCommander' && user.baseId ? (
                    <option value={user.baseId._id}>{user.baseId.name}</option>
                  ) : (
                    bases.map((base) => (
                      <option key={base._id} value={base._id}>{base.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Source Stock Display */}
              {formData.assetId && formData.fromBaseId && (
                <div className="p-3 bg-slate-900/60 border border-military-border/50 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-military-textMuted">Available Warehouse Stock:</span>
                  {checkingStock ? (
                    <Loader2 className="h-3.5 w-3.5 text-military-accent animate-spin" />
                  ) : (
                    <span className={`font-bold font-mono ${sourceStock > 0 ? 'text-military-accent' : 'text-red-400'}`}>
                      {sourceStock} unit(s)
                    </span>
                  )}
                </div>
              )}

              {/* Destination Base Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Destination Base *
                </label>
                <select
                  value={formData.toBaseId}
                  onChange={(e) => setFormData({ ...formData, toBaseId: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                >
                  <option value="">Select Destination Base</option>
                  {bases
                    .filter(b => b._id !== formData.fromBaseId)
                    .map((base) => (
                      <option key={base._id} value={base._id}>{base.name}</option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" /> Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              {/* Transfer Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Transfer Date *
                </label>
                <input
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Remarks
                </label>
                <textarea
                  placeholder="Provide authorization logs..."
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                />
              </div>

              {/* Message Banner */}
              {message && (
                <div className={`p-4 rounded-lg flex items-start gap-2.5 text-xs font-medium border ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertTriangle className="h-4.5 w-4.5 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || (sourceStock !== null && Number(formData.quantity) > sourceStock)}
                className="w-full py-2.5 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authorizing...
                  </>
                ) : (
                  'Authorize Asset Transfer'
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6">Transfer Ledgers</h2>

            {/* Filter Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-900/30 border border-military-border/50 rounded-lg">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">After Date</label>
                <input 
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Before Date</label>
                <input 
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Type</label>
                <select
                  value={filterAssetType}
                  onChange={(e) => setFilterAssetType(e.target.value)}
                  className="w-full bg-slate-900 border border-military-border/40 rounded px-2 py-1 text-xs text-military-text focus:outline-none"
                >
                  <option value="">All Classification</option>
                  <option value="Weapon">Weapons</option>
                  <option value="Vehicle">Vehicles</option>
                  <option value="Ammunition">Ammunition</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-military-textMuted uppercase">Base Location</label>
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
                    bases.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-military-accent animate-spin mx-auto mb-2" />
                <p className="text-xs text-military-textMuted">Syncing secure logs...</p>
              </div>
            ) : transfers.length === 0 ? (
              <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                No matching transfer logs found.
              </p>
            ) : (
              <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                      <th className="p-3 pl-4">Date</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">From Base</th>
                      <th className="p-3">To Base</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 pr-4">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-military-border/40">
                    {transfers.map((item) => (
                      <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                        <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">
                          {new Date(item.transferDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-military-text">{item.assetId?.name}</td>
                        <td className="p-3 text-military-textMuted text-xs">{item.fromBaseId?.name}</td>
                        <td className="p-3 text-military-textMuted text-xs">{item.toBaseId?.name}</td>
                        <td className="p-3 text-right font-mono font-bold text-military-alert">-{item.quantity}</td>
                        <td className="p-3 pr-4 text-xs text-military-textMuted truncate" title={item.initiatedBy?.email}>
                          {item.initiatedBy?.name || 'Logistics HQ'}
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

export default Transfers;
