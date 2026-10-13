const DEVICE_ID_KEY = "device_id";

export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    // crypto.randomUUID is available in secure contexts; fallback to simple uuid
    try {
      id = crypto.randomUUID();
    } catch {
      id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
    }
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

export const DEVICE_ID_HEADER = "X-Device-Id";
