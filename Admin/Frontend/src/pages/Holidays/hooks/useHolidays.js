import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as holidayService from "../../../services/holidayService";

export function useHolidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedHolidayId, setSelectedHolidayId] = useState(null);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await holidayService.getHolidays();
            if (res.success) {
                const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setHolidays(sorted);
            }
        } catch (err) {
            console.error("Holidays fetch error:", err);
            toast.error("Failed to load holiday roster");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHolidays(); }, []);

    const handleOpenCreate = () => {
        setModalMode("create");
        setTitle(""); setDate(""); setDescription("");
        setIsModalOpen(true);
    };

    const handleOpenEdit = (h) => {
        setModalMode("edit");
        setSelectedHolidayId(h._id);
        setTitle(h.title);
        setDate(h.date ? h.date.split("T")[0] : "");
        setDescription(h.description || "");
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
        try {
            const res = await holidayService.deleteHoliday(id);
            if (res.success) {
                toast.success("Holiday removed successfully");
                fetchHolidays();
            }
        } catch (err) {
            toast.error("Failed to remove holiday");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) { toast.error("Please fill in title and date"); return; }
        const payload = { title, date, description };
        try {
            let res;
            if (modalMode === "create") {
                res = await holidayService.createHoliday(payload);
            } else {
                res = await holidayService.updateHoliday(selectedHolidayId, payload);
            }
            if (res.success) {
                toast.success(res.message || `Holiday ${modalMode === "create" ? "added" : "updated"} successfully!`);
                setIsModalOpen(false);
                fetchHolidays();
            }
        } catch (err) {
            toast.error("Failed to save holiday");
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today);
    const pastHolidays = holidays.filter(h => new Date(h.date) < today);

    return {
        loading, isModalOpen, setIsModalOpen, modalMode,
        title, setTitle, date, setDate, description, setDescription,
        upcomingHolidays, pastHolidays,
        handleOpenCreate, handleOpenEdit, handleDelete, handleSubmit,
    };
}
