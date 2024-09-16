// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput } from 'aws-amplify/storage';
import './MinutesTable.css';

type StorageListOutput = ListAllWithPathOutput['items'];

export default function MinutesTable() {
  const [minutes, setMinutes] = useState<StorageListOutput>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await list({
          path: 'minutes/',
          options: {
            listAll: true,
          },
        });

        console.log('Fetched data:', JSON.stringify(result, null, 2));

        const filteredItems = result.items.filter(item => !item.path.endsWith('/') && item.path.startsWith('minutes/'));
        setMinutes(filteredItems);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='minutes-table'>
      <table>
        <thead>
          <tr>
            <th>ファイル名</th>
            <th>最終更新日時</th>
            <th>サイズ</th>
          </tr>
        </thead>
        <tbody>
          {minutes.map((minute) => (
            <tr key={minute.path}>
              <td>{minute.path.replace(/^minutes\/|\\/g, '')}</td>
              <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
              <td>{minute.size} bytes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

