import React from "react";
import { FiUploadCloud } from "react-icons/fi";

export default function ProfileCard({ 
    personalInfo, photo, uploading, uploadProgress, handlePhotoUpload, handleRemovePhoto 
}) {
    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs relative text-center">
            {/* Large Circular Avatar */}
            <div className="relative mx-auto h-28 w-28 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center group">
                {photo ? (
                    <img src={photo} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {personalInfo.firstName[0]}{personalInfo.lastName[0]}
                    </div>
                )}

                {/* Hover overlay */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiUploadCloud className="text-white text-xl" />
                    <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                </label>
            </div>

            {/* Drag/Drop Box or Progress */}
            {uploading ? (
                <div className="mt-4 px-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>Uploading avatar...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex justify-center gap-2">
                    <label className="h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-955/30 dark:hover:bg-blue-900/40 text-[10px] font-bold px-3 flex items-center cursor-pointer transition">
                        Change Photo
                        <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </label>
                    {photo && (
                        <button onClick={handleRemovePhoto} className="h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-955/20 dark:hover:bg-red-900/30 text-[10px] font-bold px-3 transition">
                            Remove
                        </button>
                    )}
                </div>
            )}

            {/* Admin Profile Data */}
            <div className="mt-5 space-y-1">
                <h4 className="text-base font-bold text-slate-850 dark:text-slate-100">
                    {personalInfo.firstName} {personalInfo.lastName}
                </h4>
                <div className="flex justify-center gap-1.5 items-center mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-650 border border-blue-100 dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900 uppercase">
                        Super Admin
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-650 border border-emerald-100 dark:bg-emerald-955/20 dark:text-emerald-400 dark:border-emerald-900 uppercase">
                        Active
                    </span>
                </div>
            </div>

            {/* Meta Grid */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Joined Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-0.5">12 May 2024</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Session Location</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-0.5">New Delhi, IN</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Browser</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-0.5">Chrome (macOS)</span>
                </div>
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Last Login</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 block mt-0.5">Just now</span>
                </div>
            </div>
        </div>
    );
}
