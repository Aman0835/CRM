import { FiCalendar, FiClock, FiDollarSign, FiHome, FiUser } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
    { to: "/dashboard", label: "Home", icon: FiHome },
    { to: "/attendance", label: "Attend.", icon: FiClock },
    { to: "/leave", label: "Leave", icon: FiCalendar },
    { to: "/payroll", label: "Salary", icon: FiDollarSign },
    { to: "/profile", label: "Profile", icon: FiUser },
];

function isNavActive(pathname, to) {
    if (to === "/profile") return pathname.startsWith("/profile") || pathname.startsWith("/settings");
    return pathname === to;
}

export default function DashboardLayout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen w-screen overflow-hidden bg-[linear-gradient(90deg,#030617_0%,#04081b_100%)] px-0 py-0 md:px-6 md:py-5">
            <div className="mx-auto h-screen w-screen overflow-hidden md:h-[calc(100vh-40px)] md:max-h-[900px] md:w-[390px] md:rounded-[42px] md:border-[10px] md:border-[#24324d] md:bg-[#0b1120] md:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)]">
                <div className="relative flex h-full flex-col overflow-hidden bg-[#0b1120] text-white">
                    <main className="employee-shell-scroll flex-1 overflow-y-auto px-4 pb-24 pt-5 md:pt-7">
                        {children}
                    </main>

                    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#1f2b43] bg-[#11192d] px-4 pb-4 pt-3">
                        <div className="flex items-center justify-around">
                            {navItems.map(({ to, label, icon: Icon }) => {
                                const active = isNavActive(location.pathname, to);

                                return (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className="flex min-w-[58px] flex-col items-center gap-1"
                                    >
                                        <Icon className={["h-5 w-5", active ? "text-[#2f6cf6]" : "text-[#5d6d8c]"].join(" ")} />
                                        <span className={["text-[11px] font-semibold", active ? "text-[#2f6cf6]" : "text-[#5d6d8c]"].join(" ")}>
                                            {label}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
