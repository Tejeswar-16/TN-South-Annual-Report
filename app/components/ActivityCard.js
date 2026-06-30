import React from 'react';
import { MapPin, Calendar, Heart, Sparkles, Compass, GraduationCap } from 'lucide-react';

export default function ActivityCard({ activity, onClick }) {
  const { title, category, district, dateRange, photoUrls } = activity;

  // Category Colors Map
  const categoryColors = {
    Outreach: "bg-red-50 text-red-600 border-red-100",
    Festival: "bg-purple-50 text-purple-600 border-purple-100",
    Camp: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Vidya Jyoti": "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  // Category Icon Map
  const categoryIcons = {
    Outreach: Heart,
    Festival: Sparkles,
    Camp: Compass,
    "Vidya Jyoti": GraduationCap,
  };

  const IconComponent = categoryIcons[category] || Heart;
  const badgeClass = categoryColors[category] || "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer hover:border-slate-200 transition-all duration-300 hover:shadow-sm flex flex-col h-full"
    >
      {/* Photo Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-50">
        {photoUrls && photoUrls.length > 0 ? (
          <img 
            src={photoUrls[0]} 
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            No Images
          </div>
        )}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 backdrop-blur-md ${badgeClass}`}>
          <IconComponent className="w-3.5 h-3.5" />
          {category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <h3 className="text-base font-medium text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-50 text-xs text-slate-400 font-medium">
          {district && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{district}</span>
            </div>
          )}
          {dateRange && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
