// app/components/SearchBar.tsx
'use client';

import React from 'react';
import './SearchBar.css';

export default function SearchBar({ placeholder }: { placeholder?: string; }) {
    const handleSearchClick = () => {
        // ここに検索処理を記述
        console.log("検索を実行");
    };

    const handleClearClick = () => {
        // ここにクリア処理を記述
        console.log("入力をクリア");
    };

    return (
        <div className="search-bar">
            <button className='icon-button' onClick={handleSearchClick}>
                <img src="/icons/search-icon.png" alt="Search" className="search-icon" />
            </button>
            <input 
                type="text" 
                placeholder={placeholder} 
                className="search-input"
            />
            <button className="icon-button" onClick={handleClearClick}>
        <       img src="/icons/clear-icon.png" alt="Clear" className="clear-icon" />
            </button>
        </div>
    );
}