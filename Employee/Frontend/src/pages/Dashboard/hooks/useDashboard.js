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

            if (attRes.status === "fulfilled") setAttendance(attRes.value?.data ?? []);
            if (leaveRes.status === "fulfilled") setLeaves(leaveRes.value?.data ?? []);
            if (payRes.status === "fulfilled") setPayroll(payRes.value?.data ?? []);
            if (holRes.status === "fulfilled") setHolidays(holRes.value?.data ?? []);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    }, [employee?.employeeId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Derived data
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendance.find((a) => a.date === today) ?? null;

    const monthAttendance = attendance.filter((a) => {
        const d = new Date(a.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const presentDays = monthAttendance.filter((a) => a.status === "Present").length;
    const absentDays = monthAttendance.filter((a) => a.status === "Absent").length;

    const pendingLeaves = leaves.filter((l) => l.status === "pending");
    const upcomingLeave = pendingLeaves[0] ?? null;

    const latestPayroll = payroll[0] ?? null;

    const upcomingHolidays = holidays
        .filter((h) => new Date(h.date) >= new Date())
        .slice(0, 3);

    return {
        loading,
        attendance,
        payroll,
        holidays,
        todayAttendance,
        presentDays,
        absentDays,
        leaves,
        upcomingLeave,
        latestPayroll,
        upcomingHolidays,
        recentAttendance: attendance.slice(0, 5),
        fetchAll,
    };
}
