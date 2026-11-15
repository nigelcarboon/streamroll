/**
 * The Loop: a play triangle held inside a ring that does not quite close.
 * Geometry from the icon exploration (r44, stroke 9, 70 degree break at
 * one o'clock, triangle 15).
 */
export function LoopMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
    >
      <path
        d="M103.83 56.16 A44 44 0 1 1 63.84 16.17"
        fill="none"
        stroke="currentColor"
        strokeWidth={size < 32 ? 11 : 9}
        strokeLinecap="round"
      />
      <path
        d="M52 45 L52 75 L78 60 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={size < 32 ? 9 : 7}
        strokeLinejoin="round"
      />
    </svg>
  );
}
