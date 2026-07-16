import { Activity, BarChart3, Boxes, Layers3, Package, Search, Settings, ShoppingCart, Truck, Users, Warehouse, X } from "lucide-react";
import { useMemo, useState } from "react";

const commands = [
  { id: "dashboard", label: "Open Dashboard", icon: Boxes },
  { id: "products", label: "Manage Products", icon: Package },
  { id: "categories", label: "Manage Categories", icon: Layers3 },
  { id: "inventory", label: "Open Inventory", icon: Warehouse },
  { id: "orders", label: "Manage Orders", icon: ShoppingCart },
  { id: "suppliers", label: "Manage Suppliers", icon: Truck },
  { id: "customers", label: "Manage Customers", icon: Users },
  { id: "reports", label: "View Reports", icon: BarChart3 },
  { id: "activity", label: "View Activity Log", icon: Activity },
  { id: "settings", label: "Open Settings", icon: Settings },
];

export default function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => commands.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  if (!open) return null;
  return (
    <div className="command-backdrop" onMouseDown={onClose}>
      <section className="command-palette" onMouseDown={(event) => event.stopPropagation()}>
        <div className="command-search"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type a command or page..." /><button onClick={onClose}><X size={17} /></button></div>
        <div className="command-results">
          {visible.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}><span><Icon size={18} /></span><strong>{item.label}</strong><kbd>↵</kbd></button>;
          })}
        </div>
      </section>
    </div>
  );
}
