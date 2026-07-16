import { useMemo, useState } from "react";
import { Download, Edit3, Mail, MoreHorizontal, Phone, Plus, Search, Star, Trash2, Truck, X } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { CircleDollarSign, Clock3, PackageCheck } from "lucide-react";
import { downloadFile, formatCurrency, formatDate, makeId, toCsv } from "../utils/formatters";

const blankSupplier = { name: "", contact: "", email: "", phone: "", category: "", rating: 4.5, status: "Active", leadTime: 5, balance: 0, lastOrder: new Date().toISOString().slice(0, 10) };

function SupplierForm({ supplier, categories, onSave, onClose }) {
  const [form, setForm] = useState(supplier || blankSupplier);
  const submit = (event) => { event.preventDefault(); onSave({ ...form, id: form.id || makeId("sup"), rating: Number(form.rating), leadTime: Number(form.leadTime), balance: Number(form.balance) }); };
  return <form className="form-layout" onSubmit={submit}><div className="form-grid two"><label className="field"><span>Company name *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field"><span>Contact person *</span><input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></label><label className="field"><span>Email *</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label className="field"><span>Primary category</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">General</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Paused</option><option>Blocked</option></select></label><label className="field"><span>Rating</span><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></label><label className="field"><span>Lead time (days)</span><input type="number" min="0" value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: e.target.value })} /></label><label className="field"><span>Outstanding balance</span><input type="number" min="0" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} /></label><label className="field"><span>Last order date</span><input type="date" value={form.lastOrder} onChange={(e) => setForm({ ...form, lastOrder: e.target.value })} /></label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary">{supplier ? "Save changes" : "Add supplier"}</button></div></form>;
}

export default function Suppliers({ suppliers, setSuppliers, categories, products, settings, globalSearch, addActivity, toast }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const visible = useMemo(() => suppliers.filter((supplier) => (!query || [supplier.name, supplier.contact, supplier.email, supplier.category].join(" ").toLowerCase().includes(query)) && (status === "All" || supplier.status === status)).sort((a, b) => b.rating - a.rating), [suppliers, query, status]);
  const productCount = (id) => products.filter((item) => item.supplierId === id).length;
  const saveSupplier = (supplier) => {
    const exists = suppliers.some((item) => item.id === supplier.id);
    setSuppliers((current) => exists ? current.map((item) => item.id === supplier.id ? supplier : item) : [supplier, ...current]);
    addActivity("supplier", exists ? "Supplier updated" : "Supplier added", supplier.name);
    toast(exists ? "Supplier updated." : "Supplier added.");
    setEditing(null);
  };
  const removeSupplier = () => {
    if (!deleteTarget) return;
    if (productCount(deleteTarget.id) > 0) return toast("Reassign products before deleting this supplier.", "error");
    setSuppliers((current) => current.filter((item) => item.id !== deleteTarget.id));
    addActivity("supplier", "Supplier deleted", deleteTarget.name);
    toast("Supplier deleted.", "warning");
    setDeleteTarget(null);
  };
  const exportCsv = () => { downloadFile("inventory-suppliers.csv", toCsv(visible), "text/csv"); toast("Supplier CSV exported.", "info"); };
  const totalBalance = suppliers.reduce((sum, item) => sum + Number(item.balance), 0);
  const avgLead = suppliers.length ? Math.round(suppliers.reduce((sum, item) => sum + Number(item.leadTime), 0) / suppliers.length) : 0;
  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Procurement</span><h1>Suppliers</h1><p>Maintain vendor relationships, lead times, balances and supplied product coverage.</p></div><div className="heading-actions"><button className="button secondary" onClick={exportCsv}><Download size={16} /> Export</button><button className="button primary" onClick={() => setEditing(blankSupplier)}><Plus size={17} /> Add supplier</button></div></div>
    <section className="metric-grid four"><StatCard title="Total suppliers" value={suppliers.length} subtitle="Vendor records" icon={Truck} tone="indigo" /><StatCard title="Active vendors" value={suppliers.filter((item) => item.status === "Active").length} subtitle="Ready to supply" icon={PackageCheck} tone="emerald" /><StatCard title="Outstanding" value={formatCurrency(totalBalance, settings.currency)} subtitle="Supplier balance" icon={CircleDollarSign} tone="rose" /><StatCard title="Average lead time" value={`${avgLead} days`} subtitle="Across all vendors" icon={Clock3} tone="amber" /></section>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier, contact or email" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Active</option><option>Paused</option><option>Blocked</option></select></div></section>
    {visible.length === 0 ? <EmptyState title="No suppliers found" message="Try another search or add your first supplier." actionLabel="Add supplier" onAction={() => setEditing(blankSupplier)} /> : <section className="supplier-grid">{visible.map((supplier) => <article className="supplier-card" key={supplier.id}><div className="supplier-card-head"><div className="supplier-logo">{supplier.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><div className="relative"><button className="icon-button small" onClick={() => setMenuId(menuId === supplier.id ? null : supplier.id)}><MoreHorizontal size={17} /></button>{menuId === supplier.id && <div className="row-menu card-menu"><button onClick={() => { setEditing(supplier); setMenuId(null); }}><Edit3 size={15} /> Edit</button><button className="danger" onClick={() => { setDeleteTarget(supplier); setMenuId(null); }}><Trash2 size={15} /> Delete</button></div>}</div></div><span className={`status-pill ${supplier.status.toLowerCase()}`}>{supplier.status}</span><h3>{supplier.name}</h3><p>{supplier.contact} • {supplier.category || "General supply"}</p><div className="supplier-contact"><a href={`mailto:${supplier.email}`}><Mail size={14} /> {supplier.email}</a><a href={`tel:${supplier.phone}`}><Phone size={14} /> {supplier.phone}</a></div><div className="supplier-stats"><div><span>Products</span><strong>{productCount(supplier.id)}</strong></div><div><span>Lead time</span><strong>{supplier.leadTime}d</strong></div><div><span>Rating</span><strong><Star size={13} fill="currentColor" /> {supplier.rating}</strong></div></div><div className="supplier-balance"><span>Outstanding balance</span><strong>{formatCurrency(supplier.balance, settings.currency)}</strong></div><div className="supplier-footer"><span>Last order {formatDate(supplier.lastOrder, { year: undefined })}</span><button className="text-button" onClick={() => setEditing(supplier)}>Manage</button></div></article>)}</section>}
    <Modal open={Boolean(editing)} title={editing?.id ? "Edit supplier" : "Add supplier"} subtitle="Store vendor and procurement details in one place." onClose={() => setEditing(null)} size="large"><SupplierForm supplier={editing?.id ? editing : null} categories={categories} onSave={saveSupplier} onClose={() => setEditing(null)} /></Modal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete supplier?" message={productCount(deleteTarget?.id) > 0 ? `${deleteTarget?.name} is linked to products and cannot be deleted yet.` : `This permanently removes ${deleteTarget?.name || "this supplier"}.`} onCancel={() => setDeleteTarget(null)} onConfirm={removeSupplier} />
  </div>;
}
