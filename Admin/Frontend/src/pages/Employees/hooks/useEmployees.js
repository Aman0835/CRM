import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as employeeService from "../../../services/employeeService";

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

    const [employeeId, setEmployeeId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("male");
    const [role, setRole] = useState("employee");
    const [password, setPassword] = useState("");
    const [joiningDate, setJoiningDate] = useState("");
    const [monthlySalary, setMonthlySalary] = useState(0);
    const [profileImage, setProfileImage] = useState("");
    const [address, setAddress] = useState("");
    const [status, setStatus] = useState("active");

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 100, search, status: statusFilter || undefined };
            const res = await employeeService.getEmployees(params);
            if (res.success) {
                setEmployees(res.data);
                setTotalPages(res.totalPages);
                setTotalEmployees(res.totalEmployees);
            }
        } catch (err) {
            console.error("Fetch roster error:", err);
            toast.error("Failed to load employee roster");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [page, statusFilter, search]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClearFilters = () => { setStatusFilter(""); setSearchParams({}); setPage(1); };

    const handleOpenCreate = () => {
        setFormMode("create");
        setEmployeeId("EMP-" + Math.floor(1000 + Math.random() * 9000));
        setFirstName(""); setLastName(""); setEmail(""); setPhone("");
        setGender("male"); setRole("employee"); setPassword("Pass1234!");
        setJoiningDate(new Date().toISOString().split("T")[0]);
        setMonthlySalary(3000);
        setProfileImage("https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200");
        setAddress(""); setStatus("active"); setIsFormOpen(true);
    };

    const handleOpenEdit = (emp) => {
        setFormMode("edit");
        setSelectedEmp(emp);
        setEmployeeId(emp.employeeId);
        setFirstName(emp.firstName); setLastName(emp.lastName); setEmail(emp.email);
        let p = emp.phone || "";
        if (p.startsWith("+91")) p = p.substring(3);
        setPhone(p);
        setGender(emp.gender || "male"); setRole(emp.role); setPassword("");
        setJoiningDate(emp.joiningDate ? emp.joiningDate.split("T")[0] : "");
        setMonthlySalary(emp.monthlySalary || 0);
        setProfileImage(emp.profileImage || ""); setAddress(emp.address || "");
        setStatus(emp.status || "active"); setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            const res = await employeeService.deleteEmployee(id);
            if (res.success) { toast.success("Employee removed successfully"); fetchEmployees(); }
        } catch (err) { toast.error("Failed to remove employee"); }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            employeeId, firstName, lastName, email,
            phone: phone.startsWith("+91") ? phone : `+91${phone}`,
            gender, role, joiningDate, monthlySalary: Number(monthlySalary),
            profileImage, address, status,
        };
        if (formMode === "create") payload.password = password;
        try {
            let res;
            if (formMode === "create") res = await employeeService.createEmployee(payload);
            else res = await employeeService.updateEmployee(selectedEmp._id, payload);
            if (res.success) {
                toast.success(res.message || `Employee ${formMode === "create" ? "created" : "updated"} successfully!`);
                setIsFormOpen(false); fetchEmployees();
            }
        } catch (err) {
            console.error("Form submit error:", err);
            toast.error(err.response?.data?.message || "Failed to submit employee form");
        }
    };

    return {
        employees, loading, totalEmployees, search, page, setPage,
        totalPages, statusFilter, setStatusFilter, statusDropdownOpen, setStatusDropdownOpen,
        statusDropdownRef, isFormOpen, setIsFormOpen, formMode,
        handleClearFilters, handleOpenCreate, handleOpenEdit, handleDelete, handleFormSubmit,
        // Form fields
        employeeId, firstName, setFirstName, lastName, setLastName,
        email, setEmail, phone, setPhone, gender, setGender,
        role, setRole, password, setPassword, joiningDate, setJoiningDate,
        monthlySalary, setMonthlySalary, profileImage, setProfileImage,
        address, setAddress, status, setStatus,
    };
}
