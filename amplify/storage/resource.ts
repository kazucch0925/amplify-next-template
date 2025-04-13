import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'docuhubMinutes',
  access: (allow) => ({
    // ユーザーごとのプライベートフォルダ
    'minutes/private/${user.sub}/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    // 共有フォルダ（認証済みユーザー全員が読み取りと書き込み可能）
    'minutes/shared/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
    ]
  })
});
