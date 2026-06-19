import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-4 animate-pulse-subtle">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-orange-600 animate-pulse" />
        <span className="text-sm font-bold text-orange-700">¡Oferta por tiempo limitado!</span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center bg-white rounded-lg p-2 min-w-[60px] shadow-md">
          <span className="text-2xl md:text-3xl font-bold text-orange-600 tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground font-semibold">HORAS</span>
        </div>
        <span className="text-2xl font-bold text-orange-600">:</span>
        <div className="flex flex-col items-center bg-white rounded-lg p-2 min-w-[60px] shadow-md">
          <span className="text-2xl md:text-3xl font-bold text-orange-600 tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground font-semibold">MIN</span>
        </div>
        <span className="text-2xl font-bold text-orange-600">:</span>
        <div className="flex flex-col items-center bg-white rounded-lg p-2 min-w-[60px] shadow-md">
          <span className="text-2xl md:text-3xl font-bold text-orange-600 tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground font-semibold">SEG</span>
        </div>
      </div>
    </div>
  );
}
