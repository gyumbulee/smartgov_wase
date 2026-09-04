import { api } from "@/lib/api";
import type {
  Announcement,
  CivicEvent,
  Community,
  Facility,
  LeadershipProfile,
  LeadershipTerm,
  NewsArticle,
  NewsCategory,
  Project,
  ProjectUpdate,
  Ward,
} from "@/types/content";
import type { PaginatedResponse } from "@/types/service";

// ---- Public --------------------------------------------------------
export const publicContentService = {
  news: async (page = 1) => {
    const { data } = await api.get<PaginatedResponse<NewsArticle>>("/public/news", { params: { page } });
    return data.data;
  },
  newsBySlug: async (slug: string) => {
    const { data } = await api.get<NewsArticle>(`/public/news/${slug}`);
    return data;
  },
  announcements: async () => {
    const { data } = await api.get<Announcement[]>("/public/announcements");
    return data;
  },
  leadership: async () => {
    const { data } = await api.get<LeadershipProfile[]>("/public/leadership");
    return data;
  },
  leadershipBySlug: async (slug: string) => {
    const { data } = await api.get<LeadershipProfile>(`/public/leadership/${slug}`);
    return data;
  },
  departments: async () => {
    const { data } = await api.get("/public/departments");
    return data;
  },
  departmentBySlug: async (slug: string) => {
    const { data } = await api.get(`/public/departments/${slug}`);
    return data;
  },
  projects: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<Project>>("/public/projects", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },
  projectBySlug: async (slug: string) => {
    const { data } = await api.get<Project>(`/public/projects/${slug}`);
    return data;
  },
  wards: async () => {
    const { data } = await api.get<Ward[]>("/public/wards");
    return data;
  },
  wardBySlug: async (slug: string) => {
    const { data } = await api.get(`/public/wards/${slug}`);
    return data;
  },
  facilities: async (params?: { type?: string; ward?: string }) => {
    const { data } = await api.get<Facility[]>("/public/facilities", { params });
    return data;
  },
  events: async (upcoming?: boolean) => {
    const { data } = await api.get<PaginatedResponse<CivicEvent>>("/public/events", {
      params: upcoming ? { upcoming: 1 } : undefined,
    });
    return data.data;
  },
};

// ---- Admin -----------------------------------------------------------
export const adminContentService = {
  // News
  listNews: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<NewsArticle>>("/admin/news", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },
  listNewsCategories: async () => {
    const { data } = await api.get<{ data: NewsCategory[] }>("/admin/news-categories");
    return data.data;
  },
  createNews: async (payload: Partial<NewsArticle> & { category_id?: string }) => {
    const { data } = await api.post<{ data: NewsArticle }>("/admin/news", payload);
    return data.data;
  },
  updateNews: async (id: string, payload: Partial<NewsArticle> & { category_id?: string }) => {
    const { data } = await api.put<{ data: NewsArticle }>(`/admin/news/${id}`, payload);
    return data.data;
  },
  publishNews: async (id: string) => {
    await api.post(`/admin/news/${id}/publish`);
  },
  deleteNews: async (id: string) => {
    await api.delete(`/admin/news/${id}`);
  },

  // Announcements
  listAnnouncements: async () => {
    const { data } = await api.get<{ data: Announcement[] }>("/admin/announcements");
    return data.data;
  },
  createAnnouncement: async (payload: Partial<Announcement>) => {
    const { data } = await api.post<{ data: Announcement }>("/admin/announcements", payload);
    return data.data;
  },
  updateAnnouncement: async (id: string, payload: Partial<Announcement>) => {
    const { data } = await api.put<{ data: Announcement }>(`/admin/announcements/${id}`, payload);
    return data.data;
  },
  deleteAnnouncement: async (id: string) => {
    await api.delete(`/admin/announcements/${id}`);
  },

  // Leadership
  listLeadership: async () => {
    const { data } = await api.get<{ data: LeadershipProfile[] }>("/admin/leadership");
    return data.data;
  },
  createLeader: async (payload: Partial<LeadershipProfile> & { department_id?: string }) => {
    const { data } = await api.post<{ data: LeadershipProfile }>("/admin/leadership", payload);
    return data.data;
  },
  updateLeader: async (id: string, payload: Partial<LeadershipProfile> & { department_id?: string }) => {
    const { data } = await api.put<{ data: LeadershipProfile }>(`/admin/leadership/${id}`, payload);
    return data.data;
  },
  deleteLeader: async (id: string) => {
    await api.delete(`/admin/leadership/${id}`);
  },
  addLeadershipTerm: async (leaderId: string, payload: Partial<LeadershipTerm>) => {
    const { data } = await api.post<{ data: LeadershipTerm }>(`/admin/leadership/${leaderId}/terms`, payload);
    return data.data;
  },

  // Projects
  listProjects: async (status?: string) => {
    const { data } = await api.get<PaginatedResponse<Project>>("/admin/projects", {
      params: status ? { status } : undefined,
    });
    return data.data;
  },
  getProject: async (id: string) => {
    const { data } = await api.get<{ data: Project }>(`/admin/projects/${id}`);
    return data.data;
  },
  createProject: async (payload: Partial<Project> & { department_id?: string; ward_id?: string }) => {
    const { data } = await api.post<{ data: Project }>("/admin/projects", payload);
    return data.data;
  },
  updateProject: async (id: string, payload: Partial<Project>) => {
    const { data } = await api.put<{ data: Project }>(`/admin/projects/${id}`, payload);
    return data.data;
  },
  deleteProject: async (id: string) => {
    await api.delete(`/admin/projects/${id}`);
  },
  addProjectUpdate: async (projectId: string, payload: Partial<ProjectUpdate>) => {
    const { data } = await api.post<{ data: ProjectUpdate }>(`/admin/projects/${projectId}/updates`, payload);
    return data.data;
  },

  // Wards / Communities / Facilities
  listWards: async () => {
    const { data } = await api.get<{ data: Ward[] }>("/admin/wards");
    return data.data;
  },
  createWard: async (payload: Partial<Ward>) => {
    const { data } = await api.post<{ data: Ward }>("/admin/wards", payload);
    return data.data;
  },
  updateWard: async (id: string, payload: Partial<Ward>) => {
    const { data } = await api.put<{ data: Ward }>(`/admin/wards/${id}`, payload);
    return data.data;
  },
  deleteWard: async (id: string) => {
    await api.delete(`/admin/wards/${id}`);
  },

  listCommunities: async () => {
    const { data } = await api.get<{ data: Community[] }>("/admin/communities");
    return data.data;
  },
  createCommunity: async (payload: Partial<Community> & { ward_id: string }) => {
    const { data } = await api.post<{ data: Community }>("/admin/communities", payload);
    return data.data;
  },
  updateCommunity: async (id: string, payload: Partial<Community> & { ward_id?: string }) => {
    const { data } = await api.put<{ data: Community }>(`/admin/communities/${id}`, payload);
    return data.data;
  },
  deleteCommunity: async (id: string) => {
    await api.delete(`/admin/communities/${id}`);
  },

  listFacilities: async () => {
    const { data } = await api.get<{ data: Facility[] }>("/admin/facilities");
    return data.data;
  },
  createFacility: async (payload: Partial<Facility>) => {
    const { data } = await api.post<{ data: Facility }>("/admin/facilities", payload);
    return data.data;
  },
  updateFacility: async (id: string, payload: Partial<Facility>) => {
    const { data } = await api.put<{ data: Facility }>(`/admin/facilities/${id}`, payload);
    return data.data;
  },
  deleteFacility: async (id: string) => {
    await api.delete(`/admin/facilities/${id}`);
  },

  // Events
  listEvents: async () => {
    const { data } = await api.get<{ data: CivicEvent[] }>("/admin/events");
    return data.data;
  },
  createEvent: async (payload: Partial<CivicEvent>) => {
    const { data } = await api.post<{ data: CivicEvent }>("/admin/events", payload);
    return data.data;
  },
  updateEvent: async (id: string, payload: Partial<CivicEvent>) => {
    const { data } = await api.put<{ data: CivicEvent }>(`/admin/events/${id}`, payload);
    return data.data;
  },
  publishEvent: async (id: string) => {
    await api.post(`/admin/events/${id}/publish`);
  },
  deleteEvent: async (id: string) => {
    await api.delete(`/admin/events/${id}`);
  },
};
