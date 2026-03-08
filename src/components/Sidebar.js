import React from 'react';

function Sidebar({ categories, activeCategory, onCategoryChange, isOpen, onToggle, onOpenHistory }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo-four-allies.png" alt="Four Allies" className="logo-img" />
                    <span className="logo-text">Four Allies</span>
                </div>
                <button className="sidebar-close" onClick={onToggle} id="sidebar-close-btn">
                    ✕
                </button>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-label">หมวดหมู่</p>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        className={`nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => {
                            onCategoryChange(cat.id);
                            if (window.innerWidth < 768) onToggle();
                        }}
                        id={`sidebar-cat-${cat.id}`}
                    >
                        <span
                            className="nav-icon"
                            style={
                                activeCategory === cat.id
                                    ? { background: cat.color + '22', color: cat.color }
                                    : {}
                            }
                        >
                            {cat.icon}
                        </span>
                        <span className="nav-text">{cat.label}</span>
                        {activeCategory === cat.id && (
                            <span className="nav-active-dot" style={{ background: cat.color }} />
                        )}
                    </button>
                ))}

                <div className="nav-divider"></div>
                <p className="nav-label">เมนูอื่นๆ</p>
                <button
                    className="nav-item history-nav-item"
                    onClick={() => {
                        onOpenHistory();
                        if (window.innerWidth < 768) onToggle();
                    }}
                    id="sidebar-history-btn"
                >
                    <span className="nav-icon" style={{ background: 'rgba(244, 162, 54, 0.15)', color: '#f4a236' }}>
                        📜
                    </span>
                    <span className="nav-text">ประวัติการสั่ง</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <p>COE64-371</p>
                <p className="sidebar-version">v1.0.0</p>
            </div>
        </aside>
    );
}

export default Sidebar;
