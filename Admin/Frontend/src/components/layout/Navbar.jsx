import { FiBell, FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import SearchBar from "../SearchBar/SearchBar";

export default function Navbar() {
    const { admin } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex items-center justify-between px-6 md:px-8 py-3 bg-white border-b border-slate-200 h-16 shrink-0 dark:bg-slate-900 dark:border-slate-800">
            {/* Search Input on the Left */}
            <SearchBar placeholder="Search employees..." className="w-72" />

            {/* Actions & Profile on the Right */}
            <div className="flex items-center gap-5">
                {/* Theme toggle (Moon/Sun icon) */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="text-slate-450 hover:text-slate-700 transition dark:text-slate-400 dark:hover:text-slate-200"
                    title="Toggle Theme"
                >
                    {theme === "dark" ? <FiSun className="text-lg text-amber-500" /> : <FiMoon className="text-lg" />}
                </button>

                {/* Notifications Bell with Red Indicator */}
                <button
                    type="button"
                    className="relative text-slate-450 hover:text-slate-700 transition"
                    title="Notifications"
                >
                    <FiBell className="text-lg" />
                    <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
                </button>


            </div>
        </header>
    );
}
