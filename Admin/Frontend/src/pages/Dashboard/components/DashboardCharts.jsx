import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PRODUCTIVITY_COLORS = {
  "New Leads": "#3b82f6",
  Visits: "#8b5cf6",
  "Follow-ups": "#10b981",
};

export default function DashboardCharts({ weeklyData = [] }) {
  const latestDay = weeklyData[weeklyData.length - 1] ?? {};
  const productivityBreakdown = [
    {
      name: "New Leads",
      value: latestDay["New Leads"] ?? 0,
      color: PRODUCTIVITY_COLORS["New Leads"],
    },
    {
      name: "Visits",
      value: latestDay.Visits ?? 0,
      color: PRODUCTIVITY_COLORS.Visits,
    },
    {
      name: "Follow-ups",
      value: latestDay["Follow-ups"] ?? 0,
      color: PRODUCTIVITY_COLORS["Follow-ups"],
    },
  ];
  const totalToday = productivityBreakdown.reduce((a, c) => a + c.value, 0);

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="panel-surface rounded-3xl p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Productivity Trend
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Last 6 days · new leads, visits, and follow-ups
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-lg">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Bar
                dataKey="New Leads"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                dataKey="Visits"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                dataKey="Follow-ups"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-surface rounded-3xl p-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Today’s Momentum
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Lead activity summary
          </p>
        </div>

        {totalToday === 0 ? (
          <div className="h-[180px] flex flex-col items-center justify-center text-center px-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No lead activity recorded yet today.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {productivityBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width:
                        totalToday > 0
                          ? `${(item.value / totalToday) * 100}%`
                          : "0%",
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-center">
          <span className="text-slate-400 dark:text-slate-500">
            Activity logged today:{" "}
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {totalToday}
          </span>
        </div>
      </div>
    </section>
  );
}
