import React, { useState, useRef, useEffect } from "react";
import { FiX, FiPlus, FiCheck, FiUser, FiPhone, FiBriefcase, FiUsers, FiDollarSign, FiEye, FiEyeOff, FiKey, FiChevronDown, FiTrash2, FiMapPin } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function EmployeeFormModal({
    isOpen,
    onClose,
    formMode,
    onSubmit,
    employeeId,
    name,
    setName,
    phone,
    setPhone,
    vendor,
    setVendor,
    vendorOptions = [],
    onAddVendor,
    onRemoveVendor,
    sourcing,
    setSourcing,
    sourcingOptions = [],
    onAddSourcing,
    onRemoveSourcing,
    sourcingManager,
    setSourcingManager,
    sourcingManagerOptions,
    onAddSourcingManager,
    perDayPayout,
    setPerDayPayout,
    payoutOptions = [950, 1000, 1100],
    onAddPayout,
    password,
    setPassword,
    status,
    setStatus,
    assignedOffice,
    setAssignedOffice,
    officeLocations = [],
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [isAddingCustomVendor, setIsAddingCustomVendor] = useState(false);
    const [customVendor, setCustomVendor] = useState("");
    const [isAddingCustomSourcing, setIsAddingCustomSourcing] = useState(false);
    const [customSourcing, setCustomSourcing] = useState("");
    const [isAddingCustomPayout, setIsAddingCustomPayout] = useState(false);
    const [customPayout, setCustomPayout] = useState("");
    const [vendorOpen, setVendorOpen] = useState(false);
    const [sourcingOpen, setSourcingOpen] = useState(false);
    const vendorRef = useRef(null);
    const sourcingRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (vendorRef.current && !vendorRef.current.contains(e.target)) setVendorOpen(false);
            if (sourcingRef.current && !sourcingRef.current.contains(e.target)) setSourcingOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const currentSourcing = sourcing !== undefined ? sourcing : (sourcingManager || "");
    const updateSourcing = setSourcing || setSourcingManager;
    const currentSourcingOptions = (sourcingOptions && sourcingOptions.length > 0)
        ? sourcingOptions
        : (sourcingManagerOptions || ["Walk-in", "Direct / Internal", "Referral", "Agency / Staffing", "Social Media", "Freelance Network"]);
    const handleAddNewSourcing = onAddSourcing || onAddSourcingManager;
    const currentPayoutOptions = Array.from(new Set([
        ...payoutOptions,
        ...(perDayPayout ? [Number(perDayPayout)] : []),
    ])).filter((amount) => Number.isFinite(amount) && amount > 0).sort((a, b) => a - b);

    const handleConfirmCustomVendor = () => {
        const val = customVendor.trim();
        if (val) {
            if (onAddVendor) onAddVendor(val);
            setVendor(val);
            setCustomVendor("");
            setIsAddingCustomVendor(false);
        }
    };

    const handleConfirmCustomSourcing = () => {
        const val = customSourcing.trim();
        if (val) {
            if (handleAddNewSourcing) handleAddNewSourcing(val);
            if (updateSourcing) updateSourcing(val);
            setCustomSourcing("");
            setIsAddingCustomSourcing(false);
        }
    };

    const handleConfirmCustomPayout = () => {
        const value = Number(customPayout);
        if (!Number.isFinite(value) || value <= 0) return;
        if (onAddPayout) onAddPayout(value);
        setPerDayPayout(String(value));
        setCustomPayout("");
        setIsAddingCustomPayout(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-[560px] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto no-scrollbar max-h-[92vh] text-slate-800 dark:text-slate-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {formMode === "create" ? "Add New Employee" : "Edit Employee Profile"}
                                </h3>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    {formMode === "create"
                                        ? "Enter the 5 required fields to register the employee."
                                        : `Updating record for ${name || "employee"}`}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={onSubmit} autoComplete="off" className="mt-5 space-y-4 text-xs">
                            {/* 1. Employee Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                    <FiUser className="text-blue-500" /> 1. Employee Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoComplete="off"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full h-11 mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-100 placeholder:text-slate-400 transition"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                    <FiPhone className="text-emerald-500" /> 2. Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-1.5 flex items-center">
                                    <span className="absolute left-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        required
                                        autoComplete="off"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                        placeholder="98765 43210"
                                        className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-100 placeholder:text-slate-400 tracking-wide transition"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                    Used for employee portal sign-in and mobile verification.
                                </p>
                            </div>

                            {/* 3. Vendor */}
                            <div ref={vendorRef} className="relative">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                        <FiBriefcase className="text-amber-500" /> 3. Vendor
                                    </label>
                                    {!isAddingCustomVendor && (
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddingCustomVendor(true); setVendorOpen(false); }}
                                            className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <FiPlus className="text-[11px]" /> Add New
                                        </button>
                                    )}
                                </div>

                                {isAddingCustomVendor ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customVendor}
                                            onChange={(e) => setCustomVendor(e.target.value)}
                                            placeholder="Enter vendor / agency name..."
                                            className="flex-1 h-10 rounded-xl border border-amber-400 bg-amber-50/30 px-3 text-xs outline-none text-slate-800 dark:bg-slate-800 dark:border-amber-500 dark:text-slate-100"
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmCustomVendor(); } }}
                                        />
                                        <button type="button" onClick={handleConfirmCustomVendor}
                                            className="h-10 px-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition flex items-center gap-1">
                                            <FiCheck /> Add
                                        </button>
                                        <button type="button" onClick={() => setIsAddingCustomVendor(false)}
                                            className="h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                            <FiX />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Trigger button */}
                                        <button
                                            type="button"
                                            onClick={() => { setVendorOpen((o) => !o); setSourcingOpen(false); }}
                                            className={`w-full h-11 flex items-center justify-between px-3.5 rounded-xl border text-xs font-medium transition
                                                ${vendor
                                                    ? "border-amber-400 bg-amber-50/50 text-amber-800 dark:bg-amber-950/30 dark:border-amber-600 dark:text-amber-300"
                                                    : "border-slate-200 bg-slate-50 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                                                } ${vendorOpen ? "ring-2 ring-amber-400/30" : ""}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {vendor
                                                    ? <><span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span><span className="text-slate-800 dark:text-slate-100">{vendor}</span></>
                                                    : "Select Vendor / Agency"
                                                }
                                            </span>
                                            <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${vendorOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Dropdown panel */}
                                        <AnimatePresence>
                                            {vendorOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    transition={{ duration: 0.12 }}
                                                    className="absolute z-50 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
                                                >
                                                    <div className="py-1.5 max-h-48 overflow-y-auto">
                                                         {vendorOptions.map((v) => (
                                                            <button
                                                                key={v}
                                                                type="button"
                                                                onClick={() => { setVendor(v); setVendorOpen(false); }}
                                                                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition hover:bg-amber-50 dark:hover:bg-amber-950/20
                                                                    ${vendor === v ? "bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}
                                                            >
                                                                <span className="flex items-center gap-2.5">
                                                                    <span className={`h-2 w-2 rounded-full ${vendor === v ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-600"}`}></span>
                                                                    {v}
                                                                </span>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    {vendor === v && <FiCheck className="text-amber-500" />}
                                                                    {onRemoveVendor && (
                                                                        <button
                                                                            type="button"
                                                                            title="Remove option"
                                                                            onClick={(e) => { e.stopPropagation(); onRemoveVendor(v); }}
                                                                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-md text-slate-300 hover:bg-red-100 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
                                                                        >
                                                                            <FiTrash2 className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {vendor && !vendorOptions.includes(vendor) && (
                                                            <button type="button" onClick={() => { setVendor(vendor); setVendorOpen(false); }}
                                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold">
                                                                <span className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>{vendor}</span>
                                                                <FiCheck className="text-amber-500 shrink-0" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </div>

                            {/* 4. Sourcing */}
                            <div ref={sourcingRef} className="relative">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                        <FiUsers className="text-indigo-500" /> 4. Sourcing
                                    </label>
                                    {!isAddingCustomSourcing && (
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddingCustomSourcing(true); setSourcingOpen(false); }}
                                            className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <FiPlus className="text-[11px]" /> Add New
                                        </button>
                                    )}
                                </div>

                                {isAddingCustomSourcing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customSourcing}
                                            onChange={(e) => setCustomSourcing(e.target.value)}
                                            placeholder="Enter recruitment sourcing channel..."
                                            className="flex-1 h-10 rounded-xl border border-indigo-400 bg-indigo-50/30 px-3 text-xs outline-none text-slate-800 dark:bg-slate-800 dark:border-indigo-500 dark:text-slate-100"
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmCustomSourcing(); } }}
                                        />
                                        <button type="button" onClick={handleConfirmCustomSourcing}
                                            className="h-10 px-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition flex items-center gap-1">
                                            <FiCheck /> Add
                                        </button>
                                        <button type="button" onClick={() => setIsAddingCustomSourcing(false)}
                                            className="h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                            <FiX />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Trigger button */}
                                        <button
                                            type="button"
                                            onClick={() => { setSourcingOpen((o) => !o); setVendorOpen(false); }}
                                            className={`w-full h-11 flex items-center justify-between px-3.5 rounded-xl border text-xs font-medium transition
                                                ${currentSourcing
                                                    ? "border-indigo-400 bg-indigo-50/50 text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-600 dark:text-indigo-300"
                                                    : "border-slate-200 bg-slate-50 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                                                } ${sourcingOpen ? "ring-2 ring-indigo-400/30" : ""}`}
                                        >
                                            <span className="flex items-center gap-2">
                                                {currentSourcing
                                                    ? <><span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span><span className="text-slate-800 dark:text-slate-100">{currentSourcing}</span></>
                                                    : "Select Sourcing Channel"
                                                }
                                            </span>
                                            <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${sourcingOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        {/* Dropdown panel */}
                                        <AnimatePresence>
                                            {sourcingOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                    transition={{ duration: 0.12 }}
                                                    className="absolute z-50 mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
                                                >
                                                    <div className="py-1.5 max-h-48 overflow-y-auto">
                                                        {currentSourcingOptions.map((m) => (
                                                            <button
                                                                key={m}
                                                                type="button"
                                                                onClick={() => { if (updateSourcing) updateSourcing(m); setSourcingOpen(false); }}
                                                                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition hover:bg-indigo-50 dark:hover:bg-indigo-950/20
                                                                    ${currentSourcing === m ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}
                                                            >
                                                                <span className="flex items-center gap-2.5">
                                                                    <span className={`h-2 w-2 rounded-full ${currentSourcing === m ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-600"}`}></span>
                                                                    {m}
                                                                </span>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    {currentSourcing === m && <FiCheck className="text-indigo-500" />}
                                                                    {(onRemoveSourcing || handleAddNewSourcing) && onRemoveSourcing && (
                                                                        <button
                                                                            type="button"
                                                                            title="Remove option"
                                                                            onClick={(e) => { e.stopPropagation(); onRemoveSourcing(m); }}
                                                                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-md text-slate-300 hover:bg-red-100 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
                                                                        >
                                                                            <FiTrash2 className="h-3 w-3" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                        {currentSourcing && !currentSourcingOptions.includes(currentSourcing) && (
                                                            <button type="button" onClick={() => { if (updateSourcing) updateSourcing(currentSourcing); setSourcingOpen(false); }}
                                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-bold">
                                                                <span className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span>{currentSourcing}</span>
                                                                <FiCheck className="text-indigo-500 shrink-0" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                )}
                            </div>

                            {/* 5. Per Day Payout (₹ Amount) */}
                            <div>
                                {/* Hidden required input for form validation */}
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    tabIndex={-1}
                                    value={perDayPayout}
                                    style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
                                    aria-hidden="true"
                                />

                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="flex items-center gap-1.5 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                                        <FiDollarSign className="text-violet-500" /> 5. Payment / Day
                                    </label>
                                    {!isAddingCustomPayout && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCustomPayout(true)}
                                            className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <FiPlus className="text-[11px]" /> Add Amount
                                        </button>
                                    )}
                                </div>

                                {isAddingCustomPayout && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="number"
                                            min="1"
                                            autoFocus
                                            value={customPayout}
                                            onChange={(e) => setCustomPayout(e.target.value)}
                                            placeholder="Enter ₹ / day"
                                            className="flex-1 h-10 rounded-xl border border-violet-400 bg-violet-50/30 px-3 text-xs outline-none text-slate-800 dark:bg-slate-800 dark:border-violet-500 dark:text-slate-100"
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmCustomPayout(); } }}
                                        />
                                        <button type="button" onClick={handleConfirmCustomPayout} className="h-10 px-3 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition flex items-center gap-1">
                                            <FiCheck /> Add
                                        </button>
                                        <button type="button" onClick={() => setIsAddingCustomPayout(false)} className="h-10 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                                            <FiX />
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-4 gap-2 mt-1.5">
                                    {currentPayoutOptions.map((amount) => {
                                        const amountValue = String(amount);
                                        const isSelected = String(perDayPayout) === amountValue;
                                        return (
                                            <button
                                                key={amountValue}
                                                type="button"
                                                onClick={() => setPerDayPayout(amountValue)}
                                                className={`relative flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all duration-150 select-none
                                                    ${isSelected
                                                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 shadow-sm"
                                                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-violet-300 hover:bg-violet-50/40 dark:hover:bg-violet-950/20"
                                                    }`}
                                            >
                                                <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isSelected ? "text-violet-500" : "text-slate-400 dark:text-slate-500"}`}>
                                                    ₹ / day
                                                </span>
                                                <span className={`text-base font-black leading-none ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-200"}`}>
                                                    {amountValue}
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-500">
                                                        <FiCheck className="text-white" style={{ fontSize: "8px" }} />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {perDayPayout && (
                                    <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                                        Selected: <span className="font-bold text-violet-600 dark:text-violet-400">₹{Number(perDayPayout).toLocaleString()}/day</span>
                                        <span className="ml-1.5 text-slate-400">≈ ₹{(Number(perDayPayout) * 30).toLocaleString()}/month</span>
                                    </p>
                                )}
                            </div>

                            {/* Attendance Location (Geofenced Office Assignment) */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 p-4 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <FiMapPin className="text-blue-500" /> Attendance Location & Geofencing
                                    </span>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md font-medium">
                                        GPS Verification
                                    </span>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">
                                        Assigned Office / Branch
                                    </label>
                                    <select
                                        value={assignedOffice || ""}
                                        onChange={(e) => setAssignedOffice(e.target.value)}
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-100"
                                    >
                                        <option value="">-- No Office Assigned (Unrestricted / Manual) --</option>
                                        {officeLocations.map((loc) => (
                                            <option key={loc._id} value={loc._id}>
                                                {loc.officeName} ({loc.allowedRadius}m radius) {!loc.isActive ? "- [Inactive]" : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {assignedOffice && (() => {
                                    const selectedLoc = officeLocations.find(l => l._id === assignedOffice);
                                    if (!selectedLoc) return null;
                                    return (
                                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                                            <div className="font-semibold text-slate-700 dark:text-slate-200">
                                                {selectedLoc.officeName}
                                            </div>
                                            <div className="text-slate-500 dark:text-slate-400 line-clamp-1">
                                                {selectedLoc.address}
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-400 text-[10px] pt-1">
                                                <span>Allowed Radius: <strong className="text-blue-600 dark:text-blue-400">{selectedLoc.allowedRadius}m</strong></span>
                                                <span>Status: <strong className={selectedLoc.isActive ? "text-emerald-600" : "text-amber-600"}>{selectedLoc.isActive ? "Active" : "Inactive"}</strong></span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Collapsible/Info Box for Login Credentials and Status */}
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <FiKey className="text-blue-500" /> Access & Credentials
                                    </span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-medium">
                                        Phone Sign-in Enabled
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                                            Employee ID
                                        </label>
                                        <div className="h-10 mt-1 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-3 text-xs font-mono font-bold flex items-center text-slate-700 dark:text-slate-300 select-all">
                                            {employeeId || "Auto-assigned"}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                                            Account Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full h-10 mt-1 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-100"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center justify-between">
                                        <span>Login Password</span>
                                        <span className="text-slate-400 font-normal">Can log in with Phone / ID</span>
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Default: Pass1234!"
                                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 pr-10 text-xs text-slate-800 outline-none focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:focus:bg-slate-850 dark:text-slate-100 placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            {showPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 h-11 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <FiCheck className="text-sm" />
                                    {formMode === "create" ? "Add Employee" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
