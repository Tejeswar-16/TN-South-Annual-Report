"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../firebase/config';
import { collection, doc, getDocs, setDoc, addDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { ArrowLeft, Save, Plus, FileText, Image as ImageIcon, Loader2, Lock, LayoutGrid, CheckCircle, AlertCircle, Trash2, Edit, X, Building2 } from 'lucide-react';


export default function AdminPage() {

  // Tab State
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'centers' | 'activities'

  // Loading & Status States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Statistics Data State — loaded from Firestore on login
  const [statsCentres, setStatsCentres] = useState([]);
  const [statsGurus, setStatsGurus] = useState([]);
  const [statsStudents, setStatsStudents] = useState([]);
  const [statsValueAdditions, setStatsValueAdditions] = useState([]);

  // Settings State
  const [reportPeriod, setReportPeriod] = useState('1 Apr 2025 – 31 Mar 2026');

  // Activities Data State — loaded from Firestore
  const [activities, setActivities] = useState([]);

  // Individual Centers Data State
  const [individualCenters, setIndividualCenters] = useState([]);

  // New Center Form State
  const [centerName, setCenterName] = useState('');
  const [centerDistrict, setCenterDistrict] = useState('');
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

  // New/Edit Activity Form State
  const [activityTitle, setActivityTitle] = useState('');
  const [activityCategory, setActivityCategory] = useState('Outreach');
  const [activityDistrict, setActivityDistrict] = useState('');
  const [activityDateRange, setActivityDateRange] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [centersInvolved, setCentersInvolved] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState([]);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');

  const fetchActivities = async () => {
    try {
      const qAct = query(collection(db, "activities"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qAct);
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setActivities(list);
    } catch (err) {
      console.warn("Could not fetch activities from Firestore:", err.message);
    }
  };

  const fetchIndividualCenters = async () => {
    try {
      const qCent = query(collection(db, "individual_centers"), orderBy("startedAt", "desc"));
      const snap = await getDocs(qCent);
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setIndividualCenters(list);
    } catch (err) {
      console.warn("Could not fetch individual centers from Firestore:", err.message);
    }
  };

  // Fetch current data from Firestore if keys are available
  useEffect(() => {

    const fetchCurrentStats = async () => {
      try {
        setLoading(true);
        
        // Fetch Centres
        const queryCentres = await getDocs(collection(db, "centres"));
        if (!queryCentres.empty) {
          const list = [];
          queryCentres.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setStatsCentres(list);
        }

        // Fetch Gurus
        const queryGurus = await getDocs(collection(db, "gurus"));
        if (!queryGurus.empty) {
          const list = [];
          queryGurus.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setStatsGurus(list);
        }

        // Fetch Students
        const queryStudents = await getDocs(collection(db, "students"));
        if (!queryStudents.empty) {
          const list = [];
          queryStudents.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setStatsStudents(list);
        }

        // Fetch Value Additions
        const queryValAdd = await getDocs(collection(db, "valueAdditions"));
        if (!queryValAdd.empty) {
          const list = [];
          queryValAdd.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          setStatsValueAdditions(list);
        }

        // Fetch Settings
        const settingsSnap = await getDoc(doc(db, "settings", "general"));
        if (settingsSnap.exists()) {
          setReportPeriod(settingsSnap.data().reportPeriod || '1 Apr 2025 – 31 Mar 2026');
        }

      } catch (err) {
        console.warn("Could not fetch current statistics/settings from Firestore (offline or unseeded). Using local values:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStats();
    fetchActivities();
    fetchIndividualCenters();
  }, []);

  // Handle Stats Inputs
  const handleStatFieldChange = (collectionName, id, field, val) => {
    const numVal = parseInt(val) || 0;
    
    const updateList = (list) => {
      return list.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: numVal };
          // Re-calculate row total
          const g1 = field === 'group1' ? numVal : (item.group1 || 0);
          const g2 = field === 'group2' ? numVal : (item.group2 || 0);
          const g3 = field === 'group3' ? numVal : (item.group3 || 0);
          const g4 = field === 'group4' ? numVal : (item.group4 || 0);
          updatedItem.total = g1 + g2 + g3 + g4;
          return updatedItem;
        }
        return item;
      });
    };

    if (collectionName === 'centres') setStatsCentres(updateList(statsCentres));
    if (collectionName === 'gurus') setStatsGurus(updateList(statsGurus));
    if (collectionName === 'students') setStatsStudents(updateList(statsStudents));
  };

  // Value additions field changes (accepts numbers or nulls)
  const handleValAddFieldChange = (id, field, val) => {
    const numVal = val === '' ? null : parseInt(val) || 0;
    setStatsValueAdditions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: numVal };
      }
      return item;
    }));
  };

  // Save Stats to Firestore
  const saveStatistics = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Save Centres
      for (const centre of statsCentres) {
        await setDoc(doc(db, "centres", centre.id), centre);
      }
      // Save Gurus
      for (const guru of gurusDataFilter(statsGurus)) {
        await setDoc(doc(db, "gurus", guru.id), guru);
      }
      // Save Students
      for (const student of statsStudents) {
        await setDoc(doc(db, "students", student.id), student);
      }
      // Save Value Additions
      for (const valAdd of statsValueAdditions) {
        await setDoc(doc(db, "valueAdditions", valAdd.id), valAdd);
      }
      // Save Settings
      await setDoc(doc(db, "settings", "general"), { reportPeriod });

      setSuccessMsg('Statistics and Settings saved successfully! Dashboard values have updated.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(`Failed to save stats: ${err.message}. Ensure Firebase is configured and rules allow writes.`);
    } finally {
      setLoading(false);
    }
  };

  // Gurus helper filter to clean undefined properties
  const gurusDataFilter = (list) => {
    return list.map(item => {
      const clean = { ...item };
      if (clean.gender === undefined) clean.gender = clean.id === 'gurus_male' ? 'Male' : 'Female';
      return clean;
    });
  };

  // File Upload handler
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  // Create / Update Activity Submit
  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityTitle) {
      setErrorMsg('Please specify an activity title.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setUploadProgress('Preparing photo uploads...');

    try {
      const newPhotoUrls = [];

      for (let i = 0; i < selectedImages.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${selectedImages.length}...`);

        const formData = new FormData();
        formData.append("file", selectedImages[i]);
        formData.append("upload_preset", "balvikas_upload");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        newPhotoUrls.push(data.secure_url);
      }

      const finalPhotoUrls = [...existingPhotoUrls, ...newPhotoUrls];

      const activityData = {
        title: activityTitle,
        category: activityCategory,
        district: activityDistrict || null,
        dateRange: activityDateRange || null,
        description: activityDescription || null,
        centersInvolved: centersInvolved || null,
        photoUrls: finalPhotoUrls,
        createdAt: editingActivityId 
          ? (activities.find(a => a.id === editingActivityId)?.createdAt || new Date())
          : new Date()
      };

      if (editingActivityId) {
        setUploadProgress('Updating activity log in Firestore...');
        await setDoc(doc(db, "activities", editingActivityId), activityData);
        setSuccessMsg('Activity updated successfully!');
      } else {
        setUploadProgress('Saving activity log in Firestore...');
        await addDoc(collection(db, "activities"), activityData);
        setSuccessMsg('New Activity added successfully! It is now live in the gallery.');
      }

      // Reset form fields
      setActivityTitle('');
      setActivityDistrict('');
      setActivityDateRange('');
      setActivityDescription('');
      setCentersInvolved('');
      setSelectedImages([]);
      setExistingPhotoUrls([]);
      setEditingActivityId(null);
      setUploadProgress('');
      
      // Refresh activities list
      fetchActivities();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setErrorMsg(`Failed to save activity: ${err.message}. Make sure Firebase setup and rules are correct.`);
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (activity) => {
    setActivityTitle(activity.title || '');
    setActivityCategory(activity.category || 'Outreach');
    setActivityDistrict(activity.district || '');
    setActivityDateRange(activity.dateRange || '');
    setActivityDescription(activity.description || '');
    setCentersInvolved(activity.centersInvolved || '');
    setExistingPhotoUrls(activity.photoUrls || []);
    setEditingActivityId(activity.id);
    
    // Switch to activities tab so they can see the edit form
    setActiveTab('activities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setActivityTitle('');
    setActivityCategory('Outreach');
    setActivityDistrict('');
    setActivityDateRange('');
    setActivityDescription('');
    setCentersInvolved('');
    setExistingPhotoUrls([]);
    setEditingActivityId(null);
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await deleteDoc(doc(db, "activities", id));
      setSuccessMsg('Activity deleted successfully.');
      fetchActivities();
    } catch (err) {
      setErrorMsg(`Failed to delete activity: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCenter = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const newCenter = {
        name: centerName || null,
        district: centerDistrict || 'All Districts',
        type: centerType,
        group1_boys: parseInt(g1Boys) || 0,
        group1_girls: parseInt(g1Girls) || 0,
        group2_boys: parseInt(g2Boys) || 0,
        group2_girls: parseInt(g2Girls) || 0,
        group3_boys: parseInt(g3Boys) || 0,
        group3_girls: parseInt(g3Girls) || 0,
        group4_boys: parseInt(g4Boys) || 0,
        group4_girls: parseInt(g4Girls) || 0,
        startedAt: centerStartedAt ? new Date(centerStartedAt) : new Date(),
        createdAt: new Date()
      };

      await addDoc(collection(db, "individual_centers"), newCenter);
      setSuccessMsg('New Center added successfully! It has been registered and statistics are updated.');
      
      // Reset form
      setCenterName('');
      setCenterDistrict('');
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

      fetchIndividualCenters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(`Failed to save center: ${err.message}. Ensure Firestore setup and rules allow writes.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCenter = async (id) => {
    if (!window.confirm("Are you sure you want to delete this center? Student counts will be decremented from stats accordingly.")) {
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await deleteDoc(doc(db, "individual_centers", id));
      setSuccessMsg('Center deleted successfully.');
      fetchIndividualCenters();
    } catch (err) {
      setErrorMsg(`Failed to delete center: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-8 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-medium text-slate-800">Admin Control Panel</h1>
        </div>

        {/* Tab Toggle buttons */}
        <div className="bg-white border border-slate-100 p-1 rounded-xl flex gap-1 self-stretch sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              activeTab === 'stats' 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Update Statistics
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              activeTab === 'centers' 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Add Center
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              activeTab === 'activities' 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            Manage Activities
          </button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-start gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: UPDATE STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-base font-semibold text-slate-700">Annual Statistical Summary</h3>
              <p className="text-xs text-slate-400 font-medium">Update the row counts of centres, gurus, and students. Group totals are re-calculated automatically.</p>
            </div>

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
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard Report Period Label</label>
                    <input 
                      type="text" 
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      placeholder="e.g. 1 Apr 2025 – 31 Mar 2026"
                      className="w-full sm:w-96 bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-xs text-slate-400">This string will be displayed on the dashboard header and filter bar as the active reporting period.</p>
                  </div>
                </div>

                {/* Centres Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-blue-500 pl-2">Centres Counts</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-xs font-medium text-slate-400 uppercase">
                        <tr>
                          <th className="py-3 px-4">Centre Type</th>
                          <th className="py-3 px-4 text-right">Group I</th>
                          <th className="py-3 px-4 text-right">Group II</th>
                          <th className="py-3 px-4 text-right">Group III</th>
                          <th className="py-3 px-4 text-right">Pre-sevadal / IV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {statsCentres.map(c => (
                          <tr key={c.id}>
                            <td className="py-3 px-4 font-medium text-slate-700">{c.type}</td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={c.group1}
                                onChange={(e) => handleStatFieldChange('centres', c.id, 'group1', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={c.group2}
                                onChange={(e) => handleStatFieldChange('centres', c.id, 'group2', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={c.group3}
                                onChange={(e) => handleStatFieldChange('centres', c.id, 'group3', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={c.group4}
                                onChange={(e) => handleStatFieldChange('centres', c.id, 'group4', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gurus Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-teal-500 pl-2">Gurus Counts</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-xs font-medium text-slate-400 uppercase">
                        <tr>
                          <th className="py-3 px-4">Gender</th>
                          <th className="py-3 px-4 text-right">Group I</th>
                          <th className="py-3 px-4 text-right">Group II</th>
                          <th className="py-3 px-4 text-right">Group III</th>
                          <th className="py-3 px-4 text-right">Pre-sevadal / IV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {statsGurus.map(g => (
                          <tr key={g.id}>
                            <td className="py-3 px-4 font-medium text-slate-700">{g.gender || (g.id === 'gurus_male' ? 'Male' : 'Female')}</td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={g.group1}
                                onChange={(e) => handleStatFieldChange('gurus', g.id, 'group1', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={g.group2}
                                onChange={(e) => handleStatFieldChange('gurus', g.id, 'group2', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={g.group3}
                                onChange={(e) => handleStatFieldChange('gurus', g.id, 'group3', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={g.group4}
                                onChange={(e) => handleStatFieldChange('gurus', g.id, 'group4', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-teal-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Students Table */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-amber-500 pl-2">Students Counts</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-xs font-medium text-slate-400 uppercase">
                        <tr>
                          <th className="py-3 px-4">Student Category</th>
                          <th className="py-3 px-4 text-right">Group I</th>
                          <th className="py-3 px-4 text-right">Group II</th>
                          <th className="py-3 px-4 text-right">Group III</th>
                          <th className="py-3 px-4 text-right">Pre-sevadal / IV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {statsStudents.map(s => (
                          <tr key={s.id}>
                            <td className="py-3 px-4 font-medium text-slate-700">{s.category}</td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={s.group1}
                                onChange={(e) => handleStatFieldChange('students', s.id, 'group1', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={s.group2}
                                onChange={(e) => handleStatFieldChange('students', s.id, 'group2', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={s.group3}
                                onChange={(e) => handleStatFieldChange('students', s.id, 'group3', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                value={s.group4}
                                onChange={(e) => handleStatFieldChange('students', s.id, 'group4', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-amber-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Value Additions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-l-4 border-indigo-500 pl-2">Value Additions Initiatives</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-xs font-medium text-slate-400 uppercase">
                        <tr>
                          <th className="py-3 px-4">Initiative Metric</th>
                          <th className="py-3 px-4 text-right">G1 / Male / Boys</th>
                          <th className="py-3 px-4 text-right">G2 / Female / Girls</th>
                          <th className="py-3 px-4 text-right">Group III</th>
                          <th className="py-3 px-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {statsValueAdditions.map(v => (
                          <tr key={v.id}>
                            <td className="py-3 px-4 font-medium text-slate-700">{v.metric}</td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="text" 
                                value={v.group1 !== null ? v.group1 : ''}
                                onChange={(e) => handleValAddFieldChange(v.id, 'group1', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                                placeholder="null"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="text" 
                                value={v.group2 !== null ? v.group2 : ''}
                                onChange={(e) => handleValAddFieldChange(v.id, 'group2', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                                placeholder="null"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="text" 
                                value={v.group3 !== null ? v.group3 : ''}
                                onChange={(e) => handleValAddFieldChange(v.id, 'group3', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                                placeholder="null"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input 
                                type="text" 
                                value={v.notes || ''}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setStatsValueAdditions(prev => prev.map(item => item.id === v.id ? { ...item, notes: text } : item));
                                }}
                                className="w-full bg-slate-50 border border-slate-100 px-2 py-1 rounded focus:outline-none focus:border-indigo-500 text-xs"
                                placeholder="Add notes..."
                              />
                            </td>
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Statistics``
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD/EDIT ACTIVITY */}
      {activeTab === 'activities' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
            <div className="border-b border-slate-50 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-slate-700">
                  {editingActivityId ? 'Edit Activity Log' : 'Log New Activity / Event'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {editingActivityId 
                    ? 'Modify the activity details, manage photos, and update changes live.' 
                    : 'Record a new community service or event, upload photos, and sync it live with the dashboard gallery.'}
                </p>
              </div>
              {editingActivityId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Title *</label>
                  <input 
                    type="text" 
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder="e.g. Oldage Home Visit by Balvikas Children - Trichy District"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <select 
                    value={activityCategory}
                    onChange={(e) => setActivityCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Outreach">Outreach</option>
                    <option value="Festival">Festival</option>
                    <option value="Camp">Camp</option>
                    <option value="Vidya Jyoti">Vidya Jyoti</option>
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District</label>
                  <input 
                    type="text" 
                    value={activityDistrict}
                    onChange={(e) => setActivityDistrict(e.target.value)}
                    placeholder="e.g. Coimbatore District / All Districts"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date / Date Range</label>
                  <input 
                    type="text" 
                    value={activityDateRange}
                    onChange={(e) => setActivityDateRange(e.target.value)}
                    placeholder="e.g. 15 Jan 2026 / Nov 2025"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Centers Involved */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Centers Involved (comma-separated)</label>
                  <input 
                    type="text" 
                    value={centersInvolved}
                    onChange={(e) => setCentersInvolved(e.target.value)}
                    placeholder="e.g. Coimbatore Samithi Center, Sai Krupa School, Rural Sai Center"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Existing Photos (Edit Mode) */}
                {editingActivityId && existingPhotoUrls.length > 0 && (
                  <div className="space-y-2 md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Existing Photos ({existingPhotoUrls.length})</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {existingPhotoUrls.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                          <img src={url} alt="" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => setExistingPhotoUrls(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Upload */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {editingActivityId ? 'Upload More Photos' : 'Select Photos'}
                  </label>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Description</label>
                  <textarea 
                    value={activityDescription}
                    onChange={(e) => setActivityDescription(e.target.value)}
                    placeholder="Write a brief overview of the activities, seva details, children participation, etc."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Uploading progress notification */}
              {uploadProgress && (
                <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {/* Submit / Action buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                {editingActivityId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-xs cursor-pointer"
                  >
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
                      {editingActivityId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingActivityId ? 'Update Activity Log' : 'Save Activity Log'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Activities List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Existing Activities ({activities.length})</h3>
              <p className="text-xs text-slate-400 font-medium">Manage previously logged activities. Edit descriptions, photos, and districts or delete outdated records.</p>
            </div>

            {activities.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Date/Range</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate" title={act.title}>
                          {act.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            act.category === 'Outreach' ? 'bg-red-50 text-red-600 border-red-100' :
                            act.category === 'Festival' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            act.category === 'Camp' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            act.category === 'Vidya Jyoti' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {act.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {act.district || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {act.dateRange || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEditActivity(act)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg hover:scale-105 transition-all cursor-pointer"
                              title="Edit Activity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg hover:scale-105 transition-all cursor-pointer"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                No activities logged yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADD CENTER */}
      {activeTab === 'centers' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
            <div className="border-b border-slate-50 pb-4">
              <h3 className="text-base font-semibold text-slate-700">Add New Balvikas Center</h3>
              <p className="text-xs text-slate-400 font-medium">Register a new center, specifying the name, type, student count (boys and girls) across active groups, and its start date.</p>
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
                    placeholder="e.g. Trichy Primary School Balvikas Center"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Center District */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">District *</label>
                  <input 
                    type="text" 
                    value={centerDistrict}
                    onChange={(e) => setCenterDistrict(e.target.value)}
                    placeholder="e.g. Trichy District / Coimbatore District"
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                    required
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
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Started *</label>
                  <input 
                    type="date" 
                    value={centerStartedAt}
                    onChange={(e) => setCenterStartedAt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Group-wise Student Counts Grid */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">Student Counts by Group Category</h4>
                  <p className="text-2xs text-slate-400 font-medium">Specify the number of boys and girls in each active group category for this center. You can leave groups with no students empty.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Group I */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Group I</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-2xs font-semibold text-slate-400">Boys</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Girls</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Boys</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Girls</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Boys</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Girls</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Boys</label>
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
                        <label className="text-2xs font-semibold text-slate-400">Girls</label>
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

              {/* Submit button */}
              <div className="flex justify-end pt-2 border-t border-slate-50">
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
                      <Plus className="w-4 h-4" />
                      Add Center
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Individual Centers List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-700">Registered Individual Centers ({individualCenters.length})</h3>
              <p className="text-xs text-slate-400 font-medium">List of all centers registered manually. Deleted centers will immediately update statistics.</p>
            </div>

            {individualCenters.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">Center Name</th>
                      <th className="py-3 px-4">District</th>
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
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {c.district}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium capitalize">
                            {c.type}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center gap-1">
                              {activeGroups.length > 0 ? activeGroups.map((g, idx) => (
                                <span key={idx} className="inline-flex bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-2xs px-2 py-0.5 rounded">
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
                            <div className="flex justify-center items-center">
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
                No individual centers added yet.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
