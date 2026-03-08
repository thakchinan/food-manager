import React from 'react';

function SearchBar({ searchTerm, onSearch }) {
    return (
        <div className="search-bar" id="search-bar">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="ค้นหาเมนูอาหาร..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="search-input"
                id="search-input"
            />
            {searchTerm && (
                <button
                    className="search-clear"
                    onClick={() => onSearch('')}
                    id="search-clear-btn"
                >
                    ✕
                </button>
            )}
        </div>
    );
}

export default SearchBar;
