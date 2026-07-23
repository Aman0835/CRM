import { useState, useEffect, useRef } from "react";
import { FiBell, FiMoon, FiSun, FiMenu, FiX, FiInfo, FiCalendar, FiClock, FiAlertTriangle } from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
    FiHome, FiBriefcase, FiUser, FiSettings, FiLogOut
} from "react-icons/fi";
import { FiSun as FiSunIcon } from "react-icons/fi";
import toast from "react-hot-toast";
import * as notificationService from "../../services/notificationService";

const mobileNav = [
    { to: "/dashboard",  label: "Dashboard",  icon: FiHome },
    { to: "/attendance", label: "Attendance",  icon: FiCalendar },
    { to: "/leave",      label: "Leave",       icon: FiClock },
    { to: "/payroll",    label: "Payroll",     icon: FiBriefcase },
    { to: "/holidays",   label: "Holidays",    icon: FiSunIcon },
    { to: "/profile",    label: "Profile",     icon: FiUser },
    { to: "/settings",   label: "Settings",    icon: FiSettings },
];

export default function Navbar() {
    const { employee, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notification dropdown state
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        if (!employee?.employeeId) return;
        try {
            const res = await notificationService.getEmployeeNotifications(employee.employeeId);
            if (res.success) {
                setNotifications(res.data || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch (err) {
            console.error("Failed to fetch employee notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
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
            <header className="relative z-30 flex items-center justify-between px-6 md:px-8 py-3 bg-white border-b border-slate-200 h-16 shrink-0 dark:bg-slate-900 dark:border-slate-800">
                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
                    <FiMenu className="text-xl" />
                </button>

                {/* Page greeting on desktop */}
                <div className="hidden lg:block">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Welcome back,{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
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
                        className="text-slate-500 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200"
                        title="Toggle Theme"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark"
                            ? <FiSun className="text-lg text-amber-500" />
                            : <FiMoon className="text-lg" />
                        }
                    </button>

                    {/* Notification bell with Dropdown */}
                    <div ref={notifRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setNotifOpen(prev => !prev)}
                            className="relative text-slate-500 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200 p-1"
                            title="Notifications"
                            aria-label="Notifications"
                        >
                            <FiBell className="text-lg" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white dark:border-slate-900">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {notifOpen && (
                            <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-[10px] font-bold dark:bg-blue-950/50 dark:text-blue-400">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllRead}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => !n.read && handleSingleMarkRead(n._id)}
                                                className={`flex items-start gap-3 p-3.5 transition cursor-pointer ${
                                                    !n.read
                                                        ? "bg-blue-50/40 dark:bg-blue-950/20"
                                                        : "hover:bg-slate-50 dark:hover:bg-slate-850"
                                                }`}
                                            >
                                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                    n.type === "leave" ? "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" :
                                                    n.type === "attendance" ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" :
                                                    n.type === "holiday" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                                                }`}>
                                                    {n.type === "attendance" ? <FiAlertTriangle /> :
                                                     n.type === "leave" ? <FiClock /> :
                                                     n.type === "holiday" ? <FiCalendar /> : <FiInfo />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-xs font-bold truncate ${!n.read ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-300"}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.read && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
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
                                className="h-8 w-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-900"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
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
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                                Diva — Employee
                            </span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="text-slate-500 dark:text-slate-400"
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
                                                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40",
                                        ].join(" ")
                                    }
                                >
                                    <Icon className="text-lg shrink-0" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
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
