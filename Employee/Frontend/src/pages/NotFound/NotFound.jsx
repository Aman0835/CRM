import { Link } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a0d09] text-center p-6 text-[#FBFAF6]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#962A22] text-[#FBFAF6] shadow-lg mb-6 border border-[#D9C4AA]/20">
                <FiHome className="text-2xl" />
            </div>
            <h1 className="text-7xl font-extrabold text-[#FBFAF6]">404</h1>
            <p className="mt-3 text-lg font-semibold text-[#D9C4AA]">Page Not Found</p>
            <p className="mt-2 text-sm text-[#AE9475] max-w-xs">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/dashboard"
                className="mt-8 flex items-center gap-2 h-11 px-6 rounded-xl bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] text-sm font-semibold transition shadow-lg shadow-[#962A22]/30 border border-[#D9C4AA]/20"
            >
                <FiArrowLeft className="text-sm" />
                Back to Dashboard
            </Link>
        </div>
    );
}
