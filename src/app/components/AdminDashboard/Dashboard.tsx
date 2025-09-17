// components/Dashboard.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { BsPatchCheck } from "react-icons/bs";

/* ----------------------------- Types ----------------------------- */
type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accentClass?: string;
  valueClass?: string;
};

/* ----------------------- Small Reusable UI ----------------------- */
const StatCard = ({
  title,
  value,
  icon,
  accentClass = "text-slate-500",
  valueClass = "",
}: StatCardProps) => (
  <div className="w-90 sm:w-94 h-48 bg-white/75 rounded-xl shadow-[0px_12px_16px_-4px_rgba(12,26,36,0.04)] border border-white backdrop-blur-md p-5 flex flex-col gap-3">
    <div className={`inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-50 ${accentClass}`}>
      <div className="[&>*]:h-5 [&>*]:w-5 [&>*]:stroke-current">{icon}</div>
    </div>
    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    <p className={`text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
  </div>
);

const LegendItem = ({ colorClass, label }: { colorClass: string; label: string }) => (
  <div className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded ${colorClass}`} />
    <span className="text-xs text-neutral-700">{label}</span>
  </div>
);

function FundUtilizedCard() {
  const bars = [
    { m: 'Jan', v: 9, color: 'bg-slate-200' },
    { m: 'Feb', v: 24, color: 'bg-slate-200' },
    { m: 'Mar', v: 16, color: 'bg-gradient-to-l from-green-800 to-emerald-500', badge: '50 Million' },
    { m: 'Apr', v: 11, color: 'bg-slate-200' },
    { m: 'May', v: 14, color: 'bg-slate-200' },
    { m: 'Jun', v: 28, color: 'bg-gradient-to-br from-indigo-600 to-indigo-500', badge: '5 Million' },
    { m: 'Jul', v: 12, color: 'bg-slate-200' },
    { m: 'Aug', v: 24, color: 'bg-slate-200' },
    { m: 'Sep', v: 6, color: 'bg-slate-200' },
    { m: 'Oct', v: 20, color: 'bg-gradient-to-l from-indigo-500 to-fuchsia-300', badge: '2 Million' },
    { m: 'Nov', v: 10, color: 'bg-slate-200' },
    { m: 'Dec', v: 16, color: 'bg-slate-200' },
  ];
  const maxV = Math.max(...bars.map(b => b.v)) || 1;

  return (
    <div className="relative bg-white rounded-md shadow-[0px_8px_16px_0px_rgba(143,149,178,0.15)] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-neutral-900 text-base sm:text-lg font-bold">Fund Utilized</h3>
      </div>
      <div className="my-3 h-px w-full bg-slate-200" />
      <div className="text-slate-900 text-2xl sm:text-3xl font-bold">80 Millions</div>
      <div className="mt-4">
        <div className="h-40 sm:h-56 md:h-64 overflow-x-auto">
          <div className="min-w-[700px] sm:min-w-0 flex h-full items-end justify-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4">
            {bars.map((b, idx) => {
              const hPct = (b.v / maxV) * 100;
              return (
                <div key={idx} className="flex h-full flex-col-reverse items-center relative group">
                  <div
                    className={`w-4 sm:w-5 md:w-6 lg:w-7 rounded-md ${b.color}`}
                    style={{ height: `${hPct}%` }}
                    title={`${b.m}: ${b.v}M`}
                  />
                  <span className="mb-1 text-[10px] sm:text-xs text-slate-400">{b.m}</span>
                  {b.badge && (
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-3 py-1 rounded-md bg-blue-950 text-white text-[10px] sm:text-xs font-bold">
                        {b.badge}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
        <LegendItem colorClass="bg-gradient-to-l from-green-800 to-emerald-400" label="Scheme 1" />
        <LegendItem colorClass="bg-gradient-to-br from-indigo-600 to-indigo-500" label="Scheme 2" />
        <LegendItem colorClass="bg-gradient-to-br from-fuchsia-300 to-indigo-500" label="Scheme 3" />
      </div>
    </div>
  );
}

function MetricCircle({
  percent, title, sub, ringColor, iconBg, iconPath,
}: {
  percent: number; title: string; sub?: string; ringColor: string; iconBg: string; iconPath: string;
}) {
  const sweep = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative h-12 w-12 rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${sweep * 3.6}deg, rgba(148,163,184,0.25) 0deg)`,
        }}
      >
        <div className="absolute inset-1 rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.06)] grid place-items-center">
          <div className={`h-7 w-7 rounded-full ${iconBg} grid place-items-center`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
              <path d={iconPath} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold" style={{ color: ringColor }}>+ {percent}%</div>
        {title && <div className="text-xs text-neutral-700">{title}</div>}
        {sub && <div className="text-[11px] text-neutral-500">{sub}</div>}
      </div>
    </div>
  );
}

export function VerifierActivityCard() {
  const approvedPercent = 82.3;
  const ringA = [
    { name: 'arc', value: 60, color: '#3B82F6' },
    { name: 'rest', value: 40, color: 'rgba(148,163,184,0.18)' },
  ];
  const ringB = [
    { name: 'arc', value: 35, color: '#059669' },
    { name: 'rest', value: 65, color: 'rgba(148,163,184,0.18)' },
  ];

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_12px_16px_-4px_rgba(12,26,36,0.04)] p-5">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Verifier Activity Overview</h3>
          <p className="text-xs text-neutral-700">Performance based on number of files reviewed</p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-slate-400">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 h-[280px]">
        <div className="flex items-center justify-center">
          <div className="relative h-56 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ringA}
                  dataKey="value"
                  innerRadius="78%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={8}
                >
                  {ringA.map((d, i) => (
                    <Cell key={`a-${i}`} fill={d.color} />
                  ))}
                </Pie>
                <Pie
                  data={ringB}
                  dataKey="value"
                  innerRadius="58%"
                  outerRadius="72%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={8}
                >
                  {ringB.map((d, i) => (
                    <Cell key={`b-${i}`} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-slate-900">{approvedPercent}%</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center gap-6">
          <MetricCircle
            percent={18}
            title="Total Application reviewed"
            sub="today"
            ringColor="#3B82F6"
            iconBg="bg-indigo-50"
            iconPath="M12 6v6m0 0l4-4m-4 4l-4-4"
          />
          <MetricCircle
            percent={14}
            title="Verification Today"
            ringColor="#059669"
            iconBg="bg-emerald-50"
            iconPath="M5 13l4 4L19 7"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-50" /> Rejected
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Total Application Reviewed
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Verify Today
        </div>
      </div>
    </div>
  );
}

function DailyFlowChart({ data }: { data: { day: string; applications: number }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Daily Application Flow</h3>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-blue-600">500</div>
          <div className="text-sm text-gray-500">Last 7 days avg</div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="applications"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorGradient)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InspectorMap() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Inspector Activity Map</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
          <span>View larger map</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      <div className="relative bg-gray-100 rounded-xl overflow-hidden" style={{ height: '450px' }}>
        <img
          src="/Map Image.png"
          alt="Lahore Map"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>

        {[
          { cls: 'top-32 left-20', label: "Quaid-i-Azam Campus Inspector" },
          { cls: 'top-24 left-64', label: 'Cavalry Ground Office' },
          { cls: 'top-20 right-32', label: "Gulberg Inspector" },
          { cls: 'bottom-32 right-28', label: 'DHA Branch Inspector' },
          { cls: 'bottom-40 left-1/3', label: 'Model Town Inspector' },
        ].map((m, i) => (
          <div key={i} className={`absolute ${m.cls} group cursor-pointer z-10`}>
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform border-2 border-white">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {m.label}
              </div>
            </div>
          </div>
        ))}

        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden z-10">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
          <div className="text-xs font-medium text-gray-600 mb-2">Legend</div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span className="text-xs text-gray-700">Inspector Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
            <span className="text-xs text-gray-700">Main Office</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg z-10">
          <div className="text-xs text-gray-600 mb-1">Scale</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-gray-700"></div>
            <span className="text-xs text-gray-700">2 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const applicationData = [
    { day: 'Day 1', applications: 120 }, { day: 'Day 2', applications: 150 },
    { day: 'Day 3', applications: 180 }, { day: 'Day 4', applications: 140 },
    { day: 'Day 5', applications: 200 }, { day: 'Day 6', applications: 160 },
    { day: 'Day 7', applications: 190 }, { day: 'Day 8', applications: 170 },
  ];

  return (
    <div className="relative">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-white">Welcome to the admin dashboard</p>
        </div>
      </div>

      {/* Stats row floating */}
      <div className="mb-8 flex flex-wrap justify-between gap-6 absolute top-20 left-6 right-6">
        <StatCard
          title="Total Applications"
          value="4,000"
          icon={<BsPatchCheck />}
          accentClass="text-blue-600"
          valueClass="text-gray-900"
        />
        <StatCard
          title="Pending"
          value="500"
          icon={<Clock />}
          accentClass="text-amber-600"
          valueClass="text-amber-600"
        />
        <StatCard
          title="Approved"
          value="600"
          icon={<CheckCircle />}
          accentClass="text-green-600"
          valueClass="text-green-600"
        />
        <StatCard
          title="Rejected"
          value="450"
          icon={<XCircle />}
          accentClass="text-red-600"
          valueClass="text-red-600"
        />
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-40">
            <FundUtilizedCard />
            <VerifierActivityCard />
          </div>
          <InspectorMap />
          <DailyFlowChart data={applicationData} />
        </div>
      </div>
    </div>
  );
};
export default Dashboard