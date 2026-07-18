import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  PlusCircle,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Building
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const fetchBases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bases');
      setBases(res.data);
    } catch (err) {
      console.error('fetchBases error:', err);
      toast.error('Failed to load bases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      const msg = 'Admin access only to create bases.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      return;
    }

    if (!formData.name || !formData.location) {
      const msg = 'Name and location are required.';
      setMessage({ type: 'error', text: msg });
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.post('/api/bases', formData);
      const msg = `Base '${formData.name}' created.`;
      setMessage({ type: 'success', text: msg });
      toast.success(msg);
      setFormData({ name: '', location: '' });
      fetchBases();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error occurred while creating base.';
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
          <SettingsIcon className="h-8 w-8 text-military-accent" />

          System Settings
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Manage base locations (Admin only).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-military-accent" />
              Create Base
            </h2>

            {!isAdmin ? (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-military-textMuted">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <strong className="text-military-text">Restricted</strong>
                </div>
                Only Admin can create bases.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">Base Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    placeholder="e.g. Delta Base"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-military-textMuted flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location *
                  </label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-military-border rounded-lg px-3 py-2 text-sm text-military-text focus:outline-none focus:border-military-accent"
                    placeholder="City, Country"
                    required
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    'Create Base'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-military-border rounded-xl">
            <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-military-accent" />
              Base Registry
            </h2>

            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 text-military-accent animate-spin mx-auto mb-3" />
                <p className="text-sm text-military-textMuted">Syncing base registry...</p>
              </div>
            ) : bases.length === 0 ? (
              <p className="text-center text-military-textMuted py-12 text-sm border border-dashed border-military-border/30 rounded-lg">
                No bases found.
              </p>
            ) : (
              <div className="overflow-x-auto border border-military-border/60 rounded-lg">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
                      <th className="p-3 pl-4">Name</th>
                      <th className="p-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-military-border/40">
                    {bases.map((b) => (
                      <tr key={b._id} className="hover:bg-military-card/25 transition-colors">
                        <td className="p-3 pl-4 font-semibold text-military-text">{b.name}</td>
                        <td className="p-3 text-military-textMuted text-xs max-w-[340px] truncate" title={b.location || ''}>
                          {b.location || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 text-xs text-military-textMuted">
              Settings control where assets are stored and where commanders can deploy stock.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

