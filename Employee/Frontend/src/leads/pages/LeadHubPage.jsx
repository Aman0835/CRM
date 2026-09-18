import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUserPlus, FiUsers, FiCalendar, FiClock } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LeadOptionCard from "../components/LeadOptionCard";
import { getMyLeads } from "../services/leadService";

export default function LeadHubPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalActive: 0, todaysFollowUps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const res = await getMyLeads({ limit: 1 });
        if (isMounted && res && res.summary) {
          setSummary(res.summary);
        }
      } catch (err) {
        console.warn("Unable to load summary stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6 pt-1">
        {/* Top Header */}
        <div className="flex items-center gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#182338] text-[#8ea4cb] hover:text-white transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-white">Leads</h1>
            <p className="text-[13px] text-[#7d93ba]">Manage your client leads</p>
          </div>
        </div>

        {/* Quick Summary Section */}
        <div className="grid grid-cols-2 gap-3 px-1">
          <div className="rounded-[22px] border border-[#243552] bg-[#1d2840] p-4">
            <div className="flex items-center gap-2 text-[#60a5fa]">
              <FiCalendar className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Follow-ups</span>
            </div>
            <p className="mt-2 text-[26px] font-black text-white">
              {loading ? "--" : summary.todaysFollowUps}
            </p>
            <p className="mt-0.5 text-[11px] text-[#7d93ba]">Requires client touchpoint</p>
          </div>

          <div className="rounded-[22px] border border-[#243552] bg-[#1d2840] p-4">
            <div className="flex items-center gap-2 text-[#34d399]">
              <FiUsers className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Leads</span>
            </div>
            <p className="mt-2 text-[26px] font-black text-white">
              {loading ? "--" : summary.totalActive}
            </p>
            <p className="mt-0.5 text-[11px] text-[#7d93ba]">In active pipeline</p>
          </div>
        </div>

        {/* Main Action Section: "What do you want to do?" */}
        <div className="space-y-3 px-1">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6e85ab]">
            Quick Actions
          </p>

          <LeadOptionCard
            title="Create New Lead"
            description="Add a new client, their property requirements, and record the first conversation."
            icon={FiUserPlus}
            tone="primary"
            onClick={() => navigate("/leads/new")}
          />

          <LeadOptionCard
            title="My Leads"
            description="View and manage your assigned clients, search pipeline, and review follow-ups."
            icon={FiUsers}
            tone="secondary"
            badge={summary.totalActive ? `${summary.totalActive} Active` : undefined}
            onClick={() => navigate("/leads/my")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}