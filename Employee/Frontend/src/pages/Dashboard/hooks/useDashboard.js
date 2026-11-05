import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getMyAttendance } from "../../../services/attendanceService";
import { getMyPayroll } from "../../../services/payrollService";
import { getMyLeads, getMyReminders } from "../../../leads/services/leadService";
import { getMyVisits } from "../../../services/visitService";
import { subscribeRealtime } from "../../../services/realtime";

export function useDashboard() {
    const { employee } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [leads, setLeads] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [totalVisits, setTotalVisits] = useState(0);
    const [leadsSummary, setLeadsSummary] = useState({
        totalLeads: 0,
        totalActive: 0,
        totalLost: 0,
        todaysFollowUps: 0,
    });

    const fetchAll = useCallback(async (isInitial = false) => {
        if (!employee?.employeeId) return;
        if (isInitial) setLoading(true);
        try {
            const [attRes, payRes, leadsRes, remRes, visitsRes] = await Promise.allSettled([
                getMyAttendance(employee.employeeId),
                getMyPayroll(employee.employeeId),
                getMyLeads({ limit: 5 }),
                getMyReminders(),
                getMyVisits(),
            ]);

            if (attRes.status === "fulfilled") {
                const rawAtt = attRes.value?.data;
                if (Array.isArray(rawAtt)) {
                    setAttendance(rawAtt);
                } else if (rawAtt && typeof rawAtt === "object") {
                    setAttendance([rawAtt]);
                } else {
                    setAttendance([]);
                }
            }



            if (payRes.status === "fulfilled") {
                const rawPay = payRes.value?.data;
                setPayroll(Array.isArray(rawPay) ? rawPay : []);
            }


            if (leadsRes.status === "fulfilled") {
                const rawLeads = leadsRes.value?.data;
                setLeads(Array.isArray(rawLeads) ? rawLeads : []);
                if (leadsRes.value?.summary) {
                    setLeadsSummary(leadsRes.value.summary);
                }
            }

            if (remRes.status === "fulfilled") {
                const rawRem = remRes.value?.data;
                setReminders(Array.isArray(rawRem) ? rawRem : []);
            }

            if (visitsRes.status === "fulfilled") {
                const rawVisits = visitsRes.value?.data;
                const count = visitsRes.value?.count ?? (Array.isArray(rawVisits) ? rawVisits.length : 0);
                setTotalVisits(count);
            }
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [employee?.employeeId]);

    useEffect(() => {
        fetchAll(true);
        const interval = setInterval(() => fetchAll(false), 10000);
        const handleFocus = () => fetchAll(false);
        const unsubscribe = subscribeRealtime(() => {
            fetchAll(false);
        });
        window.addEventListener("focus", handleFocus);
        return () => {
            clearInterval(interval);
            unsubscribe();
            window.removeEventListener("focus", handleFocus);
        };
    }, [fetchAll]);

    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const safePayroll = Array.isArray(payroll) ? payroll : [];

    // Derived data
    const localDate = new Date();
    const year = localDate.getFullYear();
    const monthStr = String(localDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(localDate.getDate()).padStart(2, "0");
    const todayLocal = `${year}-${monthStr}-${dayStr}`;
    const todayUtc = localDate.toISOString().split("T")[0];

    const todayAttendance = safeAttendance.find(
        (a) => a && (a.date === todayLocal || a.date === todayUtc)
    ) ?? (safeAttendance[0] || null);

    const monthAttendance = safeAttendance.filter((a) => {
        if (!a || !a.date) return false;
        const d = new Date(a.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const presentDays = monthAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    const absentDays = monthAttendance.filter((a) => a.status === "Absent").length;

    const latestPayroll = safePayroll[0] ?? null;

    const upcomingHolidays = [];

    return {
        loading,
        attendance: safeAttendance,
        payroll: safePayroll,
        holidays: [],
        todayAttendance,
        presentDays,
        absentDays,
        latestPayroll,
        upcomingHolidays,
        recentAttendance: safeAttendance.slice(0, 5),
        recentLeads: leads,
        leadsSummary,
        totalVisits,
        reminders,
        fetchAll,
    };
}
