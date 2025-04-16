import React, { useState, useEffect } from 'react';
import Button from './Button'
import { FileUploader } from '@aws-amplify/ui-react-storage';
import './UploadModal.css';
import { remove } from 'aws-amplify/storage';
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
    const [isShared, setIsShared] = useState(false);
    const [uploadPath, setUploadPath] = useState('');
    
    useEffect(() => {
      const setupUploadPath = async () => {
        try {
          // 現在のユーザー情報を取得
          const currentUser = await getCurrentUser();
          const userAttributes = await fetchUserAttributes();
          const session = await fetchAuthSession();
          const identityId = session.identityId;

          if (!identityId) {
            console.error('Could not get identity ID.');
            setUploadPath('');
            return;
          }
          
          const path = isShared 
            ? 'minutes/shared/' 
            : `minutes/private/${identityId}/`;
            
          console.log('Setting upload path:', path);
          console.log('Identity ID:', identityId);
          console.log('User ID from getCurrentUser:', currentUser.userId);
          
          setUploadPath(path);
        } catch (error) {
          console.error('Error setting up upload path:', error);
          setUploadPath('');
        }
      };
      
      setupUploadPath();
    }, [isShared]);

    const handleUploadComplete = (result: any) => {
      console.log('Upload completed:', result);
      deleteTempFile(result.path).then(() => {
        if (onUploadComplete) {
          onUploadComplete();
        }
        onClose();
      });
    }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>議事録アップロード</h3>
          <div className="sharing-option">
            <input
              type="checkbox"
              id="isShared"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
            />
            <label htmlFor="isShared">全員と共有する</label>
          </div>
          {uploadPath && (
            <FileUploader
              acceptedFileTypes={[".pdf", ".doc", ".docx", ".txt"]}
              path={uploadPath}
              maxFileCount={5}
              maxFileSize={10000}
              onUploadSuccess={handleUploadComplete}
            />
          )}
        </div>
        <button className="close-icon" onClick={onClose}>
          <img src='/icons/close-white-icon.png' alt='Close' />
        </button>
      </div>
    </div>
  );
}

async function deleteTempFile(path: string) {
  try {
    await remove({
      path,
    });
    console.log(`Deleted temp file: ${path}`);
  } catch (error) {
    console.error("Error deleting temp file:", error);
  }
}
