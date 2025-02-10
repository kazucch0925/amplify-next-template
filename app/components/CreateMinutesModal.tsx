'use client';

import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import Button from './Button';
import './CreateMinutesModal.css';

interface CreateMinutesModalProps {
    onClose: () => void;
    onCreateComplete: () => void;
}

export default function CreateMinutesModal({ onClose, onCreateComplete }: CreateMinutesModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('タイトルを入力してください。');
            return;
        }

        try {
            // タイトルから有効なファイル名を生成
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
            
            // テキストファイルとして保存
            await uploadData({
                key: fileName,
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
