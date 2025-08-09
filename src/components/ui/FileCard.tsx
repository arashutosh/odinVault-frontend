import React from 'react';
import { MoreVertical, Download, Share2, Trash2, RotateCcw } from 'lucide-react';
import { File } from '../../types';
import { formatFileSize, formatDate, getFileIcon } from '../../utils/format';
import { useEffect, useState } from 'react';
import { filesApi } from '../../api/files';

interface FileCardProps {
  file: File;
  viewMode: 'grid' | 'list';
  onPreview: (file: File) => void;
  onShare: (file: File) => void;
  onDelete: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  isTrash?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  viewMode,
  onPreview,
  onShare,
  onDelete,
  onRestore,
  isTrash = false
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Prefer preview; fallback to download URL for display
        const preview = await filesApi.getPreviewUrl(file.id, isTrash);
        if (isMounted) {
          if (preview.previewUrl) {
            setThumbnailUrl(preview.previewUrl);
          } else {
            const download = await filesApi.getDownloadUrl(file.id, isTrash);
            if (isMounted) setThumbnailUrl(download.downloadUrl);
          }
        }
      } catch {
        // ignore errors; icon will be shown instead
      }
    })();
    return () => { isMounted = false; };
  }, [file.id, isTrash]);

  if (viewMode === 'list') {
    return (
      <div className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div
          className="flex items-center flex-1 cursor-pointer"
          onClick={() => onPreview(file)}
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg mr-4">
            <span className="text-xl">{getFileIcon(file.type)}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {formatDate(file.uploadedAt)}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-1">
                {!isTrash && (
                  <>
                    <button
                      onClick={() => onShare(file)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Share
                    </button>
                    <button
                      onClick={() => onDelete(file.id)}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete
                    </button>
                  </>
                )}
                {isTrash && onRestore && (
                  <button
                    onClick={() => onRestore(file.id)}
                    className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                  >
                    <RotateCcw className="w-4 h-4 mr-3" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 group">
      <div
        className="cursor-pointer"
        onClick={() => onPreview(file)}
      >
        <div className="flex items-center justify-center h-24 rounded-lg mb-3 overflow-hidden bg-gray-100">
          {thumbnailUrl && file.type.startsWith('image/') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt={file.name} className="h-24 w-full object-cover" />
          )}
          {thumbnailUrl && file.type.startsWith('video/') && (
            <video
              src={thumbnailUrl}
              className="h-24 w-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          )}
          {thumbnailUrl && file.type === 'application/pdf' && (
            <iframe
              src={thumbnailUrl}
              title={file.name}
              className="h-24 w-full"
            />
          )}
          {!thumbnailUrl && (
            <div className="flex items-center justify-center h-full w-full bg-blue-50">
              <span className="text-3xl">{getFileIcon(file.type)}</span>
            </div>
          )}
        </div>

        <h3 className="font-medium text-gray-900 truncate mb-1">{file.name}</h3>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
        <p className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        {!isTrash && (
          <>
            <button
              onClick={() => onShare(file)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(file.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        {isTrash && onRestore && (
          <button
            onClick={() => onRestore(file.id)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};