import {
    FiCalendar,
    FiBriefcase,
    FiHome,
    FiMapPin,

    FiSettings,
    FiUser,
    FiLogOut,
} from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navigation = [
    { to: "/dashboard",  label: "Dashboard",   icon: FiHome },
    { to: "/leads",      label: "Leads",       icon: FiBriefcase },
    { to: "/visits",     label: "Site Visits", icon: FiMapPin },
    { to: "/attendance", label: "Attendance",  icon: FiCalendar },
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
                        ? "bg-[#962A22]/20 text-[#FBFAF6] font-semibold border-l-2 border-[#962A22] shadow-sm"
                        : "text-[#D9C4AA] hover:bg-[#24110c] hover:text-[#FBFAF6]",
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
        <aside className="hidden w-[260px] shrink-0 lg:flex flex-col bg-[#1a0d09] border-r border-[#381C14] h-full text-[#FBFAF6]">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#381C14]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#962A22] text-[#FBFAF6] shadow-md shadow-[#962A22]/20 border border-[#D9C4AA]/20">
                    <FiHome className="text-lg" />
                </div>
                <div>
                    <h1 className="text-base font-bold text-[#FBFAF6] tracking-wide">
                        Dosti
                    </h1>
                    <p className="text-[10px] font-semibold text-[#D9C4AA] uppercase tracking-widest leading-none mt-0.5">
                        Employee Portal
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto no-scrollbar">
                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE9475]">
                        Main
                    </p>
                    <nav className="mt-3 space-y-1">
                        {navigation.map((item) => (
                            <NavItem key={item.to} {...item} />
                        ))}
                    </nav>
                </div>

                <div>
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE9475]">
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
            <div className="p-4 border-t border-[#381C14] bg-[#24110c] space-y-3">
                <Link
                    to="/profile"
                    className="flex items-center gap-3 px-2 py-1.5 hover:bg-[#381C14] rounded-xl transition cursor-pointer"
                >
                    {employee?.profileImage ? (
                        <img
                            src={employee.profileImage}
                            alt={fullName}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#D9C4AA]/30"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#962A22] font-semibold text-[#FBFAF6] text-sm border border-[#D9C4AA]/30">
                            {initials}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#FBFAF6] truncate">
                            {fullName}
                        </p>
                        <p className="text-xs text-[#D9C4AA] truncate mt-0.5 capitalize">
                            {employee?.role ?? "employee"}
                        </p>
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-[#962A22]/20 transition cursor-pointer"
                >
                    <FiLogOut className="text-base shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
