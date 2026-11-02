import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLeadById, getLeadInteractions } from "../../services/leadService";
import { format } from "date-fns";
import { 
  FiArrowLeft, FiPhone, FiMail, FiMapPin, FiBriefcase, 
  FiTag, FiClock, FiMessageCircle, FiUser 
} from "react-icons/fi";
import { motion } from "framer-motion";

function maskPhone(phone = "") {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length <= 4) return `•••• ${digits}`;
  return `•••• ${digits.slice(-4)}`;
}

const StatusBadge = ({ status }) => {
  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  switch (status?.toLowerCase()) {
    case "new": styles = "bg-blue-50 text-blue-600 border-blue-200"; break;
    case "contacted": styles = "bg-purple-50 text-purple-600 border-purple-200"; break;
    case "interested": styles = "bg-emerald-50 text-emerald-600 border-emerald-200"; break;
    case "follow-up": styles = "bg-orange-50 text-orange-600 border-orange-200"; break;
    case "visit scheduled": styles = "bg-teal-50 text-teal-600 border-teal-200"; break;
    case "won": styles = "bg-green-100 text-green-700 border-green-300"; break;
    case "lost": styles = "bg-red-50 text-red-600 border-red-200"; break;
  }
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getLeadById(id);
        if (res && res.data) setLead(res.data);
        const ir = await getLeadInteractions(id);
        if (ir && ir.data) setInteractions(ir.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto min-h-screen">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <FiArrowLeft /> Back to Leads
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          </div>
        )}

        {!loading && !lead && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-medium shadow-sm">
            Lead not found or you don't have permission to view it.
          </div>
        )}

        {!loading && lead && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner">
                    {(lead.name || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{lead.name}</h1>
                    <div className="flex items-center flex-wrap gap-3 mt-3">
                      <StatusBadge status={lead.status} />
                      <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                        <FiClock className="w-4 h-4" /> 
                        Created on {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <FiUser className="text-blue-500" /> Lead Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Phone</label>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <FiPhone className="text-slate-400 dark:text-slate-500" /> {maskPhone(lead.phone)}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Location</label>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <FiMapPin className="text-slate-400 dark:text-slate-500" /> {lead.location || "—"}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Source</label>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <FiTag className="text-slate-400 dark:text-slate-500" /> {lead.source || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <FiBriefcase className="text-purple-500" /> Requirement Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Project</label>
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{lead.project || "—"}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Configuration</label>
                      <div className="text-slate-700 dark:text-slate-300 font-medium">{lead.configuration || "—"}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Budget</label>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <span className="text-slate-400 dark:text-slate-500 font-bold text-xs select-none">₹</span> {lead.budget || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactions Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <FiMessageCircle className="text-emerald-500" /> Interaction History
                  </h2>
                  
                  {interactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                      No interactions recorded yet.
                    </div>
                  ) : (
                    <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                      {interactions.map((it) => (
                        <div key={it._id} className="relative pl-6">
                          <div className="absolute left-[-5px] top-2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 shadow-sm"></div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-600">{it.type}</span>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {format(new Date(it.createdAt), "MMM dd, yyyy • hh:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 mt-3 leading-relaxed">{it.clientResponse}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              <div className="bg-white dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 font-medium shadow-sm">
                                <span className="text-slate-400 uppercase tracking-wide mr-2 text-[10px]">Outcome:</span>
                                <span className="text-slate-700 dark:text-slate-300">{it.outcome}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                                <FiUser className="w-3.5 h-3.5" /> {it.employeeName}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Assigned To & Next Action */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 block">Assigned Representative</h2>
                  {lead.assignedTo ? (
                    <div className="flex items-center gap-4">
                      {lead.assignedTo.profileImage ? (
                        <img
                          src={lead.assignedTo.profileImage}
                          alt={lead.assignedTo.firstName}
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xl font-bold border border-slate-200 dark:border-slate-700">
                          {lead.assignedTo.firstName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{lead.assignedTo.firstName} {lead.assignedTo.lastName}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 capitalize">{lead.assignedTo.role || "Employee"}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic">Unassigned</div>
                  )}
                </div>

                {lead.nextFollowUp && lead.nextFollowUp.date && (
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200/50">
                    <h2 className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <FiClock /> Next Action
                    </h2>
                    <div className="text-2xl font-extrabold mb-1">
                      {format(new Date(lead.nextFollowUp.date), "MMM dd, yyyy")}
                    </div>
                    {lead.nextFollowUp.time && (
                      <div className="text-sm font-medium text-blue-100 mb-4">{lead.nextFollowUp.time}</div>
                    )}
                    <div className="bg-white/10 rounded-xl p-3.5 text-sm font-medium backdrop-blur-sm border border-white/20 leading-relaxed shadow-inner">
                      {lead.nextFollowUp.action || "Follow up with client"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
