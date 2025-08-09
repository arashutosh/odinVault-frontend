import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { UploadProgress } from '../types';
import { formatFileSize } from '../utils/format';

interface FileUploadProps {
  onUpload: (file: File, onProgress?: (progress: number) => void, name?: string) => Promise<any>;
  isUploading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isUploading }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const fileId = Math.random().toString(36).substr(2, 9);

        setUploadProgress(prev => [...prev, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'uploading'
        }]);

        const startUpload = async (desiredName?: string) => {
          try {
            await onUpload(
              file,
              (progress) => {
                setUploadProgress(prev => prev.map(item =>
                  item.fileId === fileId
                    ? { ...item, progress }
                    : item
                ));
              },
              desiredName
            );

            setUploadProgress(prev => prev.map(item =>
              item.fileId === fileId
                ? { ...item, progress: 100, status: 'completed' }
                : item
            ));
          } catch (err: any) {
            const status = err?.response?.status;
            const backendMsg = err?.response?.data?.error?.message || err?.message;

            if (status === 409) {
              const suggested = desiredName || file.name;
              const newName = window.prompt(
                backendMsg || 'A file with this name already exists. Please choose a new name:',
                suggested
              );
              if (newName && newName.trim()) {
                return startUpload(newName.trim());
              }
            }

            setUploadProgress(prev => prev.map(item =>
              item.fileId === fileId
                ? { ...item, status: 'error' }
                : item
            ));
          }
        };

        startUpload();
      });
    },
    multiple: true,
  });

  const removeProgressItem = (fileId: string) => {
    setUploadProgress(prev => prev.filter(item => item.fileId !== fileId));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload your files'}
          </h3>

          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>

          <Button variant="primary" disabled={isUploading}>
            Choose Files
          </Button>
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Upload Progress</h4>
          <div className="space-y-3">
            {uploadProgress.map((item) => (
              <div key={item.fileId} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.fileName}
                  </p>

                  {item.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
                    </div>
                  )}

                  {item.status === 'completed' && (
                    <p className="text-xs text-green-600">Upload completed</p>
                  )}

                  {item.status === 'error' && (
                    <p className="text-xs text-red-600">Upload failed</p>
                  )}
                </div>

                <button
                  onClick={() => removeProgressItem(item.fileId)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};