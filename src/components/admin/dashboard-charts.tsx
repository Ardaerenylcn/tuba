"use client";

import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  rezervasyon: number;
  gelir: number;
}

interface ProgramData {
  name: string;
  value: number;
}

interface Props {
  monthly: MonthlyData[];
  programs: ProgramData[];
}

const COLORS = ["#b8813a", "#78716c", "#d49a50", "#a8a29e"];

export function DashboardCharts({ monthly, programs }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Aylık Rezervasyonlar */}
      <div className="col-span-2 border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-4 text-xs font-medium text-[var(--text-muted)]">AYLIK REZERVASYONlar (Son 6 Ay)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthly} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-200)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-stone-400)" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-stone-400)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ border: "1px solid var(--color-stone-200)", borderRadius: 0, fontSize: 12 }}
              cursor={{ fill: "var(--color-stone-100)" }}
            />
            <Bar dataKey="rezervasyon" fill="var(--color-stone-700)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Program Dağılımı */}
      <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-4 text-xs font-medium text-[var(--text-muted)]">PROGRAM DAĞILIMI</p>
        {programs.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-xs text-[var(--text-disabled)]">Veri yok</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={programs} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {programs.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ border: "1px solid var(--color-stone-200)", borderRadius: 0, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Aylık Gelir */}
      <div className="col-span-3 border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-4 text-xs font-medium text-[var(--text-muted)]">AYLIK GELİR — ₺ (Son 6 Ay)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b8813a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#b8813a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stone-200)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-stone-400)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-stone-400)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ border: "1px solid var(--color-stone-200)", borderRadius: 0, fontSize: 12 }}
              formatter={(v: number) => [`${v.toLocaleString("tr-TR")} ₺`, "Gelir"]}
            />
            <Area type="monotone" dataKey="gelir" stroke="#b8813a" strokeWidth={1.5} fill="url(#gelirGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
