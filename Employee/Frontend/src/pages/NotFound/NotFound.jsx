import { Link } from "react-router-dom";
import { FiArrowLeft, FiScissors } from "react-icons/fi";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-app-bg)] dark:bg-[#090a0d] text-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg mb-6">
                <FiScissors className="text-2xl rotate-90" />
            </div>
            <h1 className="text-7xl font-extrabold text-slate-800 dark:text-slate-100">404</h1>
            <p className="mt-3 text-lg font-semibold text-slate-600 dark:text-slate-300">Page Not Found</p>
            <p className="mt-2 text-sm text-slate-400 max-w-xs">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/dashboard"
                className="mt-8 flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
            >
                <FiArrowLeft className="text-sm" />
                Back to Dashboard
            </Link>
        </div>
    );
}
