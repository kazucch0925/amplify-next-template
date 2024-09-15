"use client";

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import DashboardItem from "./components/DashboardItem"
import TopBar from './components/TopBar';
import SearchBar from './components/SearchBar';
import UploadModal from './components/UploadModal';

Amplify.configure(outputs);

export default function App() {

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const handleUploadButtonClick = () => {
    setUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setUploadModalOpen(false);
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <div className="dashboard-container">
            <TopBar isLoggedIn={true} />  {/* ダッシュボードではログアウトボタンを表示 */}
              <h2>ダッシュボード</h2>
              <SearchBar placeholder="アプリ内を検索..." />
              <div className="dashboard-items">
                <DashboardItem title="Wiki" icon="wiki-icon.png" disabled /*link="/wiki" *//>
                <DashboardItem title="議事録" icon="minutes-icon.png" link="/minutes" />
                <DashboardItem title="アップロード" icon="upload-icon.png" onClick={handleUploadButtonClick} />
                <DashboardItem title="設定" icon="settings-icon.png" disabled />
              </div>
            <button onClick={signOut}>Sign out</button>
            {isUploadModalOpen && <UploadModal onClose={handleCloseModal} />}
          </div>
        </main>
      )}
    </Authenticator>
  )
}
