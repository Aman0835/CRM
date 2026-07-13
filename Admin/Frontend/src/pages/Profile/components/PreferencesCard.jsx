import React from "react";

export default function PreferencesCard({ prefs, setPrefs, currentTheme, onToggleTheme }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPrefs(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">System Preferences</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Customize localization and dashboard themes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Default Theme</label>
                    <div className="flex gap-2">
                        <button 
                            type="button"
                            onClick={() => currentTheme === "dark" && onToggleTheme()}
                            className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                                currentTheme === "light" 
                                    ? "bg-blue-50 text-blue-650 border-blue-200" 
                                    : "bg-white border-slate-250 text-slate-650 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                            }`}
                        >
                            Light Mode
                        </button>
                        <button 
                            type="button"
                            onClick={() => currentTheme === "light" && onToggleTheme()}
                            className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                                currentTheme === "dark" 
                                    ? "bg-blue-950/40 text-blue-400 border-blue-900/60" 
                                    : "bg-white border-slate-250 text-slate-650 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350"
                            }`}
                        >
                            Dark Mode
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">System Language</label>
                    <select name="language" value={prefs.language} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-880 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                        <option value="English (US)">English (US)</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Timezone Offset</label>
                    <select name="timezone" value={prefs.timezone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-880 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                        <option value="GMT+5:30 (IST)">GMT+5:30 (IST)</option>
                        <option value="GMT+0:00 (UTC)">GMT+0:00 (UTC)</option>
                        <option value="GMT-5:00 (EST)">GMT-5:00 (EST)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Date Display Format</label>
                    <select name="dateFormat" value={prefs.dateFormat} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-880 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
