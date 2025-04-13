import React, { useState, useEffect } from 'react';
import Button from './Button'
import { FileUploader } from '@aws-amplify/ui-react-storage';
import './UploadModal.css';
import { remove } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
    const [hasFile, setHasFile] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [uploadPath, setUploadPath] = useState('');
    
    useEffect(() => {
      const setupUploadPath = async () => {
        try {
          const user = await getCurrentUser();
          const userId = user.userId;
          const path = isShared 
            ? 'minutes/shared/' 
            : `minutes/private/${userId}/`;
          setUploadPath(path);
        } catch (error) {
          console.error('Error getting user ID:', error);
        }
      };
      
      setupUploadPath();
    }, [isShared]);

    const handleUploadComplete = () => {
      console.log('handleUploadComplete called');
      onClose();

      if (onUploadComplete) {
        onUploadComplete();
      }
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
              acceptedFileTypes={[".pdf,.doc,.docx,.txt"]}
              path={uploadPath}
              maxFileCount={5}
              maxFileSize={10000}
              onUploadSuccess={(result: any) => {
                console.log(result);
                deleteTempFile(result.path).then(() => {
                  handleUploadComplete();
                });
              }}
            />
          )}
          <Button
            onClick={onClose}
            className="upload-modal-button"
            colorScheme="primary"
            disabled={!hasFile}
          >
            アップロード
          </Button>
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
