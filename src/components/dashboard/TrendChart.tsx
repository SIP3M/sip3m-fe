import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { name: "Jan", proposal: 4 },
  { name: "Feb", proposal: 7 },
  { name: "Mar", proposal: 5 },
  { name: "Apr", proposal: 12 },
  { name: "May", proposal: 9 },
  { name: "Jun", proposal: 15 }
];

export default function TrendChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">

      <h3 className="font-semibold mb-4">Tren Proposal Masuk</h3>

      <LineChart width={900} height={250} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="proposal" stroke="#e10600" />
      </LineChart>

    </div>
  );
}