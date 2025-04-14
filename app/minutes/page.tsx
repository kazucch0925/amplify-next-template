'use client';

import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import React, { useState, useRef, useEffect } from 'react';
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
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const handleRef = useRef<HTMLDivElement>(null);
    const rightSectionRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const currentXRef = useRef(0);
    const [searchKeyword, setSearchKeyword] = useState('');

    // タッチ/マウスイベントハンドラー
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        startXRef.current = clientX;
        currentXRef.current = clientX;
        
        // ドラッグ中はトランジションを無効化
        if (handleRef.current) handleRef.current.classList.add('dragging');
        if (rightSectionRef.current) rightSectionRef.current.classList.add('dragging');
    };

    const handleTouchMove = (e: TouchEvent | MouseEvent) => {
        if (!isDragging) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - startXRef.current;
        currentXRef.current = clientX;
        
        // プレビューの表示状態を更新
        const threshold = window.innerWidth * 0.3; // 30%の閾値
        if (isPreviewVisible && deltaX > threshold) {
            setIsPreviewVisible(false);
        } else if (!isPreviewVisible && deltaX < -threshold) {
            setIsPreviewVisible(true);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        
        // トランジションを再有効化
        if (handleRef.current) handleRef.current.classList.remove('dragging');
        if (rightSectionRef.current) rightSectionRef.current.classList.remove('dragging');
    };

    // イベントリスナーの設定
    useEffect(() => {
        document.addEventListener('mousemove', handleTouchMove);
        document.addEventListener('mouseup', handleTouchEnd);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        
        return () => {
            document.removeEventListener('mousemove', handleTouchMove);
            document.removeEventListener('mouseup', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, isPreviewVisible]);

    // プレビューを表示
    const showPreview = (path: string) => {
        setSelectedMinutePath(path);
        setIsPreviewVisible(true);
    };

    // プレビューを閉じる
    const hidePreview = () => {
        setIsPreviewVisible(false);
    };

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
                <main aria-label="議事録管理システム">
                    <div className="minutes-page-container">
                        <TopBar isLoggedIn={true} />
                        <h1 className="page-title">議事録一覧</h1>
                        <div className="content">
                            <section className="left-section" aria-label="議事録一覧セクション">
                                <div className="search-upload-container" role="search" aria-label="議事録検索">
                                    <SearchBar 
                                        placeholder="議事録を検索..." 
                                        onSearch={setSearchKeyword}
                                    />
                                    <div className="button-container" role="toolbar" aria-label="議事録操作">
                                        <Button
                                            onClick={() => {
                                                handleOpenUploadModal();
                                            }}
                                            className="upload-button"
                                            iconSrc={"/icons/upload-white-icon.png"}
                                            altText={"アップロードアイコン"}
                                            aria-label="議事録をアップロード"
                                        >
                                            アップロード...
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleOpenCreateModal();
                                            }}
                                            className="create-button"
                                            iconSrc={"/icons/create-white-icon.png"}
                                            altText={"作成アイコン"}
                                            aria-label="新しい議事録を作成"
                                        >
                                            新規作成
                                        </Button>
                                    </div>
                                </div>
                                <MinutesTable 
                                    tableKey={minutesListKey} 
                                    searchKeyword={searchKeyword}
                                    onSelectMinute={(path) => showPreview(path)}
                                />
                            </section>
                            {/* PC版のプレビュー表示部分 */}
                            <section className="right-section-pc" aria-label="議事録プレビューセクション">
                                <Preview selectedPath={selectedMinutePath} />
                            </section>
                            
                            {/* モバイル版のプレビューコンテナ（つまみとプレビュー部分を一体化） */}
                            <div 
                                ref={rightSectionRef}
                                className={`preview-container ${isPreviewVisible ? 'show' : ''}`}
                                role="complementary"
                                aria-label="モバイル用プレビュー"
                            >
                                {/* プレビューつまみ */}
                                <div 
                                    ref={handleRef}
                                    className="preview-handle"
                                    onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                                    onMouseDown={handleTouchStart}
                                    onTouchStart={handleTouchStart}
                                    role="button"
                                    aria-label={isPreviewVisible ? "プレビューを閉じる" : "プレビューを開く"}
                                    aria-expanded={isPreviewVisible}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setIsPreviewVisible(!isPreviewVisible);
                                        }
                                    }}
                                >
                                    <div className="preview-handle-text">プレビュー表示</div>
                                </div>
                                
                                {/* モバイル版のプレビュー本体 */}
                                <div className="right-section-mobile" role="region" aria-label="議事録プレビュー">
                                    <button 
                                        className="preview-close" 
                                        onClick={hidePreview}
                                        aria-label="プレビューを閉じる"
                                    >
                                        <img src="/icons/close-black-icon.png" alt="閉じる" />
                                    </button>
                                    <Preview selectedPath={selectedMinutePath} />
                                </div>
                            </div>
                            {isPreviewVisible && (
                                <div 
                                    className={`preview-overlay ${isPreviewVisible ? 'show' : ''}`}
                                    onClick={hidePreview}
                                    role="presentation"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        {isUploadModalOpen && <UploadModal onClose={handleCloseUploadModal} onUploadComplete={handleRefreshMinutes}/>}
                        {isCreateModalOpen && <CreateMinutesModal onClose={handleCloseCreateModal} onCreateComplete={handleRefreshMinutes}/>}
                    </div>
                </main>
            )}
        </Authenticator>
    )
}
