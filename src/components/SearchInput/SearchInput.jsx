import React, { Component } from 'react';
import './search-input.css';

let SearchInput = ({ onInput, value, click }) => (
    <div className="search-section">
        <input className="search-input" type="text" value={value} onInput={onInput} onKeyPress={click} placeholder="Search for files..." />
        <button className="search-btn" onClick={click}>Search</button>
    </div>
);

export default SearchInput;