import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../components/ui/Badge";
import { Card, CardHeader } from "../components/ui/Card";
import { useAppStore } from "../store/AppContext";
import { departments } from "../types/gate-pass";

export function DashboardPage() {
  const { passes } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);
  const stats = [
    { label: "Total Gate Passes", value: passes.length },
    { label: "Returnable", value: passes.filter((pass) => pass.gatePassType === "Returnable").length },
    { label: "Non Returnable", value: passes.filter((pass) => pass.gatePassType === "Non Returnable").length },
    { label: "Today's Passes", value: passes.filter((pass) => pass.date === today).length },
  ];
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = date.toISOString().slice(0, 7);
    return { month: date.toLocaleString("default", { month: "long" }), passes: passes.filter((pass) => pass.date.startsWith(key)).length };
  });
  const departmentUsage = departments.map((department) => ({
    department,
    passes: passes.filter((pass) => pass.department === department).length,
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card>
              <p className="text-sm text-[var(--muted)]">{stat.label}</p>
              <p className="mt-3 text-4xl font-bold text-[#0f5132]">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Monthly Statistics" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="greenArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0f5132" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0f5132" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="passes" stroke="#0f5132" fill="url(#greenArea)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Department Wise Usage" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dfe7e2" />
                <XAxis dataKey="department" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="passes" fill="#0f5132" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-[var(--muted)]">
              <tr><th className="py-3">Gate Pass No</th><th>Employee</th><th>Department</th><th>Date</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {passes.slice(0, 8).map((pass) => (
                <tr key={pass.id} className="border-t border-[var(--border)]">
                  <td className="py-3 font-semibold">{pass.gatePassNumber}</td>
                  <td>{pass.employeeName}</td>
                  <td>{pass.department}</td>
                  <td>{pass.date}</td>
                  <td>{pass.preparedTime || "-"}</td>
                  <td><Badge>{pass.status}</Badge></td>
                </tr>
              ))}
              {!passes.length && <tr><td colSpan={6} className="py-8 text-center text-[var(--muted)]">No activity yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
