import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  getGoogleOAuthConfig,
  GoogleOAuthConfig,
  updateGoogleOAuthConfig,
} from "@/features/settings/systemConfig.api";

/**
 * Sistem & Konfigurasi — Login Google (OAuth).
 *
 * ADMIN_SISTEM mengganti Client ID / Client Secret Google kapan pun
 * tanpa deploy ulang (tersimpan di tabel system_config).
 */
export default function OauthGooglePage() {
  const [config, setConfig] = useState<GoogleOAuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoogleOAuthConfig();
      setConfig(data);
      setClientId(data.client_id);
      setClientSecret("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal memuat konfigurasi login Google.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    if (!clientId.trim()) {
      setFormError("Client ID wajib diisi.");
      return;
    }
    // Secret baru wajib bila belum pernah dikonfigurasi.
    if (!config?.is_configured && !clientSecret.trim()) {
      setFormError("Client Secret wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      const data = await updateGoogleOAuthConfig({
        client_id: clientId.trim(),
        // Kosong = pertahankan secret lama (GET hanya mengirim nilai ter-mask).
        client_secret: clientSecret.trim(),
      });
      setConfig(data);
      setClientSecret("");
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Gagal menyimpan konfigurasi.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        Memuat konfigurasi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
        <button
          type="button"
          onClick={() => void fetchConfig()}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <RefreshCw size={16} /> Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Login Google</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola kredensial OAuth Google (Client ID &amp; Client Secret).
          Perubahan langsung berlaku tanpa deploy ulang.
        </p>
      </div>

      {/* Status */}
      <div
        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
          config?.is_configured
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
      >
        {config?.is_configured ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        ) : (
          <KeyRound size={18} className="mt-0.5 shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {config?.is_configured
              ? "Login Google sudah aktif"
              : "Login Google belum dikonfigurasi"}
          </p>
          <p className="mt-0.5 opacity-80">
            {config?.is_configured
              ? `Terakhir diubah: ${
                  config.updated_at
                    ? new Date(config.updated_at).toLocaleString("id-ID")
                    : "-"
                }`
              : "Isi Client ID & Client Secret di bawah lalu simpan untuk mengaktifkan."}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5"
      >
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {formError}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            Konfigurasi berhasil disimpan.
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">
            Client ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
            className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Dari Google Cloud Console → Credentials → OAuth client ID (Web
            application).
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Client Secret{" "}
            {config?.is_configured ? (
              <span className="text-gray-400 font-normal">(opsional)</span>
            ) : (
              <span className="text-red-500">*</span>
            )}
          </label>
          <div className="relative mt-2">
            <input
              type={showSecret ? "text" : "password"}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={
                config?.client_secret_masked
                  ? `Tersimpan: ${config.client_secret_masked} — isi untuk mengganti`
                  : "GOCSPX-..."
              }
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 inset-y-0 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label={
                showSecret ? "Sembunyikan secret" : "Tampilkan secret"
              }
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {config?.is_configured
              ? "Kosongkan bila tidak ingin mengganti secret yang sudah tersimpan."
              : "Secret ditampilkan ter-mask dan tidak pernah dikirim utuh ke browser."}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 h-10 px-5 bg-[#e10600] hover:bg-[#c50500] text-white rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => void fetchConfig()}
            className="flex items-center gap-2 h-10 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            <RefreshCw size={16} /> Muat ulang
          </button>
        </div>
      </form>

      {/* Panduan setup */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ArrowLeft size={14} className="rotate-180" /> Cara mendapatkan
          kredensial
        </h2>
        <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
          <li>
            Buka{" "}
            <span className="font-mono text-xs bg-gray-100 px-1 rounded">
              console.cloud.google.com
            </span>{" "}
            → buat/pilih project.
          </li>
          <li>
            <b>APIs &amp; Services → OAuth consent screen</b> → isi app name
            (mis. SIP3M), pilih <b>External</b>.
          </li>
          <li>
            <b>APIs &amp; Services → Credentials → Create Credentials → OAuth
            client ID</b> → Application type: <b>Web application</b>.
          </li>
          <li>
            Di <b>Authorized redirect URIs</b> tambahkan URL callback backend,
            contoh:{" "}
            <span className="font-mono text-xs bg-gray-100 px-1 rounded break-all">
              https://sip3m-be.vercel.app/api/auth/google/callback
            </span>
          </li>
          <li>Salin <b>Client ID</b> &amp; <b>Client Secret</b> ke form di atas.</li>
        </ol>
      </div>

      {/* Catatan kebijakan akun */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <b>Catatan:</b> login Google hanya untuk email yang{" "}
        <b>sudah terdaftar</b> di sistem. Role user tetap diatur lewat menu
        <b> Pengguna</b> / <b>Role &amp; Permission</b>.
      </div>
    </div>
  );
}
