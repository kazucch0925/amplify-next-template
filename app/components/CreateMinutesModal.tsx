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

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('タイトルを入力してください。');
            return;
        }

        try {
            // 現在のユーザー情報を取得
            const user = await getCurrentUser();
            const userId = user.userId;
            
            // タイトルから有効なファイル名を生成
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
            
            // ファイルの保存先を決定（プライベートか共有か）
            const filePath = isShared
                ? `minutes/shared/${fileName}`
                : `minutes/private/${userId}/${fileName}`;
            
            // テキストファイルとして保存
            await uploadData({
                key: filePath,
                data: content,
                options: {
                    contentType: 'text/plain'
                }
            });
            
            onCreateComplete();
            onClose();
        } catch (error) {
            console.error('Error creating minutes:', error);
            alert('議事録の作成に失敗しました。');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="create-minutes-modal">
                <div className="modal-header">
                    <h3>議事録の新規作成</h3>
                    <button className="close-button" onClick={onClose}>
                        <img src="/icons/close-black-icon.png" alt="Close" />
                    </button>
                </div>
                <div className="modal-content">
                    <div className="input-group">
                        <label htmlFor="title">タイトル</label>
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
                        onClick={onClose}
                        className="cancel-button"
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleCreate}
                        className="create-button"
                    >
                        作成
                    </Button>
                </div>
            </div>
        </div>
    );
}
