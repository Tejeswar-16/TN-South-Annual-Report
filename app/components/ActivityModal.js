"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Folder } from 'lucide-react';

export default function ActivityModal({ activity, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (!activity?.photoUrls || activity.photoUrls.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % activity.photoUrls.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + activity.photoUrls.length) % activity.photoUrls.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activity, onClose]);

  if (!activity) return null;

  const { title, category, district, dateRange, description, photoUrls = [], centersInvolved } = activity;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-100 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] animate-scale-up">
        
        {/* Close Button (Floating on Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full border border-slate-100 shadow-sm backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lightbox Gallery Column */}
        <div className="w-full md:w-3/5 bg-slate-950 flex flex-col justify-center relative aspect-square md:aspect-auto md:h-[600px]">
          {photoUrls.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img 
                src={photoUrls[activeIndex]} 
                alt={`${title} - Photo ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Navigation Arrows */}
              {photoUrls.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors border border-white/10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors border border-white/10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Index Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full border border-white/10 font-medium">
                {activeIndex + 1} / {photoUrls.length}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              No Photos Available
            </div>
          )}

          {/* Thumbnails row (If multiple images) */}
          {photoUrls.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 overflow-x-auto flex justify-center gap-2 p-2 bg-slate-900/50 backdrop-blur-sm no-scrollbar">
              {photoUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                    i === activeIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto md:h-[600px] border-l border-slate-100 bg-white">
          <div className="space-y-6">
            <div>
              {/* Category Badge */}
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 mb-3">
                <Folder className="w-3.5 h-3.5" />
                {category}
              </span>
              <h2 className="text-xl font-medium text-slate-800 leading-snug">
                {title}
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About Activity</span>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {description || "No description provided."}
              </p>
            </div>

            {/* Centers Engaged */}
            {centersInvolved && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Centers Engaged</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {centersInvolved.split(',').map((c, i) => (
                    <span key={i} className="inline-flex bg-slate-50 border border-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Card at bottom */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            {district && (
              <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>District: {district}</span>
              </div>
            )}
            {dateRange && (
              <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
                <Calendar className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Date Range: {dateRange}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
