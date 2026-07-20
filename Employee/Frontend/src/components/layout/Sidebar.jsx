import {
    FiCalendar,
    FiClock,
    FiBriefcase,
    FiHome,
    FiScissors,
    FiSettings,
    FiUser,
    FiSun,
    FiLogOut,
} from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navigation = [
    { to: "/dashboard",  label: "Dashboard",  icon: FiHome },
    { to: "/attendance", label: "Attendance",  icon: FiCalendar },
    { to: "/leave",      label: "My Leave",    icon: FiClock },
    { to: "/payroll",    label: "Payroll",     icon: FiBriefcase },
    { to: "/holidays",   label: "Holidays",    icon: FiSun },
];

const accountNav = [
    { to: "/profile",  label: "Profile",  icon: FiUser },
    { to: "/settings", label: "Settings", icon: FiSettings },
];

function NavItem({ to, label, icon: Icon }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                        ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200",
                ].join(" ")
            }
        >
            <Icon className="text-lg shrink-0" />
            <span>{label}</span>
        </NavLink>
    );
}

export default function Sidebar() {
    const { employee, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    const initials = employee
        ? `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase()
        : "??";

    const fullName = employee
        ? `${employee.firstName} ${employee.lastName}`
        : "Employee";

    return (
        <aside className="hidden w-[260px] shrink-0 lg:flex flex-col bg-white border-r border-slate-200 h-full dark:bg-slate-900 dark:border-slate-800">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                    <FiScissors className="text-lg rotate-90" />
                </div>
                <div>
                    <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                        Diva
                    </h1>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                        Employee Portal
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto no-scrollbar">
                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Main
                    </p>
                    <nav className="mt-3 space-y-1">
                        {navigation.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>

                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        Account
                    </p>
                    <nav className="mt-3 space-y-1">
                        {accountNav.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>
            </div>

            {/* Footer: Profile + Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 dark:border-slate-800 dark:bg-slate-950/20">
                <Link
                    to="/profile"
                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
                >
                    {employee?.profileImage ? (
                        <img
                            src={employee.profileImage}
                            alt={fullName}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white text-sm">
                            {initials}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {fullName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 capitalize">
                            {employee?.role ?? "employee"}
                        </p>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                    <FiLogOut className="text-base shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
