import { useState } from "react";
import { FiBell, FiMoon, FiSun, FiMenu, FiX } from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
    FiHome, FiCalendar, FiClock, FiBriefcase, FiUser, FiSettings, FiLogOut
} from "react-icons/fi";
import { FiSun as FiSunIcon } from "react-icons/fi";
import toast from "react-hot-toast";

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
            <header className="flex items-center justify-between px-6 md:px-8 py-3 bg-white border-b border-slate-200 h-16 shrink-0 dark:bg-slate-900 dark:border-slate-800">
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

                    {/* Notification bell */}
                    <button
                        type="button"
                        className="relative text-slate-500 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200"
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <FiBell className="text-lg" />
                        <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900" />
                    </button>

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
