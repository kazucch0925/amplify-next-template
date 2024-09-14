import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'docuhubMinutes',
  access: (allow) => ({
    'minutes/*': [
        allow.guest.to(['read']),
        allow.authenticated.to(['read', 'write', 'delete'])
    ]
  })
});
