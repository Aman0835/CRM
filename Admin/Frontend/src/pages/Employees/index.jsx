import React from "react";
import { FiPlus, FiUsers, FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useEmployees } from "./hooks/useEmployees";
import EmployeeCard from "./components/EmployeeCard";
import EmployeeFormModal from "./components/EmployeeFormModal";

const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on_leave", label: "On Leave" },
];

export default function Employees() {
    const {
        employees, loading, totalEmployees, search, page, setPage,
        totalPages, statusFilter, setStatusFilter, statusDropdownOpen, setStatusDropdownOpen,
        statusDropdownRef, isFormOpen, setIsFormOpen, formMode,
        handleClearFilters, handleOpenCreate, handleOpenEdit, handleDelete, handleFormSubmit,
        employeeId, firstName, setFirstName, lastName, setLastName,
        email, setEmail, phone, setPhone, gender, setGender,
        role, setRole, password, setPassword, joiningDate, setJoiningDate,
        monthlySalary, setMonthlySalary, profileImage, setProfileImage,
        address, setAddress, status, setStatus,
    } = useEmployees();

    return (
        <DashboardLayout
            title="Employees"
            subtitle="Manage your barber staff profile files, contacts, schedules, and payroll parameters."
            action={
                <button onClick={handleOpenCreate} type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm">
                    <FiPlus /> Add Employee
                </button>
            }
        >
            {/* Filters panel */}
            <section className="mt-2 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] dark:border-slate-800/80 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-base font-black text-slate-855 dark:text-slate-200">Staff Directory</h2>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Search and filter standard barber files · <span className="font-bold text-blue-600 dark:text-blue-400">{totalEmployees} total</span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
                        <SearchBar placeholder="Search by name, ID..." className="w-full sm:w-64" />
                        <div ref={statusDropdownRef} className="relative w-full sm:w-44 select-none">
                            <button type="button" onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-3 text-xs font-bold text-slate-600 outline-none transition-all hover:bg-slate-100/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 cursor-pointer">
                                <span>{statusOptions.find(o => o.value === statusFilter)?.label || "All Statuses"}</span>
                                <FiChevronDown className={`text-xs text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {statusDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 left-0 mt-2.5 z-40 overflow-hidden rounded-2xl border border-slate-150 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="py-1.5">
                                            {statusOptions.map((opt) => (
                                                <button key={opt.value} type="button"
                                                    onClick={() => { setStatusFilter(opt.value); setPage(1); setStatusDropdownOpen(false); }}
                                                    className={`flex w-full items-center px-4 py-2.5 text-left text-xs transition-all hover:bg-blue-50 dark:hover:bg-slate-800/60 font-semibold ${
                                                        statusFilter === opt.value ? "text-blue-600 bg-blue-50/30 dark:text-blue-450 dark:bg-blue-950/10" : "text-slate-600 dark:text-slate-400"
                                                    }`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roster Cards Grid */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {employees.length === 0 ? (
                        <div className="mt-6 flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.005)]">
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
                                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 blur-md animate-pulse"></div>
                                <FiUsers className="text-2xl relative" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-305">No Employees Found</h3>
                            <p className="mt-1.5 max-w-[320px] text-xs text-slate-400 dark:text-slate-550 leading-normal">
                                {search || statusFilter
                                    ? `No staff files match the search "${search || ""}" or selected status filter.`
                                    : "There are currently no staff files registered in the system."}
                            </p>
                            {(search || statusFilter) && (
                                <button onClick={handleClearFilters}
                                    className="mt-4 inline-flex h-8.5 items-center gap-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all font-bold px-4.5 text-[10px] uppercase tracking-wider dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/30 cursor-pointer">
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <section className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {employees.map((barber) => (
                                <EmployeeCard key={barber._id} barber={barber} onEdit={handleOpenEdit} onDelete={handleDelete} />
                            ))}
                        </section>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500">
                            <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/60 disabled:opacity-50">
                                <FiChevronLeft /> Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800/60 disabled:opacity-50">
                                Next <FiChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}

            <EmployeeFormModal
                isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} formMode={formMode} onSubmit={handleFormSubmit}
                employeeId={employeeId} firstName={firstName} setFirstName={setFirstName}
                lastName={lastName} setLastName={setLastName} email={email} setEmail={setEmail}
                phone={phone} setPhone={setPhone} gender={gender} setGender={setGender}
                role={role} setRole={setRole} password={password} setPassword={setPassword}
                joiningDate={joiningDate} setJoiningDate={setJoiningDate}
                monthlySalary={monthlySalary} setMonthlySalary={setMonthlySalary}
                profileImage={profileImage} setProfileImage={setProfileImage}
                address={address} setAddress={setAddress} status={status} setStatus={setStatus}
            />
        </DashboardLayout>
    );
}
