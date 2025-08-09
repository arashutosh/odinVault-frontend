import { apiClient } from './client';
import { File, ShareLink } from '../types';

export const filesApi = {
  getFiles: async (isDeleted = false): Promise<File[]> => {
    const response = await apiClient.get(`/files?deleted=${isDeleted}`);
    const raw = response.data as any[];
    // Map backend FileResponse -> frontend File
    return (raw || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      type: f.mimeType || f.type || '',
      size: f.size,
      url: f.url || '',
      previewUrl: f.previewUrl || undefined,
      uploadedAt: f.createdAt || f.uploadedAt || new Date().toISOString(),
      isDeleted,
      tags: f.tags || [],
      sharedLinks: f.sharedLinks || [],
    }) as File);
  },

  uploadFile: async (file: globalThis.File, onProgress?: (progress: number) => void, opts?: { name?: string }): Promise<File> => {
    const formData = new FormData();
    // Append with filename to ensure proper multipart part
    formData.append('file', file, file.name);
    if (opts?.name) formData.append('name', opts.name);

    const response = await apiClient.post('/files/upload', formData, {
      // Do NOT set Content-Type manually; let the browser set boundary
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },

  restoreFile: async (fileId: string): Promise<void> => {
    await apiClient.patch(`/files/${fileId}/restore`);
  },

  hideDeletedFiles: async (fileIds: string[]): Promise<{ hidden: number }> => {
    const response = await apiClient.post(`/files/trash/hide`, { fileIds });
    return response.data;
  },

  permanentlyDeleteFiles: async (fileIds: string[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post(`/files/trash/delete`, { fileIds });
    return response.data;
  },

  createShareLink: async (fileId: string, expiresAt: string): Promise<ShareLink> => {
    const response = await apiClient.post(`/files/${fileId}/share`, { expiresAt });
    return response.data;
  },

  getPreviewUrl: async (fileId: string, isDeleted = false): Promise<{ previewUrl: string | null; hasPreview: boolean }> => {
    const response = await apiClient.get(`/files/${fileId}/preview?deleted=${isDeleted}`);
    return response.data as { previewUrl: string | null; hasPreview: boolean };
  },

  getDownloadUrl: async (fileId: string, isDeleted = false): Promise<{ downloadUrl: string; expiresIn: number }> => {
    const response = await apiClient.get(`/files/${fileId}/download?deleted=${isDeleted}`);
    return response.data as { downloadUrl: string; expiresIn: number };
  },
};