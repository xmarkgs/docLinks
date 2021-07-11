import React from 'react';
import './search-parameters.css';

const SearchParameters = ({ click, enabled }) => (
    <div className="search-parameters">
        <p className="search-parameters__title">
            owned documents
        </p>
        <div className={`search-parameters__switcher ${enabled ? "switcher-active" : ""}`} onClick={click}>
            <div className="search-parameters__switcher__thumb">

            </div>
        </div>
    </div>
)

export default SearchParameters;