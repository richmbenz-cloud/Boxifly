import { Crown, Award, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VIPBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const tierConfig = {
  bronce: {
    label: "Bronce",
    icon: Award,
    gradient: "from-amber-700 to-amber-500",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  plata: {
    label: "Plata",
    icon: Star,
    gradient: "from-slate-400 to-slate-200",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-300",
  },
  oro: {
    label: "Oro",
    icon: Sparkles,
    gradient: "from-yellow-500 to-yellow-300",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
  },
  platino: {
    label: "Platino",
    icon: Crown,
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
};

const sizeConfig = {
  sm: {
    icon: "h-3 w-3",
    text: "text-xs",
    padding: "px-2 py-0.5",
  },
  md: {
    icon: "h-4 w-4",
    text: "text-sm",
    padding: "px-3 py-1",
  },
  lg: {
    icon: "h-5 w-5",
    text: "text-base",
    padding: "px-4 py-1.5",
  },
};

export function VIPBadge({ tier, size = "md", showLabel = true, className }: VIPBadgeProps) {
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronce;
  const Icon = config.icon;
  const sizeStyles = sizeConfig[size];

  return (
    <Badge
      className={cn(
        "font-semibold gap-1.5 border-2 transition-all hover:scale-105",
        config.bg,
        config.border,
        config.color,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
      variant="outline"
    >
      <Icon className={sizeStyles.icon} />
      {showLabel && (
        <span className="font-bold">{config.label}</span>
      )}
    </Badge>
  );
}

interface VIPGradientBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VIPGradientBadge({ tier, size = "md", className }: VIPGradientBadgeProps) {
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.bronce;
  const Icon = config.icon;
  const sizeStyles = sizeConfig[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold text-white shadow-lg",
        `bg-gradient-to-r ${config.gradient}`,
        sizeStyles.padding,
        sizeStyles.text,
        className
      )}
    >
      <Icon className={sizeStyles.icon} />
      <span>{config.label}</span>
    </div>
  );
}
