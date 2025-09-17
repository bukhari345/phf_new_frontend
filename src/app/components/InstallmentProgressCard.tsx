// components/InstallmentProgressCard.tsx
'use client';
import React, { useId } from 'react';
import { Download } from 'lucide-react';

type Props = {
  percent: number;            // 0-100
  paidCount: number;
  remainingCount: number;
  nextDue: string;            // e.g. "2024-09-15"
  onDownload?: () => void;
  size?: number;              // svg size in px (default 140)
};

// Main component function
function InstallmentProgressCard({
  percent,
  paidCount,
  remainingCount,
  nextDue,
  onDownload,
  size = 140,
}: Props) {
  const gradId = useId(); // unique gradient id for SSR/CSR
  const stroke = 12;
  const r = (size - stroke) / 2;               // radius
  const c = 2 * Math.PI * r;                   // circumference
  const dash = Math.max(0, Math.min(100, percent)) / 100 * c;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <p className="text-indigo-600">Installment Progress</p>

      {/* Donut */}
      <div className="mx-auto my-3 relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F46E5" />   {/* indigo-600 */}
              <stop offset="100%" stopColor="#14B8A6" /> {/* teal-500 */}
            </linearGradient>
          </defs>

          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#E5E7EB"      // gray-200
            strokeWidth={stroke}
            fill="none"
          />
          {/* progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            fill="none"
          />
        </svg>

        {/* center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-zinc-900">{percent}%</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-start justify-center gap-12 text-xs">
        <div>
          <div className="flex items-center gap-2 justify-center">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span className="text-gray-500">Paid</span>
          </div>
          <div className="mt-1 font-semibold text-gray-800">{paidCount}</div>
        </div>
        <div>
          <div className="flex items-center gap-2 justify-center">
            <span className="h-2 w-2 rounded-full bg-indigo-50 ring-1 ring-indigo-200" />
            <span className="text-gray-500">Remaining</span>
          </div>
          <div className="mt-1 font-semibold text-gray-800">{remainingCount}</div>
        </div>
      </div>

      {/* Next due */}
      <p className="mt-2 text-xs text-red-600">Next Due: {nextDue}</p>

      {/* Button */}
      <button
        onClick={onDownload}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 transition-colors"
      >
        <Download size={18} />
        <span className="font-medium">Download PDF</span>
      </button>
    </div>
  );
}

// Export both named and default
export { InstallmentProgressCard };
export default InstallmentProgressCard;