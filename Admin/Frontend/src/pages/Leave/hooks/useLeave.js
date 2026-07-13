import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as leaveService from "../../../services/leaveService";
import * as employeeService from "../../../services/employeeService";

export function useLeave() {
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const leaveRes = await leaveService.getLeaves();
            if (leaveRes.success) setLeaves(leaveRes.data);
            const empRes = await employeeService.getEmployees({ limit: 100 });
            if (empRes.success) setEmployees(empRes.data);
        } catch (err) {
            console.error("Leave requests fetch error:", err);
            toast.error("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await leaveService.approveLeave(id, "admin");
            if (res.success) {
                toast.success("Leave request approved successfully!");
                fetchLeaves();
            }
        } catch (err) {
            toast.error("Failed to approve leave");
        }
    };

    const handleReject = async (id) => {
        try {
            const res = await leaveService.rejectLeave(id, "admin");
            if (res.success) {
                toast.success("Leave request rejected.");
                fetchLeaves();
            }
        } catch (err) {
            toast.error("Failed to reject leave");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this leave request?")) return;
        try {
            const res = await leaveService.deleteLeave(id);
            if (res.success) {
                toast.success("Leave request deleted");
                fetchLeaves();
            }
        } catch (err) {
            toast.error("Failed to delete request");
        }
    };

    const filteredRequests = leaves.filter(request => {
        if (activeTab === "all") return true;
        return request.status === activeTab;
    });

    const getLeaveCount = (status) => leaves.filter(l => l.status === status).length;

    return {
        leaves,
        employees,
        loading,
        activeTab,
        setActiveTab,
        handleApprove,
        handleReject,
        handleDelete,
        filteredRequests,
        getLeaveCount,
    };
}
