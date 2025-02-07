import React, { useEffect, useState } from 'react';
import { downloadData } from 'aws-amplify/storage';
import './Preview.css';

interface PreviewProps {
    selectedPath: string | null;
}

export default function Preview({ selectedPath }: PreviewProps) {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (!selectedPath) {
                setContent('');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await downloadData({
                    path: selectedPath,
                }).result;
                
                const blob = await result.body.blob();
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    if (e.target?.result) {
                        // まずUTF-8として試行
                        try {
                            const decoder = new TextDecoder('utf-8');
                            const uint8Array = new Uint8Array(e.target.result as ArrayBuffer);
                            const text = decoder.decode(uint8Array);
                            setContent(text);
                        } catch (error) {
                            // UTF-8で失敗した場合、Shift-JISとして試行
                            try {
                                const decoder = new TextDecoder('shift-jis');
                                const uint8Array = new Uint8Array(e.target.result as ArrayBuffer);
                                const text = decoder.decode(uint8Array);
                                setContent(text);
                            } catch (shiftJisError) {
                                console.error("Error decoding file:", shiftJisError);
                                setError('ファイルの読み込みに失敗しました。');
                            }
                        }
                    }
                };

                reader.onerror = () => {
                    console.error("Error reading file");
                    setError('ファイルの読み込みに失敗しました。');
                };

                reader.readAsArrayBuffer(blob);
            } catch (error) {
                console.error("Error fetching file content:", error);
                setError('ファイルの読み込みに失敗しました。');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [selectedPath]);

    return (
        <div className="preview-container">
            <h3>議事録プレビュー</h3>
            {!selectedPath && <p>左の一覧から議事録を選択してください</p>}
            {loading && <p>読み込み中...</p>}
            {error && <p className="error">{error}</p>}
            {content && !loading && !error && (
                <div className="preview-content">
                    <pre>{content}</pre>
                </div>
            )}
        </div>
    );
}
