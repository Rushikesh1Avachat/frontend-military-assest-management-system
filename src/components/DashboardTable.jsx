const DashboardTable = ({ headers, data, icon, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto">
      {data.length > 0 ? (
        <table className="min-w-full divide-y divide-military-border">
          <thead className="bg-military-bg">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-military-muted uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-military-border">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-military-text">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-12 text-center">
          {icon && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-military-bg">{icon}</div>}
          <h3 className="mt-2 text-sm font-medium text-military-text">{emptyMessage}</h3>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;
