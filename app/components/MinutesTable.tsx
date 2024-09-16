// app/components/MinutesTable.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { list, ListAllWithPathOutput, downloadData, remove } from 'aws-amplify/storage';
import './MinutesTable.css';

type StorageListOutput = ListAllWithPathOutput['items'];

export default function MinutesTable({ key }: { key: number }) {
  const [minutes, setMinutes] = useState<StorageListOutput>([]);

  useEffect(() => {
    const fetchData = async () => {
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
        setMinutes(filteredItems);
      } catch (error) {
        console.error("Error fetching minutes:", error);
      }
    };

    fetchData();
  }, [key]);

  const deleteFile = async (path: string) => {
    if (window.confirm('次のファイルを削除してもよろしいですか？: ${path}')) {
        try {
            await remove({
                path,
            });
            console.log('Deleted file: ${path}');
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
        <div className='minutes-table'>
        <table>
            <thead>
            <tr>
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
                <td>{minute.path.replace(/^minutes\/|\\/g, '')}</td>
                <td>{minute.lastModified ? new Date(minute.lastModified).toLocaleDateString() : ''}</td>
                <td>{minute.size} bytes</td>
                <td>
                    <button onClick={() => downloadFile(minute.path)} className="icon-button">
                    <img src="/icons/download-icon.png" alt="Download" />
                    </button>
                </td>
                <td>
                    <button onClick={() => deleteFile(minute.path)} className="icon-button">
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

