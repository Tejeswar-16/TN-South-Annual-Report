"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Save, Edit, Trash2, X } from "lucide-react";
import {doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";

export default function Manage(){

    const [editingActivityId,setEditingActivityId] = useState(null);
    const [activityTitle,setActivityTitle] = useState("");
    const [activityCategory,setActivityCategory] = useState("");
    const [activityDistrict,setActivityDistrict] = useState("All District");
    const [activityDateRange,setActivityDateRange] = useState("");
    const [activityDescription,setActivityDescription] = useState("");
    const [centersInvolved,setCentersInvolved] = useState("");
    const [uploadProgress,setUploadProgress] = useState(false);
    const [loading,setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [existingPhotoUrls, setExistingPhotoUrls] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [activities, setActivities] = useState([]);
    const [statsValueAdditions,setStatsValueAdditions] = useState([]);

    const router = useRouter();

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        const snap = await getDoc(doc(db, "district", "All Districts"));

        if (snap.exists()) {
            const data = snap.data();

            setActivities(data.activities || []);
            setStatsValueAdditions(data.valueAddtions || []);
        }
    };

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
            id: crypto.randomUUID(),
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
            setUploadProgress('Saving activity log in Firestore...');
            const ref = doc(db, "district", "All Districts");
            const snap = await getDoc(ref);
            const activities = snap.data().activities || [];
            const updatedActivities = activities.map(activity =>
                activity.id === editingActivityId
                    ? activityData
                    : activity
            );
            await updateDoc(ref, {
                activities: updatedActivities
            });
            setSuccessMsg('New Activity added successfully! It is now live in the gallery.');
        } else {
            setUploadProgress('Updating activity log in Firestore...');
            await updateDoc(doc(db, "district", "All Districts"),{
                    activities: arrayUnion(activityData)
                }
            );
            setSuccessMsg('Activity updated successfully!');
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
        loadActivities();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
        setErrorMsg(`Failed to save activity: ${err.message}. Make sure Firebase setup and rules are correct.`);
        setUploadProgress('');
        } finally {
        setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
        setSelectedImages(Array.from(e.target.files));
        }
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
          const ref = doc(db, "district", "All Districts");
          const snap = await getDoc(ref);
          const activities = snap.data().activities || [];
          const updatedActivities = activities.filter(
            activity => activity.id !== id
          );

            await updateDoc(ref, {
                activities: updatedActivities
            });
          loadActivities();
          setSuccessMsg('Activity deleted successfully.');
        } catch (err) {
          setErrorMsg(`Failed to delete activity: ${err.message}`);
        } finally {
          setLoading(false);
        }
    };

    const handleEditActivity = (activity) => {
        setEditingActivityId(activity.id);

        setActivityTitle(activity.title || "");
        setActivityCategory(activity.category || "Outreach");
        setActivityDistrict(activity.district || "All District");
        setActivityDateRange(activity.dateRange || "");
        setActivityDescription(activity.description || "");
        setCentersInvolved(activity.centersInvolved || "");

        setExistingPhotoUrls(activity.photoUrls || []);
        setSelectedImages([]);

        // Scroll to the form
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleValAddFieldChange = (index, field, value) => {
        setStatsValueAdditions(prev =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        );
    };

    const saveValue = async () => {
        try {
            setLoading(true);
            setSuccessMsg("");
            setErrorMsg("");

            await updateDoc(doc(db, "district", "All Districts"), {
                valueAddtions: statsValueAdditions
            });

            setSuccessMsg("Value Additions saved successfully!");
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full font-sans">
                <div className="flex flex-col md:m-4 p-4 md:p-0 ml-0 mr-0 md:ml-10 md:mr-10 md:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1.5 flex flex-col items-center md:items-start text-center md:text-left mx-auto md:mx-0">
                        <h1 className=" text-xl md:text-3xl text-slate-800 font-medium leading-tight">
                          Sri Sathya Sai Balvikas
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-sm font-medium">
                        <span className="mx-auto flex justify-center text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold">Tamil Nadu South</span>
                        <span className='mx-auto flex justify-center'>Manage Statistics</span>
                        </div>
                    </div>
                    <div className='flex flex-row gap-x-4 justify-center mx-auto md:mx-0'>
                        <button onClick={() => router.push(`/`)} className='md:font-semibold text-violet-700 bg-violet-100 p-1 md:p-2 cursor-pointer hover:bg-violet-200 hover:scale-105 rounded-xl trasition duration-300 ease-in-out w-45'>Back to Dashboard</button>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Syncing data...</span>
                    </div>
                )}

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
                </div>
                
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


                <div className="space-y-3 m-4">
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
                        {statsValueAdditions.map((v,index) => (
                            <tr key={index}>
                            <td className="py-3 px-4 font-medium text-slate-700">{v.metric}</td>
                            <td className="py-3 px-4 text-right">
                                <input 
                                type="text" 
                                value={v.group1 !== null ? v.group1 : ''}
                                onChange={(e) => handleValAddFieldChange(index, 'group1', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                                placeholder="null"
                                />
                            </td>
                            <td className="py-3 px-4 text-right">
                                <input 
                                type="text" 
                                value={v.group2 !== null ? v.group2 : ''}
                                onChange={(e) => handleValAddFieldChange(index, 'group2', e.target.value)}
                                className="w-20 bg-slate-50 border border-slate-100 text-right px-2 py-1 rounded focus:outline-none focus:border-indigo-500"
                                placeholder="null"
                                />
                            </td>
                            <td className="py-3 px-4 text-right">
                                <input 
                                type="text" 
                                value={v.group3 !== null ? v.group3 : ''}
                                onChange={(e) => handleValAddFieldChange(index, 'group3', e.target.value)}
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
                                    setStatsValueAdditions(prev =>
                                        prev.map((item, i) =>
                                            i === index
                                                ? { ...item, notes: text }
                                                : item
                                        )
                                    );
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
                <div className="flex justify-end pt-4 mr-4 mb-4">
                    <button
                    onClick={saveValue}
                    disabled={loading}
                    className="flex items-center hover:cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
                    >
                    <Save className="w-4 h-4" />
                    Save Value Additions
                    </button>
                </div>
            </div>
        </>
    )
}