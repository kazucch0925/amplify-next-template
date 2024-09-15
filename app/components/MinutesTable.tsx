// app/components/MinutesTable.tsx
'use client';

import React from 'react';
import './MinutesTable.css';

export default function MinutesTable() {
    const rows = [
        { id: 1, date: '24/01/01', author: '一ノ瀬', updated: '24/02/01' },
        { id: 2, date: '24/01/02', author: '二宮', updated: '24/01/03' },
        // 他の行データ
    ];

    return (
        <table className="minutes-table">
            <thead>
                <tr>
                    <th></th>
                    <th>開催日</th>
                    <th>更新者</th>
                    <th>更新日時</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(row => (
                    <tr key={row.id}>
                        <td>
                            <button className="icon-button view-button">
                                <img src="/icons/view-icon.png" alt="View" />
                            </button>
                            <button className="icon-button edit-button">
                                <img src="/icons/edit-icon.png" alt="Edit" />
                            </button>
                            <button className="icon-button delete-button">
                                <img src="/icons/delete-icon.png" alt="Delete" />
                            </button>
                        </td>
                        <td>{row.date}</td>
                        <td>{row.author}</td>
                        <td>{row.updated}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
