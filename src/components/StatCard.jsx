import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({ title, value, subtitle, icon: Icon, tone = "indigo", trend, onClick }) {
  return (
    <button className={`metric-card ${onClick ? "clickable" : ""}`} onClick={onClick} type="button">
      <div className={`metric-icon ${tone}`}><Icon size={21} /></div>
      <div className="metric-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        <div className="metric-bottom">
          {trend !== undefined && (
            <em className={trend >= 0 ? "positive" : "negative"}>
              {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(trend)}%
            </em>
          )}
          <small>{subtitle}</small>
        </div>
      </div>
    </button>
  );
}
