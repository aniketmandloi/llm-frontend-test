import { cssVars } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface OrbitRingProps {
  /** Percent complete, 0 to 100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

/**
 * Progress as an orbit: an arc that draws in from 12 o'clock, with a satellite
 * dot at its tip. The signature element for completion across the app.
 */
export function OrbitRing({ value, size = 56, strokeWidth = 4, showValue = false, className }: OrbitRingProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  // Angle in unrotated SVG space, where 0 is 3 o'clock. Start at -90 so the arc begins at the top.
  const angle = ((-90 + percent * 3.6) * Math.PI) / 180;
  const satelliteX = center + radius * Math.cos(angle);
  const satelliteY = center + radius * Math.sin(angle);
  const satelliteRadius = Math.max(2, strokeWidth * 0.85);

  return (
    <span role="img" aria-label={`${percent}% complete`} className={cn("relative inline-flex shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-muted" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - percent}
          transform={`rotate(-90 ${center} ${center})`}
          className="animate-ring stroke-brand"
          style={cssVars({ "--ring-offset": 100 - percent })}
        />
        {percent > 0 ? (
          <circle cx={satelliteX} cy={satelliteY} r={satelliteRadius} className="animate-satellite fill-brand stroke-card" strokeWidth={1.5} />
        ) : null}
      </svg>
      {showValue ? (
        <span
          className="absolute inset-0 flex items-center justify-center font-medium tabular-nums"
          style={{ fontSize: Math.round(size * 0.24) }}
        >
          {percent}%
        </span>
      ) : null}
    </span>
  );
}
