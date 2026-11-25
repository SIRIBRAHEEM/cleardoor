// Small design-system primitives in the shadcn/ui style: plain React
// components styled with Tailwind utilities, owned by this project.
// No extra dependencies.

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full font-display font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = {
    md: "px-6 py-3 text-base",
    sm: "min-h-11 px-5 py-2 text-sm",
  };
  const variants = {
    primary:
      "bg-teal-deep text-white shadow-sm hover:bg-teal-main active:bg-teal-deep",
    ghost:
      "border-2 border-teal-deep/30 bg-white text-teal-deep hover:border-teal-deep/60 hover:bg-teal-tint",
  };
  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white shadow-[0_2px_10px_rgba(11,79,74,0.07)] ${className}`}
      {...props}
    />
  );
}

export function Badge({ className = "", ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-teal-main/30 bg-teal-soft px-3 py-1 text-sm font-bold text-teal-deep ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }) {
  return (
    <label
      className={`mb-1.5 block font-display text-sm font-semibold text-ink ${className}`}
      {...props}
    />
  );
}

const fieldClasses =
  "w-full rounded-xl border-2 border-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 transition-colors hover:border-teal-main/50 focus:border-teal-main focus:outline-none";

export function Input({ className = "", ...props }) {
  return <input className={`${fieldClasses} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`${fieldClasses} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }) {
  return <select className={`${fieldClasses} ${className}`} {...props} />;
}

export function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div
      className="flex flex-wrap gap-1 rounded-full border-2 border-line bg-teal-tint p-1"
      role="group"
      aria-label={label}
    >
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          onClick={() => onChange(key)}
          className={`min-h-11 flex-1 rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors ${
            value === key
              ? "bg-teal-deep text-white shadow-sm"
              : "text-teal-deep hover:bg-white"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
