import React, { useState, useEffect } from "react";
import {
  FiX,
  FiMapPin,
  FiExternalLink,
  FiAlertTriangle,
  FiSend,
  FiUser,
  FiPhone,
  FiCalendar,
  FiBriefcase,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  VISIT_PROJECTS,
  VISIT_CLIENT_TYPES,
  VISIT_TOPOLOGIES,
  VISIT_SM_NAMES,
  VISIT_CALLER_NAMES,
  buildPreFilledGoogleFormUrl,
  submitVisit,
} from "../../services/visitService";
import { useAuth } from "../../context/AuthContext";

export default function VisitFormModal({
  isOpen,
  onClose,
  initialLead = null,
  onSuccess,
}) {
  const { employee } = useAuth();

  const defaultCallerName = employee
    ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim().toUpperCase()
    : "AMAN VISHWAKARMA";

  const defaultSmName = employee?.sourcingManager?.trim().toUpperCase() ||
    employee?.sourcing?.trim().toUpperCase() ||
    VISIT_SM_NAMES[0];

  const todayStr = new Date().toISOString().split("T")[0];

  const [projectName, setProjectName] = useState(VISIT_PROJECTS[0]);
  const [callerName, setCallerName] = useState(defaultCallerName);
  const [smName, setSmName] = useState(defaultSmName);
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState("FAMILY");
  const [svNumber, setSvNumber] = useState("");
  const [clientNumberLast4, setClientNumberLast4] = useState("");
  const [visitDate, setVisitDate] = useState(todayStr);
  const [cpFirmName, setCpFirmName] = useState("Dosti Realty");
  const [topology, setTopology] = useState(["2BHK"]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialLead) {
      if (initialLead.name) setClientName(initialLead.name);
      if (initialLead.phone) {
        const digits = initialLead.phone.replace(/\D/g, "");
        if (digits.length >= 4) {
          setClientNumberLast4(digits.slice(-4));
        }
      }
      if (initialLead.project && VISIT_PROJECTS.includes(initialLead.project)) {
        setProjectName(initialLead.project);
      }
      if (initialLead.configuration) {
        const matched = VISIT_TOPOLOGIES.filter((t) =>
          initialLead.configuration.toUpperCase().includes(t)
        );
        if (matched.length > 0) setTopology(matched);
      }
    }
  }, [initialLead, isOpen]);

  useEffect(() => {
    if (employee && !callerName) {
      setCallerName(
        `${employee.firstName || ""} ${employee.lastName || ""}`.trim().toUpperCase()
      );
    }
  }, [employee]);

  if (!isOpen) return null;

  const toggleTopology = (item) => {
    setTopology((prev) =>
      prev.includes(item)
        ? prev.length > 1
          ? prev.filter((t) => t !== item)
          : prev
        : [...prev, item]
    );
  };

  const getFormData = () => ({
    projectName,
    callerName: callerName.trim() || defaultCallerName,
    smName,
    clientName: clientName.trim(),
    clientType,
    svNumber: svNumber.trim(),
    clientNumberLast4: clientNumberLast4.trim(),
    visitDate,
    cpFirmName: cpFirmName.trim() || "Dosti Realty",
    topology,
    leadId: initialLead?._id || null,
    notes: notes.trim(),
    employeeId: employee?._id,
  });

  const handleOpenGoogleFormPreFilled = () => {
    if (!svNumber) {
      toast.error("Please enter the SV Number first!");
      return;
    }
    const preFilled = buildPreFilledGoogleFormUrl(getFormData());
    window.open(preFilled, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!svNumber.trim() || svNumber.trim().length !== 6 || !/^\d{6}$/.test(svNumber.trim())) {
      toast.error("SV Number must be exactly 6 numeric digits (e.g. 583920)");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Client Name is required!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitVisit(getFormData());
      if (res.success) {
        toast.success(res.message || "Visit form submitted and synced to Google Forms!");
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || "Failed to submit visit form");
      }
    } catch (err) {
      console.error("Submit visit error:", err);
      toast.error(
        err.response?.data?.message || "Error submitting visit form. Please check network."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] bg-[#1a0d09] border border-[#381C14] shadow-2xl p-5 sm:p-6 text-[#FBFAF6] space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#381C14] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#962A22]/20 text-[#E9D5BD] border border-[#962A22]/40">
              <FiMapPin className="text-lg" />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-[#FBFAF6] leading-tight">
                Site Visit Tagging Form
              </h2>
              <p className="text-[11px] text-[#D9C4AA]">
                Official Google Form sync · SV tagging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#24110c] text-[#D9C4AA] hover:text-[#FBFAF6] border border-[#381C14] transition"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-2.5 rounded-2xl bg-[#24110c] border border-amber-500/35 p-3 text-xs text-amber-300">
          <FiAlertTriangle className="text-base shrink-0 mt-0.5 text-amber-400" />
          <div className="text-[11px] leading-relaxed text-[#D9C4AA]">
            <span className="font-bold text-amber-300">Tagging Notice:</span> Incomplete forms without valid SV Number will be rejected without exception.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Row 1: Project Name & Caller Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-2xl border border-[#381C14] bg-[#24110c] font-semibold text-[#FBFAF6] outline-none focus:border-[#962A22]"
              >
                {VISIT_PROJECTS.map((proj) => (
                  <option key={proj} value={proj} className="bg-[#24110c] text-[#FBFAF6]">
                    {proj}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Caller Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={callerName}
                readOnly
                className="w-full h-11 px-3 rounded-2xl border border-[#381C14] bg-[#24110c]/70 font-semibold text-[#FBFAF6] outline-none cursor-not-allowed uppercase"
              />
            </div>
          </div>

          {/* Row 2: SM Name & Client Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                SM Name (Sourcing Manager) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={smName}
                readOnly
                className="w-full h-11 px-3 rounded-2xl border border-[#381C14] bg-[#24110c]/70 font-semibold text-[#FBFAF6] outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Client Type <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                {VISIT_CLIENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setClientType(type)}
                    className={`flex-1 h-11 rounded-2xl font-bold transition flex items-center justify-center text-xs border ${
                      clientType === type
                        ? "bg-[#962A22] text-[#FBFAF6] border-[#D9C4AA]/30 shadow-sm"
                        : "bg-[#24110c] border-[#381C14] text-[#D9C4AA] hover:bg-[#381C14]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Client Name & SV Number (Highlighted) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Client Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-3.5 text-[#AE9475]" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full name of client"
                  required
                  className="w-full h-11 pl-9 pr-3 rounded-2xl border border-[#381C14] bg-[#24110c] font-semibold text-[#FBFAF6] outline-none focus:border-[#962A22]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#E9D5BD] mb-1 flex items-center justify-between">
                <span>
                  SV Number <span className="text-rose-400">*</span>
                </span>
                <span className="text-[9px] font-normal text-[#D9C4AA]">Required</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={svNumber}
                onChange={(e) => setSvNumber(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 583920"
                required
                className="w-full h-11 px-3 rounded-2xl border-2 border-[#962A22]/60 bg-[#962A22]/15 font-mono font-black text-[#FBFAF6] outline-none focus:border-[#962A22]"
              />
            </div>
          </div>

          {/* Row 4: Phone Last 4 Digits & Visit Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Client Phone (Last 4 Digits)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3.5 text-[#AE9475]" />
                <input
                  type="text"
                  maxLength={4}
                  value={clientNumberLast4}
                  onChange={(e) => setClientNumberLast4(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 5645"
                  className="w-full h-11 pl-9 pr-3 rounded-2xl border border-[#381C14] bg-[#24110c] font-mono font-semibold text-[#FBFAF6] outline-none focus:border-[#962A22]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
                Visit Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3.5 top-3.5 text-[#AE9475]" />
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  className="w-full h-11 pl-9 pr-3 rounded-2xl border border-[#381C14] bg-[#24110c] font-semibold text-[#FBFAF6] outline-none focus:border-[#962A22]"
                />
              </div>
            </div>
          </div>

          {/* Row 5: CP Firm Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1">
              CP Firm Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-3.5 top-3.5 text-[#AE9475]" />
              <input
                type="text"
                value={cpFirmName}
                onChange={(e) => setCpFirmName(e.target.value)}
                placeholder="Channel Partner Firm Name"
                required
                className="w-full h-11 pl-9 pr-3 rounded-2xl border border-[#381C14] bg-[#24110c] font-semibold text-[#FBFAF6] outline-none focus:border-[#962A22]"
              />
            </div>
          </div>

          {/* Row 6: Topology Checkboxes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#D9C4AA] mb-1.5">
              Topology <span className="text-rose-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VISIT_TOPOLOGIES.map((topo) => {
                const isSelected = topology.includes(topo);
                return (
                  <button
                    key={topo}
                    type="button"
                    onClick={() => toggleTopology(topo)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border text-xs ${
                      isSelected
                        ? "bg-[#962A22]/25 text-[#FBFAF6] border-[#962A22]/60"
                        : "bg-[#24110c] border-[#381C14] text-[#D9C4AA] hover:bg-[#381C14]"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? "bg-[#E9D5BD]" : "bg-[#AE9475]"
                      }`}
                    />
                    {topo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-[#381C14] flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] font-black text-xs flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(150,42,34,0.4)] active:scale-[0.98] disabled:opacity-60 transition-all border border-[#D9C4AA]/20"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting to Google Form...
                </>
              ) : (
                <>
                  <FiSend className="text-sm" />
                  Submit & Sync Tagging Form
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenGoogleFormPreFilled}
                className="flex-1 h-10 rounded-2xl border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:text-[#FBFAF6] transition font-bold text-[11px] flex items-center justify-center gap-1.5"
              >
                <FiExternalLink className="text-xs text-[#E9D5BD]" />
                Pre-Filled Form Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-10 rounded-2xl border border-[#381C14] bg-[#24110c] text-[#D9C4AA] hover:text-[#FBFAF6] transition font-medium text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting to Google Form...
                </>
              ) : (
                <>
                  <FiSend className="text-sm" />
                  Submit & Sync Tagging Form
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOpenGoogleFormPreFilled}
                className="flex-1 h-10 rounded-2xl border border-[#243552] bg-[#141e31] text-[#9db4db] hover:text-white transition font-bold text-[11px] flex items-center justify-center gap-1.5"
              >
                <FiExternalLink className="text-xs text-blue-400" />
                Pre-Filled Form Link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-10 rounded-2xl border border-[#243552] bg-[#141e31] text-[#7d93ba] hover:text-white transition font-medium text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
