import React, { useState, useEffect } from "react";
import { 
     FiPlus, FiFileText, FiTrash2, FiSearch, FiX
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import * as payrollService from "../../services/payrollService";
import * as employeeService from "../../services/employeeService";

export default function Payroll() {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter & Search states
    const [search, setSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    // Modal states
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);

    // Generation states
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
    const [genYear, setGenYear] = useState(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);

    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            const payRes = await payrollService.getPayrolls();
            if (payRes.success) {
                setPayrolls(payRes.data);
            }
            const empRes = await employeeService.getEmployees({ limit: 100 });
            if (empRes.success) {
                setEmployees(empRes.data);
            }
        } catch (err) {
            console.error("Payroll fetch error:", err);
            toast.error("Failed to load payroll records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrollData();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await payrollService.generatePayroll(Number(genMonth), Number(genYear));
            if (res.success) {
                toast.success(res.message || "Payroll generated successfully!");
                setIsGenModalOpen(false);
                fetchPayrollData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate payroll for this period.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
        try {
            const res = await payrollService.deletePayroll(id);
            if (res.success) {
                toast.success("Payroll record deleted");
                fetchPayrollData();
            }
        } catch (err) {
            toast.error("Failed to delete record");
        }
    };



    // Filter calculations
    const filteredPayrolls = payrolls.filter(p => {
        const emp = employees.find(e => e.employeeId === p.employeeId);
        const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
        const matchesSearch = !search || name.includes(search.toLowerCase()) || p.employeeId.toLowerCase().includes(search.toLowerCase());
        const matchesMonth = !selectedMonth || p.month === Number(selectedMonth);
        const matchesYear = !selectedYear || p.year === Number(selectedYear);
        return matchesSearch && matchesMonth && matchesYear;
    });

    // Finance overview counts
    const grossPayroll = filteredPayrolls.reduce((acc, p) => acc + p.baseSalary + p.overtimeAmount, 0);
    const totalDeductions = filteredPayrolls.reduce((acc, p) => acc + p.deductions, 0);
    const netPayroll = filteredPayrolls.reduce((acc, p) => acc + p.netSalary, 0);

    return (
        <DashboardLayout
            title="Payroll"
            subtitle="Track salary disbursements, generate monthly payslips, and review staff deductions."
            action={
                <button
                    onClick={() => setIsGenModalOpen(true)}
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                    <FiPlus /> Generate Payroll
                </button>
            }
        >
            {/* Financial Overview Cards */}
            <section className="grid gap-4 grid-cols-3 text-slate-800 dark:text-slate-100">
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Gross Salaries</span>
                    <strong className="text-xl font-bold block mt-1.5 text-slate-800 dark:text-slate-200">${grossPayroll.toLocaleString()}</strong>
                </div>
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Total Deductions</span>
                    <strong className="text-xl font-bold block mt-1.5 text-red-500">-${totalDeductions.toLocaleString()}</strong>
                </div>
                <div className="panel-surface rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block tracking-wider font-bold">Net Disbursements</span>
                    <strong className="text-xl font-bold block mt-1.5 text-blue-600 dark:text-blue-450">${netPayroll.toLocaleString()}</strong>
                </div>
            </section>

            {/* Payroll List Table */}
            <section className="panel-surface rounded-[24px] p-5 shadow-sm mt-6 text-slate-800 dark:text-slate-100">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Payroll Ledgers</h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {/* Search */}
                        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-855">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search barber..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Month Filter */}
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        >
                            <option value="">All Months</option>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                            ))}
                        </select>

                        {/* Year Filter */}
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        >
                            <option value="">All Years</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">Barber</th>
                                    <th className="py-3 px-4">Period</th>
                                    <th className="py-3 px-4">Base Pay</th>
                                    <th className="py-3 px-4">Overtime</th>
                                    <th className="py-3 px-4">Deductions</th>
                                    <th className="py-3 px-4">Net Salary</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayrolls.map((payroll) => {
                                    const emp = employees.find(e => e.employeeId === payroll.employeeId);
                                    return (
                                        <tr key={payroll._id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-850/10 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-205">
                                                {emp ? `${emp.firstName} ${emp.lastName}` : "Unknown Barber"} ({payroll.employeeId})
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                                {payroll.month}/{payroll.year}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                                ${payroll.baseSalary.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-500 font-medium">
                                                +${payroll.overtimeAmount.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 text-red-500 font-medium">
                                                -${payroll.deductions.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                                                ${payroll.netSalary.toLocaleString()}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                    payroll.status === "paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900" : "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-455 dark:border-orange-900"
                                                }`}>
                                                    {payroll.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/payroll/${payroll._id}`)}
                                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <FiFileText className="text-xs" /> Slip
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(payroll._id)}
                                                    className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 transition-colors"
                                                >
                                                    <FiTrash2 className="text-xs" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredPayrolls.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-sm text-slate-400 dark:text-slate-550">
                                            No payroll records found for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* MODAL: Generate Payroll */}
            {isGenModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-slate-105">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Generate Payroll</h3>
                            <button
                                onClick={() => setIsGenModalOpen(false)}
                                className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="mt-4 space-y-4 text-xs">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Month</label>
                                <select
                                    value={genMonth}
                                    onChange={(e) => setGenMonth(e.target.value)}
                                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-600 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-855"
                                    required
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>Month {i + 1}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Year</label>
                                <select
                                    value={genYear}
                                    onChange={(e) => setGenYear(e.target.value)}
                                    className="w-full h-10 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-600 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:focus:bg-slate-855"
                                    required
                                >
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={generating}
                                className="w-full h-11 mt-4 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
                            >
                                {generating ? "Generating..." : "Generate Ledgers"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
