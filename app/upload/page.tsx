'use client';

import { FileUploader } from '@aws-amplify/ui-react-storage';

export const DefaultFileUploaderExample = () => {
    return (
      <FileUploader
        acceptedFileTypes={['.txt']}
        path="minutes/"
        maxFileCount={5}
        maxFileSize={10000}
      />
    );
};