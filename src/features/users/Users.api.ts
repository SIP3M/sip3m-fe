import { api } from "@/services/api";
import {
  CreateUserPayload,
  CreateUserResponse,
  GetUsersResponse,
  GetUsersParams,
} from "./users.types";

// Simple cache for users data
const cache = new Map<string, { data: GetUsersResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const sanitizeCreateUserPayload = (data: CreateUserPayload) => {
  const normalized: CreateUserPayload = {
    ...data,
    name: data.name.trim(),
    email: data.email.trim(),
    username: data.username?.trim(),
    nidn_nip: data.nidn_nip?.trim(),
    fakultas: data.fakultas?.trim(),
    program_studi: data.program_studi?.trim(),
    tempat_lahir: data.tempat_lahir?.trim(),
    jenis_kelamin: data.jenis_kelamin?.trim(),
    alamat: data.alamat?.trim(),
    nomor_hp: data.nomor_hp?.trim(),
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => {
      if (typeof value === "string") {
        return value.length > 0;
      }
      return value !== undefined && value !== null;
    }),
  ) as CreateUserPayload;
};

/**
 * Generate cache key dari params
 */
const getCacheKey = (params?: GetUsersParams): string => {
  return JSON.stringify({
    page: params?.page || 1,
    status: params?.status || "",
    roles: params?.roles || "",
    search: params?.search || "",
  });
};

/**
 * Get all users dengan optional filter dan pagination
 * @param params - Filter parameters (page, limit, status, role, search)
 */
export const getUsers = async (
  params?: GetUsersParams,
): Promise<GetUsersResponse> => {
  const cacheKey = getCacheKey(params);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const page = params?.page || 1;

    const res = await api.get<GetUsersResponse>("/users", {
      params: {
        page,
        search: params?.search || undefined,
        roles: params?.roles || undefined,
        status: params?.status || undefined,
      },
    });

    // Cache the response
    cache.set(cacheKey, { data: res.data, timestamp: Date.now() });
    return res.data;
  } catch (error) {
    // Clear cache on error
    cache.delete(cacheKey);
    throw error;
  }
};

/**
 * Clear cache (useful after create/update/delete)
 */
export const clearUsersCache = () => {
  cache.clear();
};

/**
 * Create new user
 * @param data - User creation payload
 */
export const createUser = async (
  data: CreateUserPayload,
): Promise<CreateUserResponse> => {
  const payload = sanitizeCreateUserPayload(data);

  if (!payload.name || !payload.email || !payload.password || !payload.roles) {
    throw new Error("Field wajib: name, email, password, roles.");
  }

  const res = await api.post<CreateUserResponse>("/users", payload);
  // Clear cache setelah create
  clearUsersCache();
  return res.data;
};
