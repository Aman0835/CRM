import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiScissors, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
    const { login, admin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@diva.com"); // Updated default to .env value
    const [password, setPassword] = useState("admin123"); // Updated default to .env value
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    // Already logged in → go straight to dashboard
    if (!authLoading && admin) {
        return <Navigate to="/dashboard" replace />;
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            const res = await login(email, password);
            if (res && res.success) {
                toast.success(res.message || "Logged in successfully!");
                navigate("/dashboard");
            } else {
                toast.error(res.message || "Failed to log in");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errMsg = error.response?.data?.message || "Invalid Email or Password";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-app-bg)] px-4 text-slate-800">
            <div className="relative w-full max-w-[400px]">
                {/* Subtle blue shadows */}
                <div className="absolute -inset-1 rounded-[24px] bg-blue-500 opacity-5 blur-md"></div>

                <div className="relative rounded-[24px] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-[22px] text-white shadow-md shadow-blue-500/10">
                            <FiScissors className="rotate-90" />
                        </div>
                        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-800">
                            Diva
                        </h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                            The Salon Admin System
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4 text-xs">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Email Address
                            </label>
                            <div className="relative mt-1.5 flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                <FiMail className="shrink-0 text-sm" />
                                <input
                                    type="email"
                                    placeholder="admin@diva.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Password
                                </label>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast("Contact standard support to reset password.", { icon: "ℹ️" });
                                    }}
                                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                                >
                                    Forgot?
                                </a>
                            </div>
                            <div className="relative mt-1.5 flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all">
                                <FiLock className="shrink-0 text-sm" />
                                <input
                                    type={showPassword ? "text" : "password"} // Dynamic type
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                                    required
                                />
                                <button
                                    type="button" // Important: type="button" to prevent form submission
                                    onClick={togglePasswordVisibility}
                                    className="shrink-0 text-sm focus:outline-none"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
