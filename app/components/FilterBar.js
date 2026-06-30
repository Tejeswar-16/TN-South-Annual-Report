import React from 'react';

export default function FilterBar({ 
  selectedGroup, 
  setSelectedGroup, 
  selectedCategory, 
  setSelectedCategory,
  categories = [],
  selectedDistrict,
  setSelectedDistrict,
  districts = [],
  reportPeriod = '1 Apr 2025 – 31 Mar 2026'
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 mb-6">
      <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
        {/* Group Filter */}
        <div className="flex flex-col space-y-1 w-full sm:w-44">
          <label htmlFor="group-filter" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Filter by Group
          </label>
          <select
            id="group-filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-200 transition-colors cursor-pointer"
          >
            <option value="all">All Groups (I - IV)</option>
            <option value="group1">Group I</option>
            <option value="group2">Group II</option>
            <option value="group3">Group III</option>
            <option value="group4">Group IV</option>
          </select>
        </div>

        {/* District Filter */}
        {setSelectedDistrict && (
          <div className="flex flex-col space-y-1 w-full sm:w-48">
            <label htmlFor="district-filter" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Filter by District
            </label>
            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-200 transition-colors cursor-pointer"
            >
              <option value="all">All Districts</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {setSelectedCategory && (
          <div className="flex flex-col space-y-1 w-full sm:w-44">
            <label htmlFor="category-filter" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Activity Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-200 transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="text-xs text-slate-400 self-end sm:self-center font-medium mt-2 sm:mt-0">
        Report Period: {reportPeriod}
      </div>
    </div>
  );
}

