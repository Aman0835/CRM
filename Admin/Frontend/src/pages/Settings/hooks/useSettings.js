import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as holidayService from "../../../services/holidayService";
import * as settingsService from "../../../services/settingsService";

export function useSettings() {
    const [shopName, setShopName] = useState("Diva The Salon");
    const [contactEmail, setContactEmail] = useState("admin@divathesalon.com");
    const [checkInTime, setCheckInTime] = useState("09:00");
    const [checkOutTime, setCheckOutTime] = useState("20:00");
    const [overtimeRate, setOvertimeRate] = useState(25);
    const [leaveDeduction, setLeaveDeduction] = useState(100);

    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [hTitle, setHTitle] = useState("");
    const [hDate, setHDate] = useState("");
    const [hDesc, setHDesc] = useState("");
    const [loadingHolidays, setLoadingHolidays] = useState(false);

    const loadSettings = async () => {
        try {
            const res = await settingsService.getSettings();
            if (res.success && res.data) {
                if (res.data.shopName) setShopName(res.data.shopName);
                if (res.data.contactEmail) setContactEmail(res.data.contactEmail);
                if (res.data.checkInTime) setCheckInTime(res.data.checkInTime);
                if (res.data.checkOutTime) setCheckOutTime(res.data.checkOutTime);
                if (res.data.overtimeRate !== undefined) setOvertimeRate(res.data.overtimeRate);
                if (res.data.leaveDeduction !== undefined) setLeaveDeduction(res.data.leaveDeduction);
            }
        } catch (err) {
            console.error("Failed to load settings from server:", err);
        }
    };

    const fetchSettingsHolidays = async () => {
        setLoadingHolidays(true);
        try {
            const res = await holidayService.getHolidays();
            if (res.success) {
                const futureHolidays = res.data
                    .filter(h => new Date(h.date) >= new Date().setHours(0, 0, 0, 0))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setUpcomingHolidays(futureHolidays);
            }
        } catch (err) {
            console.error("Failed to load settings holidays:", err);
        } finally {
            setLoadingHolidays(false);
        }
    };

    useEffect(() => {
        loadSettings();
        fetchSettingsHolidays();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await settingsService.updateSettings({
                shopName,
                contactEmail,
                checkInTime,
                checkOutTime,
                overtimeRate: Number(overtimeRate),
                leaveDeduction: Number(leaveDeduction),
            });
            if (res.success) {
                toast.success("Settings saved successfully!");
            }
        } catch (err) {
            toast.error("Failed to save settings");
        }
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

    return {
        shopName, setShopName, contactEmail, setContactEmail,
        checkInTime, setCheckInTime, checkOutTime, setCheckOutTime,
        overtimeRate, setOvertimeRate, leaveDeduction, setLeaveDeduction,
        upcomingHolidays, hTitle, setHTitle, hDate, setHDate, hDesc, setHDesc,
        loadingHolidays, handleSave, handleAddHoliday, handleDeleteHoliday,
    };
}
