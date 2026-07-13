import React from "react";
import {
    BarChart, Bar, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis, Legend,
    PieChart, Pie, Cell
} from "recharts";

export default function DashboardCharts({ weeklyData, leaveTypesData }) {
    const totalLeavesInChart = leaveTypesData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <section className="grid gap-6 lg:grid-cols-3">
            {/* Weekly Attendance Bar Chart */}
            <div className="panel-surface rounded-3xl p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Weekly Attendance</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">This week · 6 employees</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-lg">Jul 2025</span>
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                            <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={16} />
                            <Bar dataKey="Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Leave Types Donut Chart */}
            <div className="panel-surface rounded-3xl p-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Leave Types</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">July distribution</p>
                </div>
                {totalLeavesInChart === 0 ? (
                    <div className="h-[180px] flex flex-col items-center justify-center text-center px-4">
                        <p className="text-xs text-slate-400 dark:text-slate-500">No approved leaves this month.</p>
                    </div>
                ) : (
                    <div className="h-[180px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={leaveTypesData} dataKey="value" innerRadius={50} outerRadius={74} paddingAngle={3}>
                                    {leaveTypesData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <div className="space-y-2 mt-4">
                    {leaveTypesData.map((type) => (
                        <div key={type.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                                <span className="text-slate-600 dark:text-slate-405 font-medium">{type.name}</span>
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">{type.value}d</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
