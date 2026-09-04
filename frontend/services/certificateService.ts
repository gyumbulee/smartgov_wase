import axios from "axios";
import { api } from "@/lib/api";
import type { Certificate, CertificateTemplate, CertificateTemplateField, CertificateTemplateVersion } from "@/types/certificate";

export const certificateService = {
  list: async () => {
    const { data } = await api.get<{ data: Certificate[] }>("/citizen/certificates");
    return data.data;
  },

  get: async (id: string) => {
    const { data } = await api.get<{ data: Certificate }>(`/citizen/certificates/${id}`);
    return data.data;
  },

  // Direct download URL — the browser hits this with the stored auth
  // token attached by the api client's request interceptor.
  downloadUrl: (id: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    return `${base}/citizen/certificates/${id}/download`;
  },

  download: async (id: string, filename: string) => {
    const response = await api.get(`/citizen/certificates/${id}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};

export const adminCertificateTemplateService = {
  list: async () => {
    const { data } = await api.get<{ data: CertificateTemplate[] }>("/admin/certificate-templates");
    return data.data;
  },

  get: async (id: string) => {
    const { data } = await api.get<{ data: CertificateTemplate }>(`/admin/certificate-templates/${id}`);
    return data.data;
  },

  create: async (payload: { name: string; code: string; service_id: string; document_type?: string; description?: string }) => {
    const { data } = await api.post<{ data: CertificateTemplate }>("/admin/certificate-templates", payload);
    return data.data;
  },

  uploadVersion: async (templateId: string, file: File, version?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (version) form.append("version", version);
    const { data } = await api.post<{ data: CertificateTemplateVersion }>(
      `/admin/certificate-templates/${templateId}/versions`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  activateVersion: async (templateId: string, versionId: string) => {
    const { data } = await api.post<{ data: CertificateTemplateVersion }>(
      `/admin/certificate-templates/${templateId}/versions/${versionId}/activate`
    );
    return data.data;
  },

  createField: async (versionId: string, payload: Partial<CertificateTemplateField>) => {
    const { data } = await api.post<{ data: CertificateTemplateField }>(
      `/admin/certificate-template-versions/${versionId}/fields`,
      payload
    );
    return data.data;
  },

  updateField: async (versionId: string, fieldId: string, payload: Partial<CertificateTemplateField>) => {
    const { data } = await api.put<{ data: CertificateTemplateField }>(
      `/admin/certificate-template-versions/${versionId}/fields/${fieldId}`,
      payload
    );
    return data.data;
  },

  deleteField: async (versionId: string, fieldId: string) => {
    await api.delete(`/admin/certificate-template-versions/${versionId}/fields/${fieldId}`);
  },
};

export const publicCertificateService = {
  verify: async (code: string): Promise<{ verified: boolean; message?: string; certificate?: Record<string, string> }> => {
    try {
      const { data } = await api.get("/public/certificates/verify", { params: { code } });
      return data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        return err.response.data;
      }
      throw err;
    }
  },
};
