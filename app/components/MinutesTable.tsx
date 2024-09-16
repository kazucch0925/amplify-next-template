// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput } from 'aws-amplify/storage';

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

        setMinutes(result.items);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='minutes-table'>
      <h2>Fetched Minutes:</h2>
      <table>
        <thead>
          <tr>
            <th>Path</th>
            <th>Last Modified</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {minutes.map((minute) => (
            <tr key={minute.path}>
              <td>{minute.path}</td>
              <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
              <td>{minute.size} bytes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

