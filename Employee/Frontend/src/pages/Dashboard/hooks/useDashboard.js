import { useState, useEffect, useCallback } from "react";
import { getMyAttendance } from "../../../services/attendanceService";
import { getMyLeaves } from "../../../services/leaveService";
import { getMyPayroll } from "../../../services/payrollService";
import { getHolidays } from "../../../services/holidayService";
import { useAuth } from "../../../context/AuthContext";

export function useDashboard() {
    const { employee } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [payroll, setPayroll] = useState([]);
    const [holidays, setHolidays] = useState([]);

    const fetchAll = useCallback(async () => {
        if (!employee?.employeeId) return;
        setLoading(true);
        try {
            const [attRes, leaveRes, payRes, holRes] = await Promise.allSettled([
                getMyAttendance(employee.employeeId),
                getMyLeaves(employee.employeeId),
                getMyPayroll(employee.employeeId),
                getHolidays(),
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

            if (leaveRes.status === "fulfilled") {
                const rawLeave = leaveRes.value?.data;
                setLeaves(Array.isArray(rawLeave) ? rawLeave : []);
            }

            if (payRes.status === "fulfilled") {
                const rawPay = payRes.value?.data;
                setPayroll(Array.isArray(rawPay) ? rawPay : []);
            }

            if (holRes.status === "fulfilled") {
                const rawHol = holRes.value?.data;
                setHolidays(Array.isArray(rawHol) ? rawHol : []);
            }
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    }, [employee?.employeeId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const safeLeaves = Array.isArray(leaves) ? leaves : [];
    const safePayroll = Array.isArray(payroll) ? payroll : [];
    const safeHolidays = Array.isArray(holidays) ? holidays : [];

    // Derived data
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = safeAttendance.find((a) => a && a.date === today) ?? (safeAttendance[0] || null);

    const monthAttendance = safeAttendance.filter((a) => {
        if (!a || !a.date) return false;
        const d = new Date(a.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const presentDays = monthAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    const absentDays = monthAttendance.filter((a) => a.status === "Absent").length;

    const pendingLeaves = safeLeaves.filter((l) => l.status === "pending");
    const upcomingLeave = pendingLeaves[0] ?? null;

    const latestPayroll = safePayroll[0] ?? null;

    const upcomingHolidays = safeHolidays
        .filter((h) => h && h.date && new Date(h.date) >= new Date())
        .slice(0, 3);

    return {
        loading,
        attendance: safeAttendance,
        payroll: safePayroll,
        holidays: safeHolidays,
        todayAttendance,
        presentDays,
        absentDays,
        leaves: safeLeaves,
        upcomingLeave,
        latestPayroll,
        upcomingHolidays,
        recentAttendance: safeAttendance.slice(0, 5),
        fetchAll,
    };
}
