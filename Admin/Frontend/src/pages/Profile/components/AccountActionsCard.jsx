import React from "react";
import { FiLogOut } from "react-icons/fi";

export default function AccountActionsCard({ onLogout }) {
    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Account Actions</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Actions regarding your session status and records.</p>
            </div>

            <div className="space-y-2.5">
                <button 
                    onClick={onLogout}
                    className="w-full h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                    <FiLogOut className="text-sm" /> Sign Out of Session
                </button>
                
                <button 
                    disabled 
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 text-xs font-semibold cursor-not-allowed border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                >
                    Deactivate Account (Disabled)
                </button>
                
                <button 
                    disabled 
                    className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 text-xs font-semibold cursor-not-allowed border border-slate-200 dark:border-slate-800 flex items-center justify-center"
                >
                    Delete Administrator Record (Disabled)
                </button>
            </div>
        </div>
    );
}
