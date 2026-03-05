import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Draft", value: 1 },
  { name: "Review", value: 1 },
  { name: "Revisi", value: 1 },
  { name: "Disetujui", value: 1 },
  { name: "Ditolak", value: 1 },
];

export default function ProposalStatusChart() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">

      <h3 className="font-semibold mb-4">
        Status Proposal
      </h3>

      <BarChart width={450} height={250} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#ef4444" />
      </BarChart>

    </div>
  );
}