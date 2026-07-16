import { PackageOpen } from "lucide-react";

export default function EmptyState({ title = "Nothing found", message = "Try changing your search or filters.", actionLabel, onAction }) {
  return (
    <div className="empty-state-global">
      <div><PackageOpen size={28} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && <button className="button primary" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
