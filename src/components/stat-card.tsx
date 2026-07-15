import type { ReactNode } from "react";

const gradients: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  violet: "from-violet-500 to-violet-600",
  rose: "from-rose-500 to-rose-600",
};

export function StatCard({
  title,
  value,
  icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: keyof typeof gradients;
}) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${gradients[color]} p-4 text-white shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-white/70">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="text-white/40">{icon}</div>
      </div>
    </div>
  );
}
