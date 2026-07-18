import React, { useMemo, useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ShoppingCart, BadgeCheck } from 'lucide-react';

import { Card, InlineAlert } from './ui/ParityPrimitives';

const NetMovementModal = ({ isOpen, onClose, details, dateRange }) => {
  const [activeTab, setActiveTab] = useState('purchases');

  const { purchasesList = [], transfersInList = [], transfersOutList = [] } = details || {};
  const hasAny = purchasesList.length + transfersInList.length + transfersOutList.length > 0;

  const dateLabel = useMemo(() => {

    if (!dateRange) return '';
    const start = dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString() : '';
    const end = dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString() : '';
    return start && end ? `${start} → ${end}` : (start || end);
  }, [dateRange]);


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl glass border border-military-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-military-border bg-slate-900/50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-military-text tracking-wide">Net Movement Ledger</h3>
            <p className="text-xs text-military-textMuted font-mono mt-1">
              Timeframe: {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-military-textMuted hover:text-military-text bg-military-border/30 p-1.5 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-military-border bg-slate-900/20">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'purchases'
                ? 'border-military-accent text-military-accent bg-military-accent/5'
                : 'border-transparent text-military-textMuted hover:text-military-text hover:bg-slate-900/30'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Purchases ({purchasesList.length})
          </button>
          
          <button
            onClick={() => setActiveTab('transfersIn')}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'transfersIn'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-military-textMuted hover:text-military-text hover:bg-slate-900/30'
            }`}
          >
            <ArrowDownRight className="h-4 w-4 text-emerald-400" />
            Transfers In ({transfersInList.length})
          </button>

          <button
            onClick={() => setActiveTab('transfersOut')}
            className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'transfersOut'
                ? 'border-military-alert text-military-alert bg-military-alert/5'
                : 'border-transparent text-military-textMuted hover:text-military-text hover:bg-slate-900/30'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-military-alert" />
            Transfers Out ({transfersOutList.length})
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/10">
          {/* Purchases List View */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              {purchasesList.length === 0 ? (
                <p className="text-center text-military-textMuted py-8 text-sm">No purchases recorded in this range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-military-border text-military-textMuted font-medium text-xs uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Base</th>
                        <th className="pb-3 text-right pr-6">Quantity</th>
                        <th className="pb-3">Supplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-military-border/40">
                      {purchasesList.map((item) => (
                        <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                          <td className="py-3 pl-2 font-mono text-xs">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold text-military-text">{item.assetId?.name || 'Unknown Asset'}</td>
                          <td className="py-3 text-military-textMuted">{item.baseId?.name || 'Unknown Base'}</td>
                          <td className="py-3 text-right pr-6 text-military-accent font-bold">+{item.quantity}</td>
                          <td className="py-3 text-military-textMuted max-w-[200px] truncate" title={item.supplier}>{item.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transfers In View */}
          {activeTab === 'transfersIn' && (
            <div className="space-y-4">
              {transfersInList.length === 0 ? (
                <p className="text-center text-military-textMuted py-8 text-sm">No incoming transfers recorded in this range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-military-border text-military-textMuted font-medium text-xs uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Source Base</th>
                        <th className="pb-3">Dest Base</th>
                        <th className="pb-3 text-right pr-6">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-military-border/40">
                      {transfersInList.map((item) => (
                        <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                          <td className="py-3 pl-2 font-mono text-xs">{new Date(item.transferDate).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold text-military-text">{item.assetId?.name || 'Unknown Asset'}</td>
                          <td className="py-3 text-military-textMuted">{item.fromBaseId?.name || 'External'}</td>
                          <td className="py-3 text-military-textMuted">{item.toBaseId?.name || 'External'}</td>
                          <td className="py-3 text-right pr-6 text-emerald-400 font-bold">+{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transfers Out View */}
          {activeTab === 'transfersOut' && (
            <div className="space-y-4">
              {transfersOutList.length === 0 ? (
                <p className="text-center text-military-textMuted py-8 text-sm">No outgoing transfers recorded in this range.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-military-border text-military-textMuted font-medium text-xs uppercase tracking-wider">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Asset</th>
                        <th className="pb-3">Source Base</th>
                        <th className="pb-3">Dest Base</th>
                        <th className="pb-3 text-right pr-6">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-military-border/40">
                      {transfersOutList.map((item) => (
                        <tr key={item._id} className="hover:bg-military-card/25 transition-colors">
                          <td className="py-3 pl-2 font-mono text-xs">{new Date(item.transferDate).toLocaleDateString()}</td>
                          <td className="py-3 font-semibold text-military-text">{item.assetId?.name || 'Unknown Asset'}</td>
                          <td className="py-3 text-military-textMuted">{item.fromBaseId?.name || 'External'}</td>
                          <td className="py-3 text-military-textMuted">{item.toBaseId?.name || 'External'}</td>
                          <td className="py-3 text-right pr-6 text-military-alert font-bold">-{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-military-border bg-slate-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-military-border text-military-text hover:bg-military-hover text-sm font-semibold rounded-lg transition-colors"
          >
            Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
};

export default NetMovementModal;
