import React from 'react';

export default function CentreTypeTable({ centres = [] }) {
  // Sort centres to keep consistent row order: School first, then Urban Domestic, then Rural Domestic
  const rowOrder = ["School Balvikas", "Urban Domestic Balvikas", "Rural Domestic Balvikas"];
  
  const sortedCentres = [...centres].sort((a, b) => {
    return rowOrder.indexOf(a.type) - rowOrder.indexOf(b.type);
  });

  // Calculate column totals
  const colTotals = {
    group1: sortedCentres.reduce((sum, item) => sum + (item.group1 || 0), 0),
    group2: sortedCentres.reduce((sum, item) => sum + (item.group2 || 0), 0),
    group3: sortedCentres.reduce((sum, item) => sum + (item.group3 || 0), 0),
    group4: sortedCentres.reduce((sum, item) => sum + (item.group4 || 0), 0),
    total: sortedCentres.reduce((sum, item) => sum + (item.total || 0), 0),
  };

  return (
    <div className="overflow-x-auto w-full rounded-xl border border-slate-100 bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
            <th className="py-4 px-6 font-semibold">Centre Type</th>
            <th className="py-4 px-4 text-right font-semibold">Group I</th>
            <th className="py-4 px-4 text-right font-semibold">Group II</th>
            <th className="py-4 px-4 text-right font-semibold">Group III</th>
            <th className="py-4 px-4 text-right font-semibold">Pre-sevadal / IV</th>
            <th className="py-4 px-6 text-right font-semibold bg-slate-50/80">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {sortedCentres.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-6 font-medium text-slate-800">{row.type}</td>
              <td className="py-4 px-4 text-right">{(row.group1 || 0).toLocaleString()}</td>
              <td className="py-4 px-4 text-right">{(row.group2 || 0).toLocaleString()}</td>
              <td className="py-4 px-4 text-right">{(row.group3 || 0).toLocaleString()}</td>
              <td className="py-4 px-4 text-right">{(row.group4 || 0).toLocaleString()}</td>
              <td className="py-4 px-6 text-right font-semibold bg-slate-50/30">{(row.total || 0).toLocaleString()}</td>
            </tr>
          ))}
          {/* Total Row */}
          <tr className="bg-slate-50/80 font-semibold text-slate-800 border-t-2 border-slate-100">
            <td className="py-4 px-6">TOTAL CENTRES</td>
            <td className="py-4 px-4 text-right">{colTotals.group1.toLocaleString()}</td>
            <td className="py-4 px-4 text-right">{colTotals.group2.toLocaleString()}</td>
            <td className="py-4 px-4 text-right">{colTotals.group3.toLocaleString()}</td>
            <td className="py-4 px-4 text-right">{colTotals.group4.toLocaleString()}</td>
            <td className="py-4 px-6 text-right text-blue-600 bg-slate-100/50">{colTotals.total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
