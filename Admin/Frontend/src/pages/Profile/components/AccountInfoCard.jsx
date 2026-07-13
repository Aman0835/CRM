import React from "react";

export default function AccountInfoCard() {
    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Account Information</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">System read-only security mappings.</p>
            </div>

            <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Security Role</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Super Admin</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Account Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Administrator</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Account Created</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">12 May 2024</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500">Session Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Active (Authorized)</span>
                </div>
            </div>
        </div>
    );
}
