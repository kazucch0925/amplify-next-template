// app/components/TopBar.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Authenticator } from '@aws-amplify/ui-react';
import Button from './Button'
import './TopBar.css';

export default function TopBar({ isLoggedIn }: { isLoggedIn?: boolean;}) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/');  // トップページへの遷移
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <header className="header">
          <h1 className="logo" onClick={handleLogoClick}>DocuHub</h1>
          {isLoggedIn && (
            <Button
              onClick={signOut}
              className="logout-button"
              iconSrc={"/icons/logout-black-icon.png"}
              altText={"Logout-icon"}
              colorScheme='secondary'
            >
              ログアウト
            </Button>
          )}
        </header>
      )}
      </Authenticator>
  );
}