"use client";

import { useState, useEffect } from 'react';
import { Building2, Users, GraduationCap, Sparkles, Calendar, Loader2, RefreshCw, Database } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';

import KpiCard from './KpiCard';
import FilterBar from './FilterBar';
import GroupBarChart from './GroupBarChart';
import GenderDonutChart from './GenderDonutChart';
import CentreTypeTable from './CentreTypeTable';
import ActivityCard from './ActivityCard';
import ActivityModal from './ActivityModal';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const [centres, setCentres] = useState([]);
  const [gurus, setGurus] = useState([]);
  const [students, setStudents] = useState([]);
  const [valueAdditions, setValueAdditions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [individualCenters, setIndividualCenters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [insightMonths, setInsightMonths] = useState(3);
  const [reportPeriod, setReportPeriod] = useState('1 Apr 2025 – 31 Mar 2026');
  const [activeActivity, setActiveActivity] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const unsubs = [];

    try {
      const handleErr = (err) => {
        console.error('Firestore snapshot error:', err);
        setFirestoreError(err.message);
        setLoading(false);
      };

      unsubs.push(
        onSnapshot(collection(db, 'centres'), (snap) => {
          setCentres(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }, handleErr)
      );

      unsubs.push(
        onSnapshot(collection(db, 'gurus'), (snap) => {
          setGurus(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, handleErr)
      );

      unsubs.push(
        onSnapshot(collection(db, 'students'), (snap) => {
          setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, handleErr)
      );

      unsubs.push(
        onSnapshot(collection(db, 'valueAdditions'), (snap) => {
          setValueAdditions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, handleErr)
      );

      const qAct = query(collection(db, 'activities'), orderBy('createdAt', 'desc'));
      unsubs.push(
        onSnapshot(qAct, (snap) => {
          setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, handleErr)
      );

      unsubs.push(
        onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
          if (docSnap.exists()) {
            setReportPeriod(docSnap.data().reportPeriod || '1 Apr 2025 – 31 Mar 2026');
          }
        }, handleErr)
      );

      unsubs.push(
        onSnapshot(collection(db, 'individual_centers'), (snap) => {
          setIndividualCenters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, handleErr)
      );
    } catch (err) {
      setFirestoreError(err.message);
      setLoading(false);
    }

    return () => unsubs.forEach(u => u());
  }, []);

  // Only leaf-level student rows (School / Urban Domestic / Rural Domestic).
  // Excludes any aggregate "TOTAL BOYS" / "TOTAL GIRLS" rows that may exist in Firestore.
  const VALID_CENTRE_TYPES = new Set(['School', 'Urban Domestic', 'Rural Domestic']);

  const centreTypeMap = {
    'rural_domestic_balvikas': 'rural domestic',
    'school_balvikas': 'school',
    'urban_domestic_balvikas': 'urban domestic'
  };

  // Sum individual centers counts into aggregate centres counts dynamically
  const combinedCentres = centres.map(c => {
    const typeName = centreTypeMap[c.id];
    
    // Filter individual centers of this type and selected district
    const matched = individualCenters.filter(ic => {
      const matchType = ic.type === typeName;
      const matchDistrict = selectedDistrict === 'all' || ic.district === selectedDistrict;
      return matchType && matchDistrict;
    });

    const extraG1 = matched.filter(ic => (parseInt(ic.group1_boys) || 0) + (parseInt(ic.group1_girls) || 0) > 0).length;
    const extraG2 = matched.filter(ic => (parseInt(ic.group2_boys) || 0) + (parseInt(ic.group2_girls) || 0) > 0).length;
    const extraG3 = matched.filter(ic => (parseInt(ic.group3_boys) || 0) + (parseInt(ic.group3_girls) || 0) > 0).length;
    const extraG4 = matched.filter(ic => (parseInt(ic.group4_boys) || 0) + (parseInt(ic.group4_girls) || 0) > 0).length;

    return {
      ...c,
      group1: (c.group1 || 0) + extraG1,
      group2: (c.group2 || 0) + extraG2,
      group3: (c.group3 || 0) + extraG3,
      group4: (c.group4 || 0) + extraG4,
      total: (c.total || 0) + matched.length
    };
  });

  // Sum individual centers students counts into aggregate students counts dynamically
  const combinedStudents = students.map(s => {
    const cType = s.centreType; // e.g. "School"
    const gender = s.gender; // e.g. "Boys"

    // Filter individual centers of this type and selected district
    const matched = individualCenters.filter(ic => {
      const matchType = ic.type.toLowerCase() === cType.toLowerCase();
      const matchDistrict = selectedDistrict === 'all' || ic.district === selectedDistrict;
      return matchType && matchDistrict;
    });

    const suffix = gender === 'Boys' ? '_boys' : '_girls';
    const extraG1 = matched.reduce((sum, ic) => sum + (parseInt(ic[`group1${suffix}`]) || 0), 0);
    const extraG2 = matched.reduce((sum, ic) => sum + (parseInt(ic[`group2${suffix}`]) || 0), 0);
    const extraG3 = matched.reduce((sum, ic) => sum + (parseInt(ic[`group3${suffix}`]) || 0), 0);
    const extraG4 = matched.reduce((sum, ic) => sum + (parseInt(ic[`group4${suffix}`]) || 0), 0);
    const extraTotal = matched.reduce((sum, ic) => 
      sum + 
      (parseInt(ic[`group1${suffix}`]) || 0) +
      (parseInt(ic[`group2${suffix}`]) || 0) +
      (parseInt(ic[`group3${suffix}`]) || 0) +
      (parseInt(ic[`group4${suffix}`]) || 0)
    , 0);

    return {
      ...s,
      group1: (s.group1 || 0) + extraG1,
      group2: (s.group2 || 0) + extraG2,
      group3: (s.group3 || 0) + extraG3,
      group4: (s.group4 || 0) + extraG4,
      total: (s.total || 0) + extraTotal
    };
  });

  const leafStudents = combinedStudents.filter(s => VALID_CENTRE_TYPES.has(s.centreType));

  const getTotals = () => {
    if (selectedGroup === 'all') {
      return {
        totalCentres:  combinedCentres.reduce((s, c) => s + (c.total || 0), 0),
        totalGurus:    gurus.reduce((s, g) => s + (g.total || 0), 0),
        totalStudents: leafStudents.reduce((s, t) => s + (t.total || 0), 0),
      };
    }
    const f = selectedGroup; // 'group1' … 'group4'
    return {
      totalCentres:  combinedCentres.reduce((s, c) => s + (c[f] || 0), 0),
      totalGurus:    gurus.reduce((s, g) => s + (g[f] || 0), 0),
      totalStudents: leafStudents.reduce((s, t) => s + (t[f] || 0), 0),
    };
  };

  const { totalCentres, totalGurus, totalStudents } = getTotals();

  const filteredActivities = activities.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchDistrict = selectedDistrict === 'all' || a.district === selectedDistrict;
    return matchCategory && matchDistrict;
  });

  const uniqueCategories = [...new Set(activities.map(a => a.category))].filter(Boolean);
  const uniqueDistricts = [...new Set([
    ...activities.map(a => a.district),
    ...individualCenters.map(ic => ic.district)
  ])].filter(Boolean).sort();

  // Dynamic Insights calculation
  const getRecentInsights = () => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setMonth(now.getMonth() - parseInt(insightMonths));

    const recentActs = activities.filter(a => {
      const matchDistrict = selectedDistrict === 'all' || a.district === selectedDistrict;
      if (!matchDistrict) return false;

      if (!a.createdAt) return false;
      const actDate = a.createdAt.seconds 
        ? new Date(a.createdAt.seconds * 1000) 
        : new Date(a.createdAt);
      return actDate >= cutoff;
    });

    const centers = new Set();
    recentActs.forEach(a => {
      if (a.centersInvolved) {
        a.centersInvolved.split(',').forEach(c => {
          const trimmed = c.trim();
          if (trimmed) centers.add(trimmed);
        });
      }
    });

    // Count new centers started in this period
    const recentNewCenters = individualCenters.filter(ic => {
      const matchDistrict = selectedDistrict === 'all' || ic.district === selectedDistrict;
      if (!matchDistrict) return false;

      if (!ic.startedAt) return false;
      const startedDate = ic.startedAt.seconds 
        ? new Date(ic.startedAt.seconds * 1000) 
        : new Date(ic.startedAt);
      return startedDate >= cutoff;
    });

    const newCentersList = recentNewCenters.map(ic => ic.name || 'Unnamed Center').filter(Boolean);

    // Aggregate totals across all groups for new centers
    const totalNewBoys = recentNewCenters.reduce((sum, ic) =>
      sum +
      (parseInt(ic.group1_boys) || 0) +
      (parseInt(ic.group2_boys) || 0) +
      (parseInt(ic.group3_boys) || 0) +
      (parseInt(ic.group4_boys) || 0), 0
    );
    const totalNewGirls = recentNewCenters.reduce((sum, ic) =>
      sum +
      (parseInt(ic.group1_girls) || 0) +
      (parseInt(ic.group2_girls) || 0) +
      (parseInt(ic.group3_girls) || 0) +
      (parseInt(ic.group4_girls) || 0), 0
    );

    // Per-group student totals for new centers
    const newByGroup = [1, 2, 3, 4].map(g => ({
      label: `Group ${['I','II','III','IV'][g-1]}`,
      boys:  recentNewCenters.reduce((s, ic) => s + (parseInt(ic[`group${g}_boys`]) || 0), 0),
      girls: recentNewCenters.reduce((s, ic) => s + (parseInt(ic[`group${g}_girls`]) || 0), 0),
      centers: recentNewCenters.filter(ic => (parseInt(ic[`group${g}_boys`])||0) + (parseInt(ic[`group${g}_girls`])||0) > 0).length,
    }));

    // Per-type center counts for new centers
    const newByType = [
      { label: 'School', key: 'school' },
      { label: 'Rural Domestic', key: 'rural domestic' },
      { label: 'Urban Domestic', key: 'urban domestic' },
    ].map(t => ({
      label: t.label,
      count: recentNewCenters.filter(ic => ic.type === t.key).length,
    }));

    return {
      activityCount: recentActs.length,
      centersCount: centers.size,
      centersList: Array.from(centers),
      newCentersCount: recentNewCenters.length,
      newCentersList,
      totalNewBoys,
      totalNewGirls,
      newByGroup,
      newByType,
    };
  };

  const insights = getRecentInsights();

  // ── Value-addition helper ─────────────────────────────────────────────────
  const getValueMetric = (id) => {
    const v = valueAdditions.find(x => x.id === id);
    if (!v) return { value: '—' };
    const g = selectedGroup;
    if (g === 'all') {
      if (id === 'classes_conducted')  return { value: 'Regular' };
      if (id === 'training_programs')  return { value: (v.group1||0)+(v.group2||0)+(v.group3||0) };
      if (id === 'gurus_trained')      return { value: (v.group1||0)+(v.group2||0)+(v.group3||0) };
      if (id === 'alumni_enrolled')    return { value: (v.group1||0)+(v.group2||0) };
      if (id === 'new_centres')        return { value: v.group2 || 0 };
      if (id === 'vidya_jyoti_classes')return { value: (v.group1||0)+(v.group2||0) };
    }
    const map = { group1: v.group1, group2: v.group2, group3: v.group3, group4: 0 };
    if (id === 'classes_conducted') return { value: 'Weekly' };
    return { value: map[g] ?? 0 };
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Connecting to Firestore…</p>
      </div>
    );
  }


  // ── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="w-full font-sans">

      <div id="dashboard-content" className="space-y-8 p-1">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
              Sri Sathya Sai Balvikas
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm font-medium">
              <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">Tamil Nadu South</span>
              <span>•</span>
              <span>Annual Report Dashboard</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {reportPeriod}</span>
            </div>
          </div>
          <button onClick={() => router.push('/admin')} className='font-semibold text-blue-700 bg-blue-100 p-2 cursor-pointer hover:bg-blue-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>Manage Statistics</button>
        </div>

        {/* ── Filters ── */}
        <FilterBar
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={uniqueCategories}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          districts={uniqueDistricts}
          reportPeriod={reportPeriod}
        />

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Centres"   value={totalCentres}         icon={Building2}    colorClass="blue"   />
          <KpiCard title="Total Gurus"     value={totalGurus}           icon={Users}        colorClass="teal"   />
          <KpiCard title="Total Students"  value={totalStudents}        icon={GraduationCap} colorClass="amber"  />
          <KpiCard title="Activities Logged" value={activities.length}  icon={Sparkles}     colorClass="indigo" trend="All documented" />
        </div>

        {/* ── Dynamic Insights Section ── */}
        <div className="bg-gradient-to-br from-blue-50/40 via-slate-50/20 to-indigo-50/30 rounded-3xl border border-slate-100/80 p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Dynamic District Insights
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Active Center Analysis
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Dynamic activity-based tracking of Balvikas centers and operations.
              </p>
            </div>
            
            {/* Month Selector */}
            <div className="flex items-center gap-3 bg-white border border-slate-100/70 p-2 rounded-2xl shadow-xs self-stretch md:self-auto justify-between">
              <span className="text-xs font-semibold text-slate-400 pl-2">Time Window:</span>
              <select
                value={insightMonths}
                onChange={(e) => setInsightMonths(parseInt(e.target.value))}
                className="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value={1}>Past Month</option>
                <option value={2}>Past 2 Months</option>
                <option value={3}>Past 3 Months</option>
                <option value={6}>Past 6 Months</option>
                <option value={12}>Past 12 Months</option>
              </select>
            </div>
          </div>

          {/* ── Top row: summary stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Centers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-1 relative overflow-hidden">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">New Centers</span>
              <h4 className="text-3xl font-bold text-emerald-600">{insights.newCentersCount}</h4>
              <p className="text-2xs text-slate-400 font-medium">Started in past {insightMonths} {insightMonths === 1 ? 'month' : 'months'}</p>
              <div className="absolute right-2 bottom-2 opacity-5"><Building2 className="w-16 h-16 text-emerald-600" /></div>
            </div>

            {/* Total New Students */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-1 relative overflow-hidden">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">New Students</span>
              <h4 className="text-3xl font-bold text-blue-600">{insights.totalNewBoys + insights.totalNewGirls}</h4>
              <div className="flex items-center gap-3 pt-0.5">
                <span className="text-xs font-semibold text-slate-500">Boys: <span className="text-blue-600">{insights.totalNewBoys}</span></span>
                <span className="text-xs font-semibold text-slate-500">Girls: <span className="text-pink-500">{insights.totalNewGirls}</span></span>
              </div>
              <div className="absolute right-2 bottom-2 opacity-5"><GraduationCap className="w-16 h-16 text-blue-600" /></div>
            </div>

            {/* Active Centers from Activities */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-1 relative overflow-hidden">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Centers</span>
              <h4 className="text-3xl font-bold text-indigo-600">{insights.centersCount}</h4>
              <p className="text-2xs text-slate-400 font-medium">Conducted activities this period</p>
              <div className="absolute right-2 bottom-2 opacity-5"><Building2 className="w-16 h-16 text-indigo-600" /></div>
            </div>

            {/* Activities count */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col space-y-1 relative overflow-hidden">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Activities Logged</span>
              <h4 className="text-3xl font-bold text-violet-600">{insights.activityCount}</h4>
              <p className="text-2xs text-slate-400 font-medium">Events documented this period</p>
              <div className="absolute right-2 bottom-2 opacity-5"><Sparkles className="w-16 h-16 text-violet-600" /></div>
            </div>
          </div>

          {/* ── New Centers Detail breakdown (only shown when there are new centers) ── */}
          {insights.newCentersCount > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">New Centers Breakdown</h4>
                  <p className="text-2xs text-slate-400 font-medium">{insights.newCentersCount} center{insights.newCentersCount > 1 ? 's' : ''} started in the past {insightMonths} {insightMonths === 1 ? 'month' : 'months'} · {selectedDistrict === 'all' ? 'All Districts' : selectedDistrict}</p>
                </div>
                {/* Center name tags */}
                <div className="flex flex-wrap gap-1.5">
                  {insights.newCentersList.map((n, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Group */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">By Group Category</span>
                  <div className="space-y-2">
                    {insights.newByGroup.filter(g => g.boys + g.girls > 0 || g.centers > 0).map((g, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600 w-16 shrink-0">{g.label}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-pink-400"
                            style={{ width: `${insights.totalNewBoys + insights.totalNewGirls > 0 ? Math.round(((g.boys + g.girls) / (insights.totalNewBoys + insights.totalNewGirls)) * 100) : 0}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs shrink-0">
                          <span className="text-blue-600 font-semibold">{g.boys}B</span>
                          <span className="text-pink-500 font-semibold">{g.girls}G</span>
                          <span className="text-slate-400">({g.centers} ctr)</span>
                        </div>
                      </div>
                    ))}
                    {insights.newByGroup.every(g => g.boys + g.girls === 0) && (
                      <p className="text-xs text-slate-400 italic">No student data recorded for new centers.</p>
                    )}
                  </div>
                </div>

                {/* By Type */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">By Center Type</span>
                  <div className="grid grid-cols-3 gap-3">
                    {insights.newByType.map((t, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                        <span className="text-2xl font-bold text-slate-700 block">{t.count}</span>
                        <span className="text-2xs font-semibold text-slate-400 leading-tight block mt-0.5">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Centers from activities list */}
          {insights.centersList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Centers That Conducted Activities This Period</span>
              <div className="flex flex-wrap gap-2">
                {insights.centersList.map((c, idx) => (
                  <span key={idx} className="inline-flex items-center bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedDistrict !== 'all' && (
            <div className="text-xs text-amber-700 bg-amber-50/50 border border-amber-100/70 px-4 py-2.5 rounded-2xl font-medium">
              Note: Main statistical charts and KPI counts (Total Centres, Gurus, Students) show regional totals. Activity gallery and Active Center analysis are filtered specifically for <strong>{selectedDistrict}</strong>.
            </div>
          )}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:col-span-2 flex flex-col space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Group-Wise Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Centres, Gurus and Students across Group I–IV</p>
            </div>
            <GroupBarChart centres={combinedCentres} gurus={gurus} students={combinedStudents} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Gender Split</h3>
              <p className="text-xs text-slate-400 font-medium">
                Boys vs Girls {selectedGroup !== 'all' ? `in ${selectedGroup.replace('group', 'Group ')}` : 'across all groups'}
              </p>
            </div>
            <GenderDonutChart students={leafStudents} activeGroup={selectedGroup} />
          </div>
        </div>

        {/* ── Centre Breakdown Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-700">Bal Vikas Centres Breakdown</h3>
            <p className="text-xs text-slate-400 font-medium">School, Urban Domestic and Rural Domestic counts by Group</p>
          </div>
          <CentreTypeTable centres={combinedCentres} />
        </div>

        {/* ── Value Additions ── */}
        {valueAdditions.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Value Additions &amp; Initiatives</h3>
              <p className="text-xs text-slate-400 font-medium">Classes, training modules, alumni enrolment and Vidya Jyoti indicators</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'classes_conducted',  label: 'Classes Frequency',              sub: 'Online / Offline / Hybrid',   color: 'text-slate-800' },
                { id: 'training_programs',  label: 'Training Programs Conducted',    sub: `${getValueMetric('gurus_trained').value} Gurus participated`, color: 'text-emerald-600' },
                { id: 'alumni_enrolled',    label: 'Alumni Enrolled in SSSSO',       sub: selectedGroup==='all' ? 'Male + Female' : selectedGroup==='group1' ? 'Male' : selectedGroup==='group2' ? 'Female' : '—', color: 'text-blue-600' },
                { id: 'new_centres',        label: 'New Centres Commenced',          sub: 'Under Group II',              color: 'text-indigo-600' },
                { id: 'vidya_jyoti_classes',label: 'Vidya Jyoti Enrolment',         sub: selectedGroup==='all' ? 'Boys + Girls' : '—', color: 'text-amber-600', wide: true },
              ].map(({ id, label, sub, color, wide }) => (
                <div key={id} className={`bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-3 ${wide ? 'lg:col-span-2' : ''}`}>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Value Addition</span>
                    <h4 className="text-base font-medium text-slate-700 leading-tight">{label}</h4>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className={`text-2xl font-semibold ${color}`}>
                      {typeof getValueMetric(id).value === 'number'
                        ? getValueMetric(id).value.toLocaleString()
                        : getValueMetric(id).value}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activities Gallery ── */}
        <div className="space-y-6 pt-4">
          <div>
            <h3 className="text-base font-semibold text-slate-700">Activities Gallery</h3>
            <p className="text-xs text-slate-400 font-medium">Visits, camps, festivals and seva works across all districts</p>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredActivities.map(act => (
                <ActivityCard key={act.id} activity={act} onClick={() => setActiveActivity(act)} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 text-sm">
              {activities.length === 0
                ? 'No activities found in Firestore. Run the seed script to populate data.'
                : 'No activities match the selected category.'}
            </div>
          )}
        </div>

      </div>

      {/* ── Activity Detail Modal ── */}
      {activeActivity && (
        <ActivityModal activity={activeActivity} onClose={() => setActiveActivity(null)} />
      )}
    </div>
  );
}
