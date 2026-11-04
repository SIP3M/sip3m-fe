import { api } from "@/services/api";

/**
 * API Notifikasi — GET /notifications & PATCH /notifications/:id/read
 * (sudah tersedia di BE; sebelumnya belum ada client-nya sama sekali).
 */
export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  /** diisi bila notifikasi berasal dari pengumuman (dipakai untuk tautan) */
  pengumuman_id?: number | null;
  created_at: string;
}

export interface GetNotificationsResponse {
  message: string;
  data: {
    unread_count: number;
    notifications: NotificationItem[];
  };
}

export const getNotifications = async (): Promise<GetNotificationsResponse> => {
  const res = await api.get<GetNotificationsResponse>("/notifications");
  return res.data;
};

export const markNotificationRead = async (
  id: number | string,
): Promise<{ message: string; data: NotificationItem }> => {
  const res = await api.patch<{ message: string; data: NotificationItem }>(
    `/notifications/${id}/read`,
  );
  return res.data;
};
