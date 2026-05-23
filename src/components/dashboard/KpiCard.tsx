import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  /** Tailwind color classes for the icon background and icon itself */
  iconBg: string;
  iconColor: string;
}

/**
 * A small stat card used in the dashboard KPI row.
 * Displays an icon, a numeric value, and a label.
 */
export default function KpiCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: KpiCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      {/* Icon bubble */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <span className={`text-xl ${iconColor}`}>{icon}</span>
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-zinc-900 leading-tight">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}
