import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Download,
  History,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Warehouse,
  X,
} from "lucide-react";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { downloadFile, formatCurrency, formatDate, makeId, toCsv } from "../utils/formatters";

const blankMovement = { productId: "", type: "Stock In", quantity: 1, note: "" };

function MovementForm({ products, onSave, onClose }) {
  const [form, setForm] = useState(blankMovement);
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, quantity: Number(form.quantity), id: makeId("mov"), date: new Date().toISOString(), user: "Admin" });
  };
  return <form className="form-layout" onSubmit={submit}><div className="form-grid two"><label className="field full"><span>Product *</span><select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Choose a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.stock} available)</option>)}</select></label><label className="field"><span>Movement type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Stock In</option><option>Stock Out</option><option>Adjustment</option><option>Return</option></select></label><label className="field"><span>Quantity *</span><input required type="number" min={form.type === "Adjustment" ? "-9999" : "1"} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label><label className="field full"><span>Reason / note</span><textarea rows="4" required value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Supplier delivery, order fulfillment, damage adjustment..." /></label></div><div className="form-note">Stock Out reduces quantity. Stock In and Return increase quantity. Adjustment accepts a positive or negative value.</div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary">Record movement</button></div></form>;
}

export default function Inventory({ products, setProducts, movements, setMovements, settings, globalSearch, addActivity, toast }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [movementOpen, setMovementOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalUnits = products.reduce((sum, item) => sum + Number(item.stock), 0);
  const inventoryValue = products.reduce((sum, item) => sum + Number(item.cost) * Number(item.stock), 0);

  const visible = useMemo(() => products.filter((product) => {
    const matchesQuery = !query || [product.name, product.sku, product.location, product.category].join(" ").toLowerCase().includes(query);
    const matchesFilter = filter === "All" || (filter === "Healthy" && product.stock > product.reorderLevel) || (filter === "Low stock" && product.stock > 0 && product.stock <= product.reorderLevel) || (filter === "Out of stock" && product.stock === 0);
    return matchesQuery && matchesFilter;
  }).sort((a, b) => a.stock - b.stock), [products, query, filter]);

  const recordMovement = (movement) => {
    const product = products.find((item) => item.id === movement.productId);
    if (!product) return toast("Choose a valid product.", "error");
    let delta = movement.quantity;
    if (movement.type === "Stock Out") delta = -Math.abs(movement.quantity);
    if (movement.type === "Stock In" || movement.type === "Return") delta = Math.abs(movement.quantity);
    const nextStock = Number(product.stock) + delta;
    if (nextStock < 0) return toast("Stock cannot go below zero.", "error");
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: nextStock, updatedAt: new Date().toISOString().slice(0, 10) } : item));
    setMovements((current) => [movement, ...current]);
    addActivity("stock", `${movement.type} recorded`, `${product.name} • ${delta > 0 ? "+" : ""}${delta} units`);
    toast("Inventory movement recorded.");
    setMovementOpen(false);
  };

  const quickReorder = (product) => {
    toast(`Reorder draft created for ${product.name}.`, "info");
    addActivity("stock", "Reorder draft created", `${product.name} • Suggested ${Math.max(product.reorderLevel * 2 - product.stock, product.reorderLevel)} units`);
  };

  const exportCsv = () => {
    downloadFile("inventory-stock-report.csv", toCsv(visible.map((p) => ({ SKU: p.sku, Product: p.name, Category: p.category, Stock: p.stock, ReorderLevel: p.reorderLevel, Location: p.location, Value: p.cost * p.stock }))), "text/csv");
    toast("Inventory report exported.", "info");
  };

  const state = (p) => p.stock === 0 ? "out" : p.stock <= p.reorderLevel ? "low" : "healthy";
  const productName = (id) => products.find((p) => p.id === id)?.name || "Deleted product";
  const movementIcon = (type) => type === "Stock In" ? ArrowDownLeft : type === "Stock Out" ? ArrowUpRight : type === "Return" ? RotateCcw : SlidersHorizontal;

  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Warehouse</span><h1>Inventory control</h1><p>Track stock health, locations, movement history and replenishment needs.</p></div><div className="heading-actions"><button className="button secondary" onClick={() => setHistoryOpen(true)}><History size={16} /> Movement history</button><button className="button primary" onClick={() => setMovementOpen(true)}><Plus size={17} /> Record movement</button></div></div>
    <section className="metric-grid four"><StatCard title="Stock value" value={formatCurrency(inventoryValue, settings.currency)} subtitle="Current cost valuation" icon={Warehouse} tone="indigo" /><StatCard title="Available units" value={totalUnits} subtitle={`${products.length} SKUs tracked`} icon={Boxes} tone="cyan" /><StatCard title="Low stock" value={lowStock.length} subtitle="Below reorder level" icon={AlertTriangle} tone="amber" onClick={() => setFilter("Low stock")} /><StatCard title="Out of stock" value={outOfStock.length} subtitle="Immediate action needed" icon={PackageCheck} tone="rose" onClick={() => setFilter("Out of stock")} /></section>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU or location" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option><option>Healthy</option><option>Low stock</option><option>Out of stock</option></select><button className="button secondary compact" onClick={exportCsv}><Download size={15} /> Export stock</button></div></section>
    {visible.length === 0 ? <EmptyState title="No stock records found" message="Change your search or inventory health filter." /> : <section className="inventory-layout"><div className="data-card table-scroll inventory-table-card"><table className="data-table"><thead><tr><th>Product</th><th>Location</th><th>Available</th><th>Reorder</th><th>Stock health</th><th>Value</th><th /></tr></thead><tbody>{visible.map((product) => { const percentage = Math.min(100, Math.round(product.stock / Math.max(product.reorderLevel * 2, 1) * 100)); return <tr key={product.id}><td><div className="product-cell static"><span className={`product-thumb ${state(product)}`}><Boxes size={18} /></span><span><strong>{product.name}</strong><small>{product.sku} • {product.category}</small></span></div></td><td><span className="location-chip">{product.location || "Unassigned"}</span></td><td><strong className="large-number">{product.stock}</strong></td><td>{product.reorderLevel}</td><td><div className="inventory-health-cell"><div className={`stock-line ${state(product)}`}><i style={{ width: `${Math.max(4, percentage)}%` }} /></div><span className={`health-label ${state(product)}`}>{state(product) === "healthy" ? "Healthy" : state(product) === "low" ? "Low stock" : "Out of stock"}</span></div></td><td>{formatCurrency(product.cost * product.stock, settings.currency)}</td><td><button className="button secondary compact" onClick={() => quickReorder(product)}>Reorder</button></td></tr>; })}</tbody></table></div><aside className="content-card movement-preview"><div className="card-heading compact"><div><span className="section-kicker">Timeline</span><h2>Latest movements</h2></div><button className="text-button" onClick={() => setHistoryOpen(true)}>View all</button></div><div className="movement-list">{movements.slice(0, 7).map((movement) => { const Icon = movementIcon(movement.type); return <div key={movement.id} className="movement-row"><span className={`movement-icon ${movement.type.toLowerCase().replace(" ", "-")}`}><Icon size={16} /></span><div><strong>{productName(movement.productId)}</strong><p>{movement.note}</p><small>{formatDate(movement.date, { year: undefined, hour: "2-digit", minute: "2-digit" })}</small></div><b className={movement.type === "Stock Out" || (movement.type === "Adjustment" && movement.quantity < 0) ? "negative" : "positive"}>{movement.type === "Stock Out" ? "-" : movement.quantity > 0 ? "+" : ""}{movement.quantity}</b></div>; })}</div></aside></section>}
    <Modal open={movementOpen} title="Record stock movement" subtitle="Every adjustment is saved to the inventory timeline." onClose={() => setMovementOpen(false)}><MovementForm products={products} onSave={recordMovement} onClose={() => setMovementOpen(false)} /></Modal>
    <Modal open={historyOpen} title="Inventory movement history" subtitle={`${movements.length} recorded movements`} onClose={() => setHistoryOpen(false)} size="large"><div className="movement-history-table table-scroll"><table className="data-table"><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Note</th><th>User</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td>{formatDate(movement.date, { hour: "2-digit", minute: "2-digit" })}</td><td><strong>{productName(movement.productId)}</strong></td><td><span className={`status-pill ${movement.type.toLowerCase().replace(" ", "-")}`}>{movement.type}</span></td><td><strong>{movement.quantity}</strong></td><td>{movement.note}</td><td>{movement.user}</td></tr>)}</tbody></table></div></Modal>
  </div>;
}
