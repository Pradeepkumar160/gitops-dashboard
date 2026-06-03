import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "pending" | "running" | "info";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<StatusType, { bg: string; text: string; ring: string }> = {
  success: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    ring: "ring-green-500/30",
  },
  warning: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    ring: "ring-orange-500/30",
  },
  error: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    ring: "ring-red-500/30",
  },
  pending: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    ring: "ring-slate-500/30",
  },
  running: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    ring: "ring-cyan-500/30",
  },
  info: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    ring: "ring-blue-500/30",
  },
};

const sizeConfig = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export function StatusBadge({
  status,
  label,
  animated = false,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium ring-1",
        "transition-all duration-200",
        config.bg,
        config.text,
        config.ring,
        sizeConfig[size],
        animated && status === "running" && "pulse-glow"
      )}
    >
      {animated && (status === "running" || status === "pending") && (
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            status === "running" ? "bg-cyan-400 animate-pulse" : "bg-slate-400 animate-pulse"
          )}
        />
      )}
      {label}
    </span>
  );
}
