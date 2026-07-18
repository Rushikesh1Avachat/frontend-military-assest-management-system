import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Lightweight SVG "chart" driven by dashboard metrics.
 * Avoids extra chart dependencies while still reflecting filter changes.
 */
const DashboardChart = ({ loading, metrics, dateRange }) => {
  const opening = Number(metrics?.openingBalance ?? 0);
  const closing = Number(metrics?.closingBalance ?? 0);
  const net = Number(metrics?.netMovement ?? 0);

  // For bar heights: use max absolute value (net can be negative)
  const maxAbs = Math.max(1, Math.abs(opening), Math.abs(closing), Math.abs(net));

  const chartHeight = 140;
  const baseY = 120; // x-axis
  const toY = (value) => {
    const ratio = Math.abs(value) / maxAbs;
    const h = ratio * (chartHeight - 20);
    return baseY - h;
  };

  const openingY = toY(opening);
  const closingY = toY(closing);

  // For net movement: positive bar goes up from baseline, negative goes down visually
  const netRatio = Math.abs(net) / maxAbs;
  const netH = netRatio * (chartHeight - 20);
  const netTopY = baseY - netH;
  const netBottomY = baseY + netH;

  const xGap = 220;
  const startX = 60;

  const openingX = startX;
  const netX = startX + xGap;
  const closingX = startX + xGap * 2;

  const openingColor = 'rgba(56, 189, 248, 0.95)'; // sky-400
  const netColor = net >= 0 ? 'rgba(52, 211, 153, 0.95)' : 'rgba(248, 113, 113, 0.95)'; // emerald or red
  const closingColor = 'rgba(74, 222, 128, 0.95)'; // green

  const formatCompact = (n) => {
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return `${n}`;
  };

  return (
    <div className="p-6 glass border border-military-border rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-military-text tracking-wide flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-military-accent" />
            Tactical Movement Chart
          </h2>
          <p className="text-xs text-military-textMuted mt-0.5">
            Visual snapshot of balances and net movement for the selected filter window.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-military-textMuted">
          <div className="px-2 py-1 rounded border border-military-border bg-slate-900/30 font-mono">
            {dateRange?.startDate} → {dateRange?.endDate}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded border border-military-border bg-slate-900/30">
            <ShieldCheck className="h-4 w-4 text-military-accent" />
            <span className="font-semibold">Filtered</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-military-border/60 bg-slate-900/30">
            <div className="h-2 w-2 rounded-full bg-military-accent animate-pulse" />
            <span className="text-sm text-military-textMuted">Updating chart…</span>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg viewBox="0 0 760 180" className="w-full max-w-5xl">
            {/* Background grid */}
            {[0, 1, 2, 3].map((i) => {
              const y = 20 + i * 30;
              return (
                <line
                  key={i}
                  x1="30"
                  y1={y}
                  x2="730"
                  y2={y}
                  stroke="rgba(148, 163, 184, 0.12)"
                  strokeWidth="1"
                />
              );
            })}

            {/* X baseline */}
            <line x1="30" y1={baseY} x2="730" y2={baseY} stroke="rgba(148, 163, 184, 0.35)" strokeWidth="1" />

            {/* Opening bar */}
            <rect
              x={openingX - 28}
              y={openingY}
              width="56"
              height={baseY - openingY}
              rx="10"
              fill={openingColor}
              opacity="0.35"
              stroke={openingColor}
              strokeWidth="1.5"
            />
            <text x={openingX} y={openingY - 10} textAnchor="middle" fill="rgba(226, 232, 240, 0.95)" fontSize="12" fontWeight="700">
              {opening}
            </text>

            {/* Net bar (positive/negative) */}
            {net >= 0 ? (
              <rect
                x={netX - 28}
                y={netTopY}
                width="56"
                height={baseY - netTopY}
                rx="10"
                fill={netColor}
                opacity="0.35"
                stroke={netColor}
                strokeWidth="1.5"
              />
            ) : (
              <rect
                x={netX - 28}
                y={baseY}
                width="56"
                height={netH}
                rx="10"
                fill={netColor}
                opacity="0.22"
                stroke={netColor}
                strokeWidth="1.5"
              />
            )}
            <text
              x={netX}
              y={net >= 0 ? netTopY - 10 : baseY + netH + 18}
              textAnchor="middle"
              fill="rgba(226, 232, 240, 0.95)"
              fontSize="12"
              fontWeight="700"
            >
              {net >= 0 ? `+${net}` : `${net}`}
            </text>

            {/* Closing bar */}
            <rect
              x={closingX - 28}
              y={closingY}
              width="56"
              height={baseY - closingY}
              rx="10"
              fill={closingColor}
              opacity="0.35"
              stroke={closingColor}
              strokeWidth="1.5"
            />
            <text x={closingX} y={closingY - 10} textAnchor="middle" fill="rgba(226, 232, 240, 0.95)" fontSize="12" fontWeight="700">
              {closing}
            </text>

            {/* Labels */}
            <text x={openingX} y={baseY + 26} textAnchor="middle" fill="rgba(203, 213, 225, 0.85)" fontSize="12" fontWeight="700">
              Opening
            </text>
            <text x={netX} y={baseY + 26} textAnchor="middle" fill="rgba(203, 213, 225, 0.85)" fontSize="12" fontWeight="700">
              Net
            </text>
            <text x={closingX} y={baseY + 26} textAnchor="middle" fill="rgba(203, 213, 225, 0.85)" fontSize="12" fontWeight="700">
              Closing
            </text>
          </svg>

          {/* Quick legend row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-military-border/60 bg-slate-900/20">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-military-textMuted uppercase tracking-widest">Opening Balance</span>
                <span className="text-sm font-extrabold text-sky-400">{formatCompact(opening)}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-military-border/60 bg-slate-900/20">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-military-textMuted uppercase tracking-widest">Net Movement</span>
                <span className={`text-sm font-extrabold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {net >= 0 ? `+${formatCompact(net)}` : formatCompact(net)}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-military-border/60 bg-slate-900/20">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-military-textMuted uppercase tracking-widest">Closing Balance</span>
                <span className="text-sm font-extrabold text-emerald-400">{formatCompact(closing)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small "troubleshooting" hint (non-intrusive) */}
      {!loading && (
        <p className="text-[11px] text-military-textMuted mt-4">
          Note: Net Movement is computed server-side as Purchases + Transfers In − Transfers Out for the selected filter window.
        </p>
      )}
    </div>
  );
};

export default DashboardChart;
