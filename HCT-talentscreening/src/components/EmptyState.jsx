import { Inbox } from "lucide-react";

export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className = "",
}) {
  return (
    <div
      className={`mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center ${className}`}
    >
      <div className="rounded-full bg-blue-50 p-3 text-blue-600">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-medium text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
