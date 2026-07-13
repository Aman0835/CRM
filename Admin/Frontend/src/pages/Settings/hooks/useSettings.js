import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as holidayService from "../../../services/holidayService";

export function useSettings() {
    const [shopName, setShopName] = useState("Diva The Salon");
    const [contactEmail, setContactEmail] = useState("admin@divathesalon.com");
    const [checkInTime, setCheckInTime] = useState("09:00");
    const [checkOutTime, setCheckOutTime] = useState("20:00");
    const [overtimeRate, setOvertimeRate] = useState(25);
    const [leaveDeduction, setLeaveDeduction] = useState(100);

    const [holidays, setHolidays] = useState([]);
    const [hTitle, setHTitle] = useState("");
    const [hDate, setHDate] = useState("");
    const [hDesc, setHDesc] = useState("");
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    const fetchSettingsHolidays = async () => {
        setLoadingHolidays(true);
        try {
            const res = await holidayService.getHolidays();
            if (res.success) {
                const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setHolidays(sorted);
            }
        } catch (err) {
            console.error("Failed to load settings holidays:", err);
        } finally {
            setLoadingHolidays(false);
        }
    };

    useEffect(() => { fetchSettingsHolidays(); }, []);

    const handleSave = (e) => {
        e.preventDefault();
        toast.success("Settings saved successfully!");
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        if (!hTitle || !hDate) {
            toast.error("Please provide a title and date for the closure");
            return;
        }
        try {
            const res = await holidayService.createHoliday({ title: hTitle, date: hDate, description: hDesc });
            if (res.success) {
                toast.success("Shop closure added successfully!");
                setHTitle(""); setHDate(""); setHDesc("");
                fetchSettingsHolidays();
            }
        } catch (err) {
            toast.error("Failed to add shop closure");
        }
    };

    const handleDeleteHoliday = async (id) => {
        if (!window.confirm("Are you sure you want to remove this shop closure?")) return;
        try {
            const res = await holidayService.deleteHoliday(id);
            if (res.success) {
                toast.success("Shop closure removed");
                fetchSettingsHolidays();
            }
        } catch (err) {
            toast.error("Failed to delete closure");
        }
    };

    const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date().setHours(0, 0, 0, 0));

    return {
        shopName, setShopName, contactEmail, setContactEmail,
        checkInTime, setCheckInTime, checkOutTime, setCheckOutTime,
        overtimeRate, setOvertimeRate, leaveDeduction, setLeaveDeduction,
        holidays, upcomingHolidays, hTitle, setHTitle, hDate, setHDate, hDesc, setHDesc,
        loadingHolidays, handleSave, handleAddHoliday, handleDeleteHoliday,
    };
}
