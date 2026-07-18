import React from 'react';

export const SectionTitle = ({ icon: Icon, title, subtitle }) => {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-military-text flex items-center gap-3">
        {Icon ? <Icon className="h-8 w-8 text-military-accent" /> : null}
        {title}
      </h1>
      {subtitle ? <p className="text-sm text-military-textMuted mt-1">{subtitle}</p> : null}
    </div>
  );
};

export const Card = ({ children, className = '' }) => {
  return <div className={`p-6 glass border border-military-border rounded-xl ${className}`}>{children}</div>;
};

export const CardHeading = ({ icon: Icon, title, className = '' }) => {
  return (
    <h2
      className={`text-md font-bold text-military-text uppercase tracking-widest mb-6 flex items-center gap-2 ${className}`}
    >
      {Icon ? <Icon className="h-4.5 w-4.5 text-military-accent" /> : null}
      {title}
    </h2>
  );
};

export const InlineAlert = ({ type = 'success', title, children }) => {
  const styles =
    type === 'success'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <div className={`p-4 rounded-lg flex items-start gap-2.5 text-xs font-medium border ${styles}`}> 
      <div className="flex-1">
        {title ? <div className="font-bold text-[11px] uppercase tracking-widest">{title}</div> : null}
        {children}
      </div>
    </div>
  );
};

export const LedgerTable = ({ columns, rows, rowKey, emptyText }) => {
  return (
    <div className="overflow-x-auto border border-military-border/60 rounded-lg">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-900 border-b border-military-border text-military-textMuted font-bold text-xs uppercase tracking-wider">
            {columns.map((c) => (
              <th key={c.key} className={`p-3 ${c.className || ''}`.trim()}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-military-border/40">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-6 text-center text-military-textMuted text-sm">
                {emptyText || 'No records found.'}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={rowKey ? r[rowKey] : idx} className="hover:bg-military-card/25 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={c.cellClassName || 'p-3'}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const StatCard = ({ title, value, icon: Icon, iconClass = '', colorGlow = '' }) => {
  return (
    <div className={`p-6 bg-military-card border border-military-border rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-500 transition-all duration-200 ${colorGlow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-military-textMuted uppercase tracking-wider">{title}</span>
        {Icon ? <Icon className={`h-5 w-5 ${iconClass}`} /> : null}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-military-text">{value}</span>
        <span className="text-xs text-military-textMuted">units</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-military-accent/50" />
    </div>
  );
};

