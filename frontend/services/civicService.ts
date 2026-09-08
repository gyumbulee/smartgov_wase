import { api } from "@/lib/api";
import type {
  AppNotification,
  CivicDocument,
  Complaint,
  ComplaintCategory,
  ContactMessage,
  Faq,
} from "@/types/civic";
import type { PaginatedResponse } from "@/types/service";

// ---- Citizen --------------------------------------------------------
export const citizenCivicService = {
  listComplaints: async () => {
    const { data } = await api.get<{ data: Complaint[] }>("/citizen/complaints");
    return data.data;
  },
  getComplaint: async (id: string) => {
    const { data } = await api.get<{ data: Complaint }>(`/citizen/complaints/${id}`);
    return data.data;
  },
  submitComplaint: async (payload: {
    category_id: string;
    title: string;
    description: string;
    location?: string;
    priority?: string;
  }) => {
    const { data } = await api.post<{ data: Complaint }>("/citizen/complaints", payload);
    return data.data;
  },

  listNotifications: async () => {
    const { data } = await api.get<PaginatedResponse<AppNotification>>("/citizen/notifications");
    return data.data;
  },
  unreadNotificationCount: async () => {
    const { data } = await api.get<{ count: number }>("/citizen/notifications/unread-count");
    return data.count;
  },
  markNotificationRead: async (id: string) => {
    await api.post(`/citizen/notifications/${id}/read`);
  },
  markAllNotificationsRead: async () => {
    await api.post("/citizen/notifications/read-all");
  },
};

// ---- Public --------------------------------------------------------
export const publicCivicService = {
  complaintCategories: async () => {
    const { data } = await api.get<{ data: ComplaintCategory[] }>("/public/complaint-categories");
    return data.data;
  },
  submitContactMessage: async (payload: { name: string; email: string; phone?: string; subject: string; message: string }) => {
    await api.post("/public/contact", payload);
  },
  faqs: async (params?: { service_id?: string; category?: string }) => {
    const { data } = await api.get<{ data: Faq[] }>("/public/faqs", { params });
    return data.data;
  },
  documents: async (search?: string) => {
    const { data } = await api.get<PaginatedResponse<CivicDocument>>("/public/documents", {
      params: search ? { search } : undefined,
    });
    return data.data;
  },
};

// ---- Admin -----------------------------------------------------------
export const adminCivicService = {
  listComplaintCategories: async () => {
    const { data } = await api.get<{ data: ComplaintCategory[] }>("/admin/complaint-categories");
    return data.data;
  },
  createComplaintCategory: async (payload: Partial<ComplaintCategory>) => {
    const { data } = await api.post<{ data: ComplaintCategory }>("/admin/complaint-categories", payload);
    return data.data;
  },

  listComplaints: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<Complaint>>("/admin/complaints", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },
  getComplaint: async (id: string) => {
    const { data } = await api.get<{ data: Complaint }>(`/admin/complaints/${id}`);
    return data.data;
  },
  updateComplaintStatus: async (id: string, status: string, message?: string) => {
    const { data } = await api.put<{ data: Complaint }>(`/admin/complaints/${id}/status`, { status, message });
    return data.data;
  },

  listContactMessages: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<ContactMessage>>("/admin/contact-messages", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },
  updateContactMessageStatus: async (id: string, status: string) => {
    const { data } = await api.put<{ data: ContactMessage }>(`/admin/contact-messages/${id}/status`, { status });
    return data.data;
  },

  listFaqs: async () => {
    const { data } = await api.get<{ data: Faq[] }>("/admin/faqs");
    return data.data;
  },
  createFaq: async (payload: Partial<Faq>) => {
    const { data } = await api.post<{ data: Faq }>("/admin/faqs", payload);
    return data.data;
  },
  updateFaq: async (id: string, payload: Partial<Faq>) => {
    const { data } = await api.put<{ data: Faq }>(`/admin/faqs/${id}`, payload);
    return data.data;
  },
  deleteFaq: async (id: string) => {
    await api.delete(`/admin/faqs/${id}`);
  },

  listDocuments: async () => {
    const { data } = await api.get<PaginatedResponse<CivicDocument>>("/admin/documents");
    return data.data;
  },
  uploadDocument: async (payload: { title: string; description?: string; category_id?: string; file: File }) => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.description) form.append("description", payload.description);
    if (payload.category_id) form.append("category_id", payload.category_id);
    form.append("file", payload.file);
    form.append("is_public", "1");
    const { data } = await api.post<{ data: CivicDocument }>("/admin/documents", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
  deleteDocument: async (id: string) => {
    await api.delete(`/admin/documents/${id}`);
  },
};
