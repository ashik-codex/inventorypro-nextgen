import { useMemo, useState } from "react";
import { Activity as ActivityIcon, Filter, Search, Trash2, X } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { formatDate } from "../utils/formatters";

export default function Activity({ activities, setActivities, globalSearch, toast }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const query = `${globalSearch || ""} ${search}`.trim().toLowerCase();
  const types = ["All", ...new Set(activities.map((item) => item.type))];
  const visible = useMemo(() => activities.filter((item) => (!query || [item.title, item.detail, item.type].join(" ").toLowerCase().includes(query)) && (type === "All" || item.type === type)).sort((a, b) => new Date(b.time) - new Date(a.time)), [activities, query, type]);
  const clear = () => { setActivities([]); setConfirmOpen(false); toast("Activity log cleared.", "warning"); };
  return <div className="page-stack">
    <div className="page-heading-row"><div><span className="section-kicker">Audit trail</span><h1>Activity log</h1><p>Review a chronological record of product, order, stock and account actions.</p></div><button className="button danger subtle" onClick={() => setConfirmOpen(true)} disabled={activities.length === 0}><Trash2 size={16} /> Clear log</button></div>
    <section className="toolbar-card"><div className="toolbar-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activity" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="toolbar-filters"><label><Filter size={15} /><select value={type} onChange={(e) => setType(e.target.value)}>{types.map((item) => <option key={item} value={item}>{item === "All" ? "All activity" : item[0].toUpperCase() + item.slice(1)}</option>)}</select></label></div></section>
    {visible.length === 0 ? <EmptyState title="No activity found" message="Your future inventory actions will appear here." /> : <section className="content-card activity-page-card"><div className="timeline-list">{visible.map((item, index) => <div className="timeline-item" key={item.id}><div className="timeline-rail"><span className={`timeline-icon ${item.type}`}><ActivityIcon size={16} /></span>{index < visible.length - 1 && <i />}</div><div className="timeline-content"><div><strong>{item.title}</strong><span>{formatDate(item.time, { hour: "2-digit", minute: "2-digit" })}</span></div><p>{item.detail}</p><em>{item.type}</em></div></div>)}</div></section>}
    <ConfirmDialog open={confirmOpen} title="Clear activity log?" message="This removes all visible audit history from this browser." confirmLabel="Clear log" onCancel={() => setConfirmOpen(false)} onConfirm={clear} />
  </div>;
}
