import { api } from "@/lib/api";
import type {
  AdminApplication,
  AdminCitizen,
  AuditLogEntry,
  Department,
  ProcessingJob,
  Role,
  StaffUser,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/service";

export const adminOversightService = {
  // ---- Staff / users -----------------------------------------------
  listStaff: async () => {
    const { data } = await api.get<PaginatedResponse<StaffUser>>("/admin/users");
    return data.data;
  },

  listRoles: async () => {
    const { data } = await api.get<Role[]>("/admin/roles");
    return data;
  },

  createStaff: async (payload: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    position_title?: string;
    department_id?: string;
    role_ids: string[];
  }) => {
    const { data } = await api.post<{ data: StaffUser }>("/admin/users", payload);
    return data.data;
  },

  // Replaces the user's full role set — supports multiple simultaneous roles.
  updateRoles: async (userId: string, roleIds: string[]) => {
    const { data } = await api.put<{ data: StaffUser }>(`/admin/users/${userId}/role`, { role_ids: roleIds });
    return data.data;
  },

  suspendUser: async (userId: string) => {
    const { data } = await api.post<{ data: StaffUser }>(`/admin/users/${userId}/suspend`);
    return data.data;
  },

  reactivateUser: async (userId: string) => {
    const { data } = await api.post<{ data: StaffUser }>(`/admin/users/${userId}/reactivate`);
    return data.data;
  },

  // ---- Departments -------------------------------------------------------
  listDepartments: async () => {
    const { data } = await api.get<{ data: Department[] }>("/admin/departments");
    return data.data;
  },

  createDepartment: async (payload: Partial<Department>) => {
    const { data } = await api.post<{ data: Department }>("/admin/departments", payload);
    return data.data;
  },

  updateDepartment: async (id: string, payload: Partial<Department>) => {
    const { data } = await api.put<{ data: Department }>(`/admin/departments/${id}`, payload);
    return data.data;
  },

  deleteDepartment: async (id: string) => {
    await api.delete(`/admin/departments/${id}`);
  },

  // ---- Citizens ------------------------------------------------------
  listCitizens: async (search?: string) => {
    const { data } = await api.get<PaginatedResponse<AdminCitizen>>("/admin/citizens", {
      params: search ? { search } : undefined,
    });
    return data.data;
  },

  // ---- Applications ----------------------------------------------------
  listApplications: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<AdminApplication>>("/admin/applications", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },

  getApplication: async (id: string) => {
    const { data } = await api.get<{ data: AdminApplication }>(`/admin/applications/${id}`);
    return data.data;
  },

  // ---- Exception queue ---------------------------------------------------
  listExceptions: async () => {
    const { data } = await api.get<PaginatedResponse<ProcessingJob>>("/admin/exceptions");
    return data.data;
  },

  retryException: async (jobId: string) => {
    await api.post(`/admin/exceptions/${jobId}/retry`);
  },

  // ---- Audit logs ------------------------------------------------------
  listAuditLogs: async (actionFilter?: string) => {
    const { data } = await api.get<PaginatedResponse<AuditLogEntry>>("/admin/audit-logs", {
      params: actionFilter ? { action: actionFilter } : undefined,
    });
    return data.data;
  },
};
