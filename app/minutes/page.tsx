'use client';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import React, { useState } from 'react';
import TopBar from './../components/TopBar';
import SearchBar from './../components/SearchBar';
import MinutesTable from './../components/MinutesTable';
import Preview from './../components/Preview';
import UploadModal from './../components/UploadModal';
import CreateMinutesModal from './../components/CreateMinutesModal';
import Button from './../components/Button';
import './Minutes.css';
import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function Minutes() {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [minutesListKey, setMinutesListKey] = useState(0);
    const [selectedMinutePath, setSelectedMinutePath] = useState<string | null>(null);

    const handleOpenUploadModal = () => {
        setUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setUploadModalOpen(false);
    };

    const handleOpenCreateModal = () => {
        setCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setCreateModalOpen(false);
    };

    const handleRefreshMinutes = () => {
        // MinutesTable の再描画をトリガーするために、key を更新
        setMinutesListKey(prevKey => prevKey + 1);
    };

    return (
        <Authenticator>
            {({ signOut, user }) => (
                <main>
                    <div className="minutes-page-container">
                        <TopBar isLoggedIn={true} />
                        <h2>議事録一覧</h2>
                        <div className="content">
                            <div className="left-section">
                                <div className="search-upload-container">
                                    <SearchBar placeholder="議事録を検索..." />
                                    <div className="button-container">
                                        <Button
                                            onClick={() => {
                                                handleOpenUploadModal();
                                            }}
                                            className="upload-button"
                                            iconSrc={"/icons/upload-white-icon.png"}
                                            altText={"Upload-icon"}
                                        >
                                            アップロード...
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleOpenCreateModal();
                                            }}
                                            className="create-button"
                                            iconSrc={"/icons/edit-icon.png"}
                                            altText={"Create-icon"}
                                        >
                                            新規作成
                                        </Button>
                                    </div>
                                </div>
                                    <MinutesTable 
                                        key={minutesListKey} 
                                        onSelectMinute={(path) => setSelectedMinutePath(path)}
                                    />
                            </div>
                            <div className="right-section">
                                    <Preview selectedPath={selectedMinutePath} />
                            </div>
                        </div>
                        {isUploadModalOpen && <UploadModal onClose={handleCloseUploadModal} onUploadComplete={handleRefreshMinutes}/>}
                        {isCreateModalOpen && <CreateMinutesModal onClose={handleCloseCreateModal} onCreateComplete={handleRefreshMinutes}/>}
                    </div>
                </main>
            )}
        </Authenticator>
    )
}
