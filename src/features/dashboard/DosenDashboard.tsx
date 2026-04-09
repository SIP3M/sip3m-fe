import { useNavigate } from "react-router-dom";
import { FileText, Rocket, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DosenDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Dosen
        </h1>
        <p className="text-sm text-gray-500">
          Ringkasan proposal dan progres penelitian Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-blue-600" /> Proposal Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Lihat daftar proposal yang pernah diajukan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-emerald-600" /> Progress
              Penelitian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Pantau kemajuan proyek dan target output.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-orange-600" /> Riwayat
              Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Lihat catatan masukan dari reviewer.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => navigate("/dosen-dashboard/proposals")}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Lihat Daftar Proposal
      </Button>
    </div>
  );
}
