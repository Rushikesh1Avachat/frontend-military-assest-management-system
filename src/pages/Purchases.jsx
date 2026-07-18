import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  ShoppingBag,
  PlusCircle, 
  MapPin, 
  ShoppingCart, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Purchases = () => {
  const { user } = useAuth();
  
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    assetId: '',
    baseId: '',
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    remarks: ''
  });

  // Filters State
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('');
  const [filterBase, setFilterBase] = useState('');

  const [message, setMessage] = useState(null);

  // Initialize dropdown list options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [assetsRes, basesRes] = await Promise.all([
          api.get('assets'),
          api.get('bases')
        ]);
        setAssets(assetsRes.data);
        setBases(basesRes.data);

        // Pre-fill baseId if Base Commander
        if (user && user.role === 'BaseCommander' && user.baseId) {
          setFormData(prev => ({ ...prev, baseId: user.baseId._id }));
          setFilterBase(user.baseId._id);
        }
      } catch (err) {
        console.error('Error fetching option dependencies:', err);
      }
    };
    fetchOptions();
  }, [user]);

  // Fetch Purchases History
  const fetchPurchases = async () => {
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

      const res = await api.get('purchases', { params });
      setPurchases(res.data);
    } catch (err) {
      console.error('Error loading purchases list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [filterStartDate, filterEndDate, filterAssetType, filterBase, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Form validation
    if (!formData.assetId || !formData.baseId || !formData.quantity || !formData.supplier) {
      const msg = 'Please fill in all required fields';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('purchases', formData);
      const msg = `Acquisition of ${formData.quantity} unit(s) recorded and logged in active inventory.`;
      setMessage({ type: 'success', text: msg });
      toast.success(msg);
      
      // Reset form (keep base if base commander)
      setFormData({
        assetId: '',
        baseId: user?.role === 'BaseCommander' ? user.baseId._id : '',
        quantity: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        remarks: ''
      });
      
      // Reload purchases history
      fetchPurchases();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while saving purchase details.';
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
          <ShoppingBag className="h-8 w-8 text-military-accent" />
          Asset Procurements & Acquisitions
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Record incoming acquisitions from suppliers and assign them to bases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              Record Procurement
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

              {/* Base Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Destination Base *
                </label>
                <select
                  value={formData.baseId}
                  onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent disabled:opacity-60"
                  disabled={user?.role === 'BaseCommander'}
                  required
                >
                  <option value="">Select Base Location</option>
                  {user?.role === 'BaseCommander' && user.baseId ? (
                    <option value={user.baseId._id}>{user.baseId.name}</option>
                  ) : (
                    bases.map((base) => (
                      <option key={base._id} value={base._id}>{base.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5" /> Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Acquisition Date *
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                  required
                />
              </div>

              {/* Supplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Supplier / Contractor *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colt Manufacturing"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
                  placeholder="Additional order details..."
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                />
              </div>

              {/* Alerts Feedback */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                  </>
                ) : (
                  'Authorize Procurement'
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Historical Ledger Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6">Procurement Ledgers</h2>

            {/* Filter Sub-component inside history */}
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

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-military-accent animate-spin mx-auto mb-2" />
                <p className="text-xs text-military-textMuted">Syncing secure logs...</p>
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                No matching procurement logs found.
              </p>
            ) : (
              <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                      <th className="p-3 pl-4">Date</th>
                      <th className="p-3">Asset</th>
                      <th className="p-3">Base</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3">Supplier</th>
                      <th className="p-3 pr-4">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-military-border/40">
                    {purchases.map((item) => (
                      <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                        <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">
                          {new Date(item.purchaseDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-semibold text-military-text">{item.assetId?.name}</td>
                        <td className="p-3 text-military-textMuted text-xs">{item.baseId?.name}</td>
                        <td className="p-3 text-right font-mono font-bold text-military-accent">+{item.quantity}</td>
                        <td className="p-3 text-military-textMuted text-xs max-w-[120px] truncate" title={item.supplier}>
                          {item.supplier}
                        </td>
                        <td className="p-3 pr-4 text-xs text-military-textMuted truncate" title={item.addedBy?.email}>
                          {item.addedBy?.name || 'Logistics HQ'}
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

export default Purchases;
