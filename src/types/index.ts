export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface GoogleAuthCredentials {
  idToken: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  previewUrl?: string;
  uploadedAt: string;
  isDeleted: boolean;
  tags?: string[];
  sharedLinks?: ShareLink[];
}

export interface ShareLink {
  id: string;
  url: string;
  expiresAt: string;
  createdAt: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'size' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface FileFilters {
  search: string;
  type?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}