import { useState } from "react";
import toast from "react-hot-toast";

export function useAdminProfile(logout, theme, toggleTheme) {
    const [photo, setPhoto] = useState(
        localStorage.getItem("admin_profile_photo") || ""
    );
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [personalInfo, setPersonalInfo] = useState(() => {
        const saved = localStorage.getItem("admin_personal_info");
        return saved ? JSON.parse(saved) : {
            firstName: "Alex",
            lastName: "Rivera",
            email: "admin@gmail.com",
            phone: "+91 9876543210",
            bio: "Lead Salon Operations Manager & Operations Director at Diva The Salon. 8+ years in premium barbershop administration.",
            gender: "Male",
            dob: "1990-05-15",
            address: "12, Connaught Place Outer Circle",
            city: "New Delhi",
            state: "Delhi",
            country: "India",
            pinCode: "110001"
        };
    });

    const [prefs, setPrefs] = useState(() => {
        const saved = localStorage.getItem("admin_preferences");
        return saved ? JSON.parse(saved) : {
            language: "English (US)",
            timezone: "GMT+5:30 (IST)",
            dateFormat: "DD/MM/YYYY",
            timeFormat: "12-hour"
        };
    });

    const [notifs, setNotifs] = useState(() => {
        const saved = localStorage.getItem("admin_notifications");
        return saved ? JSON.parse(saved) : {
            emailNotif: true,
            payrollNotif: true,
            attendanceAlert: true,
            leaveRequest: true,
            holidayReminder: true,
            inventoryAlert: false
        };
    });

    const handleSaveAll = () => {
        localStorage.setItem("admin_personal_info", JSON.stringify(personalInfo));
        localStorage.setItem("admin_preferences", JSON.stringify(prefs));
        localStorage.setItem("admin_notifications", JSON.stringify(notifs));
        toast.success("Profile preferences and details saved successfully!");
    };

    const handleReset = () => {
        localStorage.removeItem("admin_personal_info");
        localStorage.removeItem("admin_preferences");
        localStorage.removeItem("admin_notifications");
        window.location.reload();
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPhoto(reader.result);
                        localStorage.setItem("admin_profile_photo", reader.result);
                        setUploading(false);
                        toast.success("Profile photo uploaded successfully!");
                    };
                    reader.readAsDataURL(file);
                    return 100;
                }
                return prev + 30;
            });
        }, 150);
    };

    const handleRemovePhoto = () => {
        setPhoto("");
        localStorage.removeItem("admin_profile_photo");
        toast.success("Profile photo removed");
    };

    return {
        photo,
        uploadProgress,
        uploading,
        personalInfo,
        setPersonalInfo,
        prefs,
        setPrefs,
        notifs,
        setNotifs,
        handleSaveAll,
        handleReset,
        handlePhotoUpload,
        handleRemovePhoto
    };
}
