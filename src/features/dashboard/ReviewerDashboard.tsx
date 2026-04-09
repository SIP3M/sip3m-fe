import { useNavigate } from "react-router-dom";
import { CheckSquare, ClipboardCheck, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Reviewer
        </h1>
        <p className="text-sm text-gray-500">
          Ringkasan tugas review proposal yang sedang berjalan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-blue-600" /> Perlu
              Direview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Proposal baru yang menunggu penilaian Anda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="h-4 w-4 text-orange-600" /> Deadline Terdekat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Pantau jadwal agar review selesai tepat waktu.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4 text-emerald-600" /> Selesai
              Direview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Riwayat proposal yang sudah Anda nilai.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => navigate("/reviewer-dashboard/reviews")}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Buka Halaman Review
      </Button>
    </div>
  );
}
