import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Progress } from "@/components/ui/progress";
interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}
export function Breadcrumbs({
  items
}: BreadcrumbsProps) {
  // Calculate navigation depth (home + items)
  const totalDepth = items.length + 1;
  const maxDepth = 5; // Maximum expected depth for scaling
  const progressPercentage = Math.min(totalDepth / maxDepth * 100, 100);

  // Define milestone markers (key navigation levels)
  const milestones = [{
    level: 1,
    label: "Inicio",
    position: 20
  }, {
    level: 2,
    label: "Sección",
    position: 40
  }, {
    level: 3,
    label: "Subsección",
    position: 60
  }, {
    level: 4,
    label: "Detalle",
    position: 80
  }, {
    level: 5,
    label: "Profundo",
    position: 100
  }];
  return <nav aria-label="breadcrumb" className="animate-fade-in space-y-3">
      {/* Progress Bar Indicator */}
      

      {/* Breadcrumb Trail */}
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {/* Home Link - Always visible with animation */}
        <li className="flex items-center gap-2 animate-slide-in-right" style={{
        animationDelay: "0ms"
      }}>
          <Link to="/" className="group flex items-center gap-1 transition-all duration-300 hover:text-primary hover:scale-105 relative">
            <Home className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
              Inicio
            </span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 transition-colors duration-300" />
        </li>

        {/* Breadcrumb Items with staggered animation */}
        {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const animationDelay = (index + 1) * 100; // 100ms delay per item

        return <li key={index} className="flex items-center gap-2 animate-slide-in-right" style={{
          animationDelay: `${animationDelay}ms`
        }}>
              {item.href && !isLast ? <>
                  <Link to={item.href} className="group relative line-clamp-1 transition-all duration-300 hover:text-primary hover:scale-105 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                    {item.label}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50 transition-colors duration-300" />
                </> : <span className="text-foreground font-medium line-clamp-1 px-2 py-1 rounded-md bg-primary/10 animate-scale-in">
                  {item.label}
                </span>}
            </li>;
      })}
      </ol>
    </nav>;
}