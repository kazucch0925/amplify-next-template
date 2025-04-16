import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'docuhubMinutes',
  access: (allow) => ({
    // バケット全体へのリスト操作権限を追加
    'minutes/*': [
      allow.authenticated.to(['list']),
    ],
    // 共有フォルダへのアクセス権限
    'minutes/shared/*': [
      allow.authenticated.to(['get', 'write', 'delete', 'list']),
    ],
    // ユーザーごとのプライベートフォルダ (Identity Pool ID を使用)
    'minutes/private/${cognito-identity.amazonaws.com:sub}/*': [
      allow.authenticated.to(['get', 'write', 'delete', 'list']),
    ]
  })
});
