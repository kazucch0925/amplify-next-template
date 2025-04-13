// app/components/SearchBar.tsx
'use client';

import React, { useState, useCallback } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (keyword: string) => void;
}

export default function SearchBar({ placeholder, onSearch }: SearchBarProps) {
    const [keyword, setKeyword] = useState('');

    const handleSearchClick = useCallback(() => {
        onSearch(keyword);
    }, [keyword, onSearch]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newKeyword = e.target.value;
        setKeyword(newKeyword);
        onSearch(newKeyword); // 入力時にリアルタイムで検索
    }, [onSearch]);

    const handleClearClick = useCallback(() => {
        setKeyword('');
        onSearch(''); // 検索をクリア
    }, [onSearch]);

    return (
        <div className="search-bar">
            <button className='icon-button' onClick={handleSearchClick}>
                <img src="/icons/search-icon.png" alt="Search" className="search-icon" />
            </button>
            <input 
                type="text" 
                value={keyword}
                onChange={handleInputChange}
                placeholder={placeholder} 
                className="search-input"
            />
            <button className="icon-button" onClick={handleClearClick}>
                <img src="/icons/clear-icon.png" alt="Clear" className="clear-icon" />
            </button>
        </div>
    );
}
