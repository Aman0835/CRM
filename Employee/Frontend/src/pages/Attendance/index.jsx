import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useDashboard } from "../Dashboard/hooks/useDashboard";

const days = ["S", "M", "T", "W", "T", "F", "S"];

function formatTime(value) {
    if (!value) return "--:--";
    return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatHours(value = 0) {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    return `${hours}h ${minutes}m`;
}

function sameMonth(date, monthDate) {
    return (
        date.getMonth() === monthDate.getMonth() &&
        date.getFullYear() === monthDate.getFullYear()
    );
}

function getMonthGrid(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let index = 0; index < startOffset; index += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(day);

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
}

function getDateStatus(dateKey, todayKey, attendanceMap, leaveSet) {
    if (dateKey === todayKey) return "today";
    if (leaveSet.has(dateKey)) return "leave";

    const record = attendanceMap.get(dateKey);
    if (!record) return "empty";
    if (record.status === "Absent") return "absent";
    return "present";
}

function getDayTone(status) {
    if (status === "absent") return "bg-[#ff3942] text-white";
    if (status === "leave") return "bg-[#f7a30b] text-white";
    if (status === "today") return "bg-[#356ef6] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)]";
    if (status === "present") return "bg-[#16c88f] text-white";
    return "text-[#50627f]";
}

export default function Attendance() {
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const {
        attendance,
        leaves,
        todayAttendance,
        presentDays,
        absentDays,
    } = useDashboard();

    const today = new Date();
    const todayKey = today.toISOString().split("T")[0];
    const workedHours = todayAttendance?.workingHours ?? 0;

    const attendanceMap = useMemo(
        () => new Map(attendance.map((item) => [item.date, item])),
        [attendance],
    );

    const approvedLeaveDays = useMemo(() => {
        const daysSet = new Set();

        leaves
            .filter((leave) => leave.status === "approved")
            .forEach((leave) => {
                const cursor = new Date(leave.fromDate);
                const end = new Date(leave.toDate);

                while (cursor <= end) {
                    daysSet.add(cursor.toISOString().split("T")[0]);
                    cursor.setDate(cursor.getDate() + 1);
                }
            });

        return daysSet;
    }, [leaves]);

    const monthAttendance = useMemo(() => (
        attendance.filter((item) => sameMonth(new Date(item.date), currentMonth))
    ), [attendance, currentMonth]);

    const leaveDays = useMemo(() => {
        let total = 0;
        approvedLeaveDays.forEach((dateKey) => {
            if (sameMonth(new Date(dateKey), currentMonth)) total += 1;
        });
        return total;
    }, [approvedLeaveDays, currentMonth]);

    const totalHours = monthAttendance.reduce(
        (sum, item) => sum + Number(item.workingHours ?? 0),
        0,
    );

    const monthTitle = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <DashboardLayout>
            <div className="space-y-5 pb-4 pt-2">
                <div className="px-1">
                    <h1 className="text-[22px] font-black text-white">Attendance</h1>
                    <p className="mt-1 text-[14px] text-[#7d93ba]">{monthTitle}</p>
                </div>

                <div className="rounded-[28px] bg-[#1d2840] p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-black text-white">
                            Today · {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </h2>
                        <span className={["rounded-full px-4 py-2 text-[13px] font-bold", todayAttendance?.status === "Present" ? "bg-[#0d6c63] text-[#17e0a0]" : "bg-[#5a4a1f] text-[#ffc400]"].join(" ")}>
                            {todayAttendance?.status ?? "Pending"}
                        </span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                        {[
                            ["Check In", formatTime(todayAttendance?.checkIn), "text-[#16e0a0]"],
                            ["Check Out", formatTime(todayAttendance?.checkOut), "text-[#7286a7]"],
                            ["Hours", formatHours(workedHours), "text-[#50a0ff]"],
                        ].map(([label, value, tone]) => (
                            <div key={label} className="rounded-[20px] bg-[#2b3a55] px-4 py-4 text-center">
                                <p className={["text-[16px] font-black", tone].join(" ")}>{value}</p>
                                <p className="mt-1 text-[12px] text-[#7386a7]">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[28px] bg-[#1d2840] p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-[16px] font-black text-white">{monthTitle}</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#334766] text-[#92a7c8]"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#334766] text-[#92a7c8]"
                            >
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-3 text-center">
                        {days.map((day, index) => (
                            <div key={`${day}-${index}`} className="text-[13px] font-bold text-[#7088ae]">{day}</div>
                        ))}
                        {getMonthGrid(currentMonth).map((day, index) => {
                            const dateKey = day
                                ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split("T")[0]
                                : "";
                            const status = day
                                ? getDateStatus(dateKey, todayKey, attendanceMap, approvedLeaveDays)
                                : "empty";

                            return (
                                <div key={`${dateKey || "blank"}-${index}`} className="flex justify-center">
                                    {day ? (
                                        <div className={["flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-bold", getDayTone(status)].join(" ")}>
                                            {day}
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-5 text-[12px] text-[#8ba0c2]">
                        {[
                            ["#16c88f", "Present"],
                            ["#ff3942", "Absent"],
                            ["#f7a30b", "Leave"],
                            ["#356ef6", "Today"],
                        ].map(([color, label]) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[24px] bg-[#082f36] p-5">
                        <p className="text-[20px] font-black text-[#16e0a0]">{sameMonth(today, currentMonth) ? presentDays : monthAttendance.filter((item) => item.status === "Present").length}</p>
                        <p className="mt-3 text-[14px] text-[#cfe4ff]">Present Days</p>
                    </div>
                    <div className="rounded-[24px] bg-[#311926] p-5">
                        <p className="text-[20px] font-black text-[#ff6371]">{sameMonth(today, currentMonth) ? absentDays : monthAttendance.filter((item) => item.status === "Absent").length}</p>
                        <p className="mt-3 text-[14px] text-[#cfe4ff]">Absent Days</p>
                    </div>
                    <div className="rounded-[24px] bg-[#2b2218] p-5">
                        <p className="text-[20px] font-black text-[#ffc400]">{leaveDays}</p>
                        <p className="mt-3 text-[14px] text-[#cfe4ff]">Leave Days</p>
                    </div>
                    <div className="rounded-[24px] bg-[#112341] p-5">
                        <p className="text-[20px] font-black text-[#4a93ff]">{Math.round(totalHours)}h</p>
                        <p className="mt-3 text-[14px] text-[#cfe4ff]">Total Hours</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
