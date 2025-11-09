import axios, { AxiosResponse } from "axios";
import { API_CONFIG } from "../constants";

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SchoolData {
  username: string;
  school_name: string;
  principal_name: string;
  board: string;
  address: string;
  is_active: boolean;
  is_admin?: boolean;
  created_at?: string;
}

export interface LoginResponse {
  success: boolean;
  school: SchoolData;
  message?: string;
}

export interface VerifyResponse {
  success: boolean;
  school: SchoolData;
}

export interface AddSchoolRequest {
  username: string;
  password: string;
  school_name: string;
  principal_name: string;
  board: string;
  address: string;
}

export interface AddSchoolResponse {
  success: boolean;
  message?: string;
}

export interface DeleteSchoolResponse {
  success: boolean;
  message?: string;
}

export interface SchoolsListResponse {
  success: boolean;
  schools: SchoolData[];
}

/**
 * Login with username and password
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  } catch (error: any) {
    console.error("Auth API: Login error:", error);
    throw new Error(
      error.response?.data?.detail || "Failed to login. Please try again."
    );
  }
};

/**
 * Verify session token/username
 */
export const verifySession = async (
  username: string
): Promise<VerifyResponse> => {
  try {
    const response: AxiosResponse<VerifyResponse> = await api.get(
      "/auth/verify",
      {
        params: { username },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Auth API: Verify session error:", error);
    throw new Error(
      error.response?.data?.detail || "Session verification failed"
    );
  }
};

/**
 * Add a new school (admin only)
 */
export const addSchool = async (
  schoolData: AddSchoolRequest
): Promise<AddSchoolResponse> => {
  try {
    const response: AxiosResponse<AddSchoolResponse> = await api.post(
      "/auth/add-school",
      schoolData
    );
    return response.data;
  } catch (error: any) {
    console.error("Auth API: Add school error:", error);
    throw new Error(error.response?.data?.detail || "Failed to add school");
  }
};

/**
 * Get list of all schools (admin only)
 */
export const listSchools = async (): Promise<SchoolsListResponse> => {
  try {
    const response: AxiosResponse<SchoolsListResponse> = await api.get(
      "/auth/schools"
    );
    return response.data;
  } catch (error: any) {
    console.error("Auth API: List schools error:", error);
    throw new Error(error.response?.data?.detail || "Failed to load schools");
  }
};

/**
 * Delete a school (admin only)
 */
export const deleteSchool = async (
  username: string
): Promise<DeleteSchoolResponse> => {
  try {
    const response: AxiosResponse<DeleteSchoolResponse> = await api.delete(
      `/auth/schools/${username}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Auth API: Delete school error:", error);
    throw new Error(error.response?.data?.detail || "Failed to delete school");
  }
};

export default api;
