// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput, downloadData, remove } from 'aws-amplify/storage';
import './MinutesTable.css';
import { getCurrentUser } from 'aws-amplify/auth';

type StorageListOutput = ListAllWithPathOutput['items'];

interface MinutesTableProps {
  key: number;
  onSelectMinute: (path: string) => void;
}

export default function MinutesTable({ key, onSelectMinute }: MinutesTableProps) {
  const [minutes, setMinutes] = useState<StorageListOutput>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'private' | 'shared'>('private');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 現在のユーザー情報を取得
        const user = await getCurrentUser();
        const userId = user.userId;

        // ユーザーのプライベートフォルダまたは共有フォルダのパスを指定
        const path = viewMode === 'private' 
          ? `minutes/private/${userId}/` 
          : 'minutes/shared/';

        const result = await list({
          path: path,
          options: {
            listAll: true,
          },
        });

        console.log('Fetched data:', JSON.stringify(result, null, 2));

        const filteredItems = result.items.filter(item => !item.path.endsWith('/'));
        const sortedMinutes = sortMinutesByDate(filteredItems);
        setMinutes(sortedMinutes);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, [key, viewMode]);

  const deleteFile = async (path: string) => {
    if (window.confirm('次のファイルを削除してもよろしいですか？: ' + path)) {
        try {
            await remove({
                path,
            });
            console.log(`Deleted file: ${path}`);
            const newMinutes = minutes.filter(item => item.path != path);
            setMinutes(newMinutes);
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
        <div className='minutes-table'>
        <table>
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
            {minutes.map((minute) => (
                <tr key={minute.path}>
                <td>
                    <input
                        type="radio"
                        name="minuteSelection"
                        checked={selectedPath === minute.path}
                        onChange={() => {
                            setSelectedPath(minute.path);
                            onSelectMinute(minute.path);
                        }}
                    />
                </td>
                <td>{minute.path.split('/').pop() || ''}</td>
                <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
                <td>{minute.size} bytes</td>
                <td>
                    <button onClick={() => downloadFile(minute.path)} className="icon-button">
                    <img src="/icons/download-icon.png" alt="Download" />
                    </button>
                </td>
                <td>
                    <button 
                      onClick={() => deleteFile(minute.path)} 
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
