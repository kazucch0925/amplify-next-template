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
                
                // 文字化けを検出する関数
                const hasGarbledCharacters = (text: string): boolean => {
                    // 特定の文字化けパターンをチェック
                    const garbledPatterns = ['��', '縺', '繧', '繝'];
                    return garbledPatterns.some(pattern => text.includes(pattern));
                };

                // UTF-8で試行
                let content = await blob.text();
                console.log('UTF-8 content:', content.substring(0, 100));

                if (hasGarbledCharacters(content)) {
                    console.log('UTF-8 decoding resulted in garbled text, trying Shift-JIS...');
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            const shiftJisText = e.target.result as string;
                            console.log('Shift-JIS content:', shiftJisText.substring(0, 100));
                            if (!hasGarbledCharacters(shiftJisText)) {
                                setContent(shiftJisText);
                            } else {
                                console.log('Both UTF-8 and Shift-JIS resulted in garbled text');
                                setContent(content); // UTF-8の結果を使用
                            }
                        }
                    };

                    reader.onerror = () => {
                        console.error('Error reading file as Shift-JIS');
                        setContent(content); // UTF-8の結果を使用
                    };

                    reader.readAsText(blob, 'shift-jis');
                } else {
                    setContent(content);
                }
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
