import { api } from "@/services/api";
import {
  CreateUserPayload,
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  GetUsersResponse,
  GetUsersParams,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UpdateUserStatusResponse,
  UpdateUserResponse,
} from "./users.types";

// Simple cache for users data
const cache = new Map<string, { data: GetUsersResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

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
  const isActive =
    params?.status === "active"
      ? true
      : params?.status === "inactive"
        ? false
        : "";

  return JSON.stringify({
    page: params?.page || 1,
    is_active: isActive,
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
    const isActive =
      params?.status === "active"
        ? true
        : params?.status === "inactive"
          ? false
          : undefined;

    const res = await api.get<GetUsersResponse>("/users", {
      params: {
        page,
        search: params?.search || undefined,
        roles: params?.roles || undefined,
        status: params?.status || undefined,
        is_active: isActive,
      },
    });

    // Evict expired entries before inserting a new one
    for (const [key, value] of cache.entries()) {
      if (Date.now() - value.timestamp >= CACHE_DURATION) {
        cache.delete(key);
      }
    }

    // If still at the size limit, remove the oldest entry
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

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

export const getUserById = async (id: number): Promise<GetUserResponse> => {
  const res = await api.get<GetUserResponse>(`/users/${id}`);
  return res.data;
};

const sanitizeUpdateUserPayload = (data: UpdateUserPayload) => {
  const normalized: UpdateUserPayload = {
    ...data,
    name: data.name?.trim(),
    email: data.email?.trim(),
    username: data.username?.trim(),
    password: data.password?.trim(),
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
  ) as UpdateUserPayload;
};

export const updateUser = async (
  id: number,
  data: UpdateUserPayload,
): Promise<UpdateUserResponse> => {
  const payload = sanitizeUpdateUserPayload(data);
  const res = await api.put<UpdateUserResponse>(`/users/${id}`, payload);
  clearUsersCache();
  return res.data;
};

export const deleteUser = async (id: number): Promise<DeleteUserResponse> => {
  const res = await api.delete<DeleteUserResponse>(`/users/${id}`);
  clearUsersCache();
  return res.data;
};

export const updateUserStatus = async (
  id: number,
  payload: UpdateUserStatusPayload,
): Promise<UpdateUserStatusResponse> => {
  const res = await api.patch<UpdateUserStatusResponse>(
    `/users/${id}/status`,
    payload,
  );
  clearUsersCache();
  return res.data;
};
