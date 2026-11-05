import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FiCalendar,
    FiClock,
    FiTrendingUp,
    FiUserCheck,
    FiUsers
} from "react-icons/fi";
import * as employeeService from "../../../services/employeeService";
import { getLeads } from "../../../services/leadService";
import { subscribeRealtime } from "../../../services/realtime";

const isSameCalendarDay = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

export function useDashboard() {
    const [employees, setEmployees] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });

    const fetchDashboardData = async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const [empRes, leadsRes] = await Promise.all([
                employeeService.getEmployees({ limit: 100 }),
                getLeads({ limit: 500 }),
            ]);

            if (empRes.success) setEmployees(empRes.data);
            if (leadsRes.success) setLeads(leadsRes.data || []);
        } catch (error) {
            console.error("Dashboard productivity data extraction error:", error);
            toast.error("Failed to load productivity dashboard data");
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(true); }, []);

    useEffect(() => {
        const unsubscribe = subscribeRealtime(() => {
            fetchDashboardData(false);
        });
        return unsubscribe;
    }, []);

    const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
    const selectedMonthStart = new Date(selectedYear, selectedMonthNumber - 1, 1);
    const selectedMonthEnd = new Date(selectedYear, selectedMonthNumber, 0, 23, 59, 59, 999);
    const leadList = Array.isArray(leads) ? leads : [];
    const isInSelectedMonth = (value) => {
        if (!value) return false;
        const date = new Date(value);
        return date >= selectedMonthStart && date <= selectedMonthEnd;
    };
    const monthlyLeads = leadList.filter((lead) => isInSelectedMonth(lead.createdAt));
    const activePipeline = monthlyLeads.filter((lead) => !["Won", "Lost"].includes(lead.status)).length;
    const totalLeads = monthlyLeads.length;
    const visitsScheduled = monthlyLeads.filter((lead) => lead.status === "Visit Scheduled" && isInSelectedMonth(lead.updatedAt)).length;
    const visitCount = monthlyLeads.filter((lead) => (
        ["Visit Scheduled", "Visit Completed"].includes(lead.status) &&
        isInSelectedMonth(lead.updatedAt)
    )).length;
    const followUpsToday = monthlyLeads.filter((lead) => {
        if (!lead.nextFollowUp?.date) return false;
        return isInSelectedMonth(lead.nextFollowUp.date);
    }).length;
    const wonLeads = monthlyLeads.filter((lead) => lead.status === "Won" && isInSelectedMonth(lead.updatedAt)).length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const metrics = [
        {
            label: "Total Leads",
            value: totalLeads,
            subtext: `${activePipeline} active in pipeline`,
            growth: "Selected month",
            icon: FiUsers,
            path: "/leads",
            iconBg: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)]",
            glowColor: "bg-blue-500/5",
        },
        {
            label: "Visit Count",
            value: visitCount,
            subtext: `${visitsScheduled} scheduled this month`,
            growth: "Selected month",
            icon: FiUserCheck,
            path: "/leads",
            iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)]",
            glowColor: "bg-emerald-500/5",
        },
        {
            label: "Visits Scheduled",
            value: visitsScheduled,
            subtext: "Ready for in-store visits",
            growth: "Selected month",
            icon: FiCalendar,
            path: "/visits",
            iconBg: "bg-violet-50 text-violet-600 border border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(139,92,246,0.06)]",
            glowColor: "bg-violet-500/5",
        },
        {
            label: "Follow-ups",
            value: followUpsToday,
            subtext: "Client touchpoints",
            growth: "Selected month",
            icon: FiClock,
            path: "/leads",
            iconBg: "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)]",
            glowColor: "bg-amber-500/5",
        },
        {
            label: "Conversion Rate",
            value: `${conversionRate}%`,
            subtext: `${wonLeads} won leads`,
            growth: "Selected month",
            icon: FiTrendingUp,
            path: "/leads",
            iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(6,182,212,0.06)]",
            glowColor: "bg-cyan-500/5",
        },
    ];

    const getMonthlyProductivityData = () => {
        const daysInMonth = new Date(selectedYear, selectedMonthNumber, 0).getDate();
        const monthDays = Array.from({ length: daysInMonth }, (_, index) => (
            new Date(selectedYear, selectedMonthNumber - 1, index + 1)
        ));

        return monthDays.map((date) => {
            const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            const newLeadCount = leadList.filter((lead) => {
                if (!lead.createdAt) return false;
                return isSameCalendarDay(new Date(lead.createdAt), date);
            }).length;

            const visitCount = leadList.filter((lead) => {
                if (lead.status !== "Visit Scheduled") return false;
                if (!lead.updatedAt) return false;
                return isSameCalendarDay(new Date(lead.updatedAt), date);
            }).length;

            return {
                name: label,
                "New Leads": newLeadCount,
                "Visits": visitCount,
            };
        });
    };

    const getTopLeadSources = () => {
        return Object.entries(
            monthlyLeads.reduce((acc, lead) => {
                const source = (lead.source || "Direct").trim() || "Direct";
                acc[source] = (acc[source] || 0) + 1;
                return acc;
            }, {})
        )
            .map(([name, count]) => ({
                name,
                count,
                label: `${count} leads`,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    };

    const getMonthlyVisits = () => {
        return monthlyLeads
            .filter((lead) => (
                ["Visit Scheduled", "Visit Completed"].includes(lead.status) &&
                isInSelectedMonth(lead.updatedAt)
            ))
            .map((lead) => ({
                name: lead.name || "Unnamed client",
                project: lead.project || lead.location || "General visit",
                status: lead.status,
                date: lead.updatedAt,
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    };

    const allEmployees = employees.map((employee) => ({
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unnamed employee",
        employeeId: employee.employeeId || "—",
        status: employee.status || "active",
    }));

    const getTodaySiteVisits = () => {
        return leadList
            .filter((lead) => (
                lead.status === "Visit Scheduled" &&
                lead.nextFollowUp?.date &&
                isSameCalendarDay(lead.nextFollowUp.date, new Date())
            ))
            .map((lead) => {
                const followUpDate = new Date(lead.nextFollowUp.date);
                return {
                    time: followUpDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                    client: lead.name,
                    service: lead.project || lead.location || "Site visit",
                    status: lead.status,
                    sortDate: followUpDate.getTime(),
                };
            })
            .sort((a, b) => a.sortDate - b.sortDate);
    };

    return {
        loading,
        metrics,
        selectedMonth,
        setSelectedMonth,
        weeklyData: getMonthlyProductivityData(),
        topLeadSources: getTopLeadSources(),
        topBarbers: getTopLeadSources(),
        monthlyVisits: getMonthlyVisits(),
        allEmployees,
        upcomingAppointments: getTodaySiteVisits(),
    };
}
