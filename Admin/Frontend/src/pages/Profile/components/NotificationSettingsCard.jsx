import React from "react";

export default function NotificationSettingsCard({ notifs, setNotifs }) {
    const toggleSwitch = (key) => {
        setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const switches = [
        { key: "emailNotif", label: "Email Notifications", desc: "Send summary payroll runs to contact email." },
        { key: "payrollNotif", label: "Payroll Notifications", desc: "Alert when monthly salary statement gets compiled." },
        { key: "attendanceAlert", label: "Attendance Alerts", desc: "Notify when check-ins or check-outs run late." },
        { key: "leaveRequest", label: "Leave Request Updates", desc: "Email alerts for staff leave approvals or denials." },
        { key: "holidayReminder", label: "Holiday Reminders", desc: "Alert operators 24-hours before shop closure." },
        { key: "inventoryAlert", label: "Inventory Stock Alerts", desc: "Notify when critical salon products run low." }
    ];

    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Notification Settings</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Toggle alert preferences and email newsletters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {switches.map((item) => (
                    <div key={item.key} className="flex items-center justify-between text-xs gap-4">
                        <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{item.label}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => toggleSwitch(item.key)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                notifs[item.key] ? 'bg-blue-600' : 'bg-slate-250 dark:bg-slate-800'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    notifs[item.key] ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
