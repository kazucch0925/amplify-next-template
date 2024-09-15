// app/components/MinutesTable.tsx
'use client';

import { list } from 'aws-amplify/storage';

export const result = await list({
	path: 'minutes/',
  // Alternatively, path: ({identityId}) => `album/{identityId}/photos/`,
  options: {
    listAll: true,
  }
});