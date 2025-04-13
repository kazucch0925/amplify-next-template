'use client';

import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import Button from './Button';
import './CreateMinutesModal.css';

interface CreateMinutesModalProps {
    onClose: () => void;
    onCreateComplete: () => void;
}

export default function CreateMinutesModal({ onClose, onCreateComplete }: CreateMinutesModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isShared, setIsShared] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // フォームの入力状態を監視
    const isFormValid = title.trim() !== '' && content.trim() !== '';

    const handleCreate = async () => {
        if (!isFormValid) {
            alert('タイトルと内容を入力してください。');
            return;
        }

        setIsSaving(true);

        try {
            // 現在のユーザー情報を取得
            const user = await getCurrentUser();
            // userId ではなく sub を使用する（Cognito標準のユーザー識別子）
            const userSub = user.userId;
            
            // タイトルから有効なファイル名を生成
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
            
            // ファイルの保存先を決定（プライベートか共有か）
            const filePath = isShared
                ? `minutes/shared/${fileName}`
                : `minutes/private/${userSub}/${fileName}`;
            
            console.log('Uploading file to:', filePath);
            
            // テキストファイルとして保存
            const textBlob = new Blob([content], { type: 'text/plain' });
            
            await uploadData({
                data: textBlob,
                path: filePath
            }).result;
            
            // ファイルの保存が確実に完了するまで待機
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 完了後にコールバックを実行
            if (onCreateComplete) {
                onCreateComplete();
            }
            onClose();
        } catch (error) {
            console.error('Error creating minutes:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`議事録の作成に失敗しました。\nエラー: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container">
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>議事録の新規作成</h3>
                <div className="modal-body">
                    <div className="input-group">
                        <label htmlFor="title">ファイル名</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="議事録のタイトルを入力..."
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="content">内容</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="議事録の内容を入力..."
                            rows={15}
                        />
                    </div>
                    <div className="input-group checkbox">
                        <input
                            type="checkbox"
                            id="isShared"
                            checked={isShared}
                            onChange={(e) => setIsShared(e.target.checked)}
                        />
                        <label htmlFor="isShared">全員と共有する</label>
                    </div>
                </div>
                <div className="modal-footer">
                    <Button
                        onClick={handleCreate}
                        className="create-modal-button"
                        colorScheme="primary"
                        disabled={!isFormValid || isSaving}
                    >
                        {isSaving ? '保存中...' : '作成'}
                    </Button>
                </div>
                </div>
                <button className="close-icon" onClick={onClose}>
                    <img src='/icons/close-white-icon.png' alt='Close' />
                </button>
            </div>
        </div>
    );
}
