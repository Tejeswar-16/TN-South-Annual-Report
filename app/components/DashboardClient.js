"use client"

import { useRouter } from "next/navigation"
import KpiCard from '../components/KpiCard';
import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { Building2, Users, GraduationCap, Sparkles } from "lucide-react";
import GroupBarChart from '../components/GroupBarChart';
import GenderDonutChart from '../components/GenderDonutChart';
import CentreTypeTable from '../components/CentreTypeTable';
import ActivityCard from '../components/ActivityCard';
import ActivityModal from '../components/ActivityModal';
import { signOut } from "firebase/auth";

export default function DashboardClient(){

    const [statsCentres,setStatsCentres] = useState([]);
    const [statsGurus,setStatsGurus] = useState([]);
    const [statsStudents,setStatsStudents] = useState([]);
    const [statsValueAdditions,setStatsValueAdditions] = useState([]);
    const [loading,setLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("all");
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState("statistics");

    // ── Activities Gallery State ──
    const [activeActivity, setActiveActivity] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("all");

    const router = useRouter();
    const result = "Annual Report";

    useEffect(() => {
        async function fetchData(){
            try{
                setLoading(true);
                const q = query(
                  collection(db,"district")
                )
                const querySnapshot = await getDocs(q);
                let centres = {};
                let gurus = {};
                let students = {};
                let valueAddtions = {}
                let allActivities = [];

                querySnapshot.forEach((docSnap) => {
                  const data = docSnap.data();

                  if (data.centre){
                    Object.entries(data.centre).forEach(([type,groups]) => {
                      if (!centres[type])
                        centres[type] = {}

                      Object.entries(groups).forEach(([group,value]) => {
                        centres[type][group] = (Number(centres[type][group] || 0)) + Number(value || 0);
                      })
                    })
                  }

                  if (data.gurus) {
                    Object.entries(data.gurus).forEach(([gender, groups]) => {
                        if (!gurus[gender]) gurus[gender] = {};

                        Object.entries(groups).forEach(([group, value]) => {
                            gurus[gender][group] =
                                (Number(gurus[gender][group] || 0)) +
                                Number(value || 0);
                        });
                    });
                  }

                  if (data.students) {
                    Object.entries(data.students).forEach(([category, groups]) => {
                        if (!students[category]) students[category] = {};

                        Object.entries(groups).forEach(([group, value]) => {
                            students[category][group] =
                                (Number(students[category][group] || 0)) +
                                Number(value || 0);
                        });
                    });
                  }

                  if (data.valueAddtions) {
                    data.valueAddtions.forEach((item) => {
                        const existing = valueAddtions[item.metric];

                        if (!existing) {
                            valueAddtions[item.metric] = {
                                metric: item.metric,
                                group1: Number(item.group1) || 0,
                                group2: Number(item.group2) || 0,
                                group3: Number(item.group3) || 0,
                                notes: item.notes || "",
                            };
                        } else {
                            existing.group1 += Number(item.group1) || 0;
                            existing.group2 += Number(item.group2) || 0;
                            existing.group3 += Number(item.group3) || 0;

                            if (item.notes) {
                                existing.notes +=
                                    (existing.notes ? "\n" : "") + item.notes;
                            }
                        }
                    });
                }

                  if (data.activities) {
                    data.activities.forEach((activity) => {
                        allActivities.push({
                            ...activity,
                            district: docSnap.id,
                            photoUrls:
                                activity.photoUrls ||
                                activity.images ||
                                [],
                        });
                    });
                  }

                  setStatsCentres(Object.entries(centres));
                  setStatsGurus(Object.entries(gurus));
                  setStatsStudents(Object.entries(students));
                  setStatsValueAdditions(Object.values(valueAddtions));
                  setActivities(allActivities);
                })
            }
            catch(err){
                alert(err.message);
            }
            finally{
                setLoading(false);
            }
        }
        fetchData();
    },[]);


    const getTotal = (table) => {
        return table.reduce(
            (sum, [, data]) =>
                sum +
                Number(data["Group I"] || 0) +
                Number(data["Group II"] || 0) +
                Number(data["Group III"] || 0) +
                Number(data["Pre-Sevadal or IV"] || 0),
            0
        );
    };

    const totalCentres = getTotal(statsCentres);
    const totalGurus = getTotal(statsGurus);
    const totalStudents = getTotal(statsStudents);

    const combinedCentres = {
        "Group I": 0,
        "Group II": 0,
        "Group III": 0,
        "Pre-Sevadal or IV": 0,
    };

    statsCentres.forEach(([, data]) => {
        combinedCentres["Group I"] += Number(data["Group I"]);
        combinedCentres["Group II"] += Number(data["Group II"]);
        combinedCentres["Group III"] += Number(data["Group III"]);
        combinedCentres["Pre-Sevadal or IV"] += Number(data["Pre-Sevadal or IV"]);
    });

    const combinedGurus = {
        "Group I": 0,
        "Group II": 0,
        "Group III": 0,
        "Pre-Sevadal or IV": 0,
    };

    statsGurus.forEach(([, data]) => {
        combinedGurus["Group I"] += Number(data["Group I"]);
        combinedGurus["Group II"] += Number(data["Group II"]);
        combinedGurus["Group III"] += Number(data["Group III"]);
        combinedGurus["Pre-Sevadal or IV"] += Number(data["Pre-Sevadal or IV"]);
    });

    const combinedStudents = {
        "Group I": 0,
        "Group II": 0,
        "Group III": 0,
        "Pre-Sevadal or IV": 0,
    };

    statsStudents.forEach(([, data]) => {
        combinedStudents["Group I"] += Number(data["Group I"]);
        combinedStudents["Group II"] += Number(data["Group II"]);
        combinedStudents["Group III"] += Number(data["Group III"]);
        combinedStudents["Pre-Sevadal or IV"] += Number(data["Pre-Sevadal or IV"]);
    });

    const leafStudents = {
        boys: 0,
        girls: 0,
    };

    statsStudents.forEach(([category, data]) => {
        const total =
            Number(data["Group I"] || 0) +
            Number(data["Group II"] || 0) +
            Number(data["Group III"] || 0) +
            Number(data["Pre-Sevadal or IV"] || 0);

        if (category.startsWith("Boys")) {
            leafStudents.boys += total;
        } else if (category.startsWith("Girls")) {
            leafStudents.girls += total;
        }
    });
    
    const getValueMetric = (title) => {
        const item = statsValueAdditions.find(([key]) => key === title);

        if (!item) {
            return {
                value: 0,
                notes: "",
            };
        }

        const data = item[1];

        let total = 0;

        Object.entries(data).forEach(([key, value]) => {
            if (key !== "Notes") {
                total += Number(value || 0);
            }
        });

        return {
            value: total,
            notes: data.Notes || "",
        };
    };

    // ── Activities Gallery Derived Data ──

    const allActivities = activities.map(act => ({
        ...act,
        district: act.district || "All District",
        dateRange: act.date
            ? new Date(act.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : (act.dateRange || ''),
    }));

    const categories = ["all", ...Array.from(new Set(allActivities.map(a => a.category).filter(Boolean)))];

    const filteredActivities = categoryFilter === "all"
        ? allActivities
        : allActivities.filter(a => a.category === categoryFilter);

    
    async function handleLogout(){
        signOut(auth)
        .then(() => {
            router.push("/")
        })
        .catch((error) => {
            alert(error.message);
        })
    }

    return (
        <>
            <div className="w-full font-sans">
                <div className="flex flex-col p-4 md:p-0 ml-0 mr-0 md:ml-10 md:mr-10 md:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1.5 flex flex-col items-center md:items-start text-center md:text-left mx-auto md:mx-0">
                        <h1 className=" text-2xl md:text-3xl text-slate-800 font-medium leading-tight">
                          Sri Sathya Sai Balvikas
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm font-medium">
                        <span className="mx-auto flex justify-center text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">Tamil Nadu South</span>
                        <span className='mx-auto flex justify-center'>{result} Dashboard</span>
                        </div>
                    </div>
                    <div className='flex flex-row gap-x-4 justify-center mx-auto md:mx-0'>
                        <button onClick={() => router.push(`/district`)} className='font-semibold text-violet-700 bg-violet-100 p-1 md:p-2 cursor-pointer hover:bg-violet-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>District-wise Statistics</button>
                        <button onClick={() => router.push(`/manage`)} className='font-semibold text-yellow-700 bg-yellow-100 p-1 md:p-2 cursor-pointer hover:bg-yellow-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>Manage Statistics</button>
                        <button onClick={handleLogout} className='font-semibold text-red-700 bg-red-100 p-1 md:p-2 cursor-pointer hover:bg-red-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>Logout</button>
                    
                    </div>
                </div>
                <div className="m-4 md:m-8 bg-gray-50 shadow-xl shadow-gray-200 p-4 md:p-6 rounded-xl">
                    <h1 className="text-2xl font-bold text-center mb-8">Tamil Nadu South Annual Report Dashboard</h1>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                        <KpiCard
                            title="Total Centres"
                            value={totalCentres}
                            icon={Building2}
                            colorClass="blue"
                        />

                        <KpiCard
                            title="Total Gurus"
                            value={totalGurus}
                            icon={Users}
                            colorClass="teal"
                        />

                        <KpiCard
                            title="Total Students"
                            value={totalStudents}
                            icon={GraduationCap}
                            colorClass="amber"
                        />

                        <KpiCard
                            title="Activities Logged"
                            value={activities.length}
                            icon={Sparkles}
                            colorClass="indigo"
                            trend="All documented"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 xl:col-span-2 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-700">
                                Group-Wise Distribution
                            </h3>

                            <p className="text-xs text-slate-400 mb-4">
                                Centres, Gurus and Students across Group I–IV
                            </p>

                            <GroupBarChart
                                centres={combinedCentres}
                                gurus={combinedGurus}
                                students={combinedStudents}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-700">
                                Gender Split
                            </h3>

                            <p className="text-xs text-slate-400 mb-4">
                                Boys vs Girls{" "}
                                {selectedGroup !== "all"
                                    ? `in ${selectedGroup.replace("group", "Group ")}`
                                    : "across all groups"}
                            </p>

                            <GenderDonutChart
                                students={leafStudents}
                                activeGroup={selectedGroup}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl mt-10 border border-slate-100 p-6 space-y-4 shadow-sm">
                        <div>
                            <h3 className="text-base font-semibold text-slate-700">Balvikas Centres Breakdown</h3>
                            <p className="text-xs text-slate-400">
                                School, Urban Domestic and Rural Domestic counts by Group
                            </p>
                        </div>

                        <CentreTypeTable centres={statsCentres} />
                    </div>

                    {statsValueAdditions.length > 0 && (
                    <div className="mt-10">
                        <div className="mb-6">
                        <h3 className="text-xl font-semibold text-slate-800">
                            Value Additions & Initiatives
                        </h3>
                        <p className="text-sm text-slate-500">
                            District level value additions and special initiatives
                        </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {statsValueAdditions.map((item, index) => {
                                const g1 = Number(item.group1 || 0);
                                const g2 = Number(item.group2 || 0);
                                const g3 = Number(item.group3 || 0);

                                const total = g1 + g2 + g3;

                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
                                    >
                                        <h4 className="text-lg font-semibold text-slate-800 mb-5">
                                            {item.metric}
                                        </h4>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Group I</span>
                                                <span className="font-semibold">{g1}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Group II</span>
                                                <span className="font-semibold">{g2}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Group III</span>
                                                <span className="font-semibold">{g3}</span>
                                            </div>

                                            <hr className="my-2" />

                                            <div className="flex justify-between text-base">
                                                <span className="font-semibold">Total</span>
                                                <span className="text-blue-600 font-bold">{total}</span>
                                            </div>

                                            {item.notes && (
                                                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                                    <p className="text-xs text-slate-400 mb-1">Notes</p>
                                                    <p className="text-sm text-slate-700">
                                                        {item.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    )}

                    {/* ── Activities Gallery ── */}
                    <div className="space-y-6 pt-10">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-700">Activities Gallery</h3>
                                <p className="text-xs text-slate-400 font-medium">Visits, camps, festivals and seva works in {result} district</p>
                            </div>

                            {categories.length > 1 && (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoryFilter(cat)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                                                categoryFilter === cat
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {cat === 'all' ? 'All' : cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {filteredActivities.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredActivities.map((act, idx) => (
                                    <ActivityCard key={act.id || idx} activity={act} onClick={() => setActiveActivity(act)} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 text-sm">
                                {allActivities.length === 0
                                    ? 'No activities found. Add activities from the district statistics page.'
                                    : 'No activities match the selected filter.'}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Activity Detail Modal ── */}
            {activeActivity && (
                <ActivityModal activity={activeActivity} onClose={() => setActiveActivity(null)} />
            )}
        </>
    )
}
