import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { FiMoon, FiSun, FiBell, FiGlobe, FiLogOut, FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { changePassword } from "../../services/authService";

function ToggleSwitch({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
                checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700",
            ].join(" ")}
        >
            <span
                className={[
                    "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200",
                    checked ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
            />
        </button>
    );
}

function SettingRow({ icon: Icon, label, description, children }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                    <Icon className="text-base" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                    {description && (
                        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                    )}
                </div>
            </div>
            <div className="shrink-0 ml-4">{children}</div>
        </div>
    );
}

export default function Settings() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [notifications, setNotifications] = useState({
        attendance: true,
        leave: true,
        payroll: true,
    });
    const [language, setLanguage] = useState("en");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        if (passwordForm.next !== passwordForm.confirm) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwordForm.next.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setSavingPassword(true);
        try {
            await changePassword(passwordForm.current, passwordForm.next);
            toast.success("Password changed successfully");
            setShowPasswordModal(false);
            setPasswordForm({ current: "", next: "", confirm: "" });
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Password change failed");
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <DashboardLayout title="Settings" subtitle="Manage your preferences and account settings">
            <div className="max-w-2xl space-y-6">
                {/* Appearance */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none">
                    <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Appearance</h3>
                    <p className="mb-4 text-xs text-slate-400">Customize how the portal looks</p>

                    <SettingRow
                        icon={theme === "dark" ? FiMoon : FiSun}
                        label="Dark Mode"
                        description="Switch between light and dark theme"
                    >
                        <ToggleSwitch checked={theme === "dark"} onChange={toggleTheme} />
                    </SettingRow>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none">
                    <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Notifications</h3>
                    <p className="mb-4 text-xs text-slate-400">Choose what you want to be notified about (UI only)</p>

                    <SettingRow
                        icon={FiBell}
                        label="Attendance Reminders"
                        description="Get reminded to check in / check out"
                    >
                        <ToggleSwitch
                            checked={notifications.attendance}
                            onChange={(v) => setNotifications((p) => ({ ...p, attendance: v }))}
                        />
                    </SettingRow>
                    <SettingRow
                        icon={FiBell}
                        label="Leave Status Updates"
                        description="Know when your leave is approved or rejected"
                    >
                        <ToggleSwitch
                            checked={notifications.leave}
                            onChange={(v) => setNotifications((p) => ({ ...p, leave: v }))}
                        />
                    </SettingRow>
                    <SettingRow
                        icon={FiBell}
                        label="Payroll Alerts"
                        description="Get notified when your salary slip is ready"
                    >
                        <ToggleSwitch
                            checked={notifications.payroll}
                            onChange={(v) => setNotifications((p) => ({ ...p, payroll: v }))}
                        />
                    </SettingRow>
                </div>

                {/* Language */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none">
                    <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Language</h3>
                    <p className="mb-4 text-xs text-slate-400">Select your preferred language (UI only)</p>

                    <SettingRow
                        icon={FiGlobe}
                        label="Display Language"
                        description="Change the language of the portal interface"
                    >
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="ta">Tamil</option>
                            <option value="te">Telugu</option>
                        </select>
                    </SettingRow>
                </div>

                {/* Security */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none">
                    <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Security</h3>
                    <p className="mb-4 text-xs text-slate-400">Update your login password</p>

                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-950/30 transition"
                    >
                        <FiLock className="text-sm" />
                        Change Password
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-red-900/40 dark:bg-slate-800/60 dark:shadow-none">
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Account</h3>
                    <p className="text-xs text-slate-400 mb-4">Sign out of your employee portal account</p>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 h-10 px-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/30 transition"
                    >
                        <FiLogOut className="text-sm" />
                        Logout
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 px-4 pb-8 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.24)] dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-500">
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {[
                                { key: "current", label: "Current Password", visible: showCurrent, toggle: () => setShowCurrent((prev) => !prev) },
                                { key: "next", label: "New Password", visible: showNext, toggle: () => setShowNext((prev) => !prev) },
                                { key: "confirm", label: "Confirm Password", visible: showNext, toggle: () => setShowNext((prev) => !prev) },
                            ].map(({ key, label, visible, toggle }) => (
                                <div key={key}>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={visible ? "text" : "password"}
                                            autoComplete={key === "current" ? "current-password" : "new-password"}
                                            value={passwordForm[key]}
                                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, [key]: event.target.value }))}
                                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="h-12 flex-1 rounded-2xl bg-slate-200 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="h-12 flex-1 rounded-2xl bg-blue-500 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60"
                                >
                                    {savingPassword ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
