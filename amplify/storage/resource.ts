import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'docuhubMinutes',
  access: (allow) => ({
    // バケット全体へのリスト操作権限を追加
    'minutes/': [
      allow.authenticated.to(['list']),
    ],
    // ユーザーごとのプライベートフォルダ
    'minutes/private/${user.sub}/*': [
      allow.authenticated.to(['get', 'write', 'delete', 'list']),
    ],
    // 共有フォルダ（認証済みユーザー全員が読み取りと書き込み可能）
    'minutes/shared/*': [
      allow.authenticated.to(['get', 'write', 'delete', 'list']),
    ]
  })
});
