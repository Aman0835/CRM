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

const ACTIVE_LEAD_STATUSES = [
    "New",
    "Contacted",
    "Interested",
    "Follow-up",
    "Visit Scheduled",
    "Visit Completed",
    "Negotiation",
    "Booking",
];

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

    const today = new Date();
    const leadList = Array.isArray(leads) ? leads : [];
    const activePipeline = leadList.filter((lead) => !["Won", "Lost"].includes(lead.status)).length;
    const totalLeads = leadList.length;
    const newLeads = leadList.filter((lead) => lead.status === "New").length;
    const qualifiedLeads = leadList.filter((lead) => ACTIVE_LEAD_STATUSES.includes(lead.status)).length;
    const visitsScheduled = leadList.filter((lead) => lead.status === "Visit Scheduled").length;
    const followUpsToday = leadList.filter((lead) => {
        if (!lead.nextFollowUp?.date) return false;
        return isSameCalendarDay(new Date(lead.nextFollowUp.date), today);
    }).length;
    const wonLeads = leadList.filter((lead) => lead.status === "Won").length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const metrics = [
        {
            label: "Total Leads",
            value: totalLeads,
            subtext: `${activePipeline} active in pipeline`,
            growth: "+12% this month",
            icon: FiUsers,
            path: "/leads",
            iconBg: "bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)]",
            glowColor: "bg-blue-500/5",
        },
        {
            label: "Qualified Leads",
            value: qualifiedLeads,
            subtext: `${newLeads} new this cycle`,
            growth: "Strong pipeline",
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
            growth: "Needs follow-up",
            icon: FiCalendar,
            path: "/leads",
            iconBg: "bg-violet-50 text-violet-600 border border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(139,92,246,0.06)]",
            glowColor: "bg-violet-500/5",
        },
        {
            label: "Follow-ups Today",
            value: followUpsToday,
            subtext: "Client touchpoints",
            growth: "Stay proactive",
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
            growth: "+4.7% uplift",
            icon: FiTrendingUp,
            path: "/leads",
            iconBg: "bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30",
            hoverShadow: "hover:shadow-[0_8px_30px_rgba(6,182,212,0.06)]",
            glowColor: "bg-cyan-500/5",
        },
    ];

    const getWeeklyProductivityData = () => {
        const last6Days = Array.from({ length: 6 }, (_, index) => {
            const date = new Date();
            date.setDate(today.getDate() - (5 - index));
            return date;
        });

        return last6Days.map((date) => {
            const label = date.toLocaleDateString("en-US", { weekday: "short" });
            const dayKey = date.toDateString();

            const newLeadCount = leadList.filter((lead) => {
                if (!lead.createdAt) return false;
                return isSameCalendarDay(new Date(lead.createdAt), date);
            }).length;

            const visitCount = leadList.filter((lead) => {
                if (lead.status !== "Visit Scheduled") return false;
                if (!lead.updatedAt) return false;
                return isSameCalendarDay(new Date(lead.updatedAt), date);
            }).length;

            const followUpCount = leadList.filter((lead) => {
                if (!lead.nextFollowUp?.date) return false;
                return isSameCalendarDay(new Date(lead.nextFollowUp.date), date);
            }).length;

            return {
                name: label,
                "New Leads": newLeadCount,
                "Visits": visitCount,
                "Follow-ups": followUpCount,
            };
        });
    };

    const getTopLeadSources = () => {
        return Object.entries(
            leadList.reduce((acc, lead) => {
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

    const getUpcomingFollowUps = () => {
        return leadList
            .filter((lead) => lead.nextFollowUp?.date && !["Won", "Lost"].includes(lead.status))
            .map((lead) => {
                const followUpDate = new Date(lead.nextFollowUp.date);
                return {
                    time: followUpDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    client: lead.name,
                    service: lead.project || lead.source || "Follow-up call",
                    status: lead.status,
                };
            })
            .sort((a, b) => new Date(a.time) - new Date(b.time))
            .slice(0, 4);
    };

    return {
        loading,
        metrics,
        weeklyData: getWeeklyProductivityData(),
        topBarbers: getTopLeadSources(),
        upcomingAppointments: getUpcomingFollowUps(),
    };
}
