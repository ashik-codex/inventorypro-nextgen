import {
  Activity,
  BarChart3,
  Boxes,
  ChevronLeft,
  CircleUserRound,
  LayoutDashboard,
  Layers3,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Layers3 },
  { id: "inventory", label: "Inventory", icon: Warehouse },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "customers", label: "Customers", icon: Users },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  lowStockCount,
}) {
  return (
    <>
      <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark"><Boxes size={22} /></div>
          {!collapsed && (
            <div className="brand-copy">
              <strong>InventoryPro</strong>
              <span>Operations Workspace</span>
            </div>
          )}
          <button className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Close sidebar"><X size={19} /></button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Workspace</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.id === "inventory" && lowStockCount > 0 && (
                  <span className="nav-count">{lowStockCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {!collapsed && lowStockCount > 0 && (
            <button className="sidebar-alert" onClick={() => onNavigate("inventory")}>
              <div className="sidebar-alert-icon"><Warehouse size={18} /></div>
              <div>
                <strong>{lowStockCount} stock alerts</strong>
                <span>Review items that need attention</span>
              </div>
            </button>
          )}
          <div className="sidebar-profile">
            <div className="profile-avatar"><CircleUserRound size={20} /></div>
            {!collapsed && (
              <div className="profile-copy">
                <strong>Muhammed Ashik</strong>
                <span>Administrator</span>
              </div>
            )}
          </div>
          <button className="sidebar-collapse" onClick={onToggle} aria-label="Toggle sidebar">
            <ChevronLeft size={18} />
            {!collapsed && <span>Collapse menu</span>}
          </button>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={onMobileClose} aria-label="Close sidebar overlay" />}
    </>
  );
}
