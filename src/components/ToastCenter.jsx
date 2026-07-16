import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const icons = { success: CheckCircle2, error: AlertCircle, warning: AlertCircle, info: Info };

export default function ToastCenter({ toasts, onRemove }) {
  return (
    <div className="toast-center">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`app-toast ${toast.type}`}>
            <Icon size={19} />
            <div><strong>{toast.title || "InventoryPro"}</strong><span>{toast.message}</span></div>
            <button onClick={() => onRemove(toast.id)} aria-label="Close notification"><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}
