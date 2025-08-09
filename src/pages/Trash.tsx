import React, { useMemo, useState } from 'react';
import { Search, Grid, List, RotateCcw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileCard } from '../components/ui/FileCard';
import { FilePreview } from '../components/FilePreview';
import { useFiles } from '../hooks/useFiles';
import { File, ViewMode, SortBy, SortOrder } from '../types';
import { filesApi } from '../api/files';
import toast from 'react-hot-toast';

export const Trash: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    sortBy: 'date' as SortBy,
    sortOrder: 'desc' as SortOrder,
  });

  const { files, isLoading, restoreFile } = useFiles(filters, true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected = useMemo(() => files.length > 0 && selectedIds.size === files.length, [files, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(files.map(f => f.id)));
  };

  const hideSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      await filesApi.hideDeletedFiles(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success('Selected files hidden from trash');
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to hide files');
    }
  };

  const deleteSelectedForever = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = window.confirm(`Permanently delete ${selectedIds.size} item(s)? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await filesApi.permanentlyDeleteFiles(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success('Selected files permanently deleted');
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete files');
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handlePreview = (file: File) => {
    setPreviewFile(file);
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
            <p className="mt-1 text-sm text-gray-600">
              Recover deleted files
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search deleted files..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
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

        {/* Bulk actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {selectedIds.size} selected
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={toggleSelectAll}>
              {allSelected ? 'Clear selection' : 'Select all'}
            </Button>
            {/* <Button variant="primary" onClick={hideSelected} disabled={selectedIds.size === 0}>
              Hide selected
            </Button> */}
            <Button variant="danger" onClick={deleteSelectedForever} disabled={selectedIds.size === 0}>
              Delete
            </Button>
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
              <RotateCcw className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
            <p className="text-gray-600">Deleted files will appear here</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <div key={file.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(file.id)}
                    onChange={() => toggleSelect(file.id)}
                  />
                </div>
                <FileCard
                  file={file}
                  viewMode="grid"
                  onPreview={handlePreview}
                  onShare={() => { }}
                  onDelete={() => { }}
                  onRestore={restoreFile}
                  isTrash={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-4 border-b border-gray-100">
                <input
                  type="checkbox"
                  className="mr-3"
                  checked={selectedIds.has(file.id)}
                  onChange={() => toggleSelect(file.id)}
                />
                <div className="flex-1">
                  <FileCard
                    file={file}
                    viewMode="list"
                    onPreview={handlePreview}
                    onShare={() => { }}
                    onDelete={() => { }}
                    onRestore={restoreFile}
                    isTrash={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onShare={() => { }}
      />
    </Layout>
  );
};