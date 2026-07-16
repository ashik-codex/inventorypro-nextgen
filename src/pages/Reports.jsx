import { useMemo, useState } from "react";
import { BarChart3, Download, PackageCheck, PieChart as PieChartIcon, Printer, TrendingUp, Warehouse } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import { downloadFile, formatCurrency, orderTotal, toCsv } from "../utils/formatters";

const monthlySales = [
  { month: "Feb", revenue: 98000, orders: 32 },
  { month: "Mar", revenue: 112000, orders: 38 },
  { month: "Apr", revenue: 126000, orders: 44 },
  { month: "May", revenue: 138000, orders: 51 },
  { month: "Jun", revenue: 149000, orders: 57 },
  { month: "Jul", revenue: 167000, orders: 63 },
];

const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function Reports({ products, categories, orders, suppliers, settings, toast }) {
  const [range, setRange] = useState("Last 6 months");
  const revenue = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + orderTotal(order), 0);
  const inventoryValue = products.reduce((sum, item) => sum + item.cost * item.stock, 0);
  const retailValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
  const margin = retailValue - inventoryValue;
  const delivered = orders.filter((item) => item.status === "Delivered").length;
  const fulfillment = orders.length ? Math.round((delivered / orders.length) * 100) : 0;

  const categoryData = useMemo(() => categories.map((category) => {
    const items = products.filter((product) => product.category === category.name);
    return { name: category.name, units: items.reduce((sum, item) => sum + item.stock, 0), value: items.reduce((sum, item) => sum + item.cost * item.stock, 0) };
  }).filter((item) => item.units > 0), [categories, products]);

  const supplierData = suppliers.map((supplier) => ({ name: supplier.name.split(" ")[0], rating: supplier.rating, leadTime: supplier.leadTime, products: products.filter((item) => item.supplierId === supplier.id).length }));
  const stockHealth = [
    { name: "Healthy", value: products.filter((item) => item.stock > item.reorderLevel).length },
    { name: "Low stock", value: products.filter((item) => item.stock > 0 && item.stock <= item.reorderLevel).length },
    { name: "Out of stock", value: products.filter((item) => item.stock === 0).length },
  ];

  const exportReport = () => {
    const rows = products.map((product) => ({ Product: product.name, SKU: product.sku, Category: product.category, Stock: product.stock, CostValue: product.cost * product.stock, RetailValue: product.price * product.stock, MarginPotential: (product.price - product.cost) * product.stock }));
    downloadFile("inventory-analytics-report.csv", toCsv(rows), "text/csv");
    toast("Analytics report exported.", "info");
  };

  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Business intelligence</span><h1>Reports & analytics</h1><p>Understand sales, stock health, supplier performance and margin potential.</p></div><div className="heading-actions"><select className="standalone-select" value={range} onChange={(e) => setRange(e.target.value)}><option>Last 30 days</option><option>Last 3 months</option><option>Last 6 months</option><option>This year</option></select><button className="button secondary" onClick={() => window.print()}><Printer size={16} /> Print</button><button className="button primary" onClick={exportReport}><Download size={16} /> Export report</button></div></div>
    <section className="metric-grid four"><StatCard title="Recorded revenue" value={formatCurrency(revenue, settings.currency)} subtitle={range} icon={TrendingUp} tone="indigo" trend={14.2} /><StatCard title="Inventory value" value={formatCurrency(inventoryValue, settings.currency)} subtitle="Current cost basis" icon={Warehouse} tone="cyan" trend={6.5} /><StatCard title="Margin potential" value={formatCurrency(margin, settings.currency)} subtitle="Available stock" icon={BarChart3} tone="emerald" trend={11.8} /><StatCard title="Fulfillment rate" value={`${fulfillment}%`} subtitle={`${delivered} delivered orders`} icon={PackageCheck} tone="amber" trend={3.4} /></section>
    <section className="report-grid-main">
      <article className="content-card report-chart wide"><div className="card-heading"><div><span className="section-kicker">Revenue movement</span><h2>Monthly sales trend</h2><p>Growth of recorded sales and order volume</p></div></div><div className="chart-large"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlySales} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><Tooltip formatter={(value, key) => key === "revenue" ? formatCurrency(value, settings.currency) : value} contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} /><Legend /><Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></article>
      <article className="content-card report-chart"><div className="card-heading compact"><div><span className="section-kicker">Stock position</span><h2>Inventory health</h2></div></div><div className="donut-wrap report"><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={stockHealth} dataKey="value" innerRadius={66} outerRadius={92} paddingAngle={5}>{stockHealth.map((entry, index) => <Cell key={entry.name} fill={["#10b981", "#f59e0b", "#ef4444"][index]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{products.length}</strong><span>SKUs</span></div></div><div className="chart-legend">{stockHealth.map((item, index) => <div key={item.name}><i style={{ background: ["#10b981", "#f59e0b", "#ef4444"][index] }} /><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></article>
    </section>
    <section className="report-grid-lower">
      <article className="content-card report-chart"><div className="card-heading compact"><div><span className="section-kicker">Category mix</span><h2>Stock value by category</h2></div></div><div className="chart-medium"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}><CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--border)" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={85} tick={{ fill: "var(--text-muted)", fontSize: 11 }} /><Tooltip formatter={(value) => formatCurrency(value, settings.currency)} contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} /><Bar dataKey="value" radius={[0, 7, 7, 0]}>{categoryData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Bar></BarChart></ResponsiveContainer></div></article>
      <article className="content-card report-chart"><div className="card-heading compact"><div><span className="section-kicker">Vendor scorecard</span><h2>Supplier performance</h2></div></div><div className="chart-medium"><ResponsiveContainer width="100%" height="100%"><BarChart data={supplierData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} /><Legend /><Bar dataKey="rating" fill="#6366f1" radius={[7, 7, 0, 0]} /><Bar dataKey="products" fill="#06b6d4" radius={[7, 7, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
      <article className="content-card insights-card"><div className="card-heading compact"><div><span className="section-kicker">Highlights</span><h2>Actionable insights</h2></div></div><div className="insight-list"><div><span className="insight-icon indigo"><TrendingUp size={17} /></span><div><strong>Revenue momentum is positive</strong><p>Monthly revenue increased steadily through the last six reporting periods.</p></div></div><div><span className="insight-icon amber"><Warehouse size={17} /></span><div><strong>{stockHealth[1].value + stockHealth[2].value} products need stock attention</strong><p>Replenishing these products can reduce missed sales and improve fulfillment.</p></div></div><div><span className="insight-icon emerald"><PieChartIcon size={17} /></span><div><strong>{categoryData[0]?.name || "Top category"} holds the most stock value</strong><p>Use category concentration when planning promotions and purchase orders.</p></div></div></div></article>
    </section>
  </div>;
}
