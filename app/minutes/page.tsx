'use client';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import React, { useState } from 'react';
import TopBar from './../components/TopBar';
import SearchBar from './../components/SearchBar';
import MinutesTable from './../components/MinutesTable';
import Preview from './../components/Preview';
import UploadModal from './../components/UploadModal';
import Button from './../components/Button';
import './Minutes.css';
import { Amplify } from 'aws-amplify';
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export default function Minutes() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [minutesListKey, setMinutesListKey] = useState(0);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
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
                                    <Button
                                        onClick={() => {
                                            handleOpenModal();
                                        }}
                                        className="upload-button"
                                        iconSrc={"/icons/upload-white-icon.png"}
                                        altText={"Upload-icon"}
                                    >
                                        アップロード...
                                    </Button>
                                </div>
                                    <MinutesTable key={minutesListKey} />
                            </div>
                            <div className="right-section">
                                    <Preview />
                            </div>
                        </div>
                        {isModalOpen && <UploadModal onClose={handleCloseModal} onUploadComplete={handleRefreshMinutes}/>}
                    </div>
                </main>
            )}
        </Authenticator>
    )
}
