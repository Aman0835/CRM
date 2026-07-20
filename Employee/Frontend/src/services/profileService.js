import api from "./api";

// Get my profile
export const getMyProfile = async () => {
    const response = await api.get("/employee/profile/me");
    return response.data;
};

// Update allowed profile fields (phone, address, profileImage)
export const updateMyProfile = async (profileData) => {
    const response = await api.patch("/employee/profile/me", profileData);
    return response.data;
};
