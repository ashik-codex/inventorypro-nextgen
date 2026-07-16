import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ToastCenter from "./components/ToastCenter";
import CommandPalette from "./components/CommandPalette";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Orders = lazy(() => import("./pages/Orders"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Customers = lazy(() => import("./pages/Customers"));
const Reports = lazy(() => import("./pages/Reports"));
const Activity = lazy(() => import("./pages/Activity"));
const Settings = lazy(() => import("./pages/Settings"));
import usePersistentState from "./hooks/usePersistentState";
import {
  defaultActivities,
  defaultCategories,
  defaultCustomers,
  defaultMovements,
  defaultOrders,
  defaultProducts,
  defaultSettings,
  defaultSuppliers,
} from "./data/defaultData";
import { downloadFile, makeId } from "./utils/formatters";

const pageTitles = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  inventory: "Inventory",
  orders: "Orders",
  suppliers: "Suppliers",
  customers: "Customers",
  reports: "Reports",
  activity: "Activity",
  settings: "Settings",
};

function App() {
  const [activePage, setActivePage] = usePersistentState("inventorypro_active_page", "dashboard");
  const [darkMode, setDarkMode] = usePersistentState("inventorypro_dark_mode", false);
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState("inventorypro_sidebar_collapsed", false);
  const [products, setProducts] = usePersistentState("inventorypro_products_v3", defaultProducts);
  const [categories, setCategories] = usePersistentState("inventorypro_categories_v3", defaultCategories);
  const [suppliers, setSuppliers] = usePersistentState("inventorypro_suppliers_v3", defaultSuppliers);
  const [customers, setCustomers] = usePersistentState("inventorypro_customers_v3", defaultCustomers);
  const [orders, setOrders] = usePersistentState("inventorypro_orders_v3", defaultOrders);
  const [movements, setMovements] = usePersistentState("inventorypro_movements_v3", defaultMovements);
  const [activities, setActivities] = usePersistentState("inventorypro_activities_v3", defaultActivities);
  const [settings, setSettings] = usePersistentState("inventorypro_settings_v3", defaultSettings);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [productCreateSignal, setProductCreateSignal] = useState(0);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setNotificationOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toast = (message, type = "success", title = "InventoryPro") => {
    const id = makeId("toast");
    setToasts((current) => [...current, { id, message, type, title }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3800);
  };

  const addActivity = (type, title, detail) => {
    setActivities((current) => [{ id: makeId("act"), type, title, detail, time: new Date().toISOString() }, ...current].slice(0, 250));
  };

  const lowStockProducts = useMemo(() => products.filter((product) => Number(product.stock) <= Number(product.reorderLevel)), [products]);
  const notifications = useMemo(() => {
    if (!settings.notifications) return [];
    const items = lowStockProducts.slice(0, 7).map((product) => ({
      id: `stock-${product.id}`,
      type: product.stock === 0 ? "danger" : "warning",
      title: product.stock === 0 ? "Out of stock" : "Low stock",
      message: `${product.name} has ${product.stock} unit${product.stock === 1 ? "" : "s"} available.`,
    }));
    const pendingOrders = orders.filter((order) => order.status === "Pending").length;
    if (pendingOrders > 0) items.unshift({ id: "pending-orders", type: "info", title: "Orders waiting", message: `${pendingOrders} order${pendingOrders === 1 ? " is" : "s are"} waiting for processing.` });
    return items.filter((item) => !dismissedNotifications.includes(item.id));
  }, [lowStockProducts, orders, settings.notifications, dismissedNotifications]);

  const navigate = (page) => {
    setProductCreateSignal(0);
    setActivePage(page);
    setMobileSidebarOpen(false);
    setGlobalSearch("");
    setNotificationOpen(false);
  };

  const quickAdd = (type) => {
    if (type === "product") {
      setProductCreateSignal(1);
      setActivePage("products");
    }
  };

  const exportBackup = () => {
    const backup = {
      version: 3,
      exportedAt: new Date().toISOString(),
      products,
      categories,
      suppliers,
      customers,
      orders,
      movements,
      activities,
      settings,
    };
    downloadFile(`inventorypro-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2), "application/json");
    toast("Complete workspace backup exported.", "info");
  };

  const importBackup = (content) => {
    try {
      const data = JSON.parse(content);
      if (!Array.isArray(data.products) || !Array.isArray(data.categories)) throw new Error("Invalid backup");
      setProducts(data.products);
      setCategories(data.categories);
      setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : []);
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setMovements(Array.isArray(data.movements) ? data.movements : []);
      setActivities(Array.isArray(data.activities) ? data.activities : []);
      if (data.settings && typeof data.settings === "object") setSettings(data.settings);
      toast("Backup imported successfully.");
      addActivity("settings", "Workspace backup imported", data.exportedAt || "External JSON backup");
    } catch {
      toast("The selected file is not a valid InventoryPro backup.", "error");
    }
  };

  const resetDemo = () => {
    const accepted = window.confirm("Reset all workspace data to the original demo records? This cannot be undone unless you exported a backup.");
    if (!accepted) return;
    setProducts(defaultProducts);
    setCategories(defaultCategories);
    setSuppliers(defaultSuppliers);
    setCustomers(defaultCustomers);
    setOrders(defaultOrders);
    setMovements(defaultMovements);
    setActivities(defaultActivities);
    setSettings(defaultSettings);
    setActivePage("dashboard");
    toast("Demo workspace restored.", "warning");
  };

  const shared = { globalSearch, addActivity, toast };

  const renderPage = () => {
    switch (activePage) {
      case "products":
        return <Products {...shared} products={products} setProducts={setProducts} categories={categories} suppliers={suppliers} settings={settings} openCreateSignal={productCreateSignal} />;
      case "categories":
        return <Categories {...shared} categories={categories} setCategories={setCategories} products={products} setProducts={setProducts} />;
      case "inventory":
        return <Inventory {...shared} products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} settings={settings} />;
      case "orders":
        return <Orders {...shared} orders={orders} setOrders={setOrders} customers={customers} setCustomers={setCustomers} products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} settings={settings} />;
      case "suppliers":
        return <Suppliers {...shared} suppliers={suppliers} setSuppliers={setSuppliers} categories={categories} products={products} settings={settings} />;
      case "customers":
        return <Customers {...shared} customers={customers} setCustomers={setCustomers} settings={settings} />;
      case "reports":
        return <Reports products={products} categories={categories} orders={orders} suppliers={suppliers} settings={settings} toast={toast} />;
      case "activity":
        return <Activity globalSearch={globalSearch} activities={activities} setActivities={setActivities} toast={toast} />;
      case "settings":
        return <Settings settings={settings} setSettings={setSettings} darkMode={darkMode} onThemeToggle={() => setDarkMode((value) => !value)} onExportBackup={exportBackup} onImportBackup={importBackup} onResetDemo={resetDemo} toast={toast} />;
      default:
        return <Dashboard products={products} categories={categories} orders={orders} customers={customers} activities={activities} settings={settings} onNavigate={navigate} onQuickAdd={quickAdd} />;
    }
  };

  return (
    <div className={`inventory-app ${settings.compactMode ? "compact-mode" : ""}`}>
      <Sidebar activePage={activePage} onNavigate={navigate} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} lowStockCount={lowStockProducts.length} />
      <div className={`app-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar pageTitle={pageTitles[activePage] || "Dashboard"} search={globalSearch} onSearch={setGlobalSearch} onMenu={() => setMobileSidebarOpen(true)} darkMode={darkMode} onThemeToggle={() => setDarkMode((value) => !value)} notifications={notifications} notificationOpen={notificationOpen} onNotificationToggle={() => setNotificationOpen((value) => !value)} onDismissNotification={(id) => setDismissedNotifications((current) => [...new Set([...current, id])])} onClearNotifications={() => { setDismissedNotifications((current) => [...new Set([...current, ...notifications.map((item) => item.id)])]); setNotificationOpen(false); }} onOpenCommand={() => setCommandOpen(true)} />
        <main className="app-content"><Suspense fallback={<div className="page-loader"><span /><strong>Loading workspace…</strong></div>}>{renderPage()}</Suspense></main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onNavigate={navigate} />
      <ToastCenter toasts={toasts} onRemove={(id) => setToasts((current) => current.filter((item) => item.id !== id))} />
    </div>
  );
}

export default App;
