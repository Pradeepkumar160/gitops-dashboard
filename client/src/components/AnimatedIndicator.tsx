import { cn } from "@/lib/utils";

type IndicatorType = "active" | "inactive" | "warning" | "error" | "syncing";

interface AnimatedIndicatorProps {
  type: IndicatorType;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const typeConfig: Record<IndicatorType, { color: string; glow: string; animate: boolean }> = {
  active: {
    color: "bg-green-500",
    glow: "shadow-green-500/50",
    animate: true,
  },
  inactive: {
    color: "bg-slate-500",
    glow: "shadow-slate-500/50",
    animate: false,
  },
  warning: {
    color: "bg-orange-500",
    glow: "shadow-orange-500/50",
    animate: true,
  },
  error: {
    color: "bg-red-500",
    glow: "shadow-red-500/50",
    animate: true,
  },
  syncing: {
    color: "bg-cyan-500",
    glow: "shadow-cyan-500/50",
    animate: true,
  },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function AnimatedIndicator({ type, label, size = "md" }: AnimatedIndicatorProps) {
  const config = typeConfig[type];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "rounded-full",
            sizeConfig[size],
            config.color,
            config.animate && "animate-pulse",
            config.glow && "shadow-lg",
            config.glow
          )}
        />
        {config.animate && (
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping",
              config.color,
              "opacity-75"
            )}
          />
        )}
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
