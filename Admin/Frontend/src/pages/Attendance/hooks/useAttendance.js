import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as attendanceService from "../../../services/attendanceService";
import * as employeeService from "../../../services/employeeService";

export function useAttendance() {
    const [attendanceList, setAttendanceList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

    // Check-in modal states
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [actionType, setActionType] = useState("check-in");

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const listRes = await attendanceService.getAttendanceList();
            if (listRes.success) {
                setAttendanceList(listRes.data);
            }
            const empRes = await employeeService.getEmployees({ limit: 100 });
            if (empRes.success) {
                setEmployees(empRes.data);
            }
        } catch (err) {
            console.error("Attendance fetch error:", err);
            toast.error("Failed to load attendance logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleLogDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attendance log?")) return;
        try {
            const res = await attendanceService.deleteAttendance(id);
            if (res.success) {
                toast.success("Attendance log deleted");
                fetchAttendance();
            }
        } catch (err) {
            toast.error("Failed to delete log");
        }
    };

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) {
            toast.error("Please select a barber");
            return;
        }

        try {
            let res;
            if (actionType === "check-in") {
                res = await attendanceService.checkIn(selectedEmployeeId);
            } else {
                res = await attendanceService.checkOut(selectedEmployeeId);
            }

            if (res.success) {
                toast.success(res.message || "Attendance log updated successfully");
                setIsActionModalOpen(false);
                fetchAttendance();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to perform ${actionType}`);
        }
    };

    // Filter attendance logs by date and name search
    const filteredLogs = attendanceList.filter(log => {
        const matchesDate = !dateFilter || log.date === dateFilter;
        const emp = employees.find(e => e.employeeId === log.employeeId);
        const fullName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
        const matchesSearch = !search || fullName.includes(search.toLowerCase()) || log.employeeId.toLowerCase().includes(search.toLowerCase());
        return matchesDate && matchesSearch;
    });

    // Stats calculations
    const todayLogs = attendanceList.filter(l => l.date === new Date().toISOString().split("T")[0]);
    const presentCount = todayLogs.filter(l => l.status === "Present").length;
    const absentCount = todayLogs.filter(l => l.status === "Absent").length;
    const leaveCount = todayLogs.filter(l => l.status === "Leave").length;

    return {
        attendanceList,
        employees,
        loading,
        search,
        setSearch,
        dateFilter,
        setDateFilter,
        isActionModalOpen,
        setIsActionModalOpen,
        selectedEmployeeId,
        setSelectedEmployeeId,
        actionType,
        setActionType,
        handleLogDelete,
        handleActionSubmit,
        filteredLogs,
        presentCount,
        absentCount,
        leaveCount
    };
}
