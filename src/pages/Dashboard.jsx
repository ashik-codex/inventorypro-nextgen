import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import { formatCurrency, formatDate, orderTotal } from "../utils/formatters";

const salesTrend = [
  { day: "Mon", sales: 18300, orders: 18 },
  { day: "Tue", sales: 23900, orders: 24 },
  { day: "Wed", sales: 21100, orders: 22 },
  { day: "Thu", sales: 31400, orders: 31 },
  { day: "Fri", sales: 28600, orders: 28 },
  { day: "Sat", sales: 36700, orders: 36 },
  { day: "Sun", sales: 32200, orders: 33 },
];

const chartColors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function Dashboard({ products, categories, orders, customers, activities, settings, onNavigate, onQuickAdd }) {
  const inventoryValue = products.reduce((sum, item) => sum + Number(item.cost) * Number(item.stock), 0);
  const retailValue = products.reduce((sum, item) => sum + Number(item.price) * Number(item.stock), 0);
  const lowStock = products.filter((item) => Number(item.stock) <= Number(item.reorderLevel));
  const completedRevenue = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + orderTotal(order), 0);
  const categoryData = categories.map((category) => ({
    name: category.name,
    value: products.filter((product) => product.category === category.name).reduce((sum, product) => sum + Number(product.stock), 0),
  })).filter((item) => item.value > 0);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const topProducts = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 5);
  const customerName = (id) => customers.find((item) => item.id === id)?.name || "Walk-in customer";

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-content">
          <div className="eyebrow"><Sparkles size={14} /> Operations overview</div>
          <h1>Good to see you, Ashik.</h1>
          <p>Your inventory is healthy overall. {lowStock.length} products need attention and {orders.filter((item) => item.status === "Pending").length} orders are waiting to be processed.</p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => onQuickAdd("product")}><Plus size={17} /> Add product</button>
            <button className="button secondary" onClick={() => onNavigate("reports")}>View analytics <ArrowRight size={16} /></button>
          </div>
        </div>
        <div className="hero-insight-card">
          <div className="insight-orbit"><TrendingUp size={30} /></div>
          <span>Potential margin</span>
          <strong>{formatCurrency(retailValue - inventoryValue, settings.currency)}</strong>
          <small>Across current available stock</small>
        </div>
      </section>

      <section className="metric-grid four">
        <StatCard title="Inventory value" value={formatCurrency(inventoryValue, settings.currency)} subtitle={`${products.length} products`} icon={Warehouse} tone="indigo" trend={12.4} onClick={() => onNavigate("inventory")} />
        <StatCard title="Sales revenue" value={formatCurrency(completedRevenue, settings.currency)} subtitle={`${orders.length} total orders`} icon={CircleDollarSign} tone="emerald" trend={8.7} onClick={() => onNavigate("orders")} />
        <StatCard title="Low stock items" value={lowStock.length} subtitle="Needs replenishment" icon={AlertTriangle} tone="amber" trend={-4.2} onClick={() => onNavigate("inventory")} />
        <StatCard title="Active customers" value={customers.filter((item) => item.status === "Active").length} subtitle={`${customers.length} customer records`} icon={ShoppingBag} tone="cyan" trend={5.1} onClick={() => onNavigate("customers")} />
      </section>

      <section className="dashboard-grid-main">
        <article className="content-card chart-card wide">
          <div className="card-heading">
            <div><span className="section-kicker">Performance</span><h2>Sales pulse</h2><p>Seven-day revenue and order momentum</p></div>
            <button className="text-button" onClick={() => onNavigate("reports")}>Full report <ArrowRight size={15} /></button>
          </div>
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value, settings.currency)} contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="content-card chart-card">
          <div className="card-heading compact"><div><span className="section-kicker">Stock mix</span><h2>Category distribution</h2></div></div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={4}>
                  {categoryData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center"><strong>{products.reduce((sum, item) => sum + Number(item.stock), 0)}</strong><span>Units</span></div>
          </div>
          <div className="chart-legend">
            {categoryData.slice(0, 5).map((item, index) => <div key={item.name}><i style={{ background: chartColors[index % chartColors.length] }} /><span>{item.name}</span><strong>{item.value}</strong></div>)}
          </div>
        </article>
      </section>

      <section className="dashboard-grid-lower">
        <article className="content-card">
          <div className="card-heading"><div><span className="section-kicker">Attention</span><h2>Low stock monitor</h2></div><button className="text-button" onClick={() => onNavigate("inventory")}>Open inventory <ArrowRight size={15} /></button></div>
          <div className="mini-list">
            {lowStock.slice(0, 5).map((product) => {
              const percentage = Math.min(100, Math.round((product.stock / Math.max(product.reorderLevel, 1)) * 100));
              return (
                <button key={product.id} className="mini-list-row" onClick={() => onNavigate("inventory")}>
                  <div className="mini-product-icon"><Boxes size={17} /></div>
                  <div className="mini-list-copy"><strong>{product.name}</strong><span>{product.sku} • {product.location}</span><div className="stock-meter"><i style={{ width: `${percentage}%` }} /></div></div>
                  <div className={`stock-number ${product.stock === 0 ? "danger" : "warning"}`}><strong>{product.stock}</strong><span>left</span></div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="content-card">
          <div className="card-heading"><div><span className="section-kicker">Latest</span><h2>Recent orders</h2></div><button className="text-button" onClick={() => onNavigate("orders")}>All orders <ArrowRight size={15} /></button></div>
          <div className="mini-list">
            {recentOrders.map((order) => (
              <button key={order.id} className="mini-list-row" onClick={() => onNavigate("orders")}>
                <div className="mini-product-icon order"><PackageCheck size={17} /></div>
                <div className="mini-list-copy"><strong>{order.id}</strong><span>{customerName(order.customerId)} • {formatDate(order.createdAt, { year: undefined })}</span></div>
                <div className="order-mini-end"><strong>{formatCurrency(orderTotal(order), settings.currency)}</strong><span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span></div>
              </button>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="card-heading"><div><span className="section-kicker">Value leaders</span><h2>Top inventory</h2></div><button className="text-button" onClick={() => onNavigate("products")}>All products <ArrowRight size={15} /></button></div>
          <div className="rank-list">
            {topProducts.map((product, index) => (
              <div className="rank-row" key={product.id}><span className="rank-number">{index + 1}</span><div><strong>{product.name}</strong><span>{product.stock} units in stock</span></div><b>{formatCurrency(product.price * product.stock, settings.currency)}</b></div>
            ))}
          </div>
        </article>
      </section>

      <section className="activity-strip content-card">
        <div className="card-heading compact"><div><span className="section-kicker">Live workspace</span><h2>Recent activity</h2></div><button className="text-button" onClick={() => onNavigate("activity")}>View timeline <ArrowRight size={15} /></button></div>
        <div className="activity-inline">
          {activities.slice(0, 4).map((activity) => <div key={activity.id}><span className={`activity-symbol ${activity.type}`}><Boxes size={15} /></span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div></div>)}
        </div>
      </section>
    </div>
  );
}
