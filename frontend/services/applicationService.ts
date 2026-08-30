import axios from "axios";
import { api } from "@/lib/api";
import type { Application } from "@/types/application";
import type { PaginatedResponse } from "@/types/service";

export const applicationService = {
  list: async () => {
    const { data } = await api.get<PaginatedResponse<Application>>("/citizen/applications");
    return data.data;
  },

  get: async (id: string) => {
    const { data } = await api.get<{ data: Application }>(`/citizen/applications/${id}`);
    return data.data;
  },

  // Creating an application for a service you already have a draft for
  // resumes that draft server-side rather than creating a duplicate.
  createForService: async (serviceId: string) => {
    const { data } = await api.post<{ data: Application }>("/citizen/applications", {
      service_id: serviceId,
    });
    return data.data;
  },

  saveFields: async (id: string, values: Record<string, string>) => {
    const { data } = await api.put<{ data: Application }>(`/citizen/applications/${id}/fields`, {
      values,
    });
    return data.data;
  },

  uploadDocument: async (id: string, requirementId: string, file: File) => {
    const form = new FormData();
    form.append("requirement_id", requirementId);
    form.append("file", file);
    const { data } = await api.post(`/citizen/applications/${id}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  deleteDocument: async (applicationId: string, documentId: string) => {
    await api.delete(`/citizen/applications/${applicationId}/documents/${documentId}`);
  },

  // Submission errors (missing required fields/documents) are an
  // expected outcome, not a failure — return them as data so the form
  // can show exactly what's missing.
  submit: async (id: string): Promise<{ success: true; application: Application } | { success: false; errors: string[] }> => {
    try {
      const { data } = await api.post<{ data: Application }>(`/citizen/applications/${id}/submit`);
      return { success: true, application: data.data };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        return { success: false, errors: err.response.data?.errors ?? ["Submission failed."] };
      }
      throw err;
    }
  },

  cancel: async (id: string) => {
    const { data } = await api.post<{ data: Application }>(`/citizen/applications/${id}/cancel`);
    return data.data;
  },
};
