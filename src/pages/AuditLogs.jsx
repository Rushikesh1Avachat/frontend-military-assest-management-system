import React, { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { 
  History, 
  User, 
  Terminal, 
  Calendar, 
  Database,
  ArrowDownCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'Admin') {
      fetchLogs();
    }
  }, [user]);

  if (user?.role !== 'Admin') {
    return (
      <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-xl text-center space-y-3 max-w-xl mx-auto">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-military-text">Security Violation</h2>
        <p className="text-sm text-military-textMuted">You do not possess the required security clearance level to access this secure log node.</p>
      </div>
    );
  }

  const toggleExpandLog = (id) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
          <History className="h-8 w-8 text-military-accent animate-pulse" />
          Tactical Audit Logs
        </h1>
        <p className="text-sm text-military-textMuted mt-1">Review chronological logs of database changes, user authentications, and stock movements.</p>
      </div>

      {/* Main Logs Card */}
      <div className="p-6 glass border border-military-border rounded-xl">
        <h2 className="text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-military-accent" />
          Secure Ledger Stream
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 text-military-accent animate-spin mx-auto mb-3" />
            <p className="text-sm text-military-textMuted">Decrypting transaction ledgers...</p>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-military-textMuted py-16 text-sm">No transaction audit records found in the database stream.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log._id;
              const hasDiffData = log.oldData || log.newData;
              return (
                <div 
                  key={log._id} 
                  className={`border rounded-lg transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-military-accent bg-slate-900/60 shadow-lg shadow-military-accent/5' 
                      : 'border-military-border/60 bg-military-card/25 hover:border-slate-500'
                  }`}
                >
                  {/* Log summary row */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Timestamp */}
                        <span className="text-xs font-mono text-military-textMuted flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        
                        {/* Action Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                          log.action === 'CREATE' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : log.action === 'LOGIN' 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {log.action}
                        </span>

                        {/* Module Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-military-border text-military-text">
                          {log.module}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm font-semibold text-military-text">{log.description}</p>

                      {/* User Officer Info */}
                      <div className="flex items-center gap-1.5 text-xs text-military-textMuted">
                        <User className="h-3.5 w-3.5 text-military-accent/80" />
                        <span>
                          {log.userId?.name} ({log.userId?.email}) - <strong className="text-military-accent">{log.userId?.role}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    {hasDiffData && (
                      <button
                        onClick={() => toggleExpandLog(log._id)}
                        className="px-4 py-2 text-xs font-bold uppercase border border-military-border rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 self-start md:self-center"
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Hide Payload
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Inspect Payload
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON diff container */}
                  {isExpanded && hasDiffData && (
                    <div className="p-4 border-t border-military-border bg-slate-950/60 font-mono text-xs overflow-x-auto space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {log.oldData && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Original State (-)</span>
                            <pre className="p-3 bg-slate-900 rounded border border-red-500/10 text-red-300 max-h-60 overflow-y-auto">
                              {JSON.stringify(log.oldData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.newData && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Modified State (+)</span>
                            <pre className="p-3 bg-slate-900 rounded border border-emerald-500/10 text-emerald-300 max-h-60 overflow-y-auto">
                              {JSON.stringify(log.newData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
