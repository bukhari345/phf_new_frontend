"use client";
import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { BsPatchCheck } from "react-icons/bs";

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accentClass?: string;
  valueClass?: string;
};

// Note: No 'export' keyword - internal to this file only
const StatCard = ({
  title,
  value,
  icon,
  accentClass = "text-slate-500",
  valueClass = "",
}: StatCardProps) => (
  <div className="w-full bg-white/75 rounded-xl shadow-[0px_12px_16px_-4px_rgba(12,26,36,0.04)] border border-white backdrop-blur-md p-4 sm:p-5 lg:p-6 flex flex-col gap-2.5 sm:gap-3 min-h-[9.5rem] sm:min-h-[10.5rem] lg:min-h-[11.5rem]">
    <div
      className={`inline-flex h-7 w-7 sm:h-9 sm:w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-slate-50 ${accentClass}`}
    >
      <div className="[&>*]:h-4 [&>*]:w-4 sm:[&>*]:h-5 sm:[&>*]:w-5 lg:[&>*]:h-6 lg:[&>*]:w-6 [&>*]:stroke-current">
        {icon}
      </div>
    </div>
    <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 leading-tight line-clamp-1">
      {title}
    </h3>
    <p
      className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

type StatsOverviewProps = {
  totals: {
    total: number | string;
    pending: number | string;
    approved: number | string;
    rejected: number | string;
  };
};

// Note: No 'export' keyword - internal to this file only
const StatsOverview = ({ totals }: StatsOverviewProps) => {
  const { total, pending, approved, rejected } = totals;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Applications"
        value={total}
        icon={<BsPatchCheck />}
        accentClass="text-blue-600"
        valueClass="text-gray-900"
      />
      <StatCard
        title="Pending"
        value={pending}
        icon={<Clock />}
        accentClass="text-amber-600"
        valueClass="text-amber-600"
      />
      <StatCard
        title="Approved"
        value={approved}
        icon={<CheckCircle />}
        accentClass="text-green-600"
        valueClass="text-green-600"
      />
      <StatCard
        title="Rejected"
        value={rejected}
        icon={<XCircle />}
        accentClass="text-red-600"
        valueClass="text-red-600"
      />
    </div>
  );
};

// This is the only export allowed in a page file
export default function CardsPage() {
  const totals = {
    total: "1,245",
    pending: "128",
    approved: "987",
    rejected: "130",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cards Overview</h1>
      <StatsOverview totals={totals} />
    </div>
  );
}