import React, { useEffect, useState } from 'react';
import { X, Download, Share2, ExternalLink } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { File } from '../types';
import { formatFileSize, formatDate } from '../utils/format';
import { filesApi } from '../api/files';

interface FilePreviewProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (file: File) => void;
  isTrash?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  isOpen,
  onClose,
  onShare,
  isTrash = false,
}) => {
  if (!file) return null;

  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!file) return;
      setLoading(true);
      try {
        const preview = await filesApi.getPreviewUrl(file.id, isTrash);
        if (!isMounted) return;
        if (preview.previewUrl) {
          setContentUrl(preview.previewUrl);
        } else {
          const download = await filesApi.getDownloadUrl(file.id, isTrash);
          if (!isMounted) return;
          setContentUrl(download.downloadUrl);
        }
      } catch {
        if (isMounted) setContentUrl(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (isOpen) load();
    return () => { isMounted = false; };
  }, [file?.id, isOpen, isTrash]);

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const url = contentUrl || file.previewUrl || file.url;
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={url || ''}
          alt={file.name}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      );
    }

    if (file.type.startsWith('video/')) {
      return (
        <video
          src={url || ''}
          controls
          className="max-w-full max-h-96 rounded-lg"
        />
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <iframe
          src={url || ''}
          className="w-full h-96 rounded-lg border"
          title={file.name}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">Preview not available for this file type</p>
        <Button
          variant="primary"
          onClick={() => url && window.open(url, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open File
        </Button>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-600">
              {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onShare(file)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => contentUrl && window.open(contentUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          {renderPreview()}
        </div>
      </div>
    </Modal>
  );
};