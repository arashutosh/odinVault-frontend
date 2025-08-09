import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../api/files';
import { FileFilters } from '../types';
import toast from 'react-hot-toast';
import { useMemo } from 'react';

type UseFilesOptions = {
  enabled?: boolean;
};

export const useFiles = (filters: FileFilters, isTrash = false, options: UseFilesOptions = {}) => {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ['files', isTrash],
    queryFn: () => filesApi.getFiles(isTrash),
    enabled: options.enabled ?? true,
  });

  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(file =>
        file.name.toLowerCase().includes(searchTerm) ||
        file.type.toLowerCase().includes(searchTerm) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by type
    if (filters.type) {
      result = result.filter(file => file.type.startsWith(filters.type!));
    }

    // Sort files
    result.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [files, filters]);

  const uploadMutation = useMutation({
    mutationFn: ({ file, onProgress, name }: { file: File; onProgress?: (progress: number) => void; name?: string }) =>
      filesApi.uploadFile(file, onProgress, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File uploaded successfully!');
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Upload failed';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File moved to trash');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Delete failed');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: filesApi.restoreFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File restored successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Restore failed');
    },
  });

  const createShareLinkMutation = useMutation({
    mutationFn: ({ fileId, expiresAt }: { fileId: string; expiresAt: string }) =>
      filesApi.createShareLink(fileId, expiresAt),
    onSuccess: () => {
      toast.success('Share link created!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create share link');
    },
  });

  return {
    files: filteredFiles,
    isLoading,
    error,
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync,
    deleteFile: deleteMutation.mutate,
    restoreFile: restoreMutation.mutate,
    createShareLink: createShareLinkMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
};