import { useEffect, useRef } from "react";

type ProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  text?: string;
  textBottom?: string;
  color?: string;
  className?: string;
};

export default function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  text,
  textBottom,
  color,
  className = ""
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // For animation
  const progressRef = useRef<SVGCircleElement>(null);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      // On first render, set the initial offset without animation
      if (progressRef.current) {
        progressRef.current.style.transition = "none";
        progressRef.current.style.strokeDashoffset = String(circumference);
        
        setTimeout(() => {
          if (progressRef.current) {
            progressRef.current.style.transition = "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)";
            progressRef.current.style.strokeDashoffset = String(offset);
          }
        }, 100);
      }
      initialRender.current = false;
    } else {
      // For subsequent updates, animate normally
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(offset);
      }
    }
  }, [percentage, offset, circumference]);

  // Generate unique gradient IDs to prevent conflicts with multiple instances
  const gradientId = useRef(`progress-gradient-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className={`relative ${className}`}>
      <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId.current} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
          {/* Optional glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle 
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress circle */}
        <circle 
          ref={progressRef}
          className="progress-ring-fg"
          stroke={color || `url(#${gradientId.current})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="url(#glow)"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {text && (
          <span className="text-2xl font-bold text-foreground dark:text-primary-foreground">{text}</span>
        )}
        {textBottom && (
          <span className="text-xs text-muted-foreground">{textBottom}</span>
        )}
      </div>
    </div>
  );
}
