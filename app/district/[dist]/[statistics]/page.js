"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Plus, FileText, Image as ImageIcon, Loader2, Lock, LayoutGrid, CheckCircle, AlertCircle, Trash2, Edit, X, Building2, Sparkles } from 'lucide-react';
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../../../firebase/config';
import ActivityCard from '../../../components/ActivityCard';
import ActivityModal from '../../../components/ActivityModal';

export default function Statistics(){
    
    const [loading,setLoading] = useState(false);
    const [reportPeriod,setReportPeriod] = useState("");
    const [statsCentres, setStatsCentres] = useState([]);
    const [statsGurus, setStatsGurus] = useState([]);
    const [statsStudents, setStatsStudents] = useState([]);
    const [statsValueAdditions, setStatsValueAdditions] = useState([]);
    const [activeTab, setActiveTab] = useState("statistics");
    const [activities, setActivities] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState("");

    const emptyActivity = {
        id: "",
        title: "",
        description: "",
        date: "",
        category: "",
        photoUrls: [],
    };
    const [activityForm, setActivityForm] = useState(emptyActivity);
    const [editingIndex, setEditingIndex] = useState(-1);

    // ── Individual Centers State ──
    const [individualCenters, setIndividualCenters] = useState([]);
    const [centerName, setCenterName] = useState('');
    const [centerType, setCenterType] = useState('school'); // 'school' | 'rural domestic' | 'urban domestic'
    const [g1Boys, setG1Boys] = useState('');
    const [g1Girls, setG1Girls] = useState('');
    const [g2Boys, setG2Boys] = useState('');
    const [g2Girls, setG2Girls] = useState('');
    const [g3Boys, setG3Boys] = useState('');
    const [g3Girls, setG3Girls] = useState('');
    const [g4Boys, setG4Boys] = useState('');
    const [g4Girls, setG4Girls] = useState('');
    const [centerStartedAt, setCenterStartedAt] = useState(new Date().toISOString().split('T')[0]);
    const [editingCenterId, setEditingCenterId] = useState(null);

    // ── Activity Modal (viewer) State ──
    const [viewingActivityIndex, setViewingActivityIndex] = useState(null); // index into activities, null = closed

    const router = useRouter();

    const params = useParams();
    const district = params.dist.replace('-',' ')
    const result = district.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");


    useEffect(() => {
        async function fetchData(){
            try{
                setLoading(true);
                const docRef = doc(db, "district", result);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()){
                    const data = docSnap.data();

                    if (!data.centre) {
                        const defaultCentres = {
                            "Rural Domestic Balvikas": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "School Balvikas": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Urban Domestic Balvikas": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                        };

                        await setDoc(
                            docRef,
                            { centre: defaultCentres },
                            { merge: true }
                        );

                        setStatsCentres(Object.entries(defaultCentres));
                    }
                    else{
                        setStatsCentres(Object.entries(data.centre))
                    }

                    if (!data.gurus) {
                        const defaultGurus = {
                            "Female": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Male": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                        };

                        await setDoc(
                            docRef,
                            { gurus: defaultGurus },
                            { merge: true }
                        );

                        setStatsGurus(Object.entries(defaultGurus));
                    }
                    else{
                        setStatsGurus(Object.entries(data.gurus))
                    }


                    if (!data.students) {
                        const defaultStudents = {
                            "Boys - Rural Domestic": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Boys - School Balvikas": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Boys - Urban Domestic": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Girls - Rural Domestic": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Girls - School Balvikas": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                            "Girls - Urban Domestic": {
                                "Group I": "0",
                                "Group II": "0",
                                "Group III": "0",
                                "Pre-Sevadal or IV": "0",
                            },
                        };

                        await setDoc(
                            docRef,
                            { students: defaultStudents },
                            { merge: true }
                        );

                        setStatsStudents(Object.entries(defaultStudents));
                    }
                    else{
                        setStatsStudents(Object.entries(data.students))
                    }


                    if (!data.values) {
                        const defaultValues = {
                            "Alumni enrolled in SSSSO": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                            "Online/Offline/Hybrid classes conducted": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                            "Gurus participated in training": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                            "New Bal Vikas centres commenced": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                            "Training programs conducted": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                            "Vidya Jyoti enrollment": {
                                "G1 / Male / Boys": "0",
                                "G2 / Female / Girls": "0",
                                "Group III": "0",
                                "Notes": "",
                            },
                        };

                        await setDoc(
                            docRef,
                            { values: defaultValues },
                            { merge: true }
                        );

                        setStatsValueAdditions(Object.entries(defaultValues));
                    }
                    else{
                        setStatsValueAdditions(Object.entries(data.values))
                    }
                    // Normalize activity images to photoUrls
                    const loadedActs = (data.activities || []).map(act => ({
                        ...act,
                        photoUrls: act.photoUrls || act.images || []
                    }));
                    setActivities(loadedActs);

                    // Individual centers scoped to this district
                    setIndividualCenters(Array.isArray(data.individualCenters) ? data.individualCenters : []);
                    if (data.reportPeriod) setReportPeriod(data.reportPeriod);
                }
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

    const getTotal = (group) => {
        return statsCentres.reduce(
            (sum, [, data]) => sum + Number(data[group] || 0),
            0
        );
    };

    const getTotal1 = (group) => {
        return statsGurus.reduce(
            (sum, [, data]) => sum + Number(data[group] || 0),
            0
        );
    };

    const getTotal2 = (group) => {
        return statsStudents.reduce(
            (sum, [, data]) => sum + Number(data[group] || 0),
            0
        );
    };

    const getTotal3 = (group) => {
        return statsValueAdditions.reduce(
            (sum, [, data]) => sum + Number(data[group] || 0),
            0
        );
    };


    function handleCentreChange(centreType,group,value){
        setStatsCentres(prev => 
            prev.map(([name,data]) => 
                name === centreType
                    ? [
                        name,
                        {
                            ...data,
                            [group]: value,
                        },
                    ]
                    :
                    [name,data]
            )
        )
    }

    function handleGurus(gender,group,value){
        setStatsGurus(prev => 
            prev.map(([name,data]) => 
                name === gender
                    ? [
                        name,
                        {
                            ...data,
                            [group]: value,
                        },
                    ]
                    :
                    [name,data]
            )
        )
    }

    function handleStudents(studentCategory,group,value){
        setStatsStudents(prev => 
            prev.map(([name,data]) => 
                name === studentCategory
                    ? [
                        name,
                        {
                            ...data,
                            [group]: value,
                        },
                    ]
                    :
                    [name,data]
            )
        )
    }

    function handleValue(initiative,group,value){
        setStatsValueAdditions(prev => 
            prev.map(([name,data]) => 
                name === initiative
                    ? [
                        name,
                        {
                            ...data,
                            [group]: value,
                        },
                    ]
                    :
                    [name,data]
            )
        )
    }

    const saveStatistics = async () => {
        try {
            setLoading(true);

            await setDoc(
                doc(db,"district",result),
                {
                    centre: Object.fromEntries(statsCentres),
                    gurus: Object.fromEntries(statsGurus),
                    students: Object.fromEntries(statsStudents),
                    values: Object.fromEntries(statsValueAdditions),
                    reportPeriod,
                    activities,
                    individualCenters,
                },
                { merge:true }
            );
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        finally{
            setLoading(false);
        }
    };

    function clearActivityForm() {
        setActivityForm(emptyActivity);
        setEditingIndex(-1);
        setSelectedFiles([]);
    }

    const addOrUpdateActivity = async () => {
        if (!activityForm.title.trim()) {
            alert("Title is required");
            return;
        }

        try {
            setLoading(true);
            setUploadProgress("Uploading images...");
            const uploadedUrls = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
                const formData = new FormData();
                formData.append("file", selectedFiles[i]);
                formData.append("upload_preset", "balvikas_upload");

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/i1xmxubn/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to upload image to Cloudinary");
                }

                const data = await response.json();
                uploadedUrls.push(data.secure_url);
            }

            const updatedImages = [...(activityForm.photoUrls || []), ...uploadedUrls];
            const updatedForm = { ...activityForm, photoUrls: updatedImages };

            let newActivities = [];
            if (editingIndex === -1) {
                const newAct = {
                    ...updatedForm,
                    id: Date.now().toString()
                };
                newActivities = [...activities, newAct];
            } else {
                newActivities = [...activities];
                newActivities[editingIndex] = updatedForm;
            }

            setActivities(newActivities);
            clearActivityForm();
            setSelectedFiles([]);
            setUploadProgress("");

            // Auto-save to Firestore
            setUploadProgress("Saving to Firestore...");
            await setDoc(
                doc(db, "district", result),
                {
                    centre: Object.fromEntries(statsCentres),
                    gurus: Object.fromEntries(statsGurus),
                    students: Object.fromEntries(statsStudents),
                    values: Object.fromEntries(statsValueAdditions),
                    reportPeriod,
                    activities: newActivities,
                    individualCenters,
                },
                { merge: true }
            );
            setUploadProgress("");
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
            setUploadProgress("");
        }
    };

    function editActivity(index) {
        setActivityForm(activities[index]);
        setEditingIndex(index);
    }

    const deleteActivity = async (index) => {
        if (!confirm("Are you sure you want to delete this activity?")) return;
        const newActivities = activities.filter((_, i) => i !== index);
        setActivities(newActivities);
        if (editingIndex === index) {
            clearActivityForm();
        }

        try {
            setLoading(true);
            await setDoc(
                doc(db, "district", result),
                {
                    centre: Object.fromEntries(statsCentres),
                    gurus: Object.fromEntries(statsGurus),
                    students: Object.fromEntries(statsStudents),
                    values: Object.fromEntries(statsValueAdditions),
                    reportPeriod,
                    activities: newActivities,
                    individualCenters,
                },
                { merge: true }
            );
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Individual Center Handlers (district-scoped) ──

    function clearCenterForm() {
        setCenterName('');
        setCenterType('school');
        setG1Boys('');
        setG1Girls('');
        setG2Boys('');
        setG2Girls('');
        setG3Boys('');
        setG3Girls('');
        setG4Boys('');
        setG4Girls('');
        setCenterStartedAt(new Date().toISOString().split('T')[0]);
        setEditingCenterId(null);
    }

    const handleSaveCenter = async (e) => {
        e.preventDefault();
        if (!centerStartedAt) {
            alert("Date started is required");
            return;
        }

        setLoading(true);
        try {
            const centerData = {
                id: editingCenterId || Date.now().toString(),
                name: centerName || null,
                district: result,
                type: centerType,
                group1_boys: parseInt(g1Boys) || 0,
                group1_girls: parseInt(g1Girls) || 0,
                group2_boys: parseInt(g2Boys) || 0,
                group2_girls: parseInt(g2Girls) || 0,
                group3_boys: parseInt(g3Boys) || 0,
                group3_girls: parseInt(g3Girls) || 0,
                group4_boys: parseInt(g4Boys) || 0,
                group4_girls: parseInt(g4Girls) || 0,
                startedAt: centerStartedAt,
                createdAt: editingCenterId
                    ? (individualCenters.find(c => c.id === editingCenterId)?.createdAt || new Date().toISOString())
                    : new Date().toISOString(),
            };

            let newCenters;
            if (editingCenterId) {
                newCenters = individualCenters.map(c => c.id === editingCenterId ? centerData : c);
            } else {
                newCenters = [...individualCenters, centerData];
            }

            setIndividualCenters(newCenters);

            await setDoc(
                doc(db, "district", result),
                {
                    centre: Object.fromEntries(statsCentres),
                    gurus: Object.fromEntries(statsGurus),
                    students: Object.fromEntries(statsStudents),
                    values: Object.fromEntries(statsValueAdditions),
                    reportPeriod,
                    activities,
                    individualCenters: newCenters,
                },
                { merge: true }
            );

            clearCenterForm();
        } catch (err) {
            console.error(err);
            alert(`Failed to save center: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    function handleEditCenter(center) {
        setCenterName(center.name || '');
        setCenterType(center.type || 'school');
        setG1Boys(center.group1_boys || '');
        setG1Girls(center.group1_girls || '');
        setG2Boys(center.group2_boys || '');
        setG2Girls(center.group2_girls || '');
        setG3Boys(center.group3_boys || '');
        setG3Girls(center.group3_girls || '');
        setG4Boys(center.group4_boys || '');
        setG4Girls(center.group4_girls || '');
        setCenterStartedAt(
            center.startedAt
                ? (center.startedAt.seconds
                    ? new Date(center.startedAt.seconds * 1000).toISOString().split('T')[0]
                    : new Date(center.startedAt).toISOString().split('T')[0])
                : new Date().toISOString().split('T')[0]
        );
        setEditingCenterId(center.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDeleteCenter = async (id) => {
        if (!confirm("Are you sure you want to delete this center? This action cannot be undone.")) {
            return;
        }

        setLoading(true);
        try {
            const newCenters = individualCenters.filter(c => c.id !== id);
            setIndividualCenters(newCenters);
            if (editingCenterId === id) clearCenterForm();

            await setDoc(
                doc(db, "district", result),
                {
                    centre: Object.fromEntries(statsCentres),
                    gurus: Object.fromEntries(statsGurus),
                    students: Object.fromEntries(statsStudents),
                    values: Object.fromEntries(statsValueAdditions),
                    reportPeriod,
                    activities,
                    individualCenters: newCenters,
                },
                { merge: true }
            );
        } catch (err) {
            console.error(err);
            alert(`Failed to delete center: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ── Activity Modal Handlers ──

    function openActivityViewer(index) {
        setViewingActivityIndex(index);
    }

    function closeActivityViewer() {
        setViewingActivityIndex(null);
    }

    const viewingActivityRaw = viewingActivityIndex !== null ? activities[viewingActivityIndex] : null;
    const viewingActivity = viewingActivityRaw ? {
        ...viewingActivityRaw,
        district: result,
        dateRange: viewingActivityRaw.date
            ? new Date(viewingActivityRaw.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '',
    } : null;

    return (
        <>
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab("statistics")}
                        className={`px-5 py-3 font-semibold ${
                            activeTab==="statistics"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                        }`}
                    >
                        Statistics
                </button>

                <button onClick={() => setActiveTab("activities")}
                        className={`px-5 py-3 font-semibold ${
                            activeTab==="activities"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                        }`}
                    >
                        Activities
                </button>

                <button onClick={() => setActiveTab("centers")}
                        className={`px-5 py-3 font-semibold ${
                            activeTab==="centers"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500"
                        }`}
                    >
                        Centers
                </button>
            </div>
            {activeTab==="statistics" && (
                <>
                    <div className="w-full font-sans">
                <div className="flex flex-col p-4 md:p-8 md:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1.5">
                        <h1 className="mx-auto flex justify-center text-2xl md:text-3xl font-medium text-slate-800 leading-tight">
                        Sri Sathya Sai Balvikas
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm font-medium">
                        <span className="mx-auto flex justify-center text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">Tamil Nadu South</span>
                        <span className='mx-auto flex justify-center'>{result} Statistics</span>
                        </div>
                    </div>
                    <div className='flex flex-row gap-x-4 justify-center mx-auto md:mx-0'>
                        <button onClick={() => router.push(`/district/${params.dist}`)} className='font-semibold text-yellow-700 bg-yellow-100 p-1 md:p-2 cursor-pointer hover:bg-yellow-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out'>Dashboard</button>
                    </div>
                </div>
                <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">

                    {loading && (
                    <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-sm font-medium">Syncing data...</span>
                    </div>
                    )}

                    {!loading && (
                    <div className="space-y-8">
                        {/* General Settings */}
                        <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100/80">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-indigo-500 pl-2">General Settings</h4>
                        <div className="space-y-1.5">
                            <label className="text-xs mr-2 font-semibold text-slate-400 uppercase tracking-wider">Dashboard Report Period Label</label>
                            <input 
                            type="text" 
                            value={reportPeriod}
                            onChange={(e) => setReportPeriod(e.target.value)}
                            placeholder="e.g. 1 Apr 2025 – 31 Mar 2026"
                            className="w-full sm:w-96 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        </div>

                        {/* Centres Table */}
                        <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-blue-500 pl-2">Centres Counts</h4>
                        <div className="overflow-x-auto rounded-xl border border-black">
                            <table className="w-full text-left border-collapse">
                            <thead className="text-xs font-medium text-white uppercase">
                                <tr className="bg-gray-900">
                                    <th className="py-3 px-4">Centre Type</th>
                                    <th className="py-3 px-4 text-center">Group I</th>
                                    <th className="py-3 px-4 text-center">Group II</th>
                                    <th className="py-3 px-4 text-center">Group III</th>
                                    <th className="py-3 px-4 text-center">Pre-sevadal / IV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {statsCentres.map((c,index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4 font-medium text-slate-700">{c[0]}</td>
                                    <td className="py-3 px-4  text-center">
                                    <input 
                                        type="number" 
                                        value={c[1]["Group I"]}
                                        onChange={(e) => handleCentreChange(c[0],"Group I",e.target.value)}
                                        className="w-20 text-center bg-slate-50 border border-slate-100 px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input 
                                        type="number" 
                                        value={c[1]["Group II"]}
                                        onChange={(e) => handleCentreChange(c[0],"Group II",e.target.value)}
                                        className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input 
                                        type="number" 
                                        value={c[1]["Group III"]}
                                        onChange={(e) => handleCentreChange(c[0],"Group III",e.target.value)}
                                        className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input 
                                        type="number" 
                                        value={c[1]["Pre-Sevadal or IV"]}
                                        onChange={(e) => handleCentreChange(c[0],"Pre-Sevadal or IV",e.target.value)}
                                        className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    </td>
                                </tr>
                                ))}
                                <tr className="bg-gray-100 border-t border-gray-900">
                                    <td className="py-3 px-4 font-medium text-slate-700">Total</td>
                                    <td className="py-3 px-4  text-center">
                                    <input type="number" value={getTotal("Group I")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input type="number" value={getTotal("Group II")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input type="number" value={getTotal("Group III")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" />
                                    </td>
                                    <td className="py-3 px-4  text-center">
                                    <input type="number" value={getTotal("Pre-Sevadal or IV")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" />
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Gurus Table */}
                        <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-teal-500 pl-2">Gurus Counts</h4>
                        <div className="overflow-x-auto rounded-xl">
                            <table className="w-full text-left border border-black">
                            <thead className="bg-gray-900 text-xs font-medium text-white uppercase">
                                <tr>
                                <th className="py-3 px-4">Gender</th>
                                <th className="py-3 px-4 text-center">Group I</th>
                                <th className="py-3 px-4 text-center">Group II</th>
                                <th className="py-3 px-4 text-center">Group III</th>
                                <th className="py-3 px-4 text-center">Pre-sevadal / IV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {statsGurus.map((g,index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4 font-medium text-slate-700">{g[0]}</td>
                                    <td className="py-3 px-4 text-center">
                                    <input type="number" value={g[1]["Group I"]} onChange={(e) => handleGurus(g[0],"Group I",e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-teal-500" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                    <input type="number" value={g[1]["Group II"]} onChange={(e) => handleGurus(g[0],"Group II",e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-teal-500" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                    <input type="number" value={g[1]["Group III"]} onChange={(e) => handleGurus(g[0],"Group III",e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-teal-500" />
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                    <input type="number" value={g[1]["Pre-Sevadal or IV"]} onChange={(e) => handleGurus(g[0],"Pre-Sevadal or IV",e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-teal-500" />
                                    </td>
                                </tr>
                                ))}
                                <tr className="bg-gray-100 border-t border-gray-900">
                                    <td className="py-3 px-4 font-medium text-slate-700">Total</td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal1("Group I")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal1("Group II")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal1("Group III")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal1("Pre-Sevadal or IV")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Students Table */}
                        <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-amber-500 pl-2">Students Counts</h4>
                        <div className="overflow-x-auto rounded-xl border border-black">
                            <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-900 text-xs font-medium text-white uppercase">
                                <tr>
                                <th className="py-3 px-4">Student Category</th>
                                <th className="py-3 px-4 text-center">Group I</th>
                                <th className="py-3 px-4 text-center">Group II</th>
                                <th className="py-3 px-4 text-center">Group III</th>
                                <th className="py-3 px-4 text-center">Pre-sevadal / IV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {statsStudents.map((s,index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4 font-medium text-slate-700">{s[0]}</td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={s[1]["Group I"]} onChange={(e) => handleStudents(s[0],'Group I',e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-amber-500" /></td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={s[1]["Group II"]} onChange={(e) => handleStudents(s[0],'Group II',e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-amber-500" /></td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={s[1]["Group III"]} onChange={(e) => handleStudents(s[0],'Group III',e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-amber-500" /></td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={s[1]["Pre-Sevadal or IV"]} onChange={(e) => handleStudents(s[0],'Pre-Sevadal or IV',e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-amber-500" /></td>
                                </tr>
                                ))}
                                <tr className="bg-gray-100 border-t border-gray-900">
                                    <td className="py-3 px-4 font-medium text-slate-700">Total</td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal2("Group I")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal2("Group II")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal2("Group III")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                    <td className="py-3 px-4  text-center"><input type="number" value={getTotal2("Pre-Sevadal or IV")} disabled className="w-20 bg-slate-50 border border-slate-100  text-center px-2 py-1 rounded" /></td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Value Additions */}
                        <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-indigo-500 pl-2">Value Additions Initiatives</h4>
                        <div className="overflow-x-auto rounded-xl border border-black">
                            <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-900 text-xs font-medium text-white uppercase">
                                <tr>
                                <th className="py-3 px-4">Initiative Metric</th>
                                <th className="py-3 px-4 text-center">G1 / Male / Boys</th>
                                <th className="py-3 px-4 text-center">G2 / Female / Girls</th>
                                <th className="py-3 px-4 text-center">Group III</th>
                                <th className="py-3 px-4 text-center">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {statsValueAdditions.map((v,index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4 font-medium text-slate-700">{v[0]}</td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={v[1]["G1 / Male / Boys"]} onChange={(e) => handleValue(v[0], 'G1 / Male / Boys', e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-indigo-500" placeholder="0" /></td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={v[1]["G2 / Female / Girls"]} onChange={(e) => handleValue(v[0], 'G2 / Female / Girls', e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-indigo-500" placeholder="0" /></td>
                                    <td className="py-3 px-4 text-center"><input type="number" value={v[1]["Group III"]} onChange={(e) => handleValue(v[0], 'Group III', e.target.value)} className="w-20 bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-indigo-500" placeholder="0" /></td>
                                    <td className="py-3 px-4 text-center"><input type="text" value={v[1]["Notes"]} onChange={(e) => handleValue(v[0], "Notes", e.target.value)} className="w-full bg-slate-50 border border-slate-100 text-center px-2 py-1 rounded focus:outline-none focus:border-indigo-500 text-xs" placeholder="Add notes..." /></td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end pt-4">
                        <button
                            onClick={saveStatistics}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:cursor-pointer hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                                Save Statistics
                        </button>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
                </>
            )}
            {activeTab === "activities" && (
            <div className="space-y-8">

                {/* ── Activity Form ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <div className="border-b border-slate-50 pb-4">
                        <h2 className="text-base font-semibold text-slate-700">
                            {editingIndex === -1 ? "Log New Activity" : "Edit Activity"}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {editingIndex === -1
                                ? "Record a new event, camp, festival or service activity for this district."
                                : "Modify the activity details and save the changes."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Title *</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
                                placeholder="e.g. Balvikas Children Visit to Oldage Home"
                                value={activityForm.title}
                                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors"
                                value={activityForm.date}
                                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                                value={activityForm.category}
                                onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                <option>Bhajans</option>
                                <option>Service</option>
                                <option>Medical Camp</option>
                                <option>Sports</option>
                                <option>Education</option>
                                <option>Festival</option>
                                <option>Spiritual</option>
                                <option>Outreach</option>
                                <option>Camp</option>
                                <option>Vidya Jyoti</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                            <textarea
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                                placeholder="Describe the activity, seva details, participants, impact..."
                                value={activityForm.description}
                                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                            />
                        </div>

                        {/* Existing Images Manager */}
                        {activityForm.photoUrls && activityForm.photoUrls.length > 0 && (
                            <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Existing Photos ({activityForm.photoUrls.length})</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {activityForm.photoUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                                            <img src={url} alt="" className="object-cover w-full h-full" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const filtered = activityForm.photoUrls.filter((_, i) => i !== idx);
                                                    setActivityForm({ ...activityForm, photoUrls: filtered });
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm cursor-pointer"
                                                title="Remove image"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Upload Input */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                {editingIndex === -1 ? "Upload Photos" : "Upload Additional Photos"}
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setSelectedFiles(Array.from(e.target.files));
                                    }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none cursor-pointer"
                            />
                            {selectedFiles.length > 0 && (
                                <p className="text-xs text-blue-600 font-semibold mt-1">
                                    {selectedFiles.length} file(s) selected for upload
                                </p>
                            )}
                        </div>
                    </div>

                    {uploadProgress && (
                        <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-xs flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>{uploadProgress}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                        <button
                            onClick={addOrUpdateActivity}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {editingIndex === -1 ? "Add Activity" : "Update Activity"}
                        </button>
                        {editingIndex !== -1 && (
                            <button
                                onClick={clearActivityForm}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Activities List ── */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-700">Activities ({activities.length})</h2>
                        <p className="text-xs text-slate-400 font-medium">All activities logged for {result} district. Changes are saved automatically when adding, editing, or deleting activities.</p>
                    </div>

                    {activities.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-100 py-20 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">No activities yet</p>
                                <p className="text-xs text-slate-400 mt-0.5">Use the form above to log the first activity for {result}.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {activities.map((activity, index) => {
                                    const formattedDate = activity.date
                                        ? new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '';

                                    return (
                                        <div key={activity.id || index} className="relative group/actions">
                                            <ActivityCard
                                                activity={{
                                                    title: activity.title,
                                                    category: activity.category,
                                                    district: result,
                                                    dateRange: formattedDate,
                                                    photoUrls: activity.photoUrls,
                                                }}
                                                onClick={() => openActivityViewer(index)}
                                            />
                                            {/* Edit / Delete overlay actions */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/actions:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); editActivity(index); }}
                                                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-100 text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer shadow-sm"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteActivity(index); }}
                                                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-slate-100 text-red-400 hover:bg-red-50 transition-colors cursor-pointer shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* ── Activity Modal (image viewer + details) ── */}
                {viewingActivity && (
                    <ActivityModal
                        activity={viewingActivity}
                        onClose={closeActivityViewer}
                    />
                )}

            </div>
            )}

            {/* ── CENTERS TAB (district-scoped individual centers) ── */}
            {activeTab === "centers" && (
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
                    <div className="border-b border-slate-50 pb-4">
                        <h3 className="text-base font-semibold text-slate-700">
                            {editingCenterId ? "Edit Balvikas Center" : "Add New Balvikas Center"}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                            {editingCenterId
                                ? `Update the center details for ${result} district.`
                                : `Register a new center in ${result} district, specifying the name, type, student count (boys and girls) across active groups, and its start date.`}
                        </p>
                    </div>

                    <form onSubmit={handleSaveCenter} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Center Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Center Name (Optional)</label>
                                <input
                                    type="text"
                                    value={centerName}
                                    onChange={(e) => setCenterName(e.target.value)}
                                    placeholder={`e.g. ${result} Primary School Balvikas Center`}
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Center Type */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Center Type</label>
                                <select
                                    value={centerType}
                                    onChange={(e) => setCenterType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="school">School Balvikas</option>
                                    <option value="rural domestic">Rural Domestic Balvikas</option>
                                    <option value="urban domestic">Urban Domestic Balvikas</option>
                                </select>
                            </div>

                            {/* Date Started */}
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Started *</label>
                                <input
                                    type="date"
                                    value={centerStartedAt}
                                    onChange={(e) => setCenterStartedAt(e.target.value)}
                                    className="w-full sm:w-64 bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        {/* Group-wise Student Counts Grid */}
                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700">Student Counts by Group Category</h4>
                                <p className="text-xs text-slate-400 font-medium">Specify the number of boys and girls in each active group category for this center. You can leave groups with no students empty.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Group I */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Group I</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Boys</label>
                                            <input
                                                type="number"
                                                value={g1Boys}
                                                onChange={(e) => setG1Boys(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Girls</label>
                                            <input
                                                type="number"
                                                value={g1Girls}
                                                onChange={(e) => setG1Girls(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Group II */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Group II</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Boys</label>
                                            <input
                                                type="number"
                                                value={g2Boys}
                                                onChange={(e) => setG2Boys(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Girls</label>
                                            <input
                                                type="number"
                                                value={g2Girls}
                                                onChange={(e) => setG2Girls(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Group III */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Group III</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Boys</label>
                                            <input
                                                type="number"
                                                value={g3Boys}
                                                onChange={(e) => setG3Boys(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Girls</label>
                                            <input
                                                type="number"
                                                value={g3Girls}
                                                onChange={(e) => setG3Girls(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Group IV */}
                                <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Group IV</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Boys</label>
                                            <input
                                                type="number"
                                                value={g4Boys}
                                                onChange={(e) => setG4Boys(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-xs font-semibold text-slate-400">Girls</label>
                                            <input
                                                type="number"
                                                value={g4Girls}
                                                onChange={(e) => setG4Girls(e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit / Cancel buttons */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                            {editingCenterId && (
                                <button
                                    type="button"
                                    onClick={clearCenterForm}
                                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {editingCenterId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                        {editingCenterId ? "Update Center" : "Add Center"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Individual Centers List */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div>
                        <h3 className="text-base font-semibold text-slate-700">Registered Centers in {result} ({individualCenters.length})</h3>
                        <p className="text-xs text-slate-400 font-medium">List of all centers registered manually for this district. Deleted centers are removed immediately.</p>
                    </div>

                    {individualCenters.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                                    <tr>
                                        <th className="py-3 px-4">Center Name</th>
                                        <th className="py-3 px-4">Type</th>
                                        <th className="py-3 px-4 text-center">Active Groups</th>
                                        <th className="py-3 px-4 text-right">Total Boys</th>
                                        <th className="py-3 px-4 text-right">Total Girls</th>
                                        <th className="py-3 px-4">Started Date</th>
                                        <th className="py-3 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {individualCenters.map((c) => {
                                        const activeGroups = [];
                                        if ((parseInt(c.group1_boys) || 0) + (parseInt(c.group1_girls) || 0) > 0) activeGroups.push('G-I');
                                        if ((parseInt(c.group2_boys) || 0) + (parseInt(c.group2_girls) || 0) > 0) activeGroups.push('G-II');
                                        if ((parseInt(c.group3_boys) || 0) + (parseInt(c.group3_girls) || 0) > 0) activeGroups.push('G-III');
                                        if ((parseInt(c.group4_boys) || 0) + (parseInt(c.group4_girls) || 0) > 0) activeGroups.push('G-IV');

                                        const totalBoys = (parseInt(c.group1_boys) || 0) +
                                                          (parseInt(c.group2_boys) || 0) +
                                                          (parseInt(c.group3_boys) || 0) +
                                                          (parseInt(c.group4_boys) || 0);

                                        const totalGirls = (parseInt(c.group1_girls) || 0) +
                                                           (parseInt(c.group2_girls) || 0) +
                                                           (parseInt(c.group3_girls) || 0) +
                                                           (parseInt(c.group4_girls) || 0);

                                        return (
                                            <tr key={c.id} className="hover:bg-slate-50/55 transition-colors">
                                                <td className="py-3.5 px-4 font-medium text-slate-700">
                                                    {c.name || 'Unnamed Center'}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 font-medium capitalize">
                                                    {c.type}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        {activeGroups.length > 0 ? activeGroups.map((g, idx) => (
                                                            <span key={idx} className="inline-flex bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-xs px-2 py-0.5 rounded">
                                                                {g}
                                                            </span>
                                                        )) : (
                                                            <span className="text-slate-400 text-xs italic">None</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                                                    {totalBoys}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                                                    {totalGirls}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 font-medium">
                                                    {c.startedAt
                                                        ? (c.startedAt.seconds
                                                            ? new Date(c.startedAt.seconds * 1000).toLocaleDateString()
                                                            : new Date(c.startedAt).toLocaleDateString())
                                                        : '—'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditCenter(c)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg hover:scale-105 transition-all cursor-pointer"
                                                            title="Edit Center"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCenter(c.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg hover:scale-105 transition-all cursor-pointer"
                                                            title="Delete Center"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            No individual centers added yet for {result}.
                        </div>
                    )}
                </div>
            </div>
            )}
        </>
    )
}
