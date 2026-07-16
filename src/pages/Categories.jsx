import { useMemo, useState } from "react";
import { Copy, Edit3, FolderOpen, Grid2X2, Layers3, List, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import StatCard from "../components/StatCard";
import { CheckCircle2, PackageOpen, PauseCircle } from "lucide-react";
import { makeId } from "../utils/formatters";

const blankCategory = { name: "", description: "", color: "#6366f1", status: "Active" };

function CategoryForm({ category, onSave, onClose }) {
  const [form, setForm] = useState(category || blankCategory);
  const submit = (event) => {
    event.preventDefault();
    onSave({ ...form, id: form.id || makeId("cat"), name: form.name.trim(), createdAt: form.createdAt || new Date().toISOString().slice(0, 10) });
  };
  return <form className="form-layout" onSubmit={submit}><div className="form-grid two"><label className="field"><span>Category name *</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Electronics" /></label><label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label><label className="field"><span>Accent color</span><div className="color-field"><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div></label><label className="field full"><span>Description</span><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what belongs in this category" /></label></div><div className="modal-actions"><button className="button secondary" type="button" onClick={onClose}>Cancel</button><button className="button primary">{category ? "Save changes" : "Create category"}</button></div></form>;
}

export default function Categories({ categories, setCategories, products, setProducts, globalSearch, toast, addActivity }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("grid");
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const countProducts = (name) => products.filter((product) => product.category === name).length;
  const totalUnits = (name) => products.filter((product) => product.category === name).reduce((sum, product) => sum + Number(product.stock), 0);

  const visible = useMemo(() => categories.filter((category) => {
    const matchesQuery = !query || [category.name, category.description].join(" ").toLowerCase().includes(query);
    const count = products.filter((product) => product.category === category.name).length;
    const matchesFilter = filter === "All" || category.status === filter || (filter === "Empty" && count === 0);
    return matchesQuery && matchesFilter;
  }), [categories, products, query, filter]);

  const saveCategory = (category) => {
    const duplicate = categories.some((item) => item.name.toLowerCase() === category.name.toLowerCase() && item.id !== category.id);
    if (duplicate) return toast("A category with that name already exists.", "error");
    const existing = categories.find((item) => item.id === category.id);
    setCategories((current) => existing ? current.map((item) => item.id === category.id ? category : item) : [category, ...current]);
    if (existing && existing.name !== category.name) setProducts((current) => current.map((product) => product.category === existing.name ? { ...product, category: category.name, updatedAt: new Date().toISOString().slice(0, 10) } : product));
    addActivity("category", existing ? "Category updated" : "Category created", category.name);
    toast(existing ? "Category updated." : "Category created.");
    setEditing(null);
  };

  const duplicateCategory = (category) => {
    const copy = { ...category, id: makeId("cat"), name: `${category.name} Copy`, createdAt: new Date().toISOString().slice(0, 10) };
    setCategories((current) => [copy, ...current]);
    addActivity("category", "Category duplicated", copy.name);
    toast("Category duplicated.", "info");
    setMenuId(null);
  };

  const removeCategory = () => {
    if (!deleteTarget) return;
    if (countProducts(deleteTarget.name) > 0) return toast("Move or delete products in this category first.", "error");
    setCategories((current) => current.filter((item) => item.id !== deleteTarget.id));
    addActivity("category", "Category deleted", deleteTarget.name);
    toast("Category deleted.", "warning");
    setDeleteTarget(null);
  };

  const active = categories.filter((item) => item.status === "Active").length;
  const inactive = categories.filter((item) => item.status === "Inactive").length;
  const empty = categories.filter((item) => countProducts(item.name) === 0).length;

  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Organization</span><h1>Categories</h1><p>Build a clean category system that keeps products easy to discover and manage.</p></div><button className="button primary" onClick={() => setEditing(blankCategory)}><Plus size={17} /> Add category</button></div>
    <section className="metric-grid four"><StatCard title="Total categories" value={categories.length} subtitle="Catalog groups" icon={Layers3} tone="indigo" onClick={() => setFilter("All")} /><StatCard title="Active" value={active} subtitle="Visible categories" icon={CheckCircle2} tone="emerald" onClick={() => setFilter("Active")} /><StatCard title="Inactive" value={inactive} subtitle="Temporarily hidden" icon={PauseCircle} tone="amber" onClick={() => setFilter("Inactive")} /><StatCard title="Empty" value={empty} subtitle="No products assigned" icon={PackageOpen} tone="rose" onClick={() => setFilter("Empty")} /></section>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option><option>Active</option><option>Inactive</option><option>Empty</option></select><div className="segmented"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><Grid2X2 size={16} /></button><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><List size={16} /></button></div></div></section>
    {visible.length === 0 ? <EmptyState title="No categories found" message="Create a category or change the current filters." actionLabel="Create category" onAction={() => setEditing(blankCategory)} /> : view === "grid" ? <section className="category-modern-grid">{visible.map((category) => <article className="category-modern-card" key={category.id} style={{ "--category-color": category.color }}><div className="category-card-head"><span className="category-folder"><FolderOpen size={23} /></span><div className="relative"><button className="icon-button small" onClick={() => setMenuId(menuId === category.id ? null : category.id)}><MoreHorizontal size={17} /></button>{menuId === category.id && <div className="row-menu card-menu"><button onClick={() => { setEditing(category); setMenuId(null); }}><Edit3 size={15} /> Edit</button><button onClick={() => duplicateCategory(category)}><Copy size={15} /> Duplicate</button><button className="danger" onClick={() => { setDeleteTarget(category); setMenuId(null); }}><Trash2 size={15} /> Delete</button></div>}</div></div><span className={`status-pill ${category.status.toLowerCase()}`}>{category.status}</span><h3>{category.name}</h3><p>{category.description || "No description added yet."}</p><div className="category-card-stats"><div><span>Products</span><strong>{countProducts(category.name)}</strong></div><div><span>Units</span><strong>{totalUnits(category.name)}</strong></div></div><button className="button secondary full-width" onClick={() => setEditing(category)}><Edit3 size={15} /> Manage category</button></article>)}</section> : <section className="data-card table-scroll"><table className="data-table"><thead><tr><th>Category</th><th>Description</th><th>Products</th><th>Units</th><th>Status</th><th /></tr></thead><tbody>{visible.map((category) => <tr key={category.id}><td><div className="category-table-cell"><i style={{ background: category.color }} /><strong>{category.name}</strong></div></td><td>{category.description || "—"}</td><td>{countProducts(category.name)}</td><td>{totalUnits(category.name)}</td><td><span className={`status-pill ${category.status.toLowerCase()}`}>{category.status}</span></td><td className="actions-cell"><button className="icon-button small" onClick={() => setEditing(category)}><Edit3 size={16} /></button><button className="icon-button small danger-ink" onClick={() => setDeleteTarget(category)}><Trash2 size={16} /></button></td></tr>)}</tbody></table></section>}
    <Modal open={Boolean(editing)} title={editing?.id ? "Edit category" : "Create category"} subtitle="Define how products are grouped in your catalog." onClose={() => setEditing(null)}><CategoryForm category={editing?.id ? editing : null} onSave={saveCategory} onClose={() => setEditing(null)} /></Modal>
    <ConfirmDialog open={Boolean(deleteTarget)} title="Delete category?" message={countProducts(deleteTarget?.name) > 0 ? `${deleteTarget?.name} still contains products and cannot be deleted.` : `This will permanently remove ${deleteTarget?.name || "this category"}.`} onCancel={() => setDeleteTarget(null)} onConfirm={removeCategory} />
  </div>;
}
