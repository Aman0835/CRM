import api from "./api";

// Get all holidays (public endpoint for employees)
export const getHolidays = async () => {
    const response = await api.get("/employee/holidays");
    return response.data;
};
