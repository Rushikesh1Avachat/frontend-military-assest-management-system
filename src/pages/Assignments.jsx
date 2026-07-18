import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 

  ClipboardList, 
  Trash2, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingDown,
  ChevronDown
} from 'lucide-react';

const Assignments = () => {
  const { user } = useAuth();
  
  const [activeMode, setActiveMode] = useState('assignments'); // 'assignments' | 'expenditures'
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lists
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);

  // Live stock state
  const [availableStock, setAvailableStock] = useState(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // Forms State
  const [assignForm, setAssignForm] = useState({
    assetId: '',
    baseId: '',
    quantity: '',
    assignedTo: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [expendForm, setExpendForm] = useState({
    assetId: '',
    baseId: '',
    quantity: '',
    reason: 'Used', // Used | Damaged | Destroyed | Expired
    expenditureDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [message, setMessage] = useState(null);

  // Initialize options
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
          const baseId = user.baseId._id;
          setAssignForm(prev => ({ ...prev, baseId }));
          setExpendForm(prev => ({ ...prev, baseId }));
        }
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchOptions();
  }, [user]);

  // Check live stock for assignment form
  useEffect(() => {
    const checkAssignStock = async () => {
      const { assetId, baseId } = assignForm;
      if (assetId && baseId) {
        setCheckingStock(true);
        try {
          const res = await api.get('/inventory', { params: { assetId, baseId } });
          if (res.data && res.data.length > 0) {
            setAvailableStock(res.data[0].currentStock);
          } else {
            setAvailableStock(0);
          }
        } catch (err) {
          console.error(err);
          setAvailableStock(0);
        } finally {
          setCheckingStock(false);
        }
      } else {
        setAvailableStock(null);
      }
    };
    if (activeMode === 'assignments') checkAssignStock();
  }, [assignForm.assetId, assignForm.baseId, activeMode]);

  // Check live stock for expenditure form
  useEffect(() => {
    const checkExpendStock = async () => {
      const { assetId, baseId } = expendForm;
      if (assetId && baseId) {
        setCheckingStock(true);
        try {
          const res = await api.get('/inventory', { params: { assetId, baseId } });
          if (res.data && res.data.length > 0) {
            setAvailableStock(res.data[0].currentStock);
          } else {
            setAvailableStock(0);
          }
        } catch (err) {
          console.error(err);
          setAvailableStock(0);
        } finally {
          setCheckingStock(false);
        }
      } else {
        setAvailableStock(null);
      }
    };
    if (activeMode === 'expenditures') checkExpendStock();
  }, [expendForm.assetId, expendForm.baseId, activeMode]);

  // Fetch History List
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user?.role === 'BaseCommander') {
        params.baseId = user.baseId._id;
      }

      if (activeMode === 'assignments') {
        const res = await api.get('/assignments', { params });
        setAssignments(res.data);
      } else {
        const res = await api.get('/expenditures', { params });
        setExpenditures(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [activeMode, user]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const qty = Number(assignForm.quantity);
    if (!assignForm.assetId || !assignForm.baseId || !qty || !assignForm.assignedTo) {
      const msg = 'All fields marked * are required.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    if (availableStock !== null && qty > availableStock) {
      setMessage({ type: 'error', text: `Insufficient stock. Only ${availableStock} units available.` });
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/assignments', assignForm);
      setMessage({ type: 'success', text: `Successfully assigned ${qty} unit(s) to ${assignForm.assignedTo}.` });
      
      // Reset form
      setAssignForm({
        assetId: '',
        baseId: user?.role === 'BaseCommander' ? user.baseId._id : '',
        quantity: '',
        assignedTo: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setAvailableStock(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const qty = Number(expendForm.quantity);
    if (!expendForm.assetId || !expendForm.baseId || !qty || !expendForm.reason) {
      const msg = 'All fields marked * are required.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    if (availableStock !== null && qty > availableStock) {
      const msg = `Insufficient stock. Only ${availableStock} units available.`;
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      setSubmitting(false);
      return;
    }


    try {
      await api.post('/expenditures', expendForm);
      const msg = `Expenditure of ${qty} unit(s) logged successfully.`;
      setMessage({ type: 'success', text: msg });
      toast.success(msg);
      
      // Reset form
      setExpendForm({
        assetId: '',
        baseId: user?.role === 'BaseCommander' ? user.baseId._id : '',
        quantity: '',
        reason: 'Used',
        expenditureDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setAvailableStock(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-military-accent" />
            Assignments & Expenditures
          </h1>
          <p className="text-sm text-military-textMuted mt-1">Issue equipment to field personnel and report spent, damaged or lost assets.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-military-border p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveMode('assignments');
              setMessage(null);
              setAvailableStock(null);
            }}
            className={`px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              activeMode === 'assignments' 
                ? 'bg-military-accent text-slate-950 shadow-md' 
                : 'text-military-textMuted hover:text-military-text'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => {
              setActiveMode('expenditures');
              setMessage(null);
              setAvailableStock(null);
            }}
            className={`px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              activeMode === 'expenditures' 
                ? 'bg-military-alert text-slate-950 shadow-md' 
                : 'text-military-textMuted hover:text-military-text'
            }`}
          >
            Expenditures
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form Card */}
        <div className="lg:col-span-1">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              {activeMode === 'assignments' ? 'Record Assignment' : 'Log Expenditure'}
            </h2>

            {activeMode === 'assignments' ? (
              /* Assignment Form */
              <form onSubmit={handleAssignSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Select Asset *
                  </label>
                  <select
                    value={assignForm.assetId}
                    onChange={(e) => setAssignForm({ ...assignForm, assetId: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  >
                    <option value="">Select Equipment</option>
                    {assets.map((asset) => (
                      <option key={asset._id} value={asset._id}>{asset.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Source Base *
                  </label>
                  <select
                    value={assignForm.baseId}
                    onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })}
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

                {assignForm.assetId && assignForm.baseId && (
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
                    <User className="h-3.5 w-3.5" /> Assign To (Unit/Personnel) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 4B / Sergeant Miller"
                    value={assignForm.assignedTo}
                    onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5" /> Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 5"
                    value={assignForm.quantity}
                    onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Assignment Date *
                  </label>
                  <input
                    type="date"
                    value={assignForm.assignmentDate}
                    onChange={(e) => setAssignForm({ ...assignForm, assignmentDate: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Remarks
                  </label>
                  <textarea
                    placeholder="Additional logs..."
                    rows="3"
                    value={assignForm.remarks}
                    onChange={(e) => setAssignForm({ ...assignForm, remarks: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg flex items-start gap-2.5 text-xs font-medium border ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertTriangle className="h-4.5 w-4.5 shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || (availableStock !== null && Number(assignForm.quantity) > availableStock)}
                  className="w-full py-2.5 bg-military-accent hover:bg-military-accentHover text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Authorize Assignment'}
                </button>
              </form>
            ) : (
              /* Expenditure Form */
              <form onSubmit={handleExpendSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Select Asset *
                  </label>
                  <select
                    value={expendForm.assetId}
                    onChange={(e) => setExpendForm({ ...expendForm, assetId: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  >
                    <option value="">Select Equipment</option>
                    {assets.map((asset) => (
                      <option key={asset._id} value={asset._id}>{asset.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Base Location *
                  </label>
                  <select
                    value={expendForm.baseId}
                    onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })}
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

                {expendForm.assetId && expendForm.baseId && (
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
                    <ChevronDown className="h-3.5 w-3.5" /> Expenditure Reason *
                  </label>
                  <select
                    value={expendForm.reason}
                    onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  >
                    <option value="Used">Used / Consumed</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Destroyed">Destroyed</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5" /> Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={expendForm.quantity}
                    onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Expenditure Date *
                  </label>
                  <input
                    type="date"
                    value={expendForm.expenditureDate}
                    onChange={(e) => setExpendForm({ ...expendForm, expenditureDate: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Remarks
                  </label>
                  <textarea
                    placeholder="Additional details..."
                    rows="3"
                    value={expendForm.remarks}
                    onChange={(e) => setExpendForm({ ...expendForm, remarks: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent resize-none"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg flex items-start gap-2.5 text-xs font-medium border ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {message.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertTriangle className="h-4.5 w-4.5 shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || (availableStock !== null && Number(expendForm.quantity) > availableStock)}
                  className="w-full py-2.5 bg-military-alert hover:bg-orange-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Log Expenditure'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Ledger Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6">
              {activeMode === 'assignments' ? 'Active Duty Assignments' : 'Depletion & Loss Records'}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-military-accent animate-spin mx-auto mb-2" />
                <p className="text-xs text-military-textMuted">Syncing secure logs...</p>
              </div>
            ) : activeMode === 'assignments' ? (
              /* Assignments Table */
              assignments.length === 0 ? (
                <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                  No active unit assignments.
                </p>
              ) : (
                <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                        <th className="p-3 pl-4">Date</th>
                        <th className="p-3">Asset</th>
                        <th className="p-3">Base</th>
                        <th className="p-3">Assigned To</th>
                        <th className="p-3 text-right pr-4">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-military-border/40">
                      {assignments.map((item) => (
                        <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                          <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">
                            {new Date(item.assignmentDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-semibold text-military-text">{item.assetId?.name}</td>
                          <td className="p-3 text-military-textMuted text-xs">{item.baseId?.name}</td>
                          <td className="p-3 text-military-text text-xs font-medium">{item.assignedTo}</td>
                          <td className="p-3 text-right pr-4 font-mono font-bold text-emerald-400">-{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Expenditures Table */
              expenditures.length === 0 ? (
                <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                  No logged expenditure reports.
                </p>
              ) : (
                <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                        <th className="p-3 pl-4">Date</th>
                        <th className="p-3">Asset</th>
                        <th className="p-3">Base</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3 text-right pr-4">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-military-border/40">
                      {expenditures.map((item) => (
                        <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                          <td className="p-3 pl-4 font-mono text-xs text-military-textMuted">
                            {new Date(item.expenditureDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-semibold text-military-text">{item.assetId?.name}</td>
                          <td className="p-3 text-military-textMuted text-xs">{item.baseId?.name}</td>
                          <td className="p-3 text-xs">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.reason === 'Used' 
                                ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' 
                                : item.reason === 'Expired'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {item.reason}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4 font-mono font-bold text-military-alert">-{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Assignments;
