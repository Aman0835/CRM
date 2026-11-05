import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiPlus,
  FiCheckCircle,
  FiSearch,
  FiCalendar,
  FiUser,
  FiPhone,
  FiBriefcase,
  FiSend,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyVisits } from "../../services/visitService";
import { subscribeRealtime } from "../../services/realtime";

export default function VisitsPage() {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedSv, setCopiedSv] = useState(null);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await getMyVisits({ search });
      if (res.success) {
        setVisits(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load visits:", err);
      toast.error("Failed to fetch visit records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [search]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event?.type === "visit") {
        fetchVisits();
      }
    });
    return () => unsubscribe();
  }, []);

  const totalVisits = visits.length;
  const thisMonthVisits = visits.filter((v) => {
    if (!v.visitDate) return false;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return v.visitDate.startsWith(currentMonth);
  }).length;

  const uniqueProjects = new Set(visits.map((v) => v.projectName)).size;

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleCopySv = (svNumber) => {
    if (!svNumber) return;
    navigator.clipboard.writeText(svNumber);
    setCopiedSv(svNumber);
    toast.success(`Copied SV: ${svNumber}`);
    setTimeout(() => setCopiedSv(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-12 pt-1">
        {/* Top App Bar */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24110c] text-[#D9C4AA] border border-[#381C14] hover:text-[#FBFAF6] active:scale-95 transition-all shadow-sm"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[20px] font-black text-[#FBFAF6] leading-tight">Site Visits</h1>
              <p className="text-[12px] text-[#D9C4AA]">SV Tagging & History</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/visits/new")}
            className="flex items-center gap-1.5 rounded-2xl bg-[#962A22] hover:bg-[#7e221b] px-3.5 py-2 text-xs font-bold text-[#FBFAF6] shadow-[0_8px_18px_rgba(150,42,34,0.35)] active:scale-[0.97] border border-[#D9C4AA]/20 transition-all"
          >
            <FiPlus className="h-4 w-4" />
            <span>New Visit</span>
          </button>
        </div>

        {/* Executive Metric Summary Card */}
        <div className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-3 divide-x divide-[#381C14] text-center">
            <div className="px-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#D9C4AA]">
                Total Tagged
              </p>
              <p className="mt-1 text-[22px] font-black text-[#FBFAF6] leading-none">
                {totalVisits}
              </p>
              <p className="text-[10px] text-[#AE9475] mt-1">Recorded</p>
            </div>

            <div className="px-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#D9C4AA]">
                This Month
              </p>
              <p className="mt-1 text-[22px] font-black text-[#E9D5BD] leading-none">
                {thisMonthVisits}
              </p>
              <p className="text-[10px] text-[#AE9475] font-bold mt-1">Active</p>
            </div>

            <div className="px-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#D9C4AA]">
                Dosti Sites
              </p>
              <p className="mt-1 text-[22px] font-black text-[#D9C4AA] leading-none">
                {uniqueProjects}
              </p>
              <p className="text-[10px] text-[#AE9475] mt-1">Projects</p>
            </div>
          </div>
        </div>

        {/* Section Header & Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[14px] font-black text-[#FBFAF6]">Submitted Visits</h2>
            <span className="text-[11px] font-bold text-[#D9C4AA] bg-[#1a0d09] px-2.5 py-0.5 rounded-full border border-[#381C14]">
              {totalVisits} {totalVisits === 1 ? "record" : "records"}
            </span>
          </div>

          {/* Search Field */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AE9475] h-4 w-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SV number, client, project..."
              className="h-11 w-full rounded-2xl border border-[#381C14] bg-[#1a0d09] pl-10 pr-4 text-xs text-[#FBFAF6] placeholder-[#AE9475] outline-none focus:border-[#962A22] transition-colors"
            />
          </div>

          {loading ? (
            <div className="flex h-44 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#962A22] border-t-transparent" />
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#381C14] bg-[#1a0d09] p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#962A22]/20 text-[#E9D5BD] mx-auto mb-3 border border-[#962A22]/40">
                <FiMapPin className="text-xl" />
              </div>
              <h4 className="text-sm font-black text-[#FBFAF6]">No Tagged Visits Yet</h4>
              <p className="text-xs text-[#D9C4AA] max-w-xs mx-auto mt-1 leading-relaxed">
                When you conduct a site visit, click below to fill the visit form and log the SV
                number.
              </p>
              <button
                type="button"
                onClick={() => navigate("/visits/new")}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#962A22] hover:bg-[#7e221b] text-[#FBFAF6] font-bold text-xs shadow-md shadow-[#962A22]/30 border border-[#D9C4AA]/20 transition"
              >
                <FiPlus /> Fill First Visit Form
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => {
                const isCopied = copiedSv === v.svNumber;
                return (
                  <div
                    key={v._id}
                    className="rounded-[24px] border border-[#381C14] bg-[#24110c] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.3)] hover:border-[#962A22]/50 transition-all space-y-3"
                  >
                    {/* Top Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[16px] font-black text-[#FBFAF6]">
                            {v.clientName}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#1a0d09] text-[#D9C4AA] border border-[#381C14]">
                            {v.clientType || "FAMILY"}
                          </span>
                        </div>
                        {v.clientNumberLast4 && (
                          <p className="text-[11px] font-mono text-[#AE9475] mt-0.5">
                            Phone: •••• {v.clientNumberLast4}
                          </p>
                        )}
                      </div>

                      {/* SV Number Pill Badge with Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopySv(v.svNumber)}
                        title="Click to copy SV Number"
                        className="shrink-0 flex items-center gap-1 font-mono text-xs font-black text-[#FBFAF6] bg-[#962A22] border border-[#D9C4AA]/40 px-2.5 py-1 rounded-xl shadow-xs hover:bg-[#7e221b] transition-colors"
                      >
                        {isCopied ? (
                          <FiCheck className="text-emerald-400 text-xs" />
                        ) : (
                          <FiCopy className="text-[#E9D5BD] text-[10px]" />
                        )}
                        <span>{v.svNumber}</span>
                      </button>
                    </div>

                    {/* Middle Details Strip */}
                    <div className="rounded-[16px] bg-[#1a0d09] p-3 border border-[#381C14]/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#FBFAF6] font-bold truncate">
                          <FiMapPin className="text-[#D9C4AA] shrink-0" />
                          <span className="truncate">{v.projectName}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {(v.topology || []).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#381C14] text-[#E9D5BD] border border-[#AE9475]/30"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#AE9475] pt-1 border-t border-[#381C14]">
                        <div className="truncate">
                          <span className="text-[#AE9475]">SM: </span>
                          <span className="font-semibold text-[#FBFAF6]">{v.smName}</span>
                        </div>
                        <div className="truncate text-right">
                          <span className="text-[#AE9475]">Caller: </span>
                          <span className="font-semibold text-[#FBFAF6]">{v.callerName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer: Date & Sync Status */}
                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-[#AE9475]">
                          <FiCalendar className="text-[#AE9475]" />
                          {v.visitDate}
                        </span>

                        {v.googleFormSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E9D5BD] bg-[#381C14] border border-[#AE9475]/40 px-2 py-0.5 rounded-full">
                            <FiCheckCircle className="text-xs text-[#1de58e]" /> Synced to Database
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D9C4AA] bg-[#381C14] border border-[#AE9475]/30 px-2 py-0.5 rounded-full">
                            <FiCheckCircle className="text-xs text-[#D9C4AA]" /> Logged in CRM
                          </span>
                        )}
                      </div>

                      {v.cpFirmName && (
                        <span className="text-[10px] font-bold text-[#AE9475] truncate max-w-[140px]">
                          CP: {v.cpFirmName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
