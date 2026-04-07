import StatCard from "@/components/dashboard/StatCard";
import { FileText, Users, CheckCircle, Clock } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const statusData = [
  { name: "Draft", value: 1, fill: "#94a3b8" },
  { name: "Review", value: 1, fill: "#facc15" },
  { name: "Revisi", value: 1, fill: "#fb923c" },
  { name: "Disetujui", value: 1, fill: "#22c55e" },
  { name: "Ditolak", value: 1, fill: "#ef4444" },
];

const kategoriData = [
  { name: "Penelitian Dasar", value: 12 },
  { name: "Penelitian Terapan", value: 8 },
  { name: "Pengabdian", value: 15 },
];

const lineData = [
  { name: "Jan", value: 4 },
  { name: "Feb", value: 7 },
  { name: "Mar", value: 5 },
  { name: "Apr", value: 12 },
  { name: "May", value: 9 },
  { name: "Jun", value: 15 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">
          Ringkasan aktivitas LPPM UMC hari ini.
        </p>
      </div>

      {/* STAT */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Proposal"
          value="5"
          desc="+12% bulan ini"
          icon={<FileText size={18} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Dosen Aktif"
          value="142"
          desc="+4 orang baru"
          icon={<Users size={18} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Proposal Disetujui"
          value="24"
          desc="Tahun Ajaran 2023/2024"
          icon={<CheckCircle size={18} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatCard
          title="Menunggu Review"
          value="8"
          desc="Perlu tindakan segera"
          icon={<Clock size={18} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* CHART */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Status Proposal</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Kategori Penelitian</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={kategoriData} layout="vertical">
              <XAxis type="number" />
              <YAxis 
              dataKey="name" 
              type="category"
              width={65}
              tick={{ fontSize: 12 }} />
              <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="value" fill="#e11d48" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Tren Proposal Masuk</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};