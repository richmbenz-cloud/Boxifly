import { Shield, Lock, Award, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      text: "Compra 100% Segura",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: Lock,
      text: "SSL Certificado",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Award,
      text: "Productos Auténticos",
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      icon: CheckCircle,
      text: "Garantía de Satisfacción",
      color: "text-success",
      bg: "bg-success/10"
    }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {badges.map((badge, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className={`${badge.bg} border-none px-4 py-2 text-sm font-medium`}
        >
          <badge.icon className={`h-4 w-4 mr-2 ${badge.color}`} />
          {badge.text}
        </Badge>
      ))}
    </div>
  );
}
