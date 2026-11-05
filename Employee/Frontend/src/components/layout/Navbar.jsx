import { useState, useEffect, useRef } from "react";
import { FiBell, FiMoon, FiSun, FiMenu, FiX, FiInfo, FiCalendar, FiClock, FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
    FiHome, FiBriefcase, FiMapPin, FiUser, FiSettings, FiLogOut
} from "react-icons/fi";
import toast from "react-hot-toast";
import * as notificationService from "../../services/notificationService";
import { joinRoom, subscribeNotification, subscribeRealtime } from "../../services/realtime";

const mobileNav = [
    { to: "/dashboard",  label: "Dashboard",   icon: FiHome },
    { to: "/leads",      label: "Leads",       icon: FiBriefcase },
    { to: "/visits",     label: "Site Visits", icon: FiMapPin },
    { to: "/attendance", label: "Attendance",  icon: FiCalendar },
    { to: "/profile",    label: "Profile",     icon: FiUser },
    { to: "/settings",   label: "Settings",    icon: FiSettings },
];

export default function Navbar() {
    const { employee, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notification dropdown state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);
    const knownNotificationIds = useRef(new Set());
    const hasLoadedNotifications = useRef(false);

    const showNotificationAlert = (notification) => {
        if (!notification?.title || !notification?.message) return;

        toast(
            (t) => (
                <div className="flex flex-col gap-1 cursor-pointer" onClick={() => { toast.dismiss(t.id); setNotifOpen(true); }}>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{notification.title}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">Reminder</span>
                    </div>
                    <span className="text-[11px] text-slate-300 leading-snug">{notification.message}</span>
                </div>
            ),
            {
                icon: "⏰",
                duration: 9000,
                style: {
                    background: "#0f172a",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
                },
            }
        );

        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(notification.title, { body: notification.message });
        }
    };

    const fetchNotifications = async () => {
        if (!employee?.employeeId) return;
        try {
            const res = await notificationService.getEmployeeNotifications(employee.employeeId);
            if (res.success) {
                const nextNotifications = res.data || [];
                if (hasLoadedNotifications.current) {
                    nextNotifications
                        .filter((notification) => !notification.read && !knownNotificationIds.current.has(notification._id))
                        .forEach(showNotificationAlert);
                }
                nextNotifications.forEach((notification) => knownNotificationIds.current.add(notification._id));
                hasLoadedNotifications.current = true;
                setNotifications(nextNotifications);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch employee notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        if (!employee?.employeeId) return;

        joinRoom("employee");
        joinRoom(`employee-${employee.employeeId}`);
        joinRoom(`employee-${employee.employeeId.toLowerCase()}`);
        joinRoom(`employee-${employee.employeeId.toUpperCase()}`);

        const interval = setInterval(fetchNotifications, 10000);

        const unsubscribeRealtime = subscribeRealtime(() => {
            fetchNotifications();
        });

        const unsubscribeNotif = subscribeNotification((data) => {
            const myId = (employee.employeeId || "").toLowerCase();
            const targetIds = (data?.targetEmployees || []).map((id) => String(id).toLowerCase());
            const appliesToMe = !data?.employeeId && targetIds.length === 0
                ? true
                : (data?.employeeId && String(data.employeeId).toLowerCase() === myId) || targetIds.includes(myId);

            if (appliesToMe) {
                fetchNotifications();
                showNotificationAlert(data);
            }
        });
        return () => {
            clearInterval(interval);
            unsubscribeRealtime();
            unsubscribeNotif();
        };
    }, [employee?.employeeId]);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllNotificationsRead("employee", employee?.employeeId);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleSingleMarkRead = async (id) => {
        try {
            await notificationService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationService.clearAllNotifications("employee", employee?.employeeId);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear notifications:", err);
        }
    };

    const handleDeleteNotification = async (e, id, isUnread) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const handleNotificationClick = async (n) => {
        if (!n.read) {
            handleSingleMarkRead(n._id);
        }
        setNotifOpen(false);
        if (n.type === "leave") {
            navigate("/leave");
        } else if (n.type === "attendance") {
            navigate("/attendance");
        } else if (n.type === "holiday") {
            navigate("/dashboard");
        } else if (n.type === "payroll") {
            navigate("/payroll");
        }
    };

    const initials = employee
        ? `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()
        : "??";

    const handleLogout = async () => {
        await logout();
        setMobileOpen(false);
        toast.success("Logged out successfully");
    };

    return (
        <>
            <header className="relative z-30 flex items-center justify-between px-6 md:px-8 py-3 bg-[#1a0d09] border-b border-[#381C14] h-16 shrink-0 text-[#FBFAF6]">
                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="lg:hidden text-[#D9C4AA] hover:text-[#FBFAF6]"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
                    <FiMenu className="text-xl" />
                </button>

                {/* Page greeting on desktop */}
                <div className="hidden lg:block">
                    <p className="text-sm text-[#AE9475]">
                        Welcome back,{" "}
                        <span className="font-semibold text-[#FBFAF6]">
                            {employee?.firstName ?? ""}
                        </span>
                    </p>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-4 ml-auto lg:ml-0">
                    {/* Theme toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="text-[#D9C4AA] hover:text-[#FBFAF6] transition"
                        title="Toggle Theme"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark"
                            ? <FiSun className="text-lg text-[#D9C4AA]" />
                            : <FiMoon className="text-lg" />
                        }
                    </button>

                    {/* Notification bell with Dropdown */}
                    <div ref={notifRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setNotifOpen(prev => !prev)}
                            className="relative text-[#D9C4AA] hover:text-[#FBFAF6] transition p-1 cursor-pointer"
                            title="Notifications"
                            aria-label="Notifications"
                        >
                            <FiBell className="text-lg" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#962A22] text-[9px] font-bold text-[#FBFAF6] border border-[#381C14]">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {notifOpen && (
                            <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-[#381C14] bg-[#24110c] shadow-2xl overflow-hidden text-[#FBFAF6]">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#381C14] bg-[#1a0d09]">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-[#FBFAF6]">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-[#962A22]/20 border border-[#962A22]/40 text-[#FBFAF6] px-2 py-0.5 text-[10px] font-bold">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllRead}
                                            className="text-[11px] font-semibold text-[#D9C4AA] hover:text-[#FBFAF6] transition cursor-pointer"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-[#381C14]/60">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`flex items-start gap-3 p-3.5 transition cursor-pointer ${
                                                    !n.read
                                                        ? "bg-[#962A22]/10"
                                                        : "hover:bg-[#381C14]/40"
                                                }`}
                                            >
                                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold bg-[#381C14] text-[#D9C4AA]">
                                                    {n.type === "attendance" ? <FiAlertTriangle /> :
                                                     n.type === "leave" ? <FiClock /> :
                                                     n.type === "holiday" ? <FiCalendar /> : <FiInfo />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-xs font-bold truncate ${!n.read ? "text-[#FBFAF6]" : "text-[#D9C4AA]"}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.read && (
                                                            <span className="h-2 w-2 rounded-full bg-[#962A22] shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-[#AE9475] mt-0.5 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[9px] text-[#D9C4AA]/70 mt-1">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-[#AE9475]">
                                            No notifications right now.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Avatar */}
                    <Link to="/profile" className="shrink-0">
                        {employee?.profileImage ? (
                            <img
                                src={employee.profileImage}
                                alt={employee.firstName}
                                className="h-8 w-8 rounded-full object-cover border-2 border-[#D9C4AA]/30"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#962A22] text-[#FBFAF6] text-xs font-semibold border border-[#D9C4AA]/30">
                                {initials}
                            </div>
                        )}
                    </Link>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/75 backdrop-blur-xs"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-[#1a0d09] border-r border-[#381C14] flex flex-col shadow-2xl text-[#FBFAF6]">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[#381C14] bg-[#24110c]">
                            <span className="text-base font-bold text-[#FBFAF6]">
                                Dosti — Employee
                            </span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="text-[#D9C4AA] hover:text-[#FBFAF6]"
                                aria-label="Close menu"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
                            {mobileNav.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        [
                                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                                            isActive
                                                ? "bg-[#962A22]/20 text-[#FBFAF6] font-semibold border-l-2 border-[#962A22]"
                                                : "text-[#D9C4AA] hover:bg-[#24110c] hover:text-[#FBFAF6]",
                                        ].join(" ")
                                    }
                                >
                                    <Icon className="text-lg shrink-0" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-[#381C14] bg-[#24110c]">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-[#962A22]/20 transition"
                            >
                                <FiLogOut className="text-base" />
                                Logout
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
