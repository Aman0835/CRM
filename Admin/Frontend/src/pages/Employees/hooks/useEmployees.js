import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import * as employeeService from "../../../services/employeeService";
import { subscribeRealtime } from "../../../services/realtime";
import api from "../../../services/api";

const DEFAULT_VENDORS = ["Direct / Internal", "Apex Staffing", "Elite Salon Associates", "Freelance Network"];
const DEFAULT_SOURCING = ["Walk-in", "Direct / Internal", "Referral", "Agency / Staffing", "Social Media", "Freelance Network"];

export function useEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEmployees, setTotalEmployees] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") || "";

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [formMode, setFormMode] = useState("create");

    // Requested 5 fields + ID / Password / Status
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [vendor, setVendor] = useState("");
    const [sourcing, setSourcing] = useState("");
    const [perDayPayout, setPerDayPayout] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("Pass1234!");
    const [status, setStatus] = useState("active");
    const [assignedOffice, setAssignedOffice] = useState("");
    const [officeLocations, setOfficeLocations] = useState([]);

    // Dynamic dropdown options
    const [vendorOptions, setVendorOptions] = useState(DEFAULT_VENDORS);
    const [sourcingOptions, setSourcingOptions] = useState(DEFAULT_SOURCING);

    const fetchOfficeLocations = async () => {
        try {
            const res = await api.get("/admin/locations");
            if (res.data?.success) {
                setOfficeLocations(res.data.data || []);
            }
        } catch {
            // Keep empty on error
        }
    };

    // Fetch settings to get persisted vendors / managers
    const fetchSettings = async () => {
        try {
            const res = await api.get("/admin/settings");
            if (res.data?.success && res.data?.data) {
                const s = res.data.data;
                if (Array.isArray(s.vendors) && s.vendors.length > 0) {
                    setVendorOptions((prev) => Array.from(new Set([...prev, ...s.vendors])));
                }
                const serverSourcing = s.sourcings || s.sourcingManagers;
                if (Array.isArray(serverSourcing) && serverSourcing.length > 0) {
                    setSourcingOptions((prev) => Array.from(new Set([...prev, ...serverSourcing])));
                }
            }
        } catch {
            // Keep default lists on error
        }
    };

    const fetchEmployees = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const params = { page, limit: 100, search, status: statusFilter || undefined };
            const res = await employeeService.getEmployees(params);
            if (res.success) {
                setEmployees(res.data);
                setTotalPages(res.totalPages);
                setTotalEmployees(res.totalEmployees);

                // Collect any existing vendors and sourcing channels from records
                const existingVendors = res.data.map((e) => e.vendor).filter(Boolean);
                const existingSourcing = res.data.map((e) => e.sourcing || e.sourcingManager).filter(Boolean);
                if (existingVendors.length) {
                    setVendorOptions((prev) => Array.from(new Set([...prev, ...existingVendors])));
                }
                if (existingSourcing.length) {
                    setSourcingOptions((prev) => Array.from(new Set([...prev, ...existingSourcing])));
                }
            }
        } catch (err) {
            console.error("Fetch roster error:", err);
            toast.error("Failed to load employee roster");
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        fetchOfficeLocations();
    }, []);

    useEffect(() => {
        fetchEmployees(true);
    }, [page, statusFilter, search]);

    useEffect(() => {
        const unsubscribe = subscribeRealtime(() => {
            fetchEmployees(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClearFilters = () => {
        setStatusFilter("");
        setSearchParams({});
        setPage(1);
    };

    const handleAddVendor = (newVendor) => {
        if (!newVendor) return;
        setVendorOptions((prev) => {
            if (prev.includes(newVendor)) return prev;
            return [...prev, newVendor];
        });
    };

    const handleRemoveVendor = (vendorToRemove) => {
        setVendorOptions((prev) => prev.filter((v) => v !== vendorToRemove));
        // Clear selection if the removed vendor was selected
        setVendor((prev) => (prev === vendorToRemove ? "" : prev));
    };

    const handleAddSourcing = (newSourcing) => {
        if (!newSourcing) return;
        setSourcingOptions((prev) => {
            if (prev.includes(newSourcing)) return prev;
            return [...prev, newSourcing];
        });
    };

    const handleRemoveSourcing = (sourcingToRemove) => {
        setSourcingOptions((prev) => prev.filter((s) => s !== sourcingToRemove));
        // Clear selection if the removed sourcing was selected
        setSourcing((prev) => (prev === sourcingToRemove ? "" : prev));
    };

    const handleOpenCreate = () => {
        setFormMode("create");
        setEmployeeId("EMP-" + Math.floor(1000 + Math.random() * 9000));
        setName("");
        setPhone("");
        setVendor("");
        setSourcing("");
        setPerDayPayout("");
        setPassword("Pass1234!");
        setStatus("active");
        setAssignedOffice("");
        fetchOfficeLocations();
        setIsFormOpen(true);
    };

    const handleOpenEdit = (emp) => {
        setFormMode("edit");
        setSelectedEmp(emp);
        setEmployeeId(emp.employeeId || "");
        setName(emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim());
        let p = emp.phone || "";
        if (p.startsWith("+91")) p = p.substring(3);
        setPhone(p);
        setVendor(emp.vendor || "");
        setSourcing(emp.sourcing || emp.sourcingManager || "");
        setPerDayPayout(emp.perDayPayout || (emp.monthlySalary ? Math.round(emp.monthlySalary / 30) : ""));
        setPassword("");
        setStatus(emp.status || "active");
        const officeId = typeof emp.assignedOffice === "object" && emp.assignedOffice !== null
            ? emp.assignedOffice._id
            : (emp.assignedOffice || "");
        setAssignedOffice(officeId);
        fetchOfficeLocations();
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            const res = await employeeService.deleteEmployee(id);
            if (res.success) {
                toast.success("Employee removed successfully");
                fetchEmployees();
            }
        } catch (err) {
            toast.error("Failed to remove employee");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter employee name");
            return;
        }
        if (!phone.trim()) {
            toast.error("Please enter mobile number");
            return;
        }

        const payload = {
            name: name.trim(),
            phone: phone.startsWith("+91") ? phone.trim() : `+91${phone.trim()}`,
            vendor: vendor.trim(),
            sourcing: sourcing.trim(),
            sourcingManager: sourcing.trim(),
            perDayPayout: Number(perDayPayout) || 0,
            status,
            employeeId,
            assignedOffice: assignedOffice || null,
        };

        if (formMode === "create") {
            payload.password = password.trim() || "Pass1234!";
        } else if (password.trim()) {
            payload.password = password.trim();
        }

        try {
            let res;
            if (formMode === "create") {
                res = await employeeService.createEmployee(payload);
            } else {
                res = await employeeService.updateEmployee(selectedEmp._id, payload);
            }
            if (res.success) {
                toast.success(res.message || `Employee ${formMode === "create" ? "created" : "updated"} successfully!`);
                setIsFormOpen(false);
                fetchEmployees();
            }
        } catch (err) {
            console.error("Form submit error:", err);
            toast.error(err.response?.data?.message || "Failed to submit employee form");
        }
    };

    return {
        employees,
        loading,
        totalEmployees,
        search,
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        statusDropdownOpen,
        setStatusDropdownOpen,
        statusDropdownRef,
        isFormOpen,
        setIsFormOpen,
        formMode,
        handleClearFilters,
        handleOpenCreate,
        handleOpenEdit,
        handleDelete,
        handleFormSubmit,
        // 5 Requested Fields + Helpers
        name,
        setName,
        phone,
        setPhone,
        vendor,
        setVendor,
        vendorOptions,
        handleAddVendor,
        handleRemoveVendor,
        sourcing,
        setSourcing,
        sourcingOptions,
        handleAddSourcing,
        handleRemoveSourcing,
        // Backwards compatibility aliases
        sourcingManager: sourcing,
        setSourcingManager: setSourcing,
        sourcingManagerOptions: sourcingOptions,
        handleAddSourcingManager: handleAddSourcing,
        perDayPayout,
        setPerDayPayout,
        employeeId,
        setEmployeeId,
        password,
        setPassword,
        status,
        setStatus,
        assignedOffice,
        setAssignedOffice,
        officeLocations,
    };
}
