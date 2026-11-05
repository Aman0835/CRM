import {
  Line,
  LineChart,
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
};

export default function DashboardCharts({ weeklyData = [], selectedMonth }) {
  const productivityBreakdown = [
    {
      name: "New Leads",
      value: weeklyData.reduce((total, day) => total + (day["New Leads"] ?? 0), 0),
      color: PRODUCTIVITY_COLORS["New Leads"],
    },
    {
      name: "Visits",
      value: weeklyData.reduce((total, day) => total + (day.Visits ?? 0), 0),
      color: PRODUCTIVITY_COLORS.Visits,
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
              Current month · new leads and visits
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-lg">
            {new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={48}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip cursor={{ stroke: "rgba(148, 163, 184, 0.3)" }} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="New Leads"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Visits"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-surface rounded-3xl p-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Selected Month Summary
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Lead and visit totals
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
