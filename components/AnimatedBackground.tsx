export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Subtle grid */}
      <div className="bg-grid absolute inset-0 opacity-[0.25] dark:opacity-[0.15]" />

      {/* Film grain */}
      <div className="bg-noise absolute inset-0 opacity-[0.025] mix-blend-overlay" />
    </div>
  );
}
