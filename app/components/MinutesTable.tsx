// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput, downloadData, remove } from 'aws-amplify/storage';
import './MinutesTable.css';

type StorageListOutput = ListAllWithPathOutput['items'];

interface MinutesTableProps {
  tableKey: number;
  searchKeyword?: string;
  onSelectMinute: (path: string) => void;
}

export default function MinutesTable({ tableKey, searchKeyword = '', onSelectMinute }: MinutesTableProps) {
  const [allMinutes, setAllMinutes] = useState<StorageListOutput>([]);
  const [filteredMinutes, setFilteredMinutes] = useState<StorageListOutput>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // 検索キーワードが変更されたときにフィルタリングを実行
  useEffect(() => {
    if (!searchKeyword) {
      setFilteredMinutes(allMinutes);
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    const filtered = allMinutes.filter(minute => {
      const fileName = minute.path.replace(/^minutes\/|\\/g, '').toLowerCase();
      return fileName.includes(keyword);
    });
    setFilteredMinutes(filtered);
  }, [searchKeyword, allMinutes]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await list({
          path: 'minutes/',
          options: {
            listAll: true,
          },
        });

        console.log('Fetched data:', JSON.stringify(result, null, 2));

        const filteredItems = result.items.filter(item => !item.path.endsWith('/') && item.path.startsWith('minutes/'));
        const sortedMinutes = sortMinutesByDate(filteredItems);
        setAllMinutes(sortedMinutes);
        setFilteredMinutes(sortedMinutes);
      } catch (error) {
        console.error("Error fetching minutes:", error);
        setError("議事録の取得中にエラーが発生しました。ネットワーク接続を確認してください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tableKey, retryCount]);

  // データ取得を再試行する関数
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const deleteFile = async (path: string) => {
    if (window.confirm('次のファイルを削除してもよろしいですか？:' + {path})) {
        try {
            await remove({
                path,
            });
            console.log('Deleted file: ${path}');
            const newMinutes = allMinutes.filter(item => item.path != path);
            setAllMinutes(newMinutes);
            setFilteredMinutes(newMinutes);
        } catch (error) {
            console.error("Error deleting file:", error);
            alert('ファイルの削除に失敗しました。再度実行してください。');
        }
    }
  }

  const sortMinutesByDate = (minutes: StorageListOutput) =>
    [...minutes].sort((a, b) => {
        const dateA = new Date(a.lastModified ?? '').getTime();
        const dateB = new Date(b.lastModified ?? '').getTime();
        return dateB - dateA;
    });

  // スケルトンローディングコンポーネント
  const TableSkeleton = () => (
    <tbody className="skeleton-loading">
      {[...Array(5)].map((_, index) => (
        <tr key={`skeleton-${index}`} className="skeleton-row">
          <td><div className="skeleton-circle"></div></td>
          <td><div className="skeleton-text"></div></td>
          <td><div className="skeleton-text skeleton-text-short"></div></td>
          <td><div className="skeleton-text skeleton-text-short"></div></td>
          <td><div className="skeleton-circle"></div></td>
          <td><div className="skeleton-circle"></div></td>
        </tr>
      ))}
    </tbody>
  );

  // エラーメッセージコンポーネント
  const ErrorMessage = () => (
    <div className="error-container" role="alert">
      <div className="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div className="error-message">
        <h3>エラーが発生しました</h3>
        <p>{error}</p>
      </div>
      <button 
        onClick={handleRetry} 
        className="retry-button"
        aria-label="データの取得を再試行"
      >
        再試行
      </button>
    </div>
  );

  return (
    <div className='minutes-table-container'>
        <div className='table-scroll-container'>
            <table className='minutes-table' aria-label="議事録一覧">
            <caption className="sr-only">議事録ファイルの一覧です。選択するとプレビューが表示されます。</caption>
            <thead>
            <tr>
                <th scope="col" aria-sort="none">選択</th>
                <th scope="col" aria-sort="none">ファイル名</th>
                <th scope="col" aria-sort="descending">更新日</th>
                <th scope="col" aria-sort="none">サイズ</th>
                <th scope="col" aria-sort="none">ダウンロード</th>
                <th scope="col" aria-sort="none">削除</th>
            </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <ErrorMessage />
                  </td>
                </tr>
              </tbody>
            ) : filteredMinutes.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="no-data-message">
                    表示する議事録がありません
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
              {filteredMinutes.map((minute) => (
                <tr 
                    key={minute.path}
                    className={selectedPath === minute.path ? 'selected-row' : ''}
                    onClick={(e) => {
                        // ダウンロードボタンや削除ボタンがクリックされた場合は、行の選択を行わない
                        if ((e.target as HTMLElement).closest('.icon-button')) {
                            return;
                        }
                        setSelectedPath(minute.path);
                        onSelectMinute(minute.path);
                    }}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-selected={selectedPath === minute.path}
                    tabIndex={0} // キーボード操作可能に
                    onKeyDown={(e) => {
                        // Enterキーまたはスペースキーでも選択可能に
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPath(minute.path);
                            onSelectMinute(minute.path);
                        }
                    }}
                >
                <td>
                    <input
                        type="radio"
                        name="minuteSelection"
                        checked={selectedPath === minute.path}
                        onChange={() => {
                            setSelectedPath(minute.path);
                            onSelectMinute(minute.path);
                        }}
                        onClick={(e) => e.stopPropagation()} // イベントの伝播を停止
                    />
                </td>
                <td>{minute.path.replace(/^minutes\/|\\/g, '')}</td>
                <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
                <td>{minute.size} bytes</td>
                <td>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // イベントの伝播を停止
                            downloadFile(minute.path);
                        }} 
                        className="icon-button"
                        aria-label={`${minute.path.replace(/^minutes\/|\\/g, '')}をダウンロード`}
                    >
                        <img src="/icons/download-icon.png" alt="ダウンロード" />
                    </button>
                </td>
                <td>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // イベントの伝播を停止
                            deleteFile(minute.path);
                        }} 
                        className="icon-button"
                        aria-label={`${minute.path.replace(/^minutes\/|\\/g, '')}を削除`}
                    >
                        <img src="/icons/delete-icon.png" alt="削除" />
                    </button>
                </td>
                </tr>
            ))}
              </tbody>
            )}
        </table>
        </div>
    </div>
  );
}

async function downloadFile(path: string) {
    try {
        const result = await downloadData({
            path,
        }).result;

        
        const blob = result.body.blob();
        const url = window.URL.createObjectURL(await blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = path.split('/').pop() || '';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}
