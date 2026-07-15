import { Stethoscope } from "lucide-react";

const colors = [
  { from: "from-blue-500", to: "to-blue-600" },
  { from: "from-emerald-500", to: "to-emerald-600" },
  { from: "from-violet-500", to: "to-violet-600" },
];

export function DoctorCard({
  name,
  index,
}: {
  name: string;
  index: number;
}) {
  const color = colors[index % colors.length];
  const initials = name
    .split(" ")
    .filter((w) => w.startsWith("Dr") === false)
    .map((w) => w[0])
    .join("");

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div
        className={`flex size-12 items-center justify-center rounded-full bg-gradient-to-br ${color.from} ${color.to} text-white text-sm font-bold shadow-sm`}
      >
        {initials}
      </div>
      <span className="text-[11px] text-center leading-tight text-zinc-600 dark:text-zinc-400 truncate w-full">
        {name.replace("Dr. ", "")}
      </span>
    </div>
  );
}
