import { FiClock, FiTrendingUp } from "react-icons/fi";

export default function DashboardBottomRow({
  upcomingAppointments,
  topBarbers,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="panel-surface rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
          Today’s Follow-ups
        </h3>
        <div className="space-y-3">
          {upcomingAppointments.map((appointment, i) => (
            <div
              key={`${appointment.client}-${i}`}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/60 transition bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
                  <FiClock />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                    {appointment.client}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-505 mt-0.5">
                    {appointment.service}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-semibold block">
                  {appointment.time}
                </span>
                <span className="text-slate-450 dark:text-slate-500 mt-0.5 block font-bold uppercase text-[9px] tracking-wide">
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
          {upcomingAppointments.length === 0 && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
              No follow-ups scheduled for today yet.
            </p>
          )}
        </div>
      </div>

      <div className="panel-surface rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
          Top Lead Sources
        </h3>
        <div className="space-y-3.5">
          {topBarbers.map((source, index) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                  {index + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {source.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {source.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                <FiTrendingUp className="text-[11px]" />
                <span>{source.count}</span>
              </div>
            </div>
          ))}
          {topBarbers.length === 0 && (
            <p className="text-center text-xs text-slate-450 dark:text-slate-500 py-6">
              No lead sources recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
