import { api } from "@/lib/api";
import type {
  Gallery,
  HistoricalRecord,
  MapMarker,
  NotablePeopleCategory,
  NotablePerson,
  TourismCategory,
  TouristAttraction,
} from "@/types/discover";

// ---- Public --------------------------------------------------------
export const publicDiscoverService = {
  attractions: async (categorySlug?: string) => {
    const { data } = await api.get<TouristAttraction[]>("/public/tourism", {
      params: categorySlug ? { category: categorySlug } : undefined,
    });
    return data;
  },
  attractionBySlug: async (slug: string) => {
    const { data } = await api.get<TouristAttraction>(`/public/tourism/${slug}`);
    return data;
  },
  tourismCategories: async () => {
    const { data } = await api.get<TourismCategory[]>("/public/tourism/categories");
    return data;
  },
  history: async () => {
    const { data } = await api.get<HistoricalRecord[]>("/public/history");
    return data;
  },
  notablePeople: async (categorySlug?: string) => {
    const { data } = await api.get<{ data: NotablePerson[] }>("/public/notable-people", {
      params: categorySlug ? { category: categorySlug } : undefined,
    });
    return data.data;
  },
  notablePersonBySlug: async (slug: string) => {
    const { data } = await api.get<{ data: NotablePerson }>(`/public/notable-people/${slug}`);
    return data.data;
  },
  galleries: async () => {
    const { data } = await api.get<{ data: Gallery[] }>("/public/galleries");
    return data.data;
  },
  galleryBySlug: async (slug: string) => {
    const { data } = await api.get<{ data: Gallery }>(`/public/galleries/${slug}`);
    return data.data;
  },
  map: async () => {
    const { data } = await api.get<MapMarker[]>("/public/map");
    return data;
  },
};

// ---- Admin -----------------------------------------------------------
export const adminDiscoverService = {
  // Tourism
  listTourismCategories: async () => {
    const { data } = await api.get<{ data: TourismCategory[] }>("/admin/tourism-categories");
    return data.data;
  },
  createTourismCategory: async (payload: Partial<TourismCategory>) => {
    const { data } = await api.post<{ data: TourismCategory }>("/admin/tourism-categories", payload);
    return data.data;
  },
  listAttractions: async () => {
    const { data } = await api.get<{ data: TouristAttraction[] }>("/admin/tourist-attractions");
    return data.data;
  },
  getAttraction: async (id: string) => {
    const { data } = await api.get<{ data: TouristAttraction }>(`/admin/tourist-attractions/${id}`);
    return data.data;
  },
  createAttraction: async (payload: Partial<TouristAttraction> & { category_id?: string }) => {
    const { data } = await api.post<{ data: TouristAttraction }>("/admin/tourist-attractions", payload);
    return data.data;
  },
  updateAttraction: async (id: string, payload: Partial<TouristAttraction> & { category_id?: string }) => {
    const { data } = await api.put<{ data: TouristAttraction }>(`/admin/tourist-attractions/${id}`, payload);
    return data.data;
  },
  deleteAttraction: async (id: string) => {
    await api.delete(`/admin/tourist-attractions/${id}`);
  },
  attachAttractionMedia: async (attractionId: string, mediaId: string) => {
    const { data } = await api.post<{ data: TouristAttraction }>(`/admin/tourist-attractions/${attractionId}/media`, {
      media_id: mediaId,
    });
    return data.data;
  },
  detachAttractionMedia: async (attractionId: string, mediaId: string) => {
    await api.delete(`/admin/tourist-attractions/${attractionId}/media/${mediaId}`);
  },

  // History
  listHistory: async () => {
    const { data } = await api.get<{ data: HistoricalRecord[] }>("/admin/historical-records");
    return data.data;
  },
  createHistory: async (payload: Partial<HistoricalRecord>) => {
    const { data } = await api.post<{ data: HistoricalRecord }>("/admin/historical-records", payload);
    return data.data;
  },
  updateHistory: async (id: string, payload: Partial<HistoricalRecord>) => {
    const { data } = await api.put<{ data: HistoricalRecord }>(`/admin/historical-records/${id}`, payload);
    return data.data;
  },
  publishHistory: async (id: string) => {
    await api.post(`/admin/historical-records/${id}/publish`);
  },
  deleteHistory: async (id: string) => {
    await api.delete(`/admin/historical-records/${id}`);
  },

  // Notable people
  listNotablePeopleCategories: async () => {
    const { data } = await api.get<{ data: NotablePeopleCategory[] }>("/admin/notable-people-categories");
    return data.data;
  },
  createNotablePeopleCategory: async (payload: Partial<NotablePeopleCategory>) => {
    const { data } = await api.post<{ data: NotablePeopleCategory }>("/admin/notable-people-categories", payload);
    return data.data;
  },
  listNotablePeople: async () => {
    const { data } = await api.get<{ data: NotablePerson[] }>("/admin/notable-people");
    return data.data;
  },
  createNotablePerson: async (payload: Partial<NotablePerson> & { category_id?: string; photo_media_id?: string }) => {
    const { data } = await api.post<{ data: NotablePerson }>("/admin/notable-people", payload);
    return data.data;
  },
  updateNotablePerson: async (id: string, payload: Partial<NotablePerson> & { category_id?: string; photo_media_id?: string }) => {
    const { data } = await api.put<{ data: NotablePerson }>(`/admin/notable-people/${id}`, payload);
    return data.data;
  },
  publishNotablePerson: async (id: string) => {
    await api.post(`/admin/notable-people/${id}/publish`);
  },
  deleteNotablePerson: async (id: string) => {
    await api.delete(`/admin/notable-people/${id}`);
  },

  // Galleries
  listGalleries: async () => {
    const { data } = await api.get<{ data: Gallery[] }>("/admin/galleries");
    return data.data;
  },
  getGallery: async (id: string) => {
    const { data } = await api.get<{ data: Gallery }>(`/admin/galleries/${id}`);
    return data.data;
  },
  createGallery: async (payload: Partial<Gallery>) => {
    const { data } = await api.post<{ data: Gallery }>("/admin/galleries", payload);
    return data.data;
  },
  updateGallery: async (id: string, payload: Partial<Gallery>) => {
    const { data } = await api.put<{ data: Gallery }>(`/admin/galleries/${id}`, payload);
    return data.data;
  },
  deleteGallery: async (id: string) => {
    await api.delete(`/admin/galleries/${id}`);
  },
  attachGalleryMedia: async (galleryId: string, mediaId: string, caption?: string) => {
    const { data } = await api.post<{ data: Gallery }>(`/admin/galleries/${galleryId}/media`, {
      media_id: mediaId,
      caption,
    });
    return data.data;
  },
  detachGalleryMedia: async (galleryId: string, mediaId: string) => {
    await api.delete(`/admin/galleries/${galleryId}/media/${mediaId}`);
  },
};
