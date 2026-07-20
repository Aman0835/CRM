import { useRef, useState } from "react";
import {
    FiCamera,
    FiChevronRight,
    FiEdit2,
    FiEye,
    FiEyeOff,
    FiLock,
    FiLogOut,
    FiMail,
    FiMapPin,
    FiPhone,
    FiTrash2,
    FiUser,
    FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../services/authService";
import { updateMyProfile } from "../../services/profileService";

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#334766]">
                <Icon className="h-4 w-4 text-[#9ab2d8]" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7088ae]">{label}</p>
                <p className="truncate text-sm font-medium text-white">{value || "--"}</p>
            </div>
        </div>
    );
}

export default function Profile() {
    const { employee, logout, updateEmployeeState } = useAuth();
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
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingPhoto, setSavingPhoto] = useState(false);
    const initials = `${employee?.firstName?.[0] ?? ""}${employee?.lastName?.[0] ?? ""}`.toUpperCase() || "EM";

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
                <div className="relative bg-[linear-gradient(to_bottom,_rgba(47,108,246,0.14),_transparent)] px-4 pb-16 pt-6 text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                    <div className="relative inline-block">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-2xl font-black text-white shadow-[0_20px_40px_rgba(59,130,246,0.28)]">
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
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f1a] bg-blue-500 disabled:opacity-60"
                        >
                            <FiCamera className="h-3.5 w-3.5 text-white" />
                        </button>
                    </div>
                    <h1 className="mt-4 text-xl font-black text-white">
                        {employee?.firstName} {employee?.lastName}
                    </h1>
                    <p className="text-sm capitalize text-[#7d93ba]">{employee?.role ?? "Employee"}</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {employee?.status ?? "Active"}
                        </span>
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400">
                            Joined employee app
                        </span>
                    </div>
                    {employee?.profileImage && (
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={savingPhoto}
                            className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 disabled:opacity-60"
                        >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Remove photo
                        </button>
                    )}
                </div>

                <div className="-mt-10 space-y-4 px-1">
                    <div className="overflow-hidden rounded-[28px] border border-[#243552] bg-[#1d2840] shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
                        <DetailRow icon={FiUser} label="Employee ID" value={employee?.employeeId} />
                        <DetailRow icon={FiPhone} label="Phone" value={employee?.phone} />
                        <DetailRow icon={FiMail} label="Email" value={employee?.email} />
                        <DetailRow icon={FiUser} label="Designation" value={employee?.role} />
                        <DetailRow
                            icon={FiMapPin}
                            label="Joined"
                            value={employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            }) : "--"}
                        />
                        <DetailRow icon={FiMapPin} label="Address" value={employee?.address || "Not provided"} />
                    </div>

                    {editing && (
                        <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white">Edit Profile</h2>
                                <button type="button" onClick={() => setEditing(false)} className="text-[#8aa3ca]">
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8aa3ca]">Phone</label>
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
                                        className="h-12 w-full rounded-2xl border border-[#324662] bg-[#334766] px-4 text-sm text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8aa3ca]">Address</label>
                                    <textarea
                                        rows={3}
                                        value={profileForm.address}
                                        onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))}
                                        className="w-full resize-none rounded-2xl border border-[#324662] bg-[#334766] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="flex h-12 w-full items-center justify-center rounded-2xl bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-60"
                                >
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="flex w-full items-center gap-3 rounded-[24px] border border-[#243552] bg-[#1d2840] px-4 py-3.5 text-left text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.34)] transition hover:bg-[#24324a]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20">
                                <FiEdit2 className="h-4 w-4 text-blue-400" />
                            </div>
                            Edit Profile
                            <FiChevronRight className="ml-auto h-4 w-4 text-[#8aa3ca]" />
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center gap-3 rounded-[24px] border border-[#243552] bg-[#1d2840] px-4 py-3.5 text-left text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.34)] transition hover:bg-[#24324a]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20">
                                <FiCamera className="h-4 w-4 text-sky-400" />
                            </div>
                            {savingPhoto ? "Updating Photo..." : "Change Profile Photo"}
                            <FiChevronRight className="ml-auto h-4 w-4 text-[#8aa3ca]" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex w-full items-center gap-3 rounded-[24px] border border-[#243552] bg-[#1d2840] px-4 py-3.5 text-left text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.34)] transition hover:bg-[#24324a]"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20">
                                <FiLock className="h-4 w-4 text-violet-400" />
                            </div>
                            Change Password
                            <FiChevronRight className="ml-auto h-4 w-4 text-[#8aa3ca]" />
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-[24px] border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20">
                                <FiLogOut className="h-4 w-4 text-red-400" />
                            </div>
                            Logout
                            <FiChevronRight className="ml-auto h-4 w-4 text-red-400/50" />
                        </button>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 px-4 pb-8 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-[28px] border border-[#243552] bg-[#141c31] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-bold text-white">Change Password</h2>
                            <button type="button" onClick={() => setShowPasswordModal(false)} className="text-[#8aa3ca]">
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
                                    visible: showNext,
                                    toggle: () => setShowNext((prev) => !prev),
                                },
                            ].map(({ key, label, visible, toggle }) => (
                                <div key={key}>
                                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8aa3ca]">{label}</label>
                                    <div className="relative">
                                        <input
                                            type={visible ? "text" : "password"}
                                            autoComplete={key === "current" ? "current-password" : "new-password"}
                                            value={passwordForm[key]}
                                            onChange={(event) => setPasswordForm((prev) => ({ ...prev, [key]: event.target.value }))}
                                            className="h-12 w-full rounded-2xl border border-[#324662] bg-[#24324a] px-4 pr-11 text-sm text-white outline-none focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8aa3ca]"
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
                                    className="h-12 flex-1 rounded-2xl bg-[#24324a] text-sm font-semibold text-white transition hover:bg-[#2d3d58]"
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
