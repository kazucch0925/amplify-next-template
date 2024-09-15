import React, { useState } from 'react';
import Button from './Button'
import { FileUploader } from '@aws-amplify/ui-react-storage';
import './UploadModal.css';

export default function UploadModal({ onClose }: { onClose: () => void }) {
    const [hasFile, setHasFile] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-icon" onClick={onClose} aria-label="Close">
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
            onClose();
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
