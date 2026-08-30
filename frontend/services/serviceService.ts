import { api } from "@/lib/api";
import type {
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceFeeVersion,
  ServiceField,
  ServiceRequirement,
} from "@/types/service";

export const serviceService = {
  // ---- Public --------------------------------------------------------
  list: async (categorySlug?: string) => {
    const { data } = await api.get<PaginatedResponse<Service>>("/public/services", {
      params: categorySlug ? { category: categorySlug } : undefined,
    });
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<{ data: Service }>(`/public/services/${slug}`);
    return data.data;
  },

  categories: async () => {
    const { data } = await api.get<{ data: ServiceCategory[] }>("/public/service-categories");
    return data.data;
  },

  // ---- Admin: services ---------------------------------------------------
  adminList: async () => {
    const { data } = await api.get<PaginatedResponse<Service>>("/admin/services");
    return data;
  },

  adminGet: async (serviceId: string) => {
    const { data } = await api.get<{ data: Service }>(`/admin/services/${serviceId}`);
    return data.data;
  },

  adminCreate: async (payload: Record<string, unknown>) => {
    const { data } = await api.post<{ data: Service }>("/admin/services", payload);
    return data.data;
  },

  adminPublish: async (serviceId: string) => {
    const { data } = await api.post<{ data: Service }>(`/admin/services/${serviceId}/publish`);
    return data.data;
  },

  adminSuspend: async (serviceId: string) => {
    const { data } = await api.post<{ data: Service }>(`/admin/services/${serviceId}/suspend`);
    return data.data;
  },

  adminSetFee: async (serviceId: string, amount: number, currency = "NGN") => {
    const { data } = await api.post<ServiceFeeVersion>(`/admin/services/${serviceId}/fees`, {
      amount,
      currency,
    });
    return data;
  },

  adminCategories: async () => {
    const { data } = await api.get<{ data: ServiceCategory[] }>("/admin/service-categories");
    return data.data;
  },

  // ---- Admin: dynamic form fields ---------------------------------------
  adminCreateField: async (serviceId: string, payload: Partial<ServiceField>) => {
    const { data } = await api.post<{ data: ServiceField }>(
      `/admin/services/${serviceId}/fields`,
      payload
    );
    return data.data;
  },

  adminUpdateField: async (serviceId: string, fieldId: string, payload: Partial<ServiceField>) => {
    const { data } = await api.put<{ data: ServiceField }>(
      `/admin/services/${serviceId}/fields/${fieldId}`,
      payload
    );
    return data.data;
  },

  adminDeleteField: async (serviceId: string, fieldId: string) => {
    await api.delete(`/admin/services/${serviceId}/fields/${fieldId}`);
  },

  // ---- Admin: requirements -----------------------------------------------
  adminCreateRequirement: async (serviceId: string, payload: Partial<ServiceRequirement>) => {
    const { data } = await api.post<{ data: ServiceRequirement }>(
      `/admin/services/${serviceId}/requirements`,
      payload
    );
    return data.data;
  },

  adminUpdateRequirement: async (
    serviceId: string,
    requirementId: string,
    payload: Partial<ServiceRequirement>
  ) => {
    const { data } = await api.put<{ data: ServiceRequirement }>(
      `/admin/services/${serviceId}/requirements/${requirementId}`,
      payload
    );
    return data.data;
  },

  adminDeleteRequirement: async (serviceId: string, requirementId: string) => {
    await api.delete(`/admin/services/${serviceId}/requirements/${requirementId}`);
  },
};
