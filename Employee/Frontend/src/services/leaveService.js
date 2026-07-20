import api from "./api";

// Get my leave requests
export const getMyLeaves = async (employeeId) => {
    const response = await api.get(`/employee/leaves/my/${employeeId}`);
    return response.data;
};

// Apply for leave
export const applyLeave = async (leaveData) => {
    const response = await api.post("/admin/leaves/createLeave", leaveData);
    return response.data;
};

// Cancel a pending leave
export const cancelLeave = async (leaveId) => {
    const response = await api.delete(`/admin/leaves/deleteLeave/${leaveId}`);
    return response.data;
};
