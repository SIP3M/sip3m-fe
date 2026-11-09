import { api } from "@/services/api";
import type {
  JabatanKelompokMaster,
  CreateJabatanMasterDTO,
  UpdateJabatanMasterDTO,
} from "./jabatanMaster.types";

export const jabatanMasterAPI = {
  async getAll(): Promise<JabatanKelompokMaster[]> {
    try {
      const res = await api.get("/kkm/jabatan-master");
      return res.data.data || [];
    } catch (err) {
      throw new Error("Gagal mengambil daftar jabatan");
    }
  },

  async getById(id: number): Promise<JabatanKelompokMaster> {
    try {
      const res = await api.get(`/kkm/jabatan-master/${id}`);
      return res.data.data;
    } catch (err) {
      throw new Error("Gagal mengambil jabatan");
    }
  },

  async create(payload: CreateJabatanMasterDTO): Promise<JabatanKelompokMaster> {
    try {
      const res = await api.post("/kkm/jabatan-master", payload);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Gagal membuat jabatan");
    }
  },

  async update(
    id: number,
    payload: UpdateJabatanMasterDTO,
  ): Promise<JabatanKelompokMaster> {
    try {
      const res = await api.patch(`/kkm/jabatan-master/${id}`, payload);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Gagal memperbarui jabatan");
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/kkm/jabatan-master/${id}`);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Gagal menghapus jabatan");
    }
  },
};
