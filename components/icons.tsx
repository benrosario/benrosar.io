export function Arrow({ direction }: { direction?: "down" }) {
  return (
    <svg
      className="arrow-icon"
      style={direction === "down" ? { transform: "rotate(135deg)" } : undefined}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M6 18 18 6M6 6h12v12" />
    </svg>
  );
}
export function GitHub() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-4.3 1.3-4.3-2.1-6-2.6m12 5v-3.3a2.9 2.9 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.2-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.2a11.2 11.2 0 0 0-6 0C6.8 3.2 5.8 3.5 5.8 3.5a4.3 4.3 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.2 3.2c0 4.7 2.8 5.7 5.5 6a2.9 2.9 0 0 0-.8 2.2v3.3" />
    </svg>
  );
}
export function Mountain() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m2 19 7-13 5 8 3-5 5 10H2Z" />
      <path d="m6 12 3 1 2-3" />
    </svg>
  );
}
export function LinkedIn() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.6c0-2 1.1-3.1 2.6-3.1s2.4 1 2.4 3V17" />
    </svg>
  );
}
export function Document() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}
export function History() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
      <path d="M3 3.5v4h4" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
// The eight-spoke asterisk mark, drawn so phones don't swap in their emoji.
export function Spark({ weight = 1.6 }: { weight?: number }) {
  return (
    <svg
      className="spark-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </svg>
  );
}
