const DashboardSummaryCard = ({ title, value, icon, iconBg, change }) => {
  return (
    <div className="card">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${iconBg}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-military-muted truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-military-text">{typeof value === 'number' ? value.toLocaleString() : value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {change !== undefined && (
        <div className="px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>{' '}
            <span className="text-military-muted">from previous period</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummaryCard;
