import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ emailOrId: "", password: "", rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setErrorMessage("");
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!form.emailOrId.trim() || !form.password.trim()) {
            const msg = "Please enter both Employee ID/Email and Password";
            setErrorMessage(msg);
            toast.error(msg);
            return;
        }
        setLoading(true);
        try {
            await login(form.emailOrId.trim(), form.password);
            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Login failed. Please check your credentials.";
            setErrorMessage(msg);
            toast.error(msg);
            // Inputs are preserved in state so user does not need to re-type
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#1a0d09] text-[#FBFAF6]">
            {/* Left — Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#962A22] via-[#651812] to-[#381C14] border-r border-[#381C14]">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Logo */}
                <div className="flex items-center relative z-10">
                    <img src="/logo.svg" alt="Dosti Real Estate Logo" className="h-12 w-auto invert" />
                </div>

                {/* Center content */}
                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-[#FBFAF6] leading-tight">
                        Your work,<br />
                        <span className="text-[#D9C4AA]">at a glance.</span>
                    </h2>
                    <p className="mt-4 text-[#E9D5BD] text-base leading-relaxed max-w-sm">
                        Manage your site visits, client leads, attendance, and payroll — all in one luxury portal.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {["Site Visits Tagging", "Client Pipeline", "Attendance & GPS", "Payslips & Salary"].map((f) => (
                            <span
                                key={f}
                                className="px-3.5 py-1.5 rounded-full bg-[#381C14]/50 border border-[#D9C4AA]/25 text-[#FBFAF6] text-xs font-semibold backdrop-blur-sm"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom tagline */}
                <p className="text-[#D9C4AA] text-xs relative z-10">
                    © 2026 Dosti Real Estate. Employee Portal.
                </p>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#1a0d09]">
                <div className="w-full max-w-md">
                    {/* Mobile logo header */}
                    <div className="lg:hidden flex items-center mb-8">
                        <img src="/logo.svg" alt="Dosti Real Estate Logo" className="h-10 w-auto invert" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#FBFAF6] tracking-tight">
                        Sign in
                    </h2>
                    <p className="mt-1 text-sm text-[#D9C4AA]">
                        Enter your Employee ID or email to continue
                    </p>

                    {errorMessage && (
                        <div className="mt-4 rounded-xl border border-[#962A22]/50 bg-[#962A22]/15 p-3.5 text-xs text-red-300 flex items-center gap-2">
                            <span className="shrink-0 font-bold">⚠️</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* Email / Employee ID */}
                        <div>
                            <label
                                htmlFor="login-emailOrId"
                                className="block text-sm font-medium text-[#D9C4AA] mb-1.5"
                            >
                                Employee ID or Email
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AE9475] text-sm" />
                                <input
                                    id="login-emailOrId"
                                    type="text"
                                    name="emailOrId"
                                    value={form.emailOrId}
                                    onChange={handleChange}
                                    placeholder="EMP001 or john@dosti.com"
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#381C14] bg-[#24110c] text-sm text-[#FBFAF6] placeholder-[#AE9475] focus:outline-none focus:border-[#962A22] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="login-password"
                                    className="block text-sm font-medium text-[#D9C4AA]"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs text-[#D9C4AA] hover:text-[#FBFAF6] font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AE9475] text-sm" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#381C14] bg-[#24110c] text-sm text-[#FBFAF6] placeholder-[#AE9475] focus:outline-none focus:border-[#962A22] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AE9475] hover:text-[#FBFAF6]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                id="login-remember"
                                type="checkbox"
                                name="rememberMe"
                                checked={form.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-[#381C14] bg-[#24110c] accent-[#962A22] text-[#962A22] focus:ring-[#962A22]"
                            />
                            <span className="text-sm text-[#D9C4AA]">Remember me</span>
                        </label>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-[#962A22] hover:bg-[#7e221b] border border-[#D9C4AA]/20 text-[#FBFAF6] text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#962A22]/25 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <div
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: "2px solid rgba(251,250,246,0.3)",
                                            borderTopColor: "#FBFAF6",
                                            animation: "spin 0.7s linear infinite",
                                        }}
                                    />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-[#AE9475]">
                        Having trouble logging in? Contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
