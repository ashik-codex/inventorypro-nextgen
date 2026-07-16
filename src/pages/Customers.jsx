import { useMemo, useState } from "react";
import { Download, Edit3, Mail, MoreHorizontal, Phone, Plus, Search, Trash2, UserRound, Users, X } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { CircleDollarSign, Crown, ShoppingBag } from "lucide-react";
import { downloadFile, formatCurrency, formatDate, makeId, toCsv } from "../utils/formatters";

const blankCustomer = { name: "", email: "", phone: "", tier: "Bronze", orders: 0, spent: 0, status: "Active", lastOrder: "" };

function CustomerForm({ customer, onSave, onClose }) {
  const [form, setForm] = useState(customer || blankCustomer);
  const submit = (event) => { event.preventDefault(); onSave({ ...form, id: form.id || makeId("cus"), orders: Number(form.orders), spent: Number(form.spent) }); };
  return <form className="form-layout" onSubmit={submit}><div className="form-grid two"><label className="field"><span>Customer name *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field"><span>Email *</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="field"><span>Phone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label className="field"><span>Tier</span><select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></label><label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Blocked</option></select></label><label className="field"><span>Existing orders</span><input type="number" min="0" value={form.orders} onChange={(e) => setForm({ ...form, orders: e.target.value })} /></label><label className="field"><span>Total spent</span><input type="number" min="0" value={form.spent} onChange={(e) => setForm({ ...form, spent: e.target.value })} /></label><label className="field"><span>Last order date</span><input type="date" value={form.lastOrder || ""} onChange={(e) => setForm({ ...form, lastOrder: e.target.value })} /></label></div><div className="modal-actions"><button className="button secondary" type="button" onClick={onClose}>Cancel</button><button className="button primary">{customer ? "Save changes" : "Add customer"}</button></div></form>;
}

export default function Customers({ customers, setCustomers, settings, globalSearch, addActivity, toast }) {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("All");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const visible = useMemo(() => customers.filter((customer) => (!query || [customer.name, customer.email, customer.phone].join(" ").toLowerCase().includes(query)) && (tier === "All" || customer.tier === tier) && (status === "All" || customer.status === status)).sort((a, b) => b.spent - a.spent), [customers, query, tier, status]);
  const saveCustomer = (customer) => {
    const exists = customers.some((item) => item.id === customer.id);
    setCustomers((current) => exists ? current.map((item) => item.id === customer.id ? customer : item) : [customer, ...current]);
    addActivity("customer", exists ? "Customer updated" : "Customer added", customer.name);
    toast(exists ? "Customer updated." : "Customer added.");
    setEditing(null);
  };
  const removeCustomer = () => {
    if (!deleteTarget) return;
    setCustomers((current) => current.filter((item) => item.id !== deleteTarget.id));
    addActivity("customer", "Customer deleted", deleteTarget.name);
    toast("Customer deleted.", "warning");
    setDeleteTarget(null);
  };
  const exportCsv = () => { downloadFile("inventory-customers.csv", toCsv(visible), "text/csv"); toast("Customer CSV exported.", "info"); };
  const totalSpent = customers.reduce((sum, item) => sum + Number(item.spent), 0);
  const avgOrderValue = customers.reduce((sum, item) => sum + Number(item.orders), 0) ? totalSpent / customers.reduce((sum, item) => sum + Number(item.orders), 0) : 0;
  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Relationships</span><h1>Customers</h1><p>Track customer value, loyalty tiers, contact details and buying activity.</p></div><div className="heading-actions"><button className="button secondary" onClick={exportCsv}><Download size={16} /> Export</button><button className="button primary" onClick={() => setEditing(blankCustomer)}><Plus size={17} /> Add customer</button></div></div>
    <section className="metric-grid four"><StatCard title="Total customers" value={customers.length} subtitle="Customer records" icon={Users} tone="indigo" /><StatCard title="Active" value={customers.filter((item) => item.status === "Active").length} subtitle="Currently engaged" icon={UserRound} tone="emerald" /><StatCard title="Customer value" value={formatCurrency(totalSpent, settings.currency)} subtitle="Lifetime recorded spend" icon={CircleDollarSign} tone="cyan" /><StatCard title="Average order" value={formatCurrency(avgOrderValue, settings.currency)} subtitle="Across all customers" icon={ShoppingBag} tone="amber" /></section>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><select value={tier} onChange={(e) => setTier(e.target.value)}><option>All</option><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option><option>Blocked</option></select></div></section>
    {visible.length === 0 ? <EmptyState title="No customers found" message="Change filters or add your first customer." actionLabel="Add customer" onAction={() => setEditing(blankCustomer)} /> : <section className="data-card table-scroll"><table className="data-table"><thead><tr><th>Customer</th><th>Contact</th><th>Tier</th><th>Orders</th><th>Lifetime value</th><th>Last order</th><th>Status</th><th /></tr></thead><tbody>{visible.map((customer) => <tr key={customer.id}><td><div className="customer-cell"><div className="customer-avatar">{customer.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><div><strong>{customer.name}</strong><small>{customer.id}</small></div></div></td><td><div className="contact-stack"><a href={`mailto:${customer.email}`}><Mail size={13} /> {customer.email}</a><a href={`tel:${customer.phone}`}><Phone size={13} /> {customer.phone}</a></div></td><td><span className={`tier-pill ${customer.tier.toLowerCase()}`}><Crown size={13} /> {customer.tier}</span></td><td>{customer.orders}</td><td><strong>{formatCurrency(customer.spent, settings.currency)}</strong></td><td>{formatDate(customer.lastOrder, { year: undefined })}</td><td><span className={`status-pill ${customer.status.toLowerCase()}`}>{customer.status}</span></td><td className="actions-cell"><button className="icon-button small" onClick={() => setMenuId(menuId === customer.id ? null : customer.id)}><MoreHorizontal size={17} /></button>{menuId === customer.id && <div className="row-menu"><button onClick={() => { setEditing(customer); setMenuId(null); }}><Edit3 size={15} /> Edit</button><button className="danger" onClick={() => { setDeleteTarget(customer); setMenuId(null); }}><Trash2 size={15} /> Delete</button></div>}</td></tr>)}</tbody></table></section>}
    <Modal open={Boolean(editing)} title={editing?.id ? "Edit customer" : "Add customer"} subtitle="Keep customer details and value metrics organized." onClose={() => setEditing(null)} size="large"><CustomerForm customer={editing?.id ? editing : null} onSave={saveCustomer} onClose={() => setEditing(null)} /></Modal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete customer?" message={`This permanently removes ${deleteTarget?.name || "this customer"} from customer records.`} onCancel={() => setDeleteTarget(null)} onConfirm={removeCustomer} />
  </div>;
}
