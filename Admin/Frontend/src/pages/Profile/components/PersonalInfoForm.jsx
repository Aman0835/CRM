import React from "react";

export default function PersonalInfoForm({ personalInfo, setPersonalInfo }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="panel-surface border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Personal Information</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Update your basic name, bio and mailing address.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">First Name</label>
                    <input type="text" name="firstName" value={personalInfo.firstName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Last Name</label>
                    <input type="text" name="lastName" value={personalInfo.lastName} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Email Address</label>
                    <input type="email" name="email" value={personalInfo.email} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Phone Number</label>
                    <input type="text" name="phone" value={personalInfo.phone} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Bio / Description</label>
                    <textarea name="bio" value={personalInfo.bio} onChange={handleChange} rows="2" className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Gender</label>
                    <select name="gender" value={personalInfo.gender} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Date of Birth</label>
                    <input type="date" name="dob" value={personalInfo.dob} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Street Address</label>
                    <input type="text" name="address" value={personalInfo.address} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">City</label>
                    <input type="text" name="city" value={personalInfo.city} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">State</label>
                    <input type="text" name="state" value={personalInfo.state} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Country</label>
                    <input type="text" name="country" value={personalInfo.country} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
                <div>
                    <label className="block text-slate-400 font-bold uppercase text-[9px] mb-1.5">Pin Code</label>
                    <input type="text" name="pinCode" value={personalInfo.pinCode} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
                </div>
            </div>
        </div>
    );
}
