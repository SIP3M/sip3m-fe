import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Wallet, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Dashboard Staff LPPM
        </h1>
        <p className="text-sm text-gray-500">
          Ringkasan tugas harian untuk staff LPPM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-blue-600" /> Verifikasi
              Proposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Cek proposal baru yang perlu diverifikasi.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-purple-600" /> Plotting Reviewer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Atur reviewer untuk proposal yang masuk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-emerald-600" /> Keuangan & Hibah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Pantau kebutuhan pencairan dan hibah.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => navigate("/staff-lppm/plotting-reviewer")}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Buka Plotting Reviewer
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/staff-lppm/finance")}
        >
          Buka Keuangan
        </Button>
      </div>
    </div>
  );
}
