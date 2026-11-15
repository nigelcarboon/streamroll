import { LoopMark } from "./LoopMark";

/** Lowercase, with the full stop. The full stop carries the accent. */
export function Wordmark({
  size = "md",
  withMark = true,
}: {
  size?: "md" | "lg";
  withMark?: boolean;
}) {
  const text = size === "lg" ? "text-3xl" : "text-lg";
  return (
    <span className={`inline-flex items-center gap-2 ${text}`}>
      {withMark && (
        <LoopMark size={size === "lg" ? 36 : 22} className="text-signal" />
      )}
      <span
        className="font-display font-extrabold tracking-tight text-paper"
        style={{ fontVariationSettings: "'wdth' 112" }}
      >
        streamroll<span className="text-signal">.</span>
      </span>
    </span>
  );
}
