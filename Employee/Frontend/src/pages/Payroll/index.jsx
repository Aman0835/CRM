import { useMemo } from "react";
import { FiFileText, FiTrendingUp } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useDashboard } from "../Dashboard/hooks/useDashboard";

function formatMoney(value) {
    return `₹${Number(value ?? 0).toLocaleString()}`;
}

function formatMonthYear(month, year) {
    if (!month || !year) {
        return "No statement yet";
    }

    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}


export default function Payroll() {
    const {
        attendance,
        payroll,
        latestPayroll,
    } = useDashboard();

    const activePayroll = latestPayroll ?? null;
    const currentMonth = activePayroll?.month ?? (new Date().getMonth() + 1);
    const currentYear = activePayroll?.year ?? new Date().getFullYear();
    const netSalary = activePayroll?.netSalary ?? 0;
    const baseSalary = activePayroll?.baseSalary ?? 0;
    const overtimeAmount = activePayroll?.overtimeAmount ?? 0;
    const deductions = activePayroll?.deductions ?? 0;

    const monthAttendance = useMemo(() => (
        attendance.filter((item) => {
            const date = new Date(item.date);
            return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
        })
    ), [attendance, currentMonth, currentYear]);

    const presentCount = monthAttendance.filter((item) => item.status === "Present").length;
    const absentCount = monthAttendance.filter((item) => item.status === "Absent").length;
    const overtimeHours = monthAttendance.reduce(
        (sum, item) => sum + Math.max(Number(item.workingHours ?? 0) - 8, 0),
        0,
    );
    const leaveCount = 0;

    const previousPayroll = payroll[1] ?? null;
    const trendPercent = previousPayroll?.netSalary
        ? (((netSalary - previousPayroll.netSalary) / previousPayroll.netSalary) * 100)
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-5 pb-4 pt-2">
                <div className="px-1">
                    <h1 className="text-[22px] font-black text-[#FBFAF6]">Salary</h1>
                    <p className="mt-1 text-[14px] text-[#D9C4AA]">{formatMonthYear(currentMonth, currentYear)} statement</p>
                </div>

                <div className="relative overflow-hidden rounded-[30px] border border-[#D9C4AA]/20 bg-[linear-gradient(135deg,#962A22_0%,#4a1511_100%)] px-7 py-7 shadow-[0_24px_48px_rgba(150,42,34,0.36)]">
                    <p className="text-[13px] font-black uppercase tracking-[0.2em] text-[#D9C4AA]">
                        Net Salary · {formatMonthYear(currentMonth, currentYear)}
                    </p>
                    <p className="mt-3 font-mono text-[56px] font-black leading-none text-[#FBFAF6]">{formatMoney(netSalary)}</p>
                    <div className="mt-5 flex items-center gap-3">
                        <span className={["flex items-center gap-1 rounded-full border px-3 py-1.5 text-[13px] font-bold", trendPercent >= 0 ? "border-[#14cf95]/30 bg-[#0f6e62] text-[#14cf95]" : "border-[#ff6371]/30 bg-[#4f2632] text-[#ff6371]"].join(" ")}>
                            <FiTrendingUp className="h-3.5 w-3.5" />
                            {trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}% vs prev
                        </span>
                        <span className="text-[14px] text-[#D9C4AA]">{activePayroll?.status ?? "Awaiting payroll"}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        [`${presentCount}d`, "Present", "text-[#16e0a0]"],
                        [`${absentCount}d`, "Absent", "text-[#ff6371]"],
                        [`${Math.round(overtimeHours)}h`, "Overtime", "text-[#E9D5BD]"],
                        [`${leaveCount}d`, "Leaves", "text-[#ffc400]"],
                    ].map(([value, label, tone]) => (
                        <div key={label} className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-6 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                            <p className={["text-[24px] font-black", tone].join(" ")}>{value}</p>
                            <p className="mt-3 text-[14px] text-[#D9C4AA]">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
                    <p className="mb-6 text-[13px] font-black uppercase tracking-[0.18em] text-[#D9C4AA]">Breakdown</p>
                    <div className="space-y-4">
                        {[
                            ["Base Salary", formatMoney(baseSalary), "text-[#FBFAF6]"],
                            ["Performance Bonus", `+${formatMoney(overtimeAmount)}`, "text-[#14cf95]"],
                            ["Deductions", `-${formatMoney(deductions)}`, "text-[#ff6371]"],
                        ].map(([label, value, tone]) => (
                            <div key={label} className="flex items-center justify-between border-b border-[#381C14] pb-4">
                                <p className="text-[16px] text-[#D9C4AA]">{label}</p>
                                <p className={["text-[16px] font-black", tone].join(" ")}>{value}</p>
                            </div>
                        ))}
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-[17px] font-black text-[#FBFAF6]">Total</p>
                            <p className="text-[20px] font-black text-[#FBFAF6]">{formatMoney(netSalary)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="mb-4 px-1 text-[13px] font-black uppercase tracking-[0.18em] text-[#D9C4AA]">Payslip History</p>
                    <div className="overflow-hidden rounded-[28px] border border-[#381C14] bg-[#24110c] shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
                        {payroll.length ? payroll.map((item, index) => {
                            const current = index === 0;

                            return (
                                <div key={item._id} className={["flex items-center gap-4 px-5 py-4", index < payroll.length - 1 ? "border-b border-[#381C14]" : ""].join(" ")}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#381C14] bg-[#1a0d09] text-[#D9C4AA]">
                                        <FiFileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[16px] font-black text-[#FBFAF6]">{formatMonthYear(item.month, item.year)}</p>
                                        <p className="mt-1 text-[13px] text-[#D9C4AA]">{formatMoney(item.netSalary)}</p>
                                    </div>
                                    <span className={["rounded-full px-4 py-1.5 text-[12px] font-bold", current ? "bg-[#962A22]/20 border border-[#962A22]/40 text-[#FBFAF6]" : item.status === "paid" ? "bg-[#0d6c63] text-[#17e0a0]" : "bg-[#5a4a1f] text-[#ffc400]"].join(" ")}>
                                        {current ? "Current" : item.status === "paid" ? "Paid" : "Generated"}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="px-5 py-8 text-center text-[14px] text-[#D9C4AA]">
                                No payroll records available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
