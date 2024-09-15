// app/components/MinutesTable.tsx
'use client';

import { list } from 'aws-amplify/storage';

const result = await list({
	path: 'minuites/',
  // Alternatively, path: ({identityId}) => `album/{identityId}/photos/`,
  options: {
    listAll: true,
  }
});