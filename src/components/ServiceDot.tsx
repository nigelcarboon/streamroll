/** A service's own brand colour, ringed so black and white still read. */
export function ServiceDot({
  colour,
  size = 10,
}: {
  colour?: string | null;
  size?: number;
}) {
  return (
    <span
      className="inline-block shrink-0 rounded-full ring-1 ring-static/50"
      style={{
        width: size,
        height: size,
        backgroundColor: colour ?? "transparent",
      }}
      aria-hidden
    />
  );
}
