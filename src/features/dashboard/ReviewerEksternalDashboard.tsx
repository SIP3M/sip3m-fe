import { useNavigate } from "react-router-dom";
import { BookOpenCheck, CircleAlert, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReviewerEksternalDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Reviewer Eksternal
        </h1>
        <p className="text-sm text-gray-500">
          Halaman ringkas untuk monitoring dan evaluasi review eksternal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-blue-600" /> Tugas Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Daftar proposal yang sedang ditugaskan ke Anda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleAlert className="h-4 w-4 text-orange-600" /> Perlu Tindak
              Lanjut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Review yang belum lengkap atau perlu revisi masukan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenCheck className="h-4 w-4 text-emerald-600" /> Selesai
              Ditinjau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Ringkasan proposal yang sudah selesai direview.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => navigate("/reviewer-eksternal-dashboard/reviews")}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Lihat Daftar Review
      </Button>
    </div>
  );
}
