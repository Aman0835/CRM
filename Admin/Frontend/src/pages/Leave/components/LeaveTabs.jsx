import React from "react";
import { FiClock, FiCheckCircle, FiAlertTriangle, FiSearch } from "react-icons/fi";

const TABS = [
    { id: "pending", label: "Pending", icon: FiClock },
    { id: "approved", label: "Approved", icon: FiCheckCircle },
    { id: "rejected", label: "Rejected", icon: FiAlertTriangle },
    { id: "all", label: "All Requests", icon: FiSearch },
];

export default function LeaveTabs({ activeTab, setActiveTab, leaves, getLeaveCount }) {
    return (
        <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950/30 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
            {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const count = tab.id === "all" ? leaves.length : getLeaveCount(tab.id);
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            isActive
                                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-150 dark:border-slate-700"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                    >
                        <TabIcon className={`text-xs ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                            isActive
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
