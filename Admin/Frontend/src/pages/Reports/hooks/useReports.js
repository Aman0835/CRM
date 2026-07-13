import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as reportService from "../../../services/reportService";
import * as employeeService from "../../../services/employeeService";

export function useReports() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgAttendance: 0, avgHours: 0, totalPayout: 0, leaveCount: 0 });
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

                setStats({ avgAttendance, avgHours, totalPayout, leaveCount });

                const rankings = empList
                    .map(emp => {
                        const empLogs = attData.filter(log => log.employeeId === emp.employeeId);
                        const empPresent = empLogs.filter(log => log.status === "Present" || log.status === "Half Day").length;
                        const presentRate = empLogs.length > 0 ? Math.round((empPresent / empLogs.length) * 100) : 0;
                        return { ...emp, presentRate, logsCount: empLogs.length, hasLogs: empLogs.length > 0 };
                    })
                    .filter(item => item.hasLogs)
                    .sort((a, b) => b.presentRate - a.presentRate);

                setRankingList(rankings);

                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const today = new Date();
                const calculatedChart = Array.from({ length: 6 }, (_, i) => {
                    const targetDate = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
                    const mIndex = targetDate.getMonth();
                    const year = targetDate.getFullYear();
                    const monthLogs = attData.filter(log => {
                        if (!log.date) return false;
                        const logDate = new Date(log.date);
                        return logDate.getMonth() === mIndex && logDate.getFullYear() === year;
                    });
                    const total = monthLogs.length;
                    const present = monthLogs.filter(log => log.status === "Present" || log.status === "Half Day").length;
                    return { name: months[mIndex], attendance: total > 0 ? Math.round((present / total) * 100) : 0 };
                });

                setChartData(calculatedChart);
            }
        } catch (err) {
            console.error("Reports aggregation error:", err);
            toast.error("Failed to load reports overview");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReportsData(); }, []);

    const handleExportCSV = () => {
        try {
            let csvContent = "SYSTEM OVERVIEW STATS\n";
            csvContent += `Avg Attendance Rate,${stats.avgAttendance}%\n`;
            csvContent += `Avg Shift Hours,${stats.avgHours} hours/day\n`;
            csvContent += `Cumulative Payout,$${stats.totalPayout}\n`;
            csvContent += `Approved Leave Periods,${stats.leaveCount}\n\n`;
            csvContent += "STAFF ATTENDANCE RANKS\n";
            csvContent += "Rank,Employee ID,First Name,Last Name,Role,Attendance Rate,Logs Count,Status\n";
            rankingList.forEach((emp, index) => {
                csvContent += [
                    index + 1, `"${emp.employeeId || ''}"`, `"${emp.firstName || ''}"`,
                    `"${emp.lastName || ''}"`, `"${emp.role || ''}"`, `"${emp.presentRate || 0}%"`,
                    emp.logsCount || 0, `"${emp.status || 'active'}"`
                ].join(",") + "\n";
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

    return { loading, stats, rankingList, chartData, handleExportCSV };
}
