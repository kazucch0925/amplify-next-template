// app/components/TopBar.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from './Button'
import './TopBar.css';

export default function TopBar({ isLoggedIn }: { isLoggedIn?: boolean;}) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/dashboard');  // トップページへの遷移
  };

  const handleLogout = () => {
    // ログアウト処理をここに追加
    router.push('/login');  // ログインページへの遷移
  };

  return (
    <header className="header">
      <h1 className="logo" onClick={handleLogoClick}>DocuHub</h1>
      {isLoggedIn && (
        <Button
          onClick={handleLogout}
          className="logout-button"
          iconSrc={"/icons/logout-black-icon.png"}
          altText={"Logout-icon"}
          colorScheme='secondary'
        >
          ログアウト
        </Button>
      )}
    </header>
  );
}