import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiCheck,
  FiCalendar,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createLead } from "../services/leadService";
import {
  CONFIG_OPTIONS,
  BUDGET_OPTIONS,
  INTERACTION_TYPES,
  OUTCOME_OPTIONS,
  NEXT_ACTION_OPTIONS,
  QUICK_RESPONSES,
} from "../utils/leadUtils";

export default function CreateLeadPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Client Info
    name: "",
    phone: "",
    email: "",
    location: "",
    // Requirements
    project: "",
    configuration: "2 BHK",
    budget: "₹1 Cr – ₹1.5 Cr",
    source: "Direct Call",
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
        navigate("/leads/my");
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

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8 pt-1">
        {/* Top Header */}
        <div className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate("/leads")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#182338] text-[#8ea4cb] hover:text-white transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-white">Create New Lead</h1>
            <p className="text-[12px] text-[#7d93ba]">Client & First Conversation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: CLIENT INFORMATION */}
          <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#23334d] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#273857] text-[#60a5fa]">
                <FiUser className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">
                Client Information
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Rajkumar Mishra"
                className={`mt-1.5 h-11 w-full rounded-2xl border bg-[#141e31] px-4 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6] ${
                  errors.name ? "border-red-500" : "border-[#243552]"
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`mt-1.5 h-11 w-full rounded-2xl border bg-[#141e31] px-3.5 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6] ${
                    errors.phone ? "border-red-500" : "border-[#243552]"
                  }`}
                />
                {errors.phone && <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Thane West"
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3.5 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="client@example.com"
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-4 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6]"
              />
            </div>
          </div>

          {/* SECTION 2: REQUIREMENTS */}
          <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#23334d] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#273857] text-[#34d399]">
                <FiHome className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">
                Requirements
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Project Interested In
              </label>
              <input
                type="text"
                value={formData.project}
                onChange={(e) => handleChange("project", e.target.value)}
                placeholder="e.g. Dosti West County, Lodha Crown..."
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-4 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Configuration
                </label>
                <select
                  value={formData.configuration}
                  onChange={(e) => handleChange("configuration", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                >
                  {CONFIG_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-[#101827] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                >
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b} className="bg-[#101827] text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
              >
                <option value="Direct Call" className="bg-[#101827]">Direct Call</option>
                <option value="WhatsApp Inquiry" className="bg-[#101827]">WhatsApp Inquiry</option>
                <option value="Walk-in" className="bg-[#101827]">Walk-in / Office</option>
                <option value="Website" className="bg-[#101827]">Website Portal</option>
                <option value="Referral" className="bg-[#101827]">Referral / Existing Client</option>
                <option value="Campaign" className="bg-[#101827]">Marketing Campaign</option>
              </select>
            </div>
          </div>

          {/* SECTION 3: FIRST INTERACTION */}
          <div className="rounded-[28px] border border-[#243552] bg-[#1d2840] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#23334d] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#273857] text-[#fbbf24]">
                <FiFileText className="h-4 w-4" />
              </div>
              <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">
                First Interaction
              </h2>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                Interaction Mode
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {INTERACTION_TYPES.slice(0, 4).map((t) => {
                  const Icon = t.icon;
                  const isSelected = formData.interactionType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleChange("interactionType", t.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl p-2.5 transition-all ${
                        isSelected
                          ? "bg-[#2f6cf6] text-white shadow-[0_4px_12px_rgba(47,108,246,0.35)]"
                          : "bg-[#141e31] text-[#7d93ba] hover:bg-[#1a263d]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="mt-1 text-[11px] font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / What client said */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                What did the client say? <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.clientResponse}
                onChange={(e) => handleChange("clientResponse", e.target.value)}
                placeholder="e.g. Interested in 2 BHK, family wants a site visit this Sunday..."
                className={`mt-1.5 w-full resize-none rounded-2xl border bg-[#141e31] p-3 text-xs text-white placeholder-[#506385] outline-none focus:border-[#2f6cf6] ${
                  errors.clientResponse ? "border-red-500" : "border-[#243552]"
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
                    className="rounded-full border border-[#2b3c58] bg-[#141e31] px-2.5 py-1 text-[10px] text-[#93aacf] hover:border-[#3b5278] hover:text-white"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Outcome <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.outcome}
                  onChange={(e) => handleChange("outcome", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                >
                  {OUTCOME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#101827] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7d93ba]">
                  Next Action <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.nextAction}
                  onChange={(e) => handleChange("nextAction", e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-[#243552] bg-[#141e31] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                >
                  {NEXT_ACTION_OPTIONS.map((act) => (
                    <option key={act} value={act} className="bg-[#101827] text-white">
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Follow-up Date & Time */}
            <div className="rounded-2xl border border-[#23334d] bg-[#141e31] p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#fbbf24]">
                Schedule Follow-up
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => handleChange("followUpDate", e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#243552] bg-[#101827] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.followUpTime}
                    onChange={(e) => handleChange("followUpTime", e.target.value)}
                    placeholder="11:00 AM"
                    className="h-10 w-full rounded-xl border border-[#243552] bg-[#101827] px-3 text-xs text-white outline-none focus:border-[#2f6cf6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="px-1 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#2f6cf6] text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(47,108,246,0.4)] active:scale-[0.98] disabled:opacity-60"
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
