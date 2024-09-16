import React, { useState } from 'react';
import Button from './Button'
import { FileUploader } from '@aws-amplify/ui-react-storage';
import './UploadModal.css';
import { remove } from 'aws-amplify/storage';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ onClose, onUploadComplete }: UploadModalProps) {
    const [hasFile, setHasFile] = useState(false);

    const handleUploadComplete = () => {
      console.log('handleUploadComplete called');
      onClose();

      if (onUploadComplete) {
        onUploadComplete();
      }
    }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-icon" onClick={onClose}>
          <img src='/icons/close-white-icon.png' alt='Close' />
        </button>
        <h3>議事録アップロード</h3>
        <FileUploader
          acceptedFileTypes={[".pdf,.doc,.docx,.txt"]}
          path="minutes/"
          maxFileCount={5}
          maxFileSize={10000}
          onUploadSuccess={(result: any) => {
            console.log(result);
            deleteTempFile(result.path).then(() => {
              handleUploadComplete();
            });
          }}
        />
        <Button
          onClick={onClose}
          className="upload-modal-button"
          colorScheme="primary"
          disabled={!hasFile}
        >
          アップロード
        </Button>
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