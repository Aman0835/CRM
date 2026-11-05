import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiHome,
  FiCheck,
  FiCalendar,
  FiClock,
  FiFileText,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createLead } from "../services/leadService";
import SchedulePicker from "../components/SchedulePicker";
import {
  CONFIG_OPTIONS,
  BUDGET_OPTIONS,
  INTERACTION_TYPES,
  OUTCOME_OPTIONS,
  NEXT_ACTION_OPTIONS,
  QUICK_RESPONSES,
} from "../utils/leadUtils";

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1.5 h-11 w-full flex items-center justify-between rounded-2xl border border-[#381C14] bg-[#1a0d09] px-3 text-xs text-[#FBFAF6] outline-none focus:border-[#962A22] transition-colors"
      >
        <span className="truncate">{value || placeholder}</span>
        <FiChevronDown className={`text-[#D9C4AA] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-[#381C14] bg-[#24110c] py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[#381C14] ${value === opt ? "text-[#FBFAF6] font-bold bg-[#962A22]" : "text-[#E9D5BD]"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CreateLeadPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Client Info
    name: "",
    phone: "",
    location: "",
    // Requirements
    project: "",
    configuration: "2 BHK",
    budget: "₹1 Cr – ₹1.5 Cr",
    source: "",
    // First Interaction
    interactionType: "CALL",
    clientResponse: "",
    outcome: "Interested",
    nextAction: "Schedule Site Visit",
    followUpDate: "",
    followUpTime: "11:00 AM",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleQuickChip = (text) => {
    setFormData((prev) => ({
      ...prev,
      clientResponse: prev.clientResponse
        ? `${prev.clientResponse}. ${text}`
        : text,
    }));
    if (errors.clientResponse) {
      setErrors((prev) => ({ ...prev, clientResponse: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 8) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (!formData.clientResponse.trim()) {
      newErrors.clientResponse = "First conversation notes are required";
    }
    if (!formData.outcome) newErrors.outcome = "Select an outcome";
    if (!formData.nextAction) newErrors.nextAction = "Select next action";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createLead(formData);
      toast.success("Lead created successfully!");
      if (res?.data?._id) {
        navigate(`/leads/${res.data._id}`);
      } else {
        navigate("/leads");
      }
    } catch (err) {
      console.error("Create Lead Error:", err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Failed to create lead";

      if (status === 409 && err?.response?.data?.existingLeadId) {
        toast.error(message);
        navigate(`/leads/${err.response.data.existingLeadId}`);
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/leads");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8 pt-1">
        {/* Top Header */}
        <div className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:text-[#FBFAF6] active:scale-95 transition-all"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-[#FBFAF6]">Create New Lead</h1>
            <p className="text-[12px] text-[#D9C4AA]">Client & First Conversation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: CLIENT INFORMATION */}
          <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#381C14] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#D9C4AA]">
                <FiUser className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                Client Information
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Full Name <span className="text-[#962A22]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Rajkumar Mishra"
                className={`mt-1.5 h-11 w-full rounded-2xl border bg-[#1a0d09] px-4 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors ${
                  errors.name ? "border-red-500" : "border-[#381C14]"
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Phone <span className="text-[#962A22]">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`mt-1.5 h-11 w-full rounded-2xl border bg-[#1a0d09] px-3.5 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors ${
                    errors.phone ? "border-red-500" : "border-[#381C14]"
                  }`}
                />
                {errors.phone && <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Thane West"
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-3.5 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: REQUIREMENTS */}
          <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#381C14] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#E9D5BD]">
                <FiHome className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                Requirements
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Project Interested In
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => handleChange("project", e.target.value)}
                placeholder="e.g. Dosti West County, Lodha Crown..."
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-4 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Configuration
                </label>
                <CustomSelect 
                  value={formData.configuration}
                  onChange={(val) => handleChange("configuration", val)}
                  options={CONFIG_OPTIONS}
                  placeholder="Select config"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Budget Range
                </label>
                <CustomSelect 
                  value={formData.budget}
                  onChange={(val) => handleChange("budget", val)}
                  options={BUDGET_OPTIONS}
                  placeholder="Select budget"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Lead Source (CP Firm)
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                placeholder="e.g. ABC CP Firm"
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] px-4 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors"
              />
            </div>
          </div>

          {/* SECTION 3: FIRST INTERACTION */}
          <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#381C14] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#D9C4AA]">
                <FiFileText className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                First Interaction
              </h2>
            </div>

            {/* Notes / What client said */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                What did the client say? <span className="text-[#962A22]">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.clientResponse}
                onChange={(e) => handleChange("clientResponse", e.target.value)}
                placeholder="e.g. Interested in 2 BHK, family wants a site visit this Sunday..."
                className={`mt-1.5 w-full resize-none rounded-2xl border bg-[#1a0d09] p-3 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors ${
                  errors.clientResponse ? "border-red-500" : "border-[#381C14]"
                }`}
              />
              {errors.clientResponse && (
                <p className="mt-1 text-[11px] text-red-400">{errors.clientResponse}</p>
              )}

              {/* Quick suggestions */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_RESPONSES.slice(0, 4).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickChip(chip)}
                    className="rounded-full border border-[#381C14] bg-[#1a0d09] px-2.5 py-1 text-[10px] text-[#E9D5BD] hover:border-[#962A22] hover:text-[#FBFAF6] transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Outcome <span className="text-[#962A22]">*</span>
                </label>
                <CustomSelect 
                  value={formData.outcome}
                  onChange={(val) => handleChange("outcome", val)}
                  options={OUTCOME_OPTIONS}
                  placeholder="Select outcome"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Next Action <span className="text-[#962A22]">*</span>
                </label>
                <CustomSelect 
                  value={formData.nextAction}
                  onChange={(val) => handleChange("nextAction", val)}
                  options={NEXT_ACTION_OPTIONS}
                  placeholder="Select action"
                />
              </div>
            </div>

            {/* Follow-up Date & Time */}
            <SchedulePicker
              date={formData.followUpDate}
              onDateChange={(val) => handleChange("followUpDate", val)}
              time={formData.followUpTime}
              onTimeChange={(val) => handleChange("followUpTime", val)}
              title="Schedule Follow-up"
              optional={true}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="px-1 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] text-[15px] font-bold text-[#FBFAF6] shadow-[0_12px_28px_rgba(150,42,34,0.4)] border border-[#D9C4AA]/20 active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
            >
              {submitting ? (
                <span>Creating Lead...</span>
              ) : (
                <>
                  <FiCheck className="h-5 w-5" />
                  <span>Create Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
