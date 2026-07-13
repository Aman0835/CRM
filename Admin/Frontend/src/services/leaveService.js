import api from "./api";

export const getLeaves = async () => {
    const response = await api.get("/admin/leaves/getLeaves");
    return response.data;
};

export const createLeave = async (data) => {
    const response = await api.post("/admin/leaves/createLeave", data);
    return response.data;
};

export const approveLeave = async (id, approvedBy = "admin") => {
    const response = await api.patch(`/admin/leaves/approveLeave/${id}`, { approvedBy });
    return response.data;
};

export const rejectLeave = async (id, approvedBy = "admin") => {
    const response = await api.patch(`/admin/leaves/rejectLeave/${id}`, { approvedBy });
    return response.data;
};

export const deleteLeave = async (id) => {
    const response = await api.delete(`/admin/leaves/deleteLeave/${id}`);
    return response.data;
};
