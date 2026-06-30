import React from 'react';

export default function KpiCard({ title, value, icon: Icon, colorClass = "blue", trend }) {
  // Map color names to classes
  const colorMap = {
    blue: {
      border: "border-blue-100",
      text: "text-blue-600",
      bg: "bg-blue-50/50"
    },
    teal: {
      border: "border-teal-100",
      text: "text-teal-600",
      bg: "bg-teal-50/50"
    },
    amber: {
      border: "border-amber-100",
      text: "text-amber-600",
      bg: "bg-amber-50/50"
    },
    indigo: {
      border: "border-indigo-100",
      text: "text-indigo-600",
      bg: "bg-indigo-50/50"
    }
  };

  const colors = colorMap[colorClass] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between transition-all duration-300 hover:border-slate-200">
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-medium text-slate-800 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3.5 rounded-xl ${colors.bg} ${colors.text}`}>
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
    </div>
  );
}
