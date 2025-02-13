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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>議事録アップロード</h3>
          <FileUploader
            acceptedFileTypes={[".pdf", ".doc", ".docx", ".txt"]}
            path="minutes/"
            maxFileCount={5}
            maxFileSize={10000}
            onUploadSuccess={(result: any) => {
              console.log(result);
              if (onUploadComplete) {
                onUploadComplete();
              }
              onClose();
            }}
          />
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
