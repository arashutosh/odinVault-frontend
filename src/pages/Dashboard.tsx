import React, { useState } from 'react';
import { Search, Grid, List, Plus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileCard } from '../components/ui/FileCard';
import { FileUpload } from '../components/FileUpload';
import { FilePreview } from '../components/FilePreview';
import { ShareModal } from '../components/ShareModal';
import { Modal } from '../components/ui/Modal';
import { useFiles } from '../hooks/useFiles';
import { File, ViewMode, SortBy, SortOrder } from '../types';

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    sortBy: 'date' as SortBy,
    sortOrder: 'desc' as SortOrder,
  });

  const { files, isLoading, uploadFileAsync, deleteFile, createShareLink, isUploading } = useFiles(filters);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleSort = (sortBy: SortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handlePreview = (file: File) => {
    setPreviewFile(file);
  };

  const handleShare = (file: File) => {
    setShareFile(file);
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and organize your files
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowUpload(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search files..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Sort */}
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => handleSort('name')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filters.sortBy === 'name'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Name
                </button>
                <button
                  onClick={() => handleSort('size')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filters.sortBy === 'size'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Size
                </button>
                <button
                  onClick={() => handleSort('date')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filters.sortBy === 'date'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Date
                </button>
              </div>

              {/* View toggle */}
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Files */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-4">Upload your first file to get started</p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                viewMode="grid"
                onPreview={handlePreview}
                onShare={handleShare}
                onDelete={deleteFile}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                viewMode="list"
                onPreview={handlePreview}
                onShare={handleShare}
                onDelete={deleteFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Files"
        maxWidth="lg"
      >
        <FileUpload onUpload={(file, onProgress) => uploadFileAsync({ file, onProgress })} isUploading={isUploading} />
      </Modal>

      {/* Preview Modal */}
      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onShare={handleShare}
      />

      {/* Share Modal */}
      <ShareModal
        file={shareFile}
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
        onCreateShareLink={({ fileId, expiresAt }) => createShareLink({ fileId, expiresAt })}
      />
    </Layout>
  );
};