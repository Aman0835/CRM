import { useMemo, useRef, useState } from "react";
import {
    FiCalendar,
    FiCamera,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiCreditCard,
    FiDollarSign,
    FiEdit2,
    FiEye,
    FiEyeOff,
    FiFileText,
    FiInfo,
    FiLock,
    FiLogOut,
    FiMail,
    FiMapPin,
    FiPhone,
    FiTrash2,
    FiTrendingUp,
    FiUser,
    FiX,
} from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../Dashboard/hooks/useDashboard";
import { changePassword } from "../../services/authService";
import { updateMyProfile } from "../../services/profileService";

function formatMoney(value) {
    return `₹${Number(value ?? 0).toLocaleString()}`;
}

function formatMonthYear(month, year) {
    if (!month || !year) return "Current Month";
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function DetailRow({ icon: Icon, label, value, subValue }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#381C14] bg-[#1a0d09]">
                <Icon className="h-4 w-4 text-[#D9C4AA]" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">{label}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-[#FBFAF6]">{value || "--"}</p>
                    {subValue && (
                        <span className="rounded-full border border-[#AE9475]/35 bg-[#381C14] px-2.5 py-0.5 text-[10px] font-bold text-[#E9D5BD] shadow-sm">
                            {subValue}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const { employee, logout, updateEmployeeState } = useAuth();
    const { attendance = [], payroll = [], latestPayroll } = useDashboard();
    const [searchParams, setSearchParams] = useSearchParams();

    // Tab state: "profile" | "salary"
    const activeTab = searchParams.get("tab") === "salary" ? "salary" : "profile";
    const setActiveTab = (tab) => {
        setSearchParams(tab === "salary" ? { tab: "salary" } : {});
    };

    const fileInputRef = useRef(null);
    const [editing, setEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [profileForm, setProfileForm] = useState({
        phone: employee?.phone ?? "",
        address: employee?.address ?? "",
        profileImage: employee?.profileImage ?? "",
    });
    const [passwordForm, setPasswordForm] = useState({
        current: "",
        next: "",
        confirm: "",
    });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingPhoto, setSavingPhoto] = useState(false);
    const initials = `${employee?.firstName?.[0] ?? ""}${employee?.lastName?.[0] ?? ""}`.toUpperCase() || "EM";

    // Date calculations
    const now = new Date();
    const currentMonth = latestPayroll?.month ?? (now.getMonth() + 1);
    const currentYear = latestPayroll?.year ?? now.getFullYear();

    // Attendance for the current month
    const monthAttendance = useMemo(() => {
        return (attendance || []).filter((item) => {
            if (!item?.date) return false;
            const d = new Date(item.date);
            return d.getMonth() === (currentMonth - 1) && d.getFullYear() === currentYear;
        });
    }, [attendance, currentMonth, currentYear]);

    // Present days calculation:
    // Full day present or late counts as 1 day; Half Day counts as 0.5 days
    const presentDays = useMemo(() => {
        return monthAttendance.reduce((acc, item) => {
            if (item.status === "Present" || item.status === "Late") return acc + 1;
            if (item.status === "Half Day") return acc + 0.5;
            return acc;
        }, 0);
    }, [monthAttendance]);

    const absentDays = useMemo(() => {
        return monthAttendance.filter((item) => item.status === "Absent").length;
    }, [monthAttendance]);

    const overtimeHours = useMemo(() => {
        return monthAttendance.reduce((sum, item) => {
            if (item.overtime && item.overtime > 0) return sum + Number(item.overtime);
            return sum + Math.max(Number(item.workingHours ?? 0) - 8, 0);
        }, 0);
    }, [monthAttendance]);

    // Daily rate calculation:
    // Uses employee.perDayPayout if provided, else (monthlySalary / 30), or default fallback ₹1,100
    const dailyRate = Number(
        employee?.perDayPayout && employee?.perDayPayout > 0
            ? employee.perDayPayout
            : employee?.monthlySalary && employee?.monthlySalary > 0
            ? Math.round(employee.monthlySalary / 30)
            : 1100
    );

    // Total Salary: dailyRate * presentDays (e.g. 1100 * 24 = 26400)
    const earnedSalary = Math.round(dailyRate * presentDays);
    const overtimePay = Math.round(overtimeHours * 25);
    const totalSalary = earnedSalary + overtimePay;

    const previousPayroll = payroll[1] ?? null;
    const trendPercent = previousPayroll?.netSalary
        ? (((totalSalary - previousPayroll.netSalary) / previousPayroll.netSalary) * 100)
        : 0;

    // Calculate number of working days since joining
    const daysWorking = useMemo(() => {
        if (!employee?.joiningDate) return null;
        const joined = new Date(employee.joiningDate);
        if (isNaN(joined.getTime())) return null;
        const today = new Date();
        const joinedMidnight = new Date(joined.getFullYear(), joined.getMonth(), joined.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffTime = todayMidnight.getTime() - joinedMidnight.getTime();
        const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        return diffDays === 0 ? "Joined today" : `${diffDays} days working`;
    }, [employee?.joiningDate]);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const result = await updateMyProfile(profileForm);
            updateEmployeeState({ ...employee, ...result.data });
            toast.success("Profile updated");
            setEditing(false);
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Unable to update profile");
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        setSavingPhoto(true);
        reader.onloadend = async () => {
            const imageValue = typeof reader.result === "string" ? reader.result : "";

            try {
                const result = await updateMyProfile({
                    phone: profileForm.phone,
                    address: profileForm.address,
                    profileImage: imageValue,
                });

                setProfileForm((prev) => ({ ...prev, profileImage: imageValue }));
                updateEmployeeState({ ...employee, ...result.data });
                toast.success("Profile image updated");
            } catch (error) {
                toast.error(error?.response?.data?.message ?? "Unable to update profile image");
            } finally {
                setSavingPhoto(false);
                event.target.value = "";
            }
        };

        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = async () => {
        setSavingPhoto(true);
        try {
            const result = await updateMyProfile({
                phone: profileForm.phone,
                address: profileForm.address,
                profileImage: "",
            });

            setProfileForm((prev) => ({ ...prev, profileImage: "" }));
            updateEmployeeState({ ...employee, ...result.data });
            toast.success("Profile image removed");
        } catch (error) {
            toast.error(error?.response?.data?.message ?? "Unable to remove profile image");
        } finally {
            setSavingPhoto(false);
        }
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
            toast.error(error?.response?.data?.message ?? "Unable to change password");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    return (
        <DashboardLayout>
            <div className="space-y-4 pt-2">
                {/* Profile Header Card */}
                <div className="relative bg-[linear-gradient(to_bottom,_rgba(150,42,34,0.18),_transparent)] px-4 pb-4 pt-6 text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                    <div className="relative inline-block">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#D9C4AA]/30 bg-[#962A22] text-2xl font-black text-[#FBFAF6] shadow-[0_20px_40px_rgba(150,42,34,0.35)]">
                            {employee?.profileImage ? (
                                <img src={employee.profileImage} alt={employee?.firstName} className="h-full w-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={savingPhoto}
                            aria-label="Change profile photo"
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1a0d09] bg-[#962A22] text-[#FBFAF6] disabled:opacity-60 cursor-pointer"
                        >
                            <FiCamera className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <h1 className="mt-4 text-xl font-black text-[#FBFAF6]">
                        {employee?.firstName} {employee?.lastName}
                    </h1>
                    <p className="text-sm capitalize text-[#D9C4AA]">{employee?.role ?? "Employee"}</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {employee?.status ?? "Active"}
                        </span>
                        <span className="rounded-full border border-[#D9C4AA]/30 bg-[#381C14] px-3 py-1 text-xs font-semibold text-[#D9C4AA]">
                            ID: {employee?.employeeId || "--"}
                        </span>
                    </div>
                    {employee?.profileImage && (
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={savingPhoto}
                            className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-[#962A22]/30 bg-[#962A22]/15 px-3 py-1.5 text-xs font-semibold text-red-300 disabled:opacity-60 cursor-pointer"
                        >
                            <FiTrash2 className="h-3 w-3" />
                            Remove photo
                        </button>
                    )}
                </div>

                {/* Tab Switcher: Profile Info vs Salary & Payout */}
                <div className="px-1">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#381C14] bg-[#1a0d09] p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                        <button
                            type="button"
                            onClick={() => setActiveTab("profile")}
                            className={[
                                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                                activeTab === "profile"
                                    ? "bg-[#962A22] text-[#FBFAF6] shadow-[0_4px_12px_rgba(150,42,34,0.4)]"
                                    : "text-[#D9C4AA] hover:text-[#FBFAF6] hover:bg-[#24110c]",
                            ].join(" ")}
                        >
                            <FiUser className="h-3.5 w-3.5" />
                            Profile Details
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("salary")}
                            className={[
                                "flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                                activeTab === "salary"
                                    ? "bg-[#962A22] text-[#FBFAF6] shadow-[0_4px_12px_rgba(150,42,34,0.4)]"
                                    : "text-[#D9C4AA] hover:text-[#FBFAF6] hover:bg-[#24110c]",
                            ].join(" ")}
                        >
                            <FiCreditCard className="h-3.5 w-3.5" />
                            Salary & Payout
                        </button>
                    </div>
                </div>

                {/* TAB 1: PROFILE DETAILS */}
                {activeTab === "profile" && (
                    <div className="space-y-4 px-1">
                        {/* Quick Salary Highlight Card */}
                        <div
                            onClick={() => setActiveTab("salary")}
                            className="cursor-pointer group flex items-center justify-between rounded-[24px] border border-[#D9C4AA]/25 bg-[linear-gradient(135deg,#962A22_0%,#381C14_100%)] p-4 shadow-[0_12px_28px_rgba(150,42,34,0.3)] transition hover:border-[#D9C4AA]/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBFAF6]/10 text-[#FBFAF6]">
                                    <FiCreditCard className="h-5 w-5 text-[#E9D5BD]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">
                                        Month Earned Salary
                                    </p>
                                    <p className="text-base font-black text-[#FBFAF6]">
                                        {formatMoney(totalSalary)}
                                        <span className="ml-2 text-xs font-normal text-[#E9D5BD]">
                                            ({presentDays}d present × {formatMoney(dailyRate)})
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center text-xs font-bold text-[#E9D5BD] group-hover:translate-x-1 transition-transform">
                                View Payout
                                <FiChevronRight className="ml-1 h-4 w-4" />
                            </div>
                        </div>

                        {/* Personal & Employment Details */}
                        <div className="overflow-hidden rounded-[28px] border border-[#381C14] bg-[#24110c] shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
                            <DetailRow icon={FiUser} label="Employee ID" value={employee?.employeeId} />
                            <DetailRow icon={FiPhone} label="Phone" value={employee?.phone} />
                            <DetailRow icon={FiMail} label="Email" value={employee?.email} />
                            <DetailRow icon={FiUser} label="Designation" value={employee?.role} />
                            <DetailRow
                                icon={FiCalendar}
                                label="Joined"
                                value={employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                }) : "--"}
                                subValue={daysWorking}
                            />
                            <DetailRow
                                icon={FiMapPin}
                                label="Assigned Office"
                                value={
                                    employee?.assignedOffice
                                        ? `${employee.assignedOffice.officeName || "Office"} (${employee.assignedOffice.allowedRadius || 100}m radius)`
                                        : "Unassigned (Contact Admin)"
                                }
                            />
                            <DetailRow icon={FiMapPin} label="Address" value={employee?.address || "Not provided"} />
                        </div>

                        {/* Editing Section */}
                        {editing && (
                            <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-sm font-bold text-[#FBFAF6]">Edit Profile</h2>
                                    <button type="button" onClick={() => setEditing(false)} className="text-[#D9C4AA]">
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                                            className="h-12 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-4 text-sm text-[#FBFAF6] outline-none focus:border-[#962A22]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">Address</label>
                                        <textarea
                                            rows={3}
                                            value={profileForm.address}
                                            onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))}
                                            className="w-full resize-none rounded-2xl border border-[#381C14] bg-[#1a0d09] px-4 py-3 text-sm text-[#FBFAF6] outline-none focus:border-[#962A22]"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#962A22] hover:bg-[#7e221b] border border-[#D9C4AA]/20 text-sm font-bold text-[#FBFAF6] transition disabled:opacity-60 cursor-pointer"
                                    >
                                        {savingProfile ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Action Buttons */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="flex w-full items-center gap-3 rounded-[24px] border border-[#381C14] bg-[#24110c] px-4 py-3.5 text-left text-sm font-semibold text-[#FBFAF6] shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition hover:bg-[#381C14] cursor-pointer"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#381C14] text-[#D9C4AA]">
                                    <FiEdit2 className="h-4 w-4" />
                                </div>
                                Edit Profile
                                <FiChevronRight className="ml-auto h-4 w-4 text-[#D9C4AA]" />
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center gap-3 rounded-[24px] border border-[#381C14] bg-[#24110c] px-4 py-3.5 text-left text-sm font-semibold text-[#FBFAF6] shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition hover:bg-[#381C14] cursor-pointer"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#381C14] text-[#D9C4AA]">
                                    <FiCamera className="h-4 w-4" />
                                </div>
                                {savingPhoto ? "Updating Photo..." : "Change Profile Photo"}
                                <FiChevronRight className="ml-auto h-4 w-4 text-[#D9C4AA]" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(true)}
                                className="flex w-full items-center gap-3 rounded-[24px] border border-[#381C14] bg-[#24110c] px-4 py-3.5 text-left text-sm font-semibold text-[#FBFAF6] shadow-[0_16px_36px_rgba(0,0,0,0.3)] transition hover:bg-[#381C14] cursor-pointer"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#381C14] text-[#D9C4AA]">
                                    <FiLock className="h-4 w-4" />
                                </div>
                                Change Password
                                <FiChevronRight className="ml-auto h-4 w-4 text-[#D9C4AA]" />
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-[24px] border border-[#962A22]/30 bg-[#962A22]/10 px-4 py-3.5 text-left text-sm font-semibold text-red-400 transition hover:bg-[#962A22]/20 cursor-pointer"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#962A22]/20">
                                    <FiLogOut className="h-4 w-4 text-red-400" />
                                </div>
                                Logout
                                <FiChevronRight className="ml-auto h-4 w-4 text-red-400/50" />
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: SALARY & PAYOUT (ALL DETAILS & WORKING DAYS CALCULATION) */}
                {activeTab === "salary" && (
                    <div className="space-y-4 px-1">
                        {/* Hero Salary Card */}
                        <div className="relative overflow-hidden rounded-[30px] border border-[#D9C4AA]/25 bg-[linear-gradient(135deg,#962A22_0%,#4a1511_100%)] px-6 py-6 shadow-[0_24px_48px_rgba(150,42,34,0.36)]">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C4AA]">
                                    {formatMonthYear(currentMonth, currentYear)} · Accrued Salary
                                </p>
                                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                    {latestPayroll?.status === "paid" ? "Paid" : "Live Accrual"}
                                </span>
                            </div>

                            <p className="mt-3 font-mono text-[44px] font-black leading-none text-[#FBFAF6]">
                                {formatMoney(totalSalary)}
                            </p>

                            {/* Working Days Calculation Formula Banner */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[#D9C4AA]/20 bg-[#24110c]/70 px-3.5 py-2.5">
                                <span className="text-[11px] font-bold text-[#D9C4AA]">Calculation:</span>
                                <span className="font-mono text-[12px] font-black text-[#FBFAF6]">
                                    {formatMoney(dailyRate)}/day × {presentDays} days present = {formatMoney(earnedSalary)}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2">
                                    <span className={["flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold", trendPercent >= 0 ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400" : "border-rose-500/30 bg-rose-950/40 text-rose-400"].join(" ")}>
                                        <FiTrendingUp className="h-3 w-3" />
                                        {trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}% vs prev
                                    </span>
                                </div>
                                <span className="text-[11px] font-semibold text-[#D9C4AA]">
                                    Daily Rate: <strong className="text-[#FBFAF6]">{formatMoney(dailyRate)}</strong>
                                </span>
                            </div>
                        </div>

                        {/* 4 Attendance & Payout Metrics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">Present Days</span>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                        <FiCheckCircle className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="mt-2 font-mono text-[26px] font-black text-[#16e0a0]">{presentDays}d</p>
                                <p className="mt-1 text-[11px] text-[#D9C4AA]">Working days attended</p>
                            </div>

                            <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">Daily Payout</span>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#962A22]/20 text-[#E9D5BD]">
                                        <FiDollarSign className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="mt-2 font-mono text-[24px] font-black text-[#E9D5BD]">{formatMoney(dailyRate)}</p>
                                <p className="mt-1 text-[11px] text-[#D9C4AA]">Per working day rate</p>
                            </div>

                            <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">Absent Days</span>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-[#ff6371]">
                                        <FiX className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="mt-2 font-mono text-[26px] font-black text-[#ff6371]">{absentDays}d</p>
                                <p className="mt-1 text-[11px] text-[#D9C4AA]">Unpaid absent days</p>
                            </div>

                            <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">Overtime</span>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                                        <FiClock className="h-3.5 w-3.5" />
                                    </span>
                                </div>
                                <p className="mt-2 font-mono text-[26px] font-black text-[#FBFAF6]">{Math.round(overtimeHours)}h</p>
                                <p className="mt-1 text-[11px] text-[#D9C4AA]">Extra logged hours</p>
                            </div>
                        </div>

                        {/* Salary Calculation Breakdown */}
                        <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#D9C4AA]">
                                    Earnings Breakdown
                                </p>
                                <span className="text-[11px] font-semibold text-[#D9C4AA]">
                                    Rate: {formatMoney(dailyRate)}/day
                                </span>
                            </div>
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between border-b border-[#381C14] pb-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-[#FBFAF6]">Base Earned Salary</p>
                                        <p className="text-[11px] text-[#D9C4AA]">
                                            {formatMoney(dailyRate)} × {presentDays} days present
                                        </p>
                                    </div>
                                    <p className="font-mono text-sm font-black text-[#FBFAF6]">{formatMoney(earnedSalary)}</p>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#381C14] pb-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-[#FBFAF6]">Overtime / Performance</p>
                                        <p className="text-[11px] text-[#D9C4AA]">
                                            {Math.round(overtimeHours)} hrs @ ₹25/hr
                                        </p>
                                    </div>
                                    <p className="font-mono text-sm font-black text-emerald-400">+{formatMoney(overtimePay)}</p>
                                </div>

                                <div className="flex items-center justify-between border-b border-[#381C14] pb-3 text-sm">
                                    <div>
                                        <p className="font-semibold text-[#FBFAF6]">Deductions</p>
                                        <p className="text-[11px] text-[#D9C4AA]">
                                            Paid strictly for present days
                                        </p>
                                    </div>
                                    <p className="font-mono text-sm font-black text-[#D9C4AA]">-₹0</p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <p className="text-base font-black text-[#FBFAF6]">Total Net Salary</p>
                                        <p className="text-[11px] text-[#D9C4AA]">Calculated for {presentDays} working days</p>
                                    </div>
                                    <p className="font-mono text-xl font-black text-[#FBFAF6]">{formatMoney(totalSalary)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payslip & Statement History */}
                        <div className="space-y-3">
                            <p className="px-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#D9C4AA]">
                                Payslip Statement History
                            </p>
                            <div className="overflow-hidden rounded-[28px] border border-[#381C14] bg-[#24110c] shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
                                {payroll.length ? (
                                    payroll.map((item, index) => {
                                        const isCurrent = index === 0;

                                        return (
                                            <div
                                                key={item._id || `${item.month}-${item.year}`}
                                                className={[
                                                    "flex items-center gap-3.5 px-4 py-3.5",
                                                    index < payroll.length - 1 ? "border-b border-[#381C14]" : "",
                                                ].join(" ")}
                                            >
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#381C14] bg-[#1a0d09] text-[#D9C4AA]">
                                                    <FiFileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-[#FBFAF6]">
                                                        {formatMonthYear(item.month, item.year)}
                                                    </p>
                                                    <p className="text-[11px] text-[#D9C4AA]">
                                                        Net: <strong className="text-[#FBFAF6]">{formatMoney(item.netSalary)}</strong>
                                                        {item.presentDays ? ` · ${item.presentDays} days` : ""}
                                                    </p>
                                                </div>
                                                <span
                                                    className={[
                                                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                        isCurrent
                                                            ? "bg-[#962A22]/20 border border-[#962A22]/40 text-[#FBFAF6]"
                                                            : item.status === "paid"
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-amber-500/20 text-amber-300",
                                                    ].join(" ")}
                                                >
                                                    {isCurrent ? "Current" : item.status === "paid" ? "Paid" : "Generated"}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-5 py-8 text-center text-xs text-[#D9C4AA]">
                                        <FiCalendar className="mx-auto mb-2 h-6 w-6 text-[#D9C4AA]/50" />
                                        No previous payslips archived yet.
                                        <p className="mt-1 text-[11px] text-[#D9C4AA]/70">
                                            Current month earnings are accruing in real time above.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 px-4 pb-8 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-[28px] border border-[#381C14] bg-[#24110c] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-[#FBFAF6]">Change Password</h2>
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="text-[#D9C4AA]">
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {[
                                {
                                    key: "current",
                                    label: "Current Password",
                                    visible: showCurrent,
                                    toggle: () => setShowCurrent((prev) => !prev),
                                },
                                {
                                    key: "next",
                                    label: "New Password",
                                    visible: showNext,
                                    toggle: () => setShowNext((prev) => !prev),
                                },
                                {
                                    key: "confirm",
                                    label: "Confirm Password",
                                    visible: showConfirm,
                                    toggle: () => setShowConfirm((prev) => !prev),
                                },
                            ].map(({ key, label, visible, toggle }) => (
                                <div key={key}>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9C4AA]">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={visible ? "text" : "password"}
                                            autoComplete={key === "current" ? "current-password" : "new-password"}
                                            value={passwordForm[key]}
                                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, [key]: event.target.value }))}
                                            className="h-12 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-4 pr-11 text-sm text-[#FBFAF6] outline-none focus:border-[#962A22]"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D9C4AA]"
                                        >
                                            {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="h-12 flex-1 rounded-2xl border border-[#381C14] bg-[#1a0d09] text-sm font-semibold text-[#D9C4AA] hover:text-[#FBFAF6] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="h-12 flex-1 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] border border-[#D9C4AA]/20 text-sm font-semibold text-[#FBFAF6] transition shadow-[0_8px_20px_rgba(150,42,34,0.35)] disabled:opacity-60 cursor-pointer"
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
