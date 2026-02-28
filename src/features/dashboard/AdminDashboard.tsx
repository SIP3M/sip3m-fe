import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Jan", proposal: 12 },
  { name: "Feb", proposal: 20 },
];

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

      <div className="bg-white p-4 rounded-xl shadow">
        <BarChart width={400} height={250} data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="proposal" />
        </BarChart>
      </div>
    </div>
  );
}