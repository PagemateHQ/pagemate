import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pagemate.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Tenant {
  _id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  _id: string;
  tenant_id: string;
  name: string;
  object_path: string;
  size: number;
  created_at: string;
  updated_at: string;
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  text?: string;
  embedding?: number[];
  error?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
}

// API Service
export const tenantService = {
  // List all tenants
  listTenants: async (offset = 0, limit = 20): Promise<Tenant[]> => {
    const response = await api.get('/tenants/', {
      params: { offset, limit },
    });
    return response.data;
  },

  // Get tenant by ID
  getTenant: async (tenantId: string): Promise<Tenant> => {
    const response = await api.get(`/tenants/${tenantId}`);
    return response.data;
  },

  // List documents for a tenant
  listDocuments: async (
    tenantId: string,
    offset = 0,
    limit = 20
  ): Promise<Document[]> => {
    const response = await api.get(`/tenants/${tenantId}/documents/`, {
      params: { offset, limit },
    });
    return response.data;
  },

  // Create document by uploading file
  createDocument: async (tenantId: string, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/tenants/${tenantId}/documents/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};