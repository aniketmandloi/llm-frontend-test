import type { CSSProperties } from "react";

/**
 * Sets CSS custom properties on an element (for example `--i` for staggered
 * reveals). Typed here once so call sites stay free of assertions.
 */
export function cssVars(vars: Record<`--${string}`, string | number>): CSSProperties {
  return vars as CSSProperties;
}
