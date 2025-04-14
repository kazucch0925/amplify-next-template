'use client';

import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
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
    const [debugInfo, setDebugInfo] = useState<string>(''); // デバッグ情報を保存するためのステート
    
    // フォームの入力状態を監視
    const isFormValid = title.trim() !== '' && content.trim() !== '';

    const handleCreate = async () => {
        if (!isFormValid) {
            alert('タイトルと内容を入力してください。');
            return;
        }

        setIsSaving(true);
        setDebugInfo(''); // デバッグ情報をクリア

        try {
            // 現在のユーザー情報を取得
            const currentUser = await getCurrentUser();
            const userAttributes = await fetchUserAttributes();
            
            // Cognitoの標準ユーザー識別子 - subを使用
            const userSub = userAttributes.sub;
            
            // タイトルから有効なファイル名を生成
            const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
            
            // ファイルの保存先を決定（プライベートか共有か）
            const filePath = isShared
                ? `minutes/shared/${fileName}`
                : `minutes/private/${userSub}/${fileName}`;
            
            // デバッグ情報を出力
            const debugDetails = `
            アップロード情報:
            - ファイルパス: ${filePath}
            - ユーザーSUB: ${userSub}
            - ユーザーID: ${currentUser.userId}
            - 属性情報: ${JSON.stringify(userAttributes, null, 2)}
            `;
            
            console.log(debugDetails);
            setDebugInfo(debugDetails); // デバッグ情報をテキストファイルとして保存
            
            console.log('Uploading file to:', filePath);
            console.log('User sub:', userSub);
            console.log('User ID from getCurrentUser:', currentUser.userId);
            console.log('All user attributes:', JSON.stringify(userAttributes, null, 2));
            
            // 非共有ファイルならテストパスを使用（デバッグ用）
            if (!isShared) {
                // テスト用に書き込み権限のあるパスに書き込む
                console.log('Trying to upload to shared folder as a test');
                await uploadData({
                    data: new Blob(['Test content'], { type: 'text/plain' }),
                    path: `minutes/shared/test_debug_${Date.now()}.txt`
                }).result;
                console.log('Test upload to shared folder successful');
            } // デバッグ用ここまで
            
            // テキストファイルとして保存
            const textBlob = new Blob([content], { type: 'text/plain' });
            
            try {
                await uploadData({
                    data: textBlob,
                    path: filePath
                }).result;
                console.log('Upload successful to:', filePath);
            } catch (uploadError) {
                console.error('Upload failed:', uploadError);
                setDebugInfo(prev => prev + '\n\nアップロードエラー: ' + JSON.stringify(uploadError));
                throw uploadError;
            }
            
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
            setDebugInfo(prev => prev + '\n\n最終エラー: ' + errorMessage);
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
                    
                    {debugInfo && (
                        <div className="debug-info" style={{fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '150px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '8px', marginTop: '10px', border: '1px solid #ddd'}}>
                            {debugInfo}
                        </div>
                    )}
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
