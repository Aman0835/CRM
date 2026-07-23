import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as employeeService from "../../services/employeeService";

export default function SearchBar({ placeholder = "Search employees...", className = "" }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced live search
    const handleInputChange = (val) => {
        setQuery(val);
        clearTimeout(debounceRef.current);

        if (!val.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await employeeService.getEmployees({ search: val, limit: 6 });
                if (res.success) {
                    setResults(res.data);
                    setOpen(true);
                }
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleSelect = (emp) => {
        setQuery("");
        setResults([]);
        setOpen(false);
        navigate(`/employees/${emp._id}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setOpen(false);
        navigate(`/employees?search=${encodeURIComponent(query)}`);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <form
                onSubmit={handleSubmit}
                className="flex h-9 w-full items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-500 focus-within:bg-white transition-all dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-850"
            >
                <FiSearch className="shrink-0 text-sm text-slate-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                />
                {loading && (
                    <div className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                )}
            </form>

            {/* Dropdown results */}
            {open && results.length > 0 && (
                <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {results.map((emp) => (
                        <button
                            key={emp._id}
                            type="button"
                            onClick={() => handleSelect(emp)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-blue-50 dark:hover:bg-slate-800"
                        >
                            {emp.profileImage ? (
                                <img
                                    src={emp.profileImage}
                                    alt={emp.firstName}
                                    loading="lazy"
                                    className="h-8 w-8 rounded-xl object-cover border border-slate-100 dark:border-slate-700 shrink-0"
                                />
                            ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                                    {emp.firstName} {emp.lastName}
                                </p>
                                <p className="truncate text-[10px] text-slate-400 capitalize">{emp.role} · {emp.employeeId}</p>
                            </div>
                            <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                emp.status === "active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                                emp.status === "on_leave" ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400" :
                                "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                                {emp.status}
                            </span>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={handleSubmit.bind(null, { preventDefault: () => {} })}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-slate-800 transition"
                    >
                        <FiSearch className="text-xs" /> See all results for "{query}"
                    </button>
                </div>
            )}

            {open && !loading && results.length === 0 && query.trim() && (
                <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <p className="text-xs text-slate-400">No employees found for "<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>"</p>
                </div>
            )}
        </div>
    );
}
