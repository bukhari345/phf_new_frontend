import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Eye, Clock, MapPin, AlertCircle, Users, UserCheck, ClipboardList, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

/* ----------------------- Types ----------------------- */
interface ApiStats {
  totalApplications: number;
  statusCounts: {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
  };
  schemeCounts: {
    scheme1: number;
    scheme2: number;
    scheme3: number;
  };
  recentApplications: Array<{
    id: number;
    fullName: string;
    organizationName: string;
    status: string;
    scheme: string;
    createdAt: string;
  }>;
  inspectorStats: {
    totalInspectors: number;
    activeInspectors: number;
    totalAssigned: number;
    totalCompleted: number;
    totalPending: number;
    averageCompletionRate: number;
  };
}

/* ----------------------- Small Reusable UI ----------------------- */
type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accentClass?: string;
  valueClass?: string;
  isLoading?: boolean;
};

const StatCard = ({
  title,
  value,
  icon,
  accentClass = "text-slate-500",
  valueClass = "",
  isLoading = false,
}: StatCardProps) => (
  <div className="min-w-32 bg-white/75 rounded-lg shadow-[0px_8px_16px_-4px_rgba(12,26,36,0.04)] border border-white backdrop-blur-md p-3 flex flex-col gap-2">
    <div className={`inline-flex h-5 w-5 items-center justify-center rounded-lg bg-slate-50 ${accentClass}`}>
      <div className="[&>*]:h-3 [&>*]:w-3 [&>*]:stroke-current">{icon}</div>
    </div>
    <h3 className="text-xs font-medium text-gray-600 leading-tight">{title}</h3>
    <p className={`text-xl font-bold tracking-tight ${valueClass}`}>
      {isLoading ? (
        <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
      ) : (
        value
      )}
    </p>
  </div>
);

const LegendItem = ({ colorClass, label }: { colorClass: string; label: string }) => (
  <div className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded ${colorClass}`} />
    <span className="text-xs text-neutral-700">{label}</span>
  </div>
);

/* ----------------------- Fund Utilized (scheme-based bars) -------------------- */
function FundUtilizedCard({ schemeCounts, isLoading }: { schemeCounts: ApiStats['schemeCounts'], isLoading: boolean }) {
  // Convert scheme data to monthly format for visualization
  const bars = [
    { m: 'Jan', v: 9, color: 'bg-slate-200' },
    { m: 'Feb', v: 24, color: 'bg-slate-200' },
    { m: 'Mar', v: Math.round((schemeCounts.scheme1 / 100) * 16) || 16, color: 'bg-gradient-to-l from-green-800 to-emerald-500', badge: `${schemeCounts.scheme1} Apps` },
    { m: 'Apr', v: 11, color: 'bg-slate-200' },
    { m: 'May', v: 14, color: 'bg-slate-200' },
    { m: 'Jun', v: Math.round((schemeCounts.scheme2 / 100) * 28) || 28, color: 'bg-gradient-to-br from-indigo-600 to-indigo-500', badge: `${schemeCounts.scheme2} Apps` },
    { m: 'Jul', v: 12, color: 'bg-slate-200' },
    { m: 'Aug', v: 24, color: 'bg-slate-200' },
    { m: 'Sep', v: 6, color: 'bg-slate-200' },
    { m: 'Oct', v: Math.round((schemeCounts.scheme3 / 100) * 20) || 20, color: 'bg-gradient-to-l from-indigo-500 to-fuchsia-300', badge: `${schemeCounts.scheme3} Apps` },
    { m: 'Nov', v: 10, color: 'bg-slate-200' },
    { m: 'Dec', v: 16, color: 'bg-slate-200' },
  ];
  
  const maxV = Math.max(...bars.map(b => b.v)) || 1;
  const totalFunds = schemeCounts.scheme1 + schemeCounts.scheme2 + schemeCounts.scheme3;

  return (
    <div className="relative bg-white rounded-md shadow-[0px_8px_16px_0px_rgba(143,149,178,0.15)] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-neutral-900 text-base sm:text-lg font-bold">Scheme Distribution</h3>
      </div>
      <div className="my-3 h-px w-full bg-slate-200" />
      <div className="text-slate-900 text-2xl sm:text-3xl font-bold">
        {isLoading ? (
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          `${totalFunds.toLocaleString()} Applications`
        )}
      </div>
      <div className="mt-4">
        <div className="h-40 sm:h-56 md:h-64 overflow-x-auto">
          <div className="min-w-[700px] sm:min-w-0 flex h-full items-end justify-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4">
            {bars.map((b, idx) => {
              const hPct = (b.v / maxV) * 100;
              return (
                <div key={idx} className="flex h-full flex-col-reverse items-center relative group">
                  <div
                    className={`w-4 sm:w-5 md:w-6 lg:w-7 rounded-md ${b.color} ${isLoading ? 'animate-pulse' : ''}`}
                    style={{ height: `${hPct}%` }}
                    title={`${b.m}: ${b.v}M`}
                  />
                  <span className="mb-1 text-[10px] sm:text-xs text-slate-400">{b.m}</span>
                  {b.badge && !isLoading && (
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

/* ----------------------- Verifier Donut Card --------------------- */
function MetricCircle({
  percent,
  title,
  sub,
  ringColor,
  iconBg,
  iconPath,
}: {
  percent: number;
  title: string;
  sub?: string;
  ringColor: string;
  iconBg: string;
  iconPath: string;
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
        <div className="text-sm font-bold" style={{ color: ringColor }}>
          {percent}%
        </div>
        {title && <div className="text-xs text-neutral-700">{title}</div>}
        {sub && <div className="text-[11px] text-neutral-500">{sub}</div>}
      </div>
    </div>
  );
}

function VerifierActivityCard({ statusCounts, totalApplications, isLoading }: { 
  statusCounts: ApiStats['statusCounts'], 
  totalApplications: number,
  isLoading: boolean 
}) {
  const approvedPercent = totalApplications > 0 ? Math.round((statusCounts.approved / totalApplications) * 100) : 0;
  const reviewedPercent = totalApplications > 0 ? Math.round((statusCounts.under_review / totalApplications) * 100) : 0;
  
  const ringA = [
    { name: 'reviewed', value: reviewedPercent, color: '#3B82F6' },
    { name: 'rest', value: 100 - reviewedPercent, color: 'rgba(148,163,184,0.18)' },
  ];
  const ringB = [
    { name: 'approved', value: approvedPercent, color: '#059669' },
    { name: 'rest', value: 100 - approvedPercent, color: 'rgba(148,163,184,0.18)' },
  ];

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-[0_12px_16px_-4px_rgba(12,26,36,0.04)] p-4 sm:p-5">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">Application Status Overview</h3>
          <p className="text-xs text-neutral-700">
            Performance based on application processing
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[280px]">
        <div className="flex items-center justify-center">
          {isLoading ? (
            <div className="h-40 w-40 sm:h-56 sm:w-56 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <div className="relative h-40 w-40 sm:h-56 sm:w-56">
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
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{approvedPercent}%</div>
                <div className="text-xs text-slate-500">Approved</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start justify-center gap-4 sm:gap-6">
          <MetricCircle
            percent={reviewedPercent}
            title="Under Review"
            sub={`${statusCounts.under_review} applications`}
            ringColor="#3B82F6"
            iconBg="bg-indigo-50"
            iconPath="M12 6v6m0 0l4-4m-4 4l-4-4"
          />
          <MetricCircle
            percent={approvedPercent}
            title="Approved Today"
            sub={`${statusCounts.approved} applications`}
            ringColor="#059669"
            iconBg="bg-emerald-50"
            iconPath="M5 13l4 4L19 7"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> 
          Rejected ({statusCounts.rejected})
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> 
          Under Review ({statusCounts.under_review})
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> 
          Approved ({statusCounts.approved})
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Recent Applications Table ------------------ */
function RecentApplicationsTable({ applications, isLoading }: { 
  applications: ApiStats['recentApplications'], 
  isLoading: boolean 
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Under Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Applications</h3>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 border rounded">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{app.fullName}</div>
                <div className="text-sm text-gray-500">{app.organizationName}</div>
                <div className="text-xs text-gray-400">
                  {app.scheme} • {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="ml-4">
                {getStatusBadge(app.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------- Inspector Activity Table ------------------ */
function InspectorActivityTable() {
  const inspectorData = [
    { id: '01', name: 'Ali Raza', items: 50, assigned: 45, pending: 5, lastVisit: '27 Aug 25', status: 'Active' },
    { id: '02', name: 'Ibrahim Khan', items: 30, assigned: 24, pending: 6, lastVisit: '27 Aug 25', status: 'Active' },
    { id: '03', name: 'Asif Malik', items: 15, assigned: 10, pending: 5, lastVisit: '27 Aug 25', status: 'Inactive' },
    { id: '04', name: 'Amir Jaghar', items: 20, assigned: 18, pending: 2, lastVisit: '27 Aug 25', status: 'Active' },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        • Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        • Inactive
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Inspectors Activity Overview</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Click inspector → open detail activity page.
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 rounded-lg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits Completed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspectorData.map((inspector, index) => (
              <tr key={inspector.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspector.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inspector.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspector.items}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspector.assigned}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspector.pending}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inspector.lastVisit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getStatusBadge(inspector.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------- Inspector Map (styled) ------------------ */
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
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Interactive Map</p>
            <p className="text-sm">Inspector locations would be shown here</p>
          </div>
        </div>
        
        {/* Mock location pins for Lahore */}
        {[
          { cls: 'top-32 left-20', label: "Quaid-e-Azam Campus Inspector" },
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
      </div>
    </div>
  );
}

/* ============================ MAIN DASHBOARD CONTENT ============================= */
const SupervisorDashboardContent: React.FC = () => {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://16.171.43.146/api/applications/stats/summary');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
          setError(null);
        } else {
          throw new Error(result.error || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        // Set fallback data for demo
        setStats({
          totalApplications: 1247,
          statusCounts: { pending: 156, under_review: 89, approved: 892, rejected: 110 },
          schemeCounts: { scheme1: 423, scheme2: 378, scheme3: 446 },
          recentApplications: [
            { id: 1, fullName: 'Ahmed Ali Khan', organizationName: 'Tech Solutions Ltd', status: 'approved', scheme: 'Scheme 1', createdAt: '2024-08-27' },
            { id: 2, fullName: 'Fatima Sheikh', organizationName: 'Green Energy Corp', status: 'under_review', scheme: 'Scheme 2', createdAt: '2024-08-26' },
            { id: 3, fullName: 'Muhammad Hassan', organizationName: 'Innovation Hub', status: 'pending', scheme: 'Scheme 3', createdAt: '2024-08-25' }
          ],
          inspectorStats: {
            totalInspectors: 12,
            activeInspectors: 9,
            totalAssigned: 115,
            totalCompleted: 79,
            totalPending: 36,
            averageCompletionRate: 68.7
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-4 relative">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-white">Welcome to Supervisor Dashboard</p>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Using demo data - API connection failed</span>
            </div>
          )}
        </div>
      </div>

            {/* Stats Cards Section - Single Row with Horizontal Scroll */}
      <div className="mb-8 absolute top-20 left-12 right-8 z-10">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {/* Application Stats Cards */}
          <StatCard
            title="Total Applications"
            value={stats?.totalApplications.toLocaleString() || '0'}
            icon={<ClipboardList />}
            accentClass="text-blue-600"
            valueClass="text-gray-900"
            isLoading={isLoading}
          />

          <StatCard
            title="Pending"
            value={stats?.statusCounts.pending.toLocaleString() || '0'}
            icon={<Clock />}
            accentClass="text-amber-600"
            valueClass="text-amber-600"
            isLoading={isLoading}
          />

          <StatCard
            title="Under Review"
            value={stats?.statusCounts.under_review.toLocaleString() || '0'}
            icon={<Eye />}
            accentClass="text-orange-600"
            valueClass="text-orange-600"
            isLoading={isLoading}
          />

          <StatCard
            title="Approved"
            value={stats?.statusCounts.approved.toLocaleString() || '0'}
            icon={<CheckCircle />}
            accentClass="text-green-600"
            valueClass="text-green-600"
            isLoading={isLoading}
          />

          <StatCard
            title="Rejected"
            value={stats?.statusCounts.rejected.toLocaleString() || '0'}
            icon={<XCircle />}
            accentClass="text-red-600"
            valueClass="text-red-600"
            isLoading={isLoading}
          />

          {/* Inspector Stats Cards */}
        

         
        </div>
      </div>
   {/* Main Content Area */}
      <div className="pt-32 px-6 pb-8 space-y-8">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fund Utilized / Scheme Distribution */}
          {stats && (
            <FundUtilizedCard 
              schemeCounts={stats.schemeCounts} 
              isLoading={isLoading}
            />
          )}

          {/* Status Overview Donut Chart */}
          {stats && (
            <VerifierActivityCard 
              statusCounts={stats.statusCounts}
              totalApplications={stats.totalApplications}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Tables and Map Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Applications - Takes 2 columns */}
          <div className="xl:col-span-2">
            {stats && (
              <RecentApplicationsTable 
                applications={stats.recentApplications}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Inspector Map - Takes 1 column */}
          <div className="xl:col-span-1">
            <InspectorMap />
          </div>
        </div>

        {/* Inspector Activity Table - Full width */}
        <div className="w-full">
          <InspectorActivityTable />
        </div>
      </div>


   

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SupervisorDashboardContent