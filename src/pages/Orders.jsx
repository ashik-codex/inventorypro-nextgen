import { useState } from "react";
import { CalendarDays, Download, Eye, Grid2X2, List, MoreHorizontal, Plus, Search, ShoppingCart, Trash2, X } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { CircleDollarSign, Clock3, PackageCheck, Truck } from "lucide-react";
import { downloadFile, formatCurrency, formatDate, makeId, orderTotal, toCsv } from "../utils/formatters";

function OrderForm({ customers, products, onSave, onClose }) {
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1, status: "Pending", payment: "Pending", channel: "Website", notes: "" });
  const selectedProduct = products.find((item) => item.id === form.productId);
  const submit = (event) => {
    event.preventDefault();
    onSave({
      id: `ORD-${String(Date.now()).slice(-5)}`,
      customerId: form.customerId,
      items: [{ productId: form.productId, quantity: Number(form.quantity), price: Number(selectedProduct?.price || 0) }],
      status: form.status,
      payment: form.payment,
      channel: form.channel,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    });
  };
  return <form className="form-layout" onSubmit={submit}><div className="form-grid two"><label className="field"><span>Customer *</span><select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Choose customer</option>{customers.filter((item) => item.status === "Active").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="field"><span>Product *</span><select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}><option value="">Choose product</option>{products.filter((item) => item.status === "Active" && item.stock > 0).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.stock} available)</option>)}</select></label><label className="field"><span>Quantity *</span><input required type="number" min="1" max={selectedProduct?.stock || 1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label><label className="field"><span>Order status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option></select></label><label className="field"><span>Payment</span><select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}><option>Pending</option><option>Paid</option><option>COD</option></select></label><label className="field"><span>Sales channel</span><select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option>Website</option><option>Mobile App</option><option>Marketplace</option><option>Store</option></select></label><label className="field full"><span>Order notes</span><textarea rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery or customer instructions" /></label></div>{selectedProduct && <div className="order-form-summary"><span>{selectedProduct.name} × {form.quantity}</span><strong>{formatCurrency(selectedProduct.price * Number(form.quantity || 0))}</strong></div>}<div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary">Create order</button></div></form>;
}

const columns = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders({ orders, setOrders, customers, setCustomers, products, setProducts, setMovements, settings, globalSearch, addActivity, toast }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [payment, setPayment] = useState("All");
  const [view, setView] = useState("table");
  const [createOpen, setCreateOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const customerName = (id) => customers.find((item) => item.id === id)?.name || "Unknown customer";
  const productName = (id) => products.find((item) => item.id === id)?.name || "Deleted product";

  const visible = orders.filter((order) => {
    const productNames = order.items.map((item) => productName(item.productId)).join(" ");
    const matchesQuery = !query || [order.id, customerName(order.customerId), productNames, order.channel].join(" ").toLowerCase().includes(query);
    return matchesQuery && (status === "All" || order.status === status) && (payment === "All" || order.payment === payment);
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const createOrder = (order) => {
    const item = order.items[0];
    const product = products.find((p) => p.id === item.productId);
    if (!product || item.quantity > product.stock) return toast("Not enough stock to create this order.", "error");
    setOrders((current) => [order, ...current]);
    setProducts((current) => current.map((p) => p.id === product.id ? { ...p, stock: p.stock - item.quantity, updatedAt: new Date().toISOString().slice(0, 10) } : p));
    setMovements((current) => [{ id: makeId("mov"), productId: product.id, type: "Stock Out", quantity: item.quantity, note: `Allocated to ${order.id}`, date: new Date().toISOString(), user: "Admin" }, ...current]);
    setCustomers((current) => current.map((customer) => customer.id === order.customerId ? { ...customer, orders: Number(customer.orders || 0) + 1, spent: Number(customer.spent || 0) + orderTotal(order), lastOrder: new Date().toISOString().slice(0, 10) } : customer));
    addActivity("order", `Order ${order.id} created`, `${customerName(order.customerId)} • ${item.quantity} item(s)`);
    toast("Order created and stock allocated.");
    setCreateOpen(false);
  };

  const updateStatus = (order, nextStatus) => {
    setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: nextStatus } : item));
    addActivity("order", `Order ${order.id} status changed`, `${order.status} → ${nextStatus}`);
    toast(`Order moved to ${nextStatus}.`, "info");
  };

  const removeOrder = () => {
    if (!deleteTarget) return;
    setOrders((current) => current.filter((item) => item.id !== deleteTarget.id));
    addActivity("order", `Order ${deleteTarget.id} deleted`, customerName(deleteTarget.customerId));
    toast("Order deleted.", "warning");
    setDeleteTarget(null);
  };

  const exportCsv = () => {
    downloadFile("inventory-orders.csv", toCsv(visible.map((order) => ({ Order: order.id, Customer: customerName(order.customerId), Items: order.items.reduce((sum, item) => sum + item.quantity, 0), Total: orderTotal(order), Status: order.status, Payment: order.payment, Channel: order.channel, Date: order.createdAt }))), "text/csv");
    toast("Orders exported.", "info");
  };

  const revenue = orders.filter((item) => item.status !== "Cancelled").reduce((sum, item) => sum + orderTotal(item), 0);
  const pendingCount = orders.filter((item) => item.status === "Pending" || item.status === "Processing").length;
  const shippedCount = orders.filter((item) => item.status === "Shipped").length;
  const deliveredCount = orders.filter((item) => item.status === "Delivered").length;

  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Sales operations</span><h1>Orders</h1><p>Manage order flow from creation and payment to delivery completion.</p></div><div className="heading-actions"><button className="button secondary" onClick={exportCsv}><Download size={16} /> Export</button><button className="button primary" onClick={() => setCreateOpen(true)}><Plus size={17} /> New order</button></div></div>
    <section className="metric-grid four"><StatCard title="Order revenue" value={formatCurrency(revenue, settings.currency)} subtitle={`${orders.length} total orders`} icon={CircleDollarSign} tone="indigo" /><StatCard title="To process" value={pendingCount} subtitle="Pending and processing" icon={Clock3} tone="amber" onClick={() => setStatus("Processing")} /><StatCard title="In transit" value={shippedCount} subtitle="Currently shipped" icon={Truck} tone="cyan" onClick={() => setStatus("Shipped")} /><StatCard title="Delivered" value={deliveredCount} subtitle="Completed orders" icon={PackageCheck} tone="emerald" onClick={() => setStatus("Delivered")} /></section>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer or product" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option>{columns.map((item) => <option key={item}>{item}</option>)}</select><select value={payment} onChange={(e) => setPayment(e.target.value)}><option>All</option><option>Paid</option><option>Pending</option><option>COD</option><option>Refunded</option></select><div className="segmented"><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><List size={16} /></button><button className={view === "board" ? "active" : ""} onClick={() => setView("board")}><Grid2X2 size={16} /></button></div></div></section>
    {visible.length === 0 ? <EmptyState title="No orders found" message="Try changing the current order filters." actionLabel="Create order" onAction={() => setCreateOpen(true)} /> : view === "table" ? <section className="data-card table-scroll"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Channel</th><th>Date</th><th /></tr></thead><tbody>{visible.map((order) => <tr key={order.id}><td><button className="order-id-button" onClick={() => setDetails(order)}>{order.id}</button></td><td><strong>{customerName(order.customerId)}</strong></td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td><strong>{formatCurrency(orderTotal(order), settings.currency)}</strong></td><td><span className={`status-pill ${order.payment.toLowerCase()}`}>{order.payment}</span></td><td><select className={`status-select ${order.status.toLowerCase()}`} value={order.status} onChange={(e) => updateStatus(order, e.target.value)}>{columns.map((item) => <option key={item}>{item}</option>)}</select></td><td>{order.channel}</td><td>{formatDate(order.createdAt, { year: undefined })}</td><td className="actions-cell"><button className="icon-button small" onClick={() => setMenuId(menuId === order.id ? null : order.id)}><MoreHorizontal size={17} /></button>{menuId === order.id && <div className="row-menu"><button onClick={() => { setDetails(order); setMenuId(null); }}><Eye size={15} /> View details</button><button className="danger" onClick={() => { setDeleteTarget(order); setMenuId(null); }}><Trash2 size={15} /> Delete</button></div>}</td></tr>)}</tbody></table></section> : <section className="order-board">{columns.map((column) => <div className="order-column" key={column}><div className="order-column-head"><span className={`status-dot ${column.toLowerCase()}`} /><strong>{column}</strong><em>{visible.filter((order) => order.status === column).length}</em></div><div className="order-column-body">{visible.filter((order) => order.status === column).map((order) => <article className="order-board-card" key={order.id}><div><strong>{order.id}</strong><span>{formatDate(order.createdAt, { year: undefined })}</span></div><h3>{customerName(order.customerId)}</h3><p>{order.items.map((item) => `${productName(item.productId)} × ${item.quantity}`).join(", ")}</p><div><span className={`status-pill ${order.payment.toLowerCase()}`}>{order.payment}</span><strong>{formatCurrency(orderTotal(order), settings.currency)}</strong></div><button className="button secondary full-width" onClick={() => setDetails(order)}>View order</button></article>)}</div></div>)}</section>}
    <Modal open={createOpen} title="Create a new order" subtitle="Stock is automatically allocated when the order is saved." onClose={() => setCreateOpen(false)} size="large"><OrderForm customers={customers} products={products} onSave={createOrder} onClose={() => setCreateOpen(false)} /></Modal>
    <Modal open={Boolean(details)} title={details?.id || "Order details"} subtitle={details ? `${customerName(details.customerId)} • ${formatDate(details.createdAt)}` : ""} onClose={() => setDetails(null)} size="medium">{details && <div className="detail-stack"><div className="order-detail-summary"><div><span>Total</span><strong>{formatCurrency(orderTotal(details), settings.currency)}</strong></div><div><span>Status</span><span className={`status-pill ${details.status.toLowerCase()}`}>{details.status}</span></div><div><span>Payment</span><span className={`status-pill ${details.payment.toLowerCase()}`}>{details.payment}</span></div></div><div className="order-items-list">{details.items.map((item) => <div key={item.productId}><span className="product-thumb healthy"><ShoppingCart size={17} /></span><div><strong>{productName(item.productId)}</strong><span>{item.quantity} × {formatCurrency(item.price, settings.currency)}</span></div><b>{formatCurrency(item.quantity * item.price, settings.currency)}</b></div>)}</div><div className="detail-grid"><div><span>Channel</span><strong>{details.channel}</strong></div><div><span>Created</span><strong>{formatDate(details.createdAt)}</strong></div><div className="full"><span>Notes</span><strong>{details.notes || "No order notes"}</strong></div></div><div className="modal-actions"><button className="button secondary" onClick={() => window.print()}><CalendarDays size={16} /> Print invoice</button><button className="button primary" onClick={() => { setDetails(null); toast("Invoice marked as shared.", "info"); }}>Share invoice</button></div></div>}</Modal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete order?" message={`This removes ${deleteTarget?.id || "the selected order"}. Stock is not automatically restored.`} onCancel={() => setDeleteTarget(null)} onConfirm={removeOrder} />
  </div>;
}
