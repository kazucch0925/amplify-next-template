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
    
    // フォームの入力状態を監視
    const isFormValid = title.trim() !== '' && content.trim() !== '';

    const handleCreate = async () => {

        try {
            // タイトルから有効なファイル名を生成
            const fileName = `minutes/${title}.txt`;
            
            // テキストファイルとして保存
            await uploadData({
                data: content,
                path: fileName
            });
            
            // 完了後にコールバックを実行
            if (onCreateComplete) {
                onCreateComplete();
            }
            onClose();
        } catch (error) {
            console.error('Error creating minutes:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`議事録の作成に失敗しました。\nエラー: ${errorMessage}`);
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
                </div>
                <div className="modal-footer">
                    <Button
                        onClick={handleCreate}
                        className="create-modal-button"
                        colorScheme="primary"
                        disabled={!isFormValid}
                    >
                        作成
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
