import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'docuhubMinutes',
  access: (allow) => ({
    'minutes/*': [
        allow.guest.to(['get', 'write', 'delete', 'list']),
        allow.authenticated.to(['get', 'write', 'delete', 'list'])
    ],
    'minutes/shared/*': [
        allow.guest.to(['get', 'list']),
        allow.authenticated.to(['get', 'write', 'delete', 'list'])
    ],
    'minutes/private/*': [
        allow.authenticated.to(['get', 'write', 'delete', 'list'])
    ]
  })
});
