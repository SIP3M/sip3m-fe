import { User } from "@/features/auth/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_DATA_KEY = "userData";

type AuthPersistence = "local" | "session";

const parseUser = (value: string | null): User | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
};

export const getAccessToken = (): string | null => {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
};

export const getStoredUser = (): User | null => {
  const localUser = parseUser(localStorage.getItem(USER_DATA_KEY));
  if (localUser) return localUser;

  return parseUser(sessionStorage.getItem(USER_DATA_KEY));
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_DATA_KEY);
};

export const setAuthSession = (params: {
  token: string;
  user: User;
  rememberMe: boolean;
}) => {
  const targetStorage = params.rememberMe ? localStorage : sessionStorage;
  const otherStorage = params.rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_DATA_KEY);

  targetStorage.setItem(ACCESS_TOKEN_KEY, params.token);
  targetStorage.setItem(USER_DATA_KEY, JSON.stringify(params.user));
};

export const setStoredUser = (user: User) => {
  if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    return;
  }

  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }
};

export const getAuthPersistence = (): AuthPersistence | null => {
  if (localStorage.getItem(ACCESS_TOKEN_KEY)) return "local";
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) return "session";
  return null;
};
