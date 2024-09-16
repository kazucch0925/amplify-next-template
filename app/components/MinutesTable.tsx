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

        setMinutes(result.items as unknown as StorageListOutput);
        console.log(result);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='minutes-table'>
      <h2>Fetched Minutes:</h2>
      <pre>{JSON.stringify(minutes, null, 2)}</pre>
    </div>
  );
}

