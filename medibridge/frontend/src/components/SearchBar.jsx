import React, { useState } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const SearchBar = ({ onSearch, initialValue = '', placeholder = "Search for doctors, hospitals, specialists..." }) => {
    const [query, setQuery] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="search-bar-v2-container">
            <form className="search-bar-v2 glass-card" onSubmit={handleSubmit}>
                <div className="search-input-group">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="main-search-input"
                    />
                </div>
                <button type="submit" className="btn btn-primary search-submit-btn">
                    Find Medical Care
                </button>
            </form>
            <div className="search-hints">
                <span>Try: "dentist", "hospital near me", "cardiologist in vizag"</span>
            </div>
        </div>
    );
};

export default SearchBar;
