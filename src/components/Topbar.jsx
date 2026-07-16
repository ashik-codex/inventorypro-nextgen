import { Bell, CheckCheck, Command, Menu, Moon, Search, Sun, Trash2, X } from "lucide-react";

export default function Topbar({
  pageTitle,
  search,
  onSearch,
  onMenu,
  darkMode,
  onThemeToggle,
  notifications,
  notificationOpen,
  onNotificationToggle,
  onDismissNotification,
  onClearNotifications,
  onOpenCommand,
}) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu-button" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
          <div className="page-title-block">
            <span>InventoryPro /</span>
            <strong>{pageTitle}</strong>
          </div>
        </div>

        <div className="topbar-search">
          <Search size={17} />
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={`Search ${pageTitle.toLowerCase()}...`} />
          {search ? (
            <button onClick={() => onSearch("")} aria-label="Clear search"><X size={15} /></button>
          ) : (
            <button className="command-hint" onClick={onOpenCommand}><Command size={13} /> K</button>
          )}
        </div>

        <div className="topbar-actions">
          <button className="icon-button" onClick={onThemeToggle} aria-label="Toggle theme">
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <div className="notification-wrap">
            <button className={`icon-button ${notificationOpen ? "active" : ""}`} onClick={onNotificationToggle} aria-label="Notifications">
              <Bell size={19} />
              {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
            </button>
            {notificationOpen && (
              <div className="notification-panel" role="dialog" aria-label="Notifications">
                <div className="notification-panel-head">
                  <div><strong>Notifications</strong><span>{notifications.length} active alert{notifications.length === 1 ? "" : "s"}</span></div>
                  <div className="notification-head-actions">
                    {notifications.length > 0 && <button onClick={onClearNotifications} title="Clear all"><CheckCheck size={16} /></button>}
                    <button onClick={onNotificationToggle} title="Close"><X size={16} /></button>
                  </div>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty"><CheckCheck size={28} /><strong>You are all caught up</strong><span>No alerts need your attention.</span></div>
                  ) : notifications.map((item) => (
                    <div key={item.id} className={`notification-item ${item.type}`}>
                      <span className="notification-dot" />
                      <div><strong>{item.title}</strong><p>{item.message}</p></div>
                      <button className="notification-dismiss" onClick={() => onDismissNotification(item.id)} aria-label={`Dismiss ${item.title}`}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="topbar-user">
            <div className="user-avatar">MA</div>
            <div><strong>Ashik</strong><span>Admin</span></div>
          </div>
        </div>
      </header>
      {notificationOpen && <button className="floating-panel-backdrop" onClick={onNotificationToggle} aria-label="Close notification panel" />}
    </>
  );
}
