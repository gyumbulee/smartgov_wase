export interface NinVerifyResponse {
  verified: boolean;
  eligible: boolean;
  request_reference?: string;
  identity_preview?: {
    first_name: string | null;
    last_name: string | null;
  };
  message: string;
}

export interface CitizenProfile {
  id: string;
  citizen_reference: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  ward: string | null;
  community: string | null;
  identity_status: "unverified" | "verified" | "failed";
  eligibility_status: "unknown" | "verified" | "pending" | "rejected";
  profile_completed_at: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  status: string;
}

export interface CompleteRegistrationResponse {
  message: string;
  user: AuthUser;
  citizen: CitizenProfile;
  token: string;
}

export interface LoginResponse {
  user: AuthUser;
  roles: string[];
  token: string;
}
