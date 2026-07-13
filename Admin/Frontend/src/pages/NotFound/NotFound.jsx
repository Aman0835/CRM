import React from "react";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiHome } from "react-icons/fi";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-app-bg)] px-4 text-slate-800 text-center">
            <div className="relative w-full max-w-[400px]">
                <div className="absolute -inset-1 rounded-[24px] bg-red-500 opacity-5 blur-md"></div>

                <div className="relative rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mx-auto text-2xl border border-red-100">
                        <FiAlertTriangle />
                    </div>

                    <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-800">404</h1>
                    <h2 className="mt-2 text-base font-bold text-slate-700">Page Not Found</h2>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        The workspace or page you are looking for does not exist, or has been moved.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/dashboard"
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                        >
                            <FiHome />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
