const variantClasses = {
  active: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-slate-100 text-slate-700 ring-slate-600/20",
  success: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-100 text-amber-700 ring-amber-600/20",
  error: "bg-red-100 text-red-700 ring-red-600/20",
  info: "bg-blue-100 text-blue-700 ring-blue-600/20",
};

export default function StatusBadge({ children, variant = "info", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
        variantClasses[variant] || variantClasses.info
      } ${className}`}
    >
      {children}
    </span>
  );
}
