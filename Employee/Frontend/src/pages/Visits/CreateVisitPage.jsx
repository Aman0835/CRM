import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiCalendar,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiSend,
  FiSearch,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { getLeadById } from "../../leads/services/leadService";
import {
  VISIT_PROJECTS,
  VISIT_CLIENT_TYPES,
  VISIT_TOPOLOGIES,
  VISIT_SM_NAMES,
  VISIT_CALLER_NAMES,
  submitVisit,
} from "../../services/visitService";

const SearchableSelect = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1.5 h-11 w-full flex items-center justify-between rounded-2xl border border-[#381C14] bg-[#1a0d09] px-3.5 text-xs text-[#FBFAF6] outline-none focus:border-[#962A22] transition-colors"
      >
        <span className="truncate font-semibold">{value || placeholder}</span>
        <FiChevronDown
          className={`text-[#D9C4AA] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-64 overflow-hidden rounded-2xl border border-[#381C14] bg-[#24110c] shadow-[0_12px_36px_rgba(0,0,0,0.7)] flex flex-col">
          {options.length > 8 && (
            <div className="p-2 border-b border-[#381C14] sticky top-0 bg-[#24110c]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1a0d09] border border-[#381C14] text-xs">
                <FiSearch className="text-[#AE9475]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${label || "options"}...`}
                  className="w-full bg-transparent text-xs text-[#FBFAF6] outline-none placeholder-[#AE9475]"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-52 py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-xs text-[#AE9475] text-center">No matching options</p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-[#381C14] flex items-center justify-between ${
                    value === opt ? "text-[#FBFAF6] font-bold bg-[#962A22]" : "text-[#E9D5BD]"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <FiCheck className="text-sm shrink-0 text-[#FBFAF6]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreateVisitPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const { employee } = useAuth();

  const callerNameValue = useMemo(() => {
    if (!employee) return "AMAN VISHWAKARMA";
    const full = employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
    return full ? full.toUpperCase() : "AMAN VISHWAKARMA";
  }, [employee]);

  const smNameValue = useMemo(() => {
    const rawSm = employee?.sourcingManager || employee?.sourcing;
    if (rawSm && String(rawSm).trim()) {
      return String(rawSm).trim().toUpperCase();
    }
    return VISIT_SM_NAMES[0] || "ASIM SHAIKH";
  }, [employee]);

  const todayStr = new Date().toISOString().split("T")[0];
  const dateInputRef = useRef(null);

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return "Select Visit Date";
    try {
      const [y, m, d] = dateVal.split("-");
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      if (isNaN(dateObj.getTime())) return dateVal;
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateVal;
    }
  };

  const [formData, setFormData] = useState({
    projectName: VISIT_PROJECTS[0],
    callerName: callerNameValue,
    smName: smNameValue,
    clientName: "",
    clientType: "FAMILY",
    svNumber: "",
    clientNumberLast4: "",
    visitDate: todayStr,
    cpFirmName: "Dosti Realty",
    topology: ["2BHK"],
    notes: "",
  });

  // Keep callerName and smName synchronized with employee profile
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      callerName: callerNameValue,
      smName: smNameValue,
    }));
  }, [callerNameValue, smNameValue]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);

  // If leadId is passed, pre-fill form
  useEffect(() => {
    if (!leadId) return;
    const loadLead = async () => {
      try {
        setLoadingLead(true);
        const res = await getLeadById(leadId);
        if (res?.data) {
          const l = res.data;
          const digits = (l.phone || "").replace(/\D/g, "");
          setFormData((prev) => ({
            ...prev,
            clientName: l.name || prev.clientName,
            clientNumberLast4: digits.length >= 4 ? digits.slice(-4) : prev.clientNumberLast4,
            projectName:
              l.project && VISIT_PROJECTS.includes(l.project) ? l.project : prev.projectName,
            topology: l.configuration
              ? VISIT_TOPOLOGIES.filter((t) => l.configuration.toUpperCase().includes(t))
              : prev.topology,
          }));
        }
      } catch (err) {
        console.error("Failed to load pre-filled lead:", err);
      } finally {
        setLoadingLead(false);
      }
    };
    loadLead();
  }, [leadId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const toggleTopology = (t) => {
    setFormData((prev) => {
      const current = prev.topology || [];
      const updated = current.includes(t)
        ? current.length > 1
          ? current.filter((item) => item !== t)
          : current
        : [...current, t];
      return { ...prev, topology: updated };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.projectName) errs.projectName = "Project name is required";
    if (!formData.callerName.trim()) errs.callerName = "Caller name is required";
    if (!formData.smName) errs.smName = "SM name is required";
    if (!formData.clientName.trim()) errs.clientName = "Client name is required";
    if (!formData.svNumber.trim()) {
      errs.svNumber = "6-digit SV Number is required";
    } else if (formData.svNumber.trim().length !== 6 || !/^\d{6}$/.test(formData.svNumber.trim())) {
      errs.svNumber = "SV Number must be exactly 6 numeric digits";
    }
    if (!formData.visitDate) errs.visitDate = "Visit date is required";
    if (!formData.cpFirmName.trim()) errs.cpFirmName = "CP Firm Name is required";
    if (!formData.topology || formData.topology.length === 0) {
      errs.topology = "Select at least one topology";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required visit fields");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        leadId: leadId || null,
        employeeId: employee?._id,
      };

      const res = await submitVisit(payload);
      if (res.success) {
        toast.success("Visit form submitted & tagged successfully!");
        navigate("/visits");
      } else {
        toast.error(res.message || "Failed to submit visit form");
      }
    } catch (err) {
      console.error("Submit visit form error:", err);
      toast.error(err.response?.data?.message || "Failed to submit visit form");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-36 pt-1">
        {/* Top App Bar */}
        <div className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24110c] text-[#D9C4AA] border border-[#381C14] hover:text-[#FBFAF6] active:scale-95 transition-all shadow-sm"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-[#FBFAF6] leading-tight">Fill Visit Form</h1>
            <p className="text-[12px] text-[#D9C4AA]">Official Site Visit Tagging & Record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ════════════════ SECTION 1: PROJECT & CALLER ASSIGNMENT ════════════════ */}
          <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#381C14] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#E9D5BD]">
                <FiHome className="h-4 w-4" />
              </div>
              <h2 className="text-[13px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                Site & Sourcing Details
              </h2>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Project Name <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                value={formData.projectName}
                onChange={(v) => handleChange("projectName", v)}
                options={VISIT_PROJECTS}
                placeholder="Select Project"
                label="Project"
              />
              {errors.projectName && (
                <p className="mt-1 text-[11px] text-red-400">{errors.projectName}</p>
              )}
            </div>

            {/* Caller Name (Auto-filled from Employee, cannot be changed) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Caller Name <span className="text-red-400">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D9C4AA]/70 bg-[#381C14] px-2 py-0.5 rounded-md border border-[#381C14]">
                  <FiLock className="h-2.5 w-2.5 text-[#AE9475]" />
                  Auto-filled (Employee)
                </span>
              </div>
              <div className="mt-1.5 h-11 w-full flex items-center justify-between rounded-2xl border border-[#381C14] bg-[#1a0d09]/70 px-3.5 text-xs text-[#FBFAF6] select-none cursor-not-allowed">
                <div className="flex items-center gap-2 truncate font-semibold">
                  <FiUser className="h-3.5 w-3.5 text-[#AE9475] shrink-0" />
                  <span className="truncate">{formData.callerName}</span>
                </div>
                <FiLock className="h-3.5 w-3.5 text-[#AE9475] shrink-0 ml-2" />
              </div>
            </div>

            {/* SM Name (Auto-filled Sourcing Manager, cannot be changed) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  SM Name (Sourcing Manager) <span className="text-red-400">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D9C4AA]/70 bg-[#381C14] px-2 py-0.5 rounded-md border border-[#381C14]">
                  <FiLock className="h-2.5 w-2.5 text-[#AE9475]" />
                  Auto-assigned
                </span>
              </div>
              <div className="mt-1.5 h-11 w-full flex items-center justify-between rounded-2xl border border-[#381C14] bg-[#1a0d09]/70 px-3.5 text-xs text-[#FBFAF6] select-none cursor-not-allowed">
                <div className="flex items-center gap-2 truncate font-semibold">
                  <FiBriefcase className="h-3.5 w-3.5 text-[#AE9475] shrink-0" />
                  <span className="truncate">{formData.smName}</span>
                </div>
                <FiLock className="h-3.5 w-3.5 text-[#AE9475] shrink-0 ml-2" />
              </div>
            </div>

            {/* CP Firm Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                CP Firm Name <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-1.5">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AE9475]" />
                <input
                  type="text"
                  value={formData.cpFirmName}
                  onChange={(e) => handleChange("cpFirmName", e.target.value)}
                  placeholder="Channel Partner Firm Name"
                  className="h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] pl-10 pr-4 text-xs font-semibold text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22]"
                />
              </div>
              {errors.cpFirmName && (
                <p className="mt-1 text-[11px] text-red-400">{errors.cpFirmName}</p>
              )}
            </div>
          </div>

          {/* ════════════════ SECTION 2: CLIENT INFORMATION ════════════════ */}
          <div className="rounded-[28px] border border-[#381C14] bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#381C14] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#E9D5BD]">
                <FiUser className="h-4 w-4" />
              </div>
              <h2 className="text-[13px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                Client Information
              </h2>
            </div>

            {/* Client Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Client Name <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-1.5">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AE9475]" />
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  placeholder="e.g. Rajkumar Sharma"
                  className="h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] pl-10 pr-4 text-xs font-semibold text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22]"
                />
              </div>
              {errors.clientName && (
                <p className="mt-1 text-[11px] text-red-400">{errors.clientName}</p>
              )}
            </div>

            {/* Client Type Toggle */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA] mb-1.5">
                Client Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VISIT_CLIENT_TYPES.map((type) => {
                  const isSelected = formData.clientType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange("clientType", type)}
                      className={`h-11 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                        isSelected
                          ? "bg-[#962A22] text-[#FBFAF6] border-[#962A22] shadow-[0_4px_14px_rgba(150,42,34,0.4)]"
                          : "bg-[#1a0d09] border-[#381C14] text-[#AE9475] hover:bg-[#2e1710]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#AE9475]"
                        }`}
                      />
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Number Last 4 Digits & Visit Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Client Phone (Last 4 Digits)
              </label>
              <div className="relative mt-1.5">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AE9475]" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={formData.clientNumberLast4}
                  onChange={(e) =>
                    handleChange("clientNumberLast4", e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 5645"
                  className="h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] pl-9 pr-3 text-xs font-mono font-bold text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22]"
                />
              </div>
            </div>

            {/* Visit Date Field with Interactive Picker & Presets */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                  Visit Date <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleChange("visitDate", todayStr)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                      formData.visitDate === todayStr
                        ? "bg-[#962A22] text-[#FBFAF6] border border-[#962A22]"
                        : "bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6] border border-[#381C14]"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      handleChange("visitDate", d.toISOString().split("T")[0]);
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1a0d09] text-[#AE9475] hover:text-[#FBFAF6] border border-[#381C14] transition-colors"
                  >
                    Yesterday
                  </button>
                </div>
              </div>

              <div
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.();
                  } catch {
                    dateInputRef.current?.focus();
                  }
                }}
                className={`relative mt-1.5 flex h-11 w-full items-center justify-between rounded-2xl border px-3.5 cursor-pointer select-none transition-colors ${
                  errors.visitDate
                    ? "border-red-500 bg-[#1a0d09]"
                    : "border-[#381C14] bg-[#1a0d09] hover:border-[#962A22]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FiCalendar className="text-[#D9C4AA] shrink-0 text-sm" />
                  <span className="text-xs font-bold text-[#FBFAF6] truncate">
                    {formatDisplayDate(formData.visitDate)}
                  </span>
                </div>

                <span className="text-[10px] font-extrabold text-[#AE9475] shrink-0 uppercase tracking-wider">
                  Select ▾
                </span>

                {/* Hidden native date input that covers the whole box and always triggers native calendar */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => handleChange("visitDate", e.target.value)}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              {errors.visitDate && (
                <p className="mt-1 text-[11px] text-red-400">{errors.visitDate}</p>
              )}
            </div>
          </div>

          {/* ════════════════ SECTION 3: SV NUMBER & TOPOLOGY ════════════════ */}
          <div className="rounded-[28px] border-2 border-[#962A22]/50 bg-[#24110c] p-5 shadow-[0_12px_28px_rgba(150,42,34,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#381C14] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#381C14] text-[#E9D5BD]">
                  <FiMapPin className="h-4 w-4" />
                </div>
                <h2 className="text-[13px] font-bold text-[#FBFAF6] uppercase tracking-wider">
                  SV Number & Topology
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#962A22]/30 text-[#E9D5BD] border border-[#962A22]/40">
                Critical
              </span>
            </div>

            {/* SV Number (Highlighted - Strictly 6 Digits) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#E9D5BD]">
                  SV Number (6 Digits) <span className="text-red-400">*</span>
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    formData.svNumber.length === 6
                      ? "bg-[#962A22]/30 text-[#E9D5BD] border-[#962A22]/50"
                      : "bg-[#1a0d09] text-[#AE9475] border-[#381C14]"
                  }`}
                >
                  {formData.svNumber.length === 6
                    ? "✓ 6 Digits Complete"
                    : `${formData.svNumber.length} / 6 Digits`}
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={formData.svNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  handleChange("svNumber", val);
                }}
                placeholder="e.g. 583920"
                className={`mt-1.5 h-12 w-full rounded-2xl border-2 bg-[#1a0d09] px-4 font-mono text-base font-black tracking-widest text-[#FBFAF6] placeholder-[#AE9475] outline-none transition-colors ${
                  errors.svNumber
                    ? "border-red-500"
                    : formData.svNumber.length === 6
                    ? "border-[#962A22] focus:border-[#962A22]"
                    : "border-[#381C14] focus:border-[#962A22]"
                }`}
              />
              {errors.svNumber ? (
                <p className="mt-1 text-[11px] text-red-400">{errors.svNumber}</p>
              ) : (
                <p className="mt-1 text-[10px] text-[#AE9475]">
                  Enter the official 6-digit site visit number for client tagging.
                </p>
              )}
            </div>

            {/* Topology Checkbox Pills */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA] mb-1.5">
                Topology <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {VISIT_TOPOLOGIES.map((topo) => {
                  const isSelected = formData.topology.includes(topo);
                  return (
                    <button
                      key={topo}
                      type="button"
                      onClick={() => toggleTopology(topo)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-[#962A22] text-[#FBFAF6] border-[#962A22] shadow-sm"
                          : "bg-[#1a0d09] border-[#381C14] text-[#D9C4AA] hover:bg-[#2e1710]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected ? "bg-[#FBFAF6]" : "bg-[#AE9475]"
                        }`}
                      />
                      <span>{topo}</span>
                    </button>
                  );
                })}
              </div>
              {errors.topology && (
                <p className="mt-1 text-[11px] text-red-400">{errors.topology}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#D9C4AA]">
                Visit Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Client feedback, specific flat preferences, discount requests..."
                className="mt-1.5 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] p-3 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22]"
              />
            </div>
          </div>

          {/* ════════════════ FIXED BOTTOM SUBMIT BUTTON ════════════════ */}
          <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-[390px] px-4 pointer-events-none">
            <button
              type="submit"
              disabled={submitting}
              className="pointer-events-auto flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] text-sm font-black text-[#FBFAF6] shadow-[0_12px_28px_rgba(150,42,34,0.5)] active:scale-[0.98] border border-[#D9C4AA]/30 disabled:opacity-60 transition-all"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting & Tagging...</span>
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" />
                  <span>Submit Visit Form</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

