// app/components/MinutesTable.tsx
'use client';

import React, { useEffect } from 'react';
import { list } from 'aws-amplify/storage';

export default function MinutesTable() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await list({
          path: 'minutes/',
          options: {
            listAll: true,
          },
        });
        console.log(result);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, []);

  return null;
}

