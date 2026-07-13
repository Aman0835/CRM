import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function DashboardMetrics({ metrics }) {
    const navigate = useNavigate();
    return (
        <section className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                    <div
                        key={metric.label}
                        onClick={() => navigate(metric.path)}
                        className={`group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.005)] transition-all duration-305 hover:-translate-y-1 cursor-pointer dark:border-slate-800/80 dark:bg-slate-900/10 ${metric.hoverShadow}`}
                    >
                        <div className={`absolute top-0 right-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full ${metric.glowColor} blur-xl transition-all duration-500 group-hover:scale-110`}></div>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1.5 relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{metric.label}</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{metric.value}</p>
                            </div>
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 relative z-10 ${metric.iconBg}`}>
                                <Icon className="text-base" />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-0.5 relative z-10">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{metric.subtext}</span>
                            <span className="text-[10px] font-bold text-emerald-600 mt-1.5 flex items-center gap-0.5 dark:text-emerald-400">
                                <FiArrowUpRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                {metric.growth}
                            </span>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
