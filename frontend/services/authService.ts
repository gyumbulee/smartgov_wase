import axios from "axios";
import { api } from "@/lib/api";
import type {
  CompleteRegistrationResponse,
  LoginResponse,
  NinVerifyResponse,
} from "@/types/auth";

// Mirrors the backend's onboarding flow: NIN verification includes an
// immediate eligibility gate (residence must be Wase, Plateau State).
// A 403/422 here is an expected outcome (not verified / not eligible),
// not a failure — so we return that payload rather than throwing.
export const authService = {
  verifyNin: async (nin: string): Promise<NinVerifyResponse> => {
    try {
      const { data } = await api.post<NinVerifyResponse>("/auth/nin/verify", { nin });
      return data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        return err.response.data as NinVerifyResponse;
      }
      throw err;
    }
  },

  ninStatus: async (requestReference: string) => {
    const { data } = await api.get(`/auth/nin/status/${requestReference}`);
    return data;
  },

  completeCitizenRegistration: async (payload: {
    request_reference: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const { data } = await api.post<CompleteRegistrationResponse>(
      "/auth/register/citizen",
      payload
    );
    return data;
  },

  login: async (email: string, password: string) => {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  console.log("LOGIN API DATA:", data);
  console.log("LOGIN API DATA TYPE:", typeof data);
  console.log("LOGIN API ROLES:", data?.roles);

  return data;
},

  logout: async () => {
    await api.post("/auth/logout");
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
};
