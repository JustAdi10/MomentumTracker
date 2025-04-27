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
  color = "url(#progress-gradient)",
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
            progressRef.current.style.transition = "stroke-dashoffset 1s ease";
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

  return (
    <div className={`relative ${className}`}>
      <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5D68F1" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle 
          className="progress-ring-circle"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        {/* Progress circle */}
        <circle 
          ref={progressRef}
          className="progress-ring-circle"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {text && (
          <span className="text-3xl font-bold text-gray-800">{text}</span>
        )}
        {textBottom && (
          <span className="text-xs text-gray-500">{textBottom}</span>
        )}
      </div>
    </div>
  );
}
