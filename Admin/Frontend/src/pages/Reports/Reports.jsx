import React, { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";
import * as reportService from "../../services/reportService";
import * as employeeService from "../../services/employeeService";

export default function Reports() {
    const [loading, setLoading] = useState(true);
    
    // Aggregation Stats
    const [stats, setStats] = useState({
        avgAttendance: 0,
        avgHours: 0,
        totalPayout: 0,
        leaveCount: 0
    });
    
    const [rankingList, setRankingList] = useState([]);
    const [chartData, setChartData] = useState([]);

    const fetchReportsData = async () => {
        setLoading(true);
        try {
            const [attRes, payRes, leaveRes, empRes] = await Promise.all([
                reportService.getAttendanceReport(),
                reportService.getPayrollReport(),
                reportService.getLeaveReport(),
                employeeService.getEmployees({ limit: 100 })
            ]);

            if (empRes.success) {
                const attData = attRes.success ? attRes.data : [];
                const payData = payRes.success ? payRes.data : [];
                const leaveData = leaveRes.success ? leaveRes.data : [];
                const empList = empRes.data;

                const totalAttLogs = attData.length;
                const presentLogs = attData.filter(l => l.status === "Present" || l.status === "Half Day").length;
                const avgAttendance = totalAttLogs > 0 ? ((presentLogs / totalAttLogs) * 100).toFixed(1) : 95.0;

                const workingHoursLogs = attData.filter(l => l.workingHours > 0);
                const totalHours = workingHoursLogs.reduce((sum, l) => sum + l.workingHours, 0);
                const avgHours = workingHoursLogs.length > 0 ? (totalHours / workingHoursLogs.length).toFixed(1) : 8.2;

                const totalPayout = payData.reduce((sum, p) => sum + p.netSalary, 0);

                const leaveCount = leaveData.filter(l => l.status === "approved").length;

                setStats({
                    avgAttendance,
                    avgHours,
                    totalPayout,
                    leaveCount
                });

                const rankings = empList
                    .map(emp => {
                        const empLogs = attData.filter(log => log.employeeId === emp.employeeId);
                        const empPresent = empLogs.filter(log => log.status === "Present" || log.status === "Half Day").length;
                        const presentRate = empLogs.length > 0 ? Math.round((empPresent / empLogs.length) * 100) : 0;
                        return {
                            ...emp,
                            presentRate,
                            logsCount: empLogs.length,
                            hasLogs: empLogs.length > 0
                        };
                    })
                    .filter(item => item.hasLogs)
                    .sort((a, b) => b.presentRate - a.presentRate);

                setRankingList(rankings);

                // Generate 6-month trends dynamically
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const calculatedChart = [];
                const today = new Date();
                
                for (let i = 5; i >= 0; i--) {
                    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    const mIndex = targetDate.getMonth();
                    const year = targetDate.getFullYear();
                    const monthName = months[mIndex];
                    
                    const monthLogs = attData.filter(log => {
                        if (!log.date) return false;
                        const logDate = new Date(log.date);
                        return logDate.getMonth() === mIndex && logDate.getFullYear() === year;
                    });
                    
                    const totalLogs = monthLogs.length;
                    const presentLogs = monthLogs.filter(log => log.status === "Present" || log.status === "Half Day").length;
                    const rate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 0;
                    
                    calculatedChart.push({
                        name: monthName,
                        attendance: rate
                    });
                }
                setChartData(calculatedChart);
            }
        } catch (err) {
            console.error("Reports aggregation error:", err);
            toast.error("Failed to load reports overview");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportsData();
    }, []);

    const handleExportCSV = () => {
        try {
            let csvContent = "";
            
            // 1. System Overview Section
            csvContent += "SYSTEM OVERVIEW STATS\n";
            csvContent += `Avg Attendance Rate,${stats.avgAttendance}%\n`;
            csvContent += `Avg Shift Hours,${stats.avgHours} hours/day\n`;
            csvContent += `Cumulative Payout,$${stats.totalPayout}\n`;
            csvContent += `Approved Leave Periods,${stats.leaveCount}\n\n`;
            
            // 2. Leaderboard Ranks Section
            csvContent += "STAFF ATTENDANCE RANKS\n";
            csvContent += "Rank,Employee ID,First Name,Last Name,Role,Attendance Rate,Logs Count,Status\n";
            
            rankingList.forEach((emp, index) => {
                const row = [
                    index + 1,
                    `"${emp.employeeId || ''}"`,
                    `"${emp.firstName || ''}"`,
                    `"${emp.lastName || ''}"`,
                    `"${emp.role || ''}"`,
                    `"${emp.presentRate || 0}%"`,
                    emp.logsCount || 0,
                    `"${emp.status || 'active'}"`
                ];
                csvContent += row.join(",") + "\n";
            });
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Diva_The_Salon_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success("CSV report downloaded successfully!");
        } catch (err) {
            console.error("Export error:", err);
            toast.error("Failed to generate CSV file");
        }
    };



    return (
        <DashboardLayout
            title="Reports"
            subtitle="Explore high-level aggregates and analysis summaries of staff rosters, wage bills, and log trends."
            action={
                <button
                    onClick={handleExportCSV}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                >
                    <FiDownload /> Export CSV Report
                </button>
            }
        >
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <div className="space-y-6 text-slate-800 dark:text-slate-105">
                    {/* Metrics Grid */}
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="panel-surface rounded-2xl p-4 shadow-sm">
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase block font-bold tracking-wider">Avg Attendance Rate</span>
                            <strong className="text-xl font-bold block mt-1.5 text-emerald-650 dark:text-emerald-500">{stats.avgAttendance}%</strong>
                        </div>
                        <div className="panel-surface rounded-2xl p-4 shadow-sm">
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase block font-bold tracking-wider">Avg Shift Hours</span>
                            <strong className="text-xl font-bold block mt-1.5 text-slate-800 dark:text-slate-200">{stats.avgHours} hours/day</strong>
                        </div>
                        <div className="panel-surface rounded-2xl p-4 shadow-sm">
                            <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase block font-bold tracking-wider">Cumulative Payout</span>
                            <strong className="text-xl font-bold block mt-1.5 text-blue-600 dark:text-blue-450">${stats.totalPayout.toLocaleString()}</strong>
                        </div>
                        <div className="panel-surface rounded-2xl p-4 shadow-sm">
                            <span className="text-[10px] text-slate-400 dark:text-slate-555 uppercase block font-bold tracking-wider">Approved Leave Days</span>
                            <strong className="text-xl font-bold block mt-1.5 text-orange-500">{stats.leaveCount} Periods</strong>
                        </div>
                    </section>

                    {/* Chart Row */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Area Chart */}
                        <section className="panel-surface rounded-3xl p-6 shadow-sm lg:col-span-2">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Performance Trends</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">6-month comparison of attendance rate logs.</p>

                            <div className="mt-5 h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="reportsGlowLight" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="attendance"
                                            stroke="#3b82f6"
                                            strokeWidth={2.5}
                                            fill="url(#reportsGlowLight)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Attendance Leaderboard */}
                        <section className="panel-surface rounded-3xl p-6 shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Roster Attendance Ranks</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Ranked crew list based on shift logging present rate.</p>

                            <div className="mt-4 space-y-3.5">
                                {rankingList.map((emp, index) => (
                                    <div 
                                        key={emp._id}
                                        className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0 text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-lg bg-slate-50 dark:bg-slate-800 font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{emp.firstName} {emp.lastName}</h4>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase mt-0.5 font-medium">{emp.role}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-500 block">{emp.presentRate}% Attendance</span>
                                            <span className="text-[9px] text-slate-400 dark:text-slate-550 block mt-0.5">{emp.logsCount} logs filed</span>
                                        </div>
                                    </div>
                                ))}
                                {rankingList.length === 0 && (
                                    <p className="text-center text-xs text-slate-400 dark:text-slate-550 py-8">
                                        No active staff records.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
