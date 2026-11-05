import { FiCalendar, FiClock, FiHome, FiMapPin, FiUser, FiUsers } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import PwaInstallPrompt from "../PwaInstallPrompt";

const navItems = [
    { to: "/dashboard",  label: "Home",     icon: FiHome },
    { to: "/leads",      label: "Leads",    icon: FiUsers },
    { to: "/visits",     label: "Visits",   icon: FiMapPin },
    { to: "/attendance", label: "Attend.",  icon: FiClock },
    { to: "/profile",    label: "Profile",  icon: FiUser },
];

function isNavActive(pathname, to) {
    if (to === "/profile") return pathname.startsWith("/profile") || pathname.startsWith("/settings");
    if (to === "/leads") return pathname.startsWith("/leads");
    if (to === "/visits") return pathname.startsWith("/visits");
    return pathname === to;
}

export default function DashboardLayout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,#2d140e_0%,#170905_60%,#0c0402_100%)] px-0 py-0 md:px-6 md:py-5">
            <PwaInstallPrompt />
            <div className="mx-auto h-screen w-screen overflow-hidden md:h-[calc(100vh-40px)] md:max-h-[900px] md:w-[390px] md:rounded-[42px] md:border-[10px] md:border-[#381C14] md:bg-[#1a0d09] md:shadow-[0_60px_120px_-20px_rgba(20,5,3,0.9)]">
                <div className="relative flex h-full flex-col overflow-hidden bg-[#1a0d09] text-[#FBFAF6]">
                    <main className="employee-shell-scroll flex-1 overflow-y-auto px-4 pb-32 pt-5 md:pt-7">
                        {children}
                    </main>

                    <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[#3d1e16] bg-[#24110c] px-4 pb-4 pt-3 shadow-[0_-12px_30px_rgba(15,5,3,0.6)]">
                        <div className="flex items-center justify-around">
                            {navItems.map(({ to, label, icon: Icon }) => {
                                const active = isNavActive(location.pathname, to);

                                return (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className="flex min-w-[48px] flex-col items-center gap-1 transition-all"
                                    >
                                        <Icon className={["h-5 w-5 transition-colors", active ? "text-[#E9D5BD] drop-shadow-[0_0_10px_rgba(233,213,189,0.5)]" : "text-[#AE9475] hover:text-[#D9C4AA]"].join(" ")} />
                                        <span className={["text-[11px] font-bold transition-colors", active ? "text-[#FBFAF6]" : "text-[#AE9475] hover:text-[#D9C4AA]"].join(" ")}>
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
