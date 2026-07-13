import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as payrollService from "../../../services/payrollService";
import * as employeeService from "../../../services/employeeService";

export function usePayroll() {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
    const [genYear, setGenYear] = useState(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);

    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            const payRes = await payrollService.getPayrolls();
            if (payRes.success) setPayrolls(payRes.data);
            const empRes = await employeeService.getEmployees({ limit: 100 });
            if (empRes.success) setEmployees(empRes.data);
        } catch (err) {
            console.error("Payroll fetch error:", err);
            toast.error("Failed to load payroll records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPayrollData(); }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const res = await payrollService.generatePayroll(Number(genMonth), Number(genYear));
            if (res.success) {
                toast.success(res.message || "Payroll generated successfully!");
                setIsGenModalOpen(false);
                fetchPayrollData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate payroll for this period.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payroll record?")) return;
        try {
            const res = await payrollService.deletePayroll(id);
            if (res.success) { toast.success("Payroll record deleted"); fetchPayrollData(); }
        } catch (err) { toast.error("Failed to delete record"); }
    };

    const filteredPayrolls = payrolls.filter(p => {
        const emp = employees.find(e => e.employeeId === p.employeeId);
        const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
        const matchesSearch = !search || name.includes(search.toLowerCase()) || p.employeeId.toLowerCase().includes(search.toLowerCase());
        const matchesMonth = !selectedMonth || p.month === Number(selectedMonth);
        const matchesYear = !selectedYear || p.year === Number(selectedYear);
        return matchesSearch && matchesMonth && matchesYear;
    });

    const grossPayroll = filteredPayrolls.reduce((acc, p) => acc + p.baseSalary + p.overtimeAmount, 0);
    const totalDeductions = filteredPayrolls.reduce((acc, p) => acc + p.deductions, 0);
    const netPayroll = filteredPayrolls.reduce((acc, p) => acc + p.netSalary, 0);

    return {
        navigate, loading, employees, filteredPayrolls, search, setSearch,
        selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
        isGenModalOpen, setIsGenModalOpen, genMonth, setGenMonth, genYear, setGenYear,
        generating, grossPayroll, totalDeductions, netPayroll,
        handleGenerate, handleDelete,
    };
}
