// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput, downloadData, remove } from 'aws-amplify/storage';
import './MinutesTable.css';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

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
  const [viewMode, setViewMode] = useState<'private' | 'shared'>('private');

  // 検索キーワードが変更されたときにフィルタリングを実行
  useEffect(() => {
    if (!searchKeyword) {
      setFilteredMinutes(allMinutes);
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    const filtered = allMinutes.filter(minute => {
      const fileName = minute.path.split('/').pop()?.toLowerCase() || '';
      return fileName.includes(keyword);
    });
    setFilteredMinutes(filtered);
  }, [searchKeyword, allMinutes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 現在のユーザー情報を取得
        const currentUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
          
        // Cognitoの標準ユーザー識別子 - subを使用
        const userSub = userAttributes.sub;

        // ユーザーのプライベートフォルダまたは共有フォルダのパスを指定
        const path = viewMode === 'private' 
          ? `minutes/private/${userSub}/` 
          : 'minutes/shared/';
          
        console.log('Fetching minutes from path:', path);
        console.log('User sub:', userSub);
        console.log('User ID from getCurrentUser:', currentUser.userId);

        const result = await list({
          path: path,
          options: {
            listAll: true,
          },
        });

        console.log('Fetched data:', JSON.stringify(result, null, 2));

        const filteredItems = result.items.filter(item => !item.path.endsWith('/'));
        const sortedMinutes = sortMinutesByDate(filteredItems);
        setAllMinutes(sortedMinutes);
        setFilteredMinutes(sortedMinutes);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, [tableKey, viewMode]);

  const deleteFile = async (path: string) => {
    if (window.confirm('次のファイルを削除してもよろしいですか？: ' + path)) {
        try {
            await remove({
                path,
            });
            console.log(`Deleted file: ${path}`);
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

  return (
    <div className='minutes-table-container'>
        <div className="view-toggle">
          <button 
            className={viewMode === 'private' ? 'active' : ''}
            onClick={() => setViewMode('private')}
          >
            マイ議事録
          </button>
          <button 
            className={viewMode === 'shared' ? 'active' : ''}
            onClick={() => setViewMode('shared')}
          >
            共有議事録
          </button>
        </div>
        <div className='table-scroll-container'>
            <table className='minutes-table'>
            <thead>
            <tr>
                <th>選択</th>
                <th>ファイル名</th>
                <th>更新日</th>
                <th>サイズ</th>
                <th>ダウンロード</th>
                <th>削除</th>
            </tr>
            </thead>
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
                <td>{minute.path.split('/').pop() || ''}</td>
                <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
                <td>{minute.size} bytes</td>
                <td>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // イベントの伝播を停止
                            downloadFile(minute.path);
                        }} 
                        className="icon-button"
                    >
                        <img src="/icons/download-icon.png" alt="Download" />
                    </button>
                </td>
                <td>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // イベントの伝播を停止
                            deleteFile(minute.path);
                        }} 
                        className="icon-button"
                        disabled={viewMode === 'shared'}
                    >
                        <img src="/icons/delete-icon.png" alt="Delete" />
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
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
