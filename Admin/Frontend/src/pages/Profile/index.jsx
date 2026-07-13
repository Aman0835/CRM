import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

// Sub-components
import ProfileCard from "./components/ProfileCard";
import AccountInfoCard from "./components/AccountInfoCard";
import AccountActionsCard from "./components/AccountActionsCard";
import PersonalInfoForm from "./components/PersonalInfoForm";
import PreferencesCard from "./components/PreferencesCard";
import NotificationSettingsCard from "./components/NotificationSettingsCard";

// Custom Hook
import { useAdminProfile } from "./hooks/useAdminProfile";

export default function AdminProfile() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const {
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
    } = useAdminProfile(logout, theme, toggleTheme);

    return (
        <DashboardLayout 
            title="Admin Profile" 
            subtitle="Manage your personal information, preferences and account."
            action={
                <div className="flex gap-2.5">
                    <button 
                        onClick={handleReset}
                        className="h-10 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition px-4 inline-flex items-center shadow-xs"
                    >
                        Reset Defaults
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        className="h-10 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition px-4 inline-flex items-center shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            }
        >
            <div className="space-y-6 text-slate-800 dark:text-slate-100">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-450 dark:hover:text-blue-400 transition"
                >
                    <FiArrowLeft /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileCard 
                            personalInfo={personalInfo} 
                            photo={photo} 
                            uploading={uploading} 
                            uploadProgress={uploadProgress} 
                            handlePhotoUpload={handlePhotoUpload} 
                            handleRemovePhoto={handleRemovePhoto} 
                        />
                        <AccountInfoCard />
                        <AccountActionsCard onLogout={logout} />
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <PersonalInfoForm personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />
                        <PreferencesCard prefs={prefs} setPrefs={setPrefs} currentTheme={theme} onToggleTheme={toggleTheme} />
                        <NotificationSettingsCard notifs={notifs} setNotifs={setNotifs} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
