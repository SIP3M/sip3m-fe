import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  desc: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  desc,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex justify-between items-center h-full min-h-[110px]">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>

      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBg}`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  );
}