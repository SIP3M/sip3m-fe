import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import Logo from "@/assets/images/Logo LPPM UMC 2.png";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  FileText,
  Search,
  BookOpen,
  Download,
  UploadCloud,
  CheckCircle,
  PlayCircle,
  FileCheck,
  ArrowLeftIcon,
  ArrowBigRightDashIcon,
  ArrowRightIcon,
  ArrowRightSquare,
  ArrowRightFromLine,
  ArrowUpRightFromSquare,
  ArrowRightSquareIcon,
  ArrowRightToLine,
  LogIn,
  Send,
  Medal,
  BookAIcon,
  Library,
  Archive,
  CalendarDays,
} from "lucide-react";
import {
  Eye,
  BarChart3,
  Wallet,
  FolderOpen,
  LayoutDashboard,
  Clock,
  Award,
  Users,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";

import hero1 from "@/assets/images/hero1.jpg";
import hero2 from "@/assets/images/hero2.jpg";
import hero3 from "@/assets/images/hero3.jpg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function LPPMLandingPage() {
  const navigate = useNavigate();
  const heroImages = [hero1, hero2, hero3];
  const aboutImage =
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644";

  return (
    <div className="font-sans text-gray-800">
      {/* TOP BAR */}
      <div className="bg-[#d60000] text-white text-xs text-center py-2">
        Pengajuan Hibah Penelitian Internal UMC Tahun 2026 Telah Dibuka
        <button className="ml-3 bg-white text-[#d60000] px-3 py-1 rounded-full text-[11px]">
          Lihat Panduan
        </button>
      </div>

      {/* NAVBAR MODERN */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-12 py-3">
          {/* LOGO */}
            <img src={Logo} className="w-23 h-10 object-contain" />

          {/* MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#beranda"
              className="text-red-600 font-semibold border-b-2 border-red-600 pb-1"
            >
              Beranda
            </a>

            <a href="#tentang" className="hover:text-red-600 transition">
              Tentang
            </a>

            {/* DROPDOWN STYLE */}
            <div className="flex items-center gap-1 cursor-pointer hover:text-red-600">
              Penelitian
              <span className="text-xs">▾</span>
            </div>

            <a className="hover:text-red-600 transition">Pengabdian</a>
            <a className="hover:text-red-600 transition">Publikasi</a>
            <a className="hover:text-red-600 transition">Berita</a>
            <a className="hover:text-red-600 transition">Kontak</a>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* SEARCH ICON */}
            <Search className="w-5 h-5 text-gray-500 cursor-pointer hover:text-red-600" />

            {/* BUTTON */}
            <button
              onClick={() => navigate("/login")}
              className="bg-red-600 text-white px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5 
  hover:bg-red-700 transition cursor-pointer"
            >
              <LogIn size={16} />
              <span>Masuk Sistem</span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <section id="beranda" className="h-162.5">
        <Swiper
  modules={[Autoplay, Navigation, Pagination]}
  autoplay={{ delay: 4000, disableOnInteraction: false }}
  loop
  navigation
  pagination={{ clickable: true }}
  className="h-full custom-swiper"
>
          {heroImages.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full group">
                {/* Background Image */}
                <img
                  src={img}
                  className="absolute w-full h-full object-cover scale-100 group-hover:scale-105 transition duration-700"
                />

                {/* Gradient Overlay (lebih elegan dari merah solid) */}
                <div className="absolute w-full h-full bg-linear-to-r from-black/70 via-red-600/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 px-12 py-32 text-white max-w-2xl">
                  {/* Title */}
                  <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">
                    Pengajuan Hibah Penelitian 2026 Telah Dibuka
                  </h1>

                  {/* Subtitle */}
                  <p className="mt-4 text-sm text-gray-200">
                    Sistem LPPM online, transparan, dan terstruktur.
                  </p>

                  {/* Button */}
                  <button
                    className="mt-6 border border-white/70 px-6 py-3 rounded-xl flex items-center gap-2 leading-none cursor-pointer 
                    backdrop-blur-sm bg-white/10 text-white
                    transition-all duration-300 ease-out
                  hover:bg-red-700 hover:text-white hover:shadow-lg hover:scale-105 active:scale-95 hover:border-none"
                  >
                    <FileText
                      size={18}
                      className="shrink-0 transition-transform duration-300 "
                    />

                    <span className="flex items-center font-medium tracking-wide">
                      Ajukan Proposal
                    </span>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* SHORTCUT */}
      <section className="bg-gray-100 py-12 px-12 grid md:grid-cols-4 gap-6">
        {[
          {
            title: "Ajukan Proposal",
            icon: <Send />,
            bg: "bg-red-100",
            text: "text-red-600",
          },
          {
            title: "Cek Status",
            icon: <Search />,
            bg: "bg-blue-100",
            text: "text-blue-600",
          },
          {
            title: "Panduan",
            icon: <BookOpen />,
            bg: "bg-green-100",
            text: "text-green-600",
          },
          {
            title: "Download RAB",
            icon: <Download />,
            bg: "bg-orange-100",
            text: "text-orange-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl text-center shadow hover:shadow-lg transition duration-300 hover:-translate-y-1"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-full ${item.bg} ${item.text}`}
            >
              {item.icon}
            </div>

            <p className="font-medium text-gray-700">{item.title}</p>
          </div>
        ))}
      </section>

      {/* TENTANG */}
      <section id="tentang" className="px-12 py-20 bg-[#f8f8f8]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT TEXT */}
          <div>
            <span className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full font-medium">
              Tentang Kami
            </span>

            <h2 className="text-4xl font-bold mt-4 leading-snug">
              Tentang LPPM UMC
            </h2>

            <p className="text-gray-500 mt-4 text-sm leading-relaxed max-w-md">
              Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)
              Universitas Muhammadiyah Cirebon merupakan unit yang bertanggung
              jawab dalam mengelola, mengembangkan, dan memfasilitasi kegiatan
              penelitian dan pengabdian kepada masyarakat bagi dosen.
            </p>

            {/* STATS */}
            <div className="flex gap-8 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center rounded-lg text-red-600">
                  <Medal />
                </div>
                <div>
                  <p className="font-bold">10+</p>
                  <span className="text-gray-400 text-xs">
                    Tahun Pengalaman
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center rounded-lg text-red-600">
                  <FileText />
                </div>
                <div>
                  <p className="font-bold">100+</p>
                  <span className="text-gray-400 text-xs">Penelitian</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center rounded-lg text-red-600">
                  <BookOpen />
                </div>
                <div>
                  <p className="font-bold">50+</p>
                  <span className="text-gray-400 text-xs">Publikasi</span>
                </div>
              </div>
            </div>

            <button className="mt-8 bg-red-600 text-white px-6 py-3 rounded-xl shadow hover:bg-red-700 transition">
              Selengkapnya →
            </button>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            {/* MAIN IMAGE */}
            <img src={aboutImage} className="rounded-2xl shadow-lg" />

            {/* BADGE TOP RIGHT */}
            <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl shadow text-sm flex items-center gap-2">
              <span className="text-green-500">✔</span>
              Terakreditasi
            </div>

            {/* FLOAT CARD */}
            <div className="absolute -bottom-6 left-6 bg-white px-6 py-4 rounded-xl shadow flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded-lg">
                <Medal />
              </div>
              <div>
                <p className="font-bold">10+</p>
                <span className="text-gray-400 text-xs">Tahun Pengalaman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA */}
      <section className="bg-[#f5f5f7] py-24 px-12 text-center">
        {/* LABEL */}
        <div className="mb-4">
          <span className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full font-medium">
            Fitur
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold">Fitur Utama Sistem LPPM</h2>

        {/* SUBTITLE */}
        <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
          Berbagai fitur canggih untuk mendukung pengelolaan penelitian dan
          pengabdian secara digital.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {/* ITEM */}
          {[
            {
              icon: <FileText size={20} />,
              title: "Pengajuan Proposal",
              desc: "Ajukan proposal penelitian secara online dengan sistem terstruktur dan terintegrasi.",
            },
            {
              icon: <Eye size={20} />,
              title: "Review Proposal",
              desc: "Proses penilaian oleh reviewer dilakukan secara transparan dan objektif.",
            },
            {
              icon: <BarChart3 size={20} />,
              title: "Monitoring Penelitian",
              desc: "Pantau progres penelitian dan laporan berkala secara real-time.",
            },
            {
              icon: <Wallet size={20} />,
              title: "Manajemen Hibah",
              desc: "Kelola anggaran dan pencairan dana penelitian secara akuntabel.",
            },
            {
              icon: <Archive size={20} />,
              title: "Publikasi & Repository",
              desc: "Simpan dan kelola hasil penelitian dan publikasi ilmiah.",
            },
            {
              icon: <LayoutDashboard size={20} />,
              title: "Dashboard Statistik",
              desc: "Lihat data penelitian dalam bentuk visual yang informatif.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm text-left hover:shadow-md transition"
            >
              {/* ICON */}
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-xl mb-4">
                {item.icon}
              </div>

              {/* TITLE */}
              <h3 className="font-semibold text-base">{item.title}</h3>

              {/* DESC */}
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ALUR SISTEM */}
      <section className="py-24 bg-[#f9f9f9] text-center px-12">
        {/* LABEL */}
        <span className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full">
          Alur Sistem
        </span>

        {/* TITLE */}
        <h2 className="text-4xl font-bold mt-4">Alur Sistem Penelitian</h2>

        <p className="text-gray-500 mt-3 text-sm">
          Proses pengajuan hingga publikasi penelitian yang terstruktur dan
          transparan.
        </p>

        {/* FLOW */}
        <div className="relative mt-16 flex justify-between max-w-5xl mx-auto">
          {/* GARIS */}
          <div className="absolute left-8 right-8 h-0.5 bg-gray-300 top-8 z-0"></div>

          {[
            {
              icon: <UploadCloud size={20} />,
              title: "Submit Proposal",
              desc: "Ajukan penelitian",
            },
            {
              icon: <Eye size={20} />,
              title: "Review Reviewer",
              desc: "Penilaian oleh ahli",
            },
            {
              icon: <CheckCircle size={20} />,
              title: "Persetujuan Hibah",
              desc: "Validasi pendanaan",
            },
            {
              icon: <Clock size={20} />,
              title: "Pelaksanaan",
              desc: "Riset berlangsung",
            },
            {
              icon: <BookOpen size={20} />,
              title: "Laporan & Publikasi",
              desc: "Hasil dipublikasi",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center w-40"
            >
              {/* BOX ICON */}
              <div className="w-16 h-16 bg-red-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
                {/* ICON */}
                {step.icon}

                {/* NUMBER DI DALAM */}
                <span className="text-xs mt-1 font-semibold opacity-90">
                  {i + 1}
                </span>
              </div>

              {/* TEXT */}
              <h4 className="mt-4 font-semibold text-sm">{step.title}</h4>

              <p className="text-gray-400 text-xs mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS MERAH */}
      <section className="bg-red-700 text-white py-20 px-12">
        <div className="grid md:grid-cols-4 gap-10 text-center">
          {[
            {
              icon: <FileText size={20} />,
              value: "150+",
              label: "Proposal Penelitian",
            },
            {
              icon: <TrendingUp size={20} />,
              value: "95+",
              label: "Penelitian Aktif",
            },
            {
              icon: <Award size={20} />,
              value: "60+",
              label: "Publikasi Ilmiah",
            },
            {
              icon: <Users size={20} />,
              value: "25+",
              label: "Mitra Kerjasama",
            },
          ].map((item, i) => (
            <div key={i}>
              {/* ICON BOX */}
              <div className="w-12 h-12 mx-auto mb-4 bg-white/20 flex items-center justify-center rounded-xl">
                {item.icon}
              </div>

              {/* VALUE */}
              <h3 className="text-4xl font-bold">{item.value}</h3>

              {/* LABEL */}
              <p className="text-sm text-white/80 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BERITA & INFORMASI */}
      <section className="py-24 px-12 bg-[#f9f9f9]">
        {/* LABEL */}
        <div className="text-center mb-4">
          <span className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full">
            Berita
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-4xl font-bold text-center">Berita & Informasi</h2>

        <p className="text-gray-500 text-sm text-center mt-3 max-w-xl mx-auto">
          Informasi terkini seputar kegiatan penelitian dan pengabdian di LPPM
          UMC.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              category: "Penelitian",
              color: "bg-red-600",
              date: "10 April 2026",
              title: "Pembukaan Hibah Penelitian Internal UMC 2026",
              desc: "LPPM UMC membuka kesempatan bagi dosen untuk mengajukan penelitian internal. Pendaftaran dibuka hingga 30 April 2026.",
              image:
                "https://images.unsplash.com/photo-1581091215367-59ab6b1f6a1d",
            },
            {
              category: "Kegiatan",
              color: "bg-blue-600",
              date: "5 April 2026",
              title: "Workshop Penulisan Proposal Penelitian",
              desc: "Kegiatan pelatihan untuk meningkatkan kualitas proposal dosen diselenggarakan secara hybrid.",
              image:
                "https://images.unsplash.com/photo-1571260899304-425eee4c7efc",
            },
            {
              category: "Pengabdian",
              color: "bg-green-600",
              date: "28 Maret 2026",
              title: "Pengabdian Masyarakat di Desa Mitra",
              desc: "Program pengabdian dalam bidang pemberdayaan masyarakat di desa binaan Universitas Muhammadiyah Cirebon.",
              image:
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {/* IMAGE */}
              <div className="relative h-52">
                <img src={item.image} className="w-full h-full object-cover" />

                {/* BADGE */}
                <span
                  className={`absolute top-4 left-4 text-white text-xs px-3 py-1 rounded-full ${item.color}`}
                >
                  {item.category}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-6">
                {/* DATE */}
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <CalendarDays size={12} className="opacity-70" />
                  <span>{item.date}</span>
                </p>

                {/* TITLE */}
                <h3 className="font-semibold text-base leading-snug">
                  {item.title}
                </h3>

                {/* DESC */}
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  {item.desc}
                </p>

                {/* LINK */}
                <button className="text-red-600 text-sm mt-4 flex items-center gap-1 hover:underline">
                  Baca Selengkapnya →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KEPERCAYAAN & KOLABORASI */}
      <section className="py-24 px-12 bg-[#f9f9f9] text-center">
        {/* LABEL */}
        <div className="mb-4">
          <span className="bg-red-100 text-red-600 text-xs px-4 py-1 rounded-full">
            Kepercayaan
          </span>
        </div>

        {/* TITLE */}
        <h2 className="text-4xl font-bold">Kepercayaan & Kolaborasi</h2>

        {/* SUBTITLE */}
        <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
          Dipercaya oleh dosen dan mitra dalam pengelolaan penelitian
          berkualitas.
        </p>

        {/* MITRA */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-gray-500">
          {[
            "Kemenristekdikti",
            "LLDIKTI Wilayah IV",
            "Pemkot Cirebon",
            "Muhammadiyah",
            "BRIN",
            "Dikti",
          ].map((item, i) => (
            <div key={i} className="px-4 py-2 bg-gray-100 rounded-full">
              {item}
            </div>
          ))}
        </div>

        {/* TESTIMONI */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          {[
            {
              name: "Dr. Ahmad Fauzi, M.Si.",
              role: "Dosen Fakultas Ekonomi",
              initial: "A",
              text: "Sistem ini sangat membantu pengelolaan penelitian kami. Proses pengajuan proposal menjadi lebih cepat dan transparan.",
            },
            {
              name: "Dr. Siti Nurhaliza, M.Kom.",
              role: "Dosen Fakultas Teknik",
              initial: "S",
              text: "Monitoring penelitian menjadi jauh lebih mudah. Saya bisa memantau progres dan laporan kapan saja dan di mana saja.",
            },
            {
              name: "Prof. Dr. Budi Santoso, M.Pd.",
              role: "Ketua LPPM UMC",
              initial: "B",
              text: "Platform yang luar biasa. Dashboard statistik memberikan insight yang sangat berharga untuk pengambilan keputusan.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm relative"
            >
              {/* BINTANG */}
              <div className="text-yellow-400 text-sm mb-4">★★★★★</div>

              {/* TEXT */}
              <p className="text-gray-500 text-sm leading-relaxed italic">
                "{item.text}"
              </p>

              {/* QUOTE ICON */}
              <div className="absolute top-6 right-6 text-gray-200 text-5xl">
                ”
              </div>

              {/* USER */}
              <div className="flex items-center gap-3 mt-6">
                {/* AVATAR */}
                <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded-full text-sm font-semibold">
                  {item.initial}
                </div>

                {/* NAME */}
                <div>
                  <p className="font-semibold text-sm">{item.name}</p>
                  <span className="text-gray-400 text-xs">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA MODERN */}
      <section className="px-12 py-24 bg-[#f9f9f9]">
        <div className="relative bg-linear-to-br from-red-600 to-red-700 text-white rounded-[30px] py-20 px-6 text-center overflow-hidden">
          {/* DEKORASI BULAT */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full"></div>

          {/* ICON ATAS */}
          <div className="w-14 h-14 mx-auto mb-6 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl">
            <LogIn />
          </div>

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Siap Memulai Penelitian <br /> Anda?
          </h2>

          {/* SUBTITLE */}
          <p className="text-white/80 text-sm mt-4 max-w-xl mx-auto">
            Gunakan Sistem Informasi LPPM untuk pengelolaan penelitian yang
            lebih mudah, cepat, dan terintegrasi.
          </p>

          {/* BUTTON */}
          <button
            onClick={() => navigate("/login")}
            className="mt-8 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:scale-105 transition hover:cursor-pointer"
          >
            → Masuk Sistem Sekarang
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0b0b0b] text-gray-300 pt-16 pb-6 px-12">
        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-10">
          {/* KOLOM 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={Logo}
                alt="Logo LPPM"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="font-bold text-white">LPPM UMC</h3>
                <p className="text-xs text-gray-400">
                  Universitas Muhammadiyah Cirebon
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Lembaga Penelitian dan Pengabdian kepada Masyarakat Universitas
              Muhammadiyah Cirebon.
            </p>
          </div>

          {/* KOLOM 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>Beranda</li>
              <li>Tentang</li>
              <li>Penelitian</li>
              <li>Publikasi</li>
              <li>Kontak</li>
            </ul>
          </div>

          {/* KOLOM 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Akses Sistem</h4>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">↗ Masuk Sistem</li>
              <li className="flex items-center gap-2">↗ Ajukan Proposal</li>
              <li className="flex items-center gap-2">↗ Cek Status</li>
              <li className="flex items-center gap-2">↗ Panduan Pengguna</li>
            </ul>

            {/* JAM */}
            <div className="mt-6 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 text-sm text-white">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Jam Operasional
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Senin - Jumat: 08.00 – 16.00 WIB
              </p>
            </div>
          </div>

          {/* KOLOM 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-red-500 mt-1" />
                <p>Jl. Fatahillah No. 40, Cirebon, Jawa Barat 45153</p>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={16} className="text-red-500" />
                <p>lppm@umc.ac.id</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-red-500" />
                <p>(0231) 123456</p>
              </div>
            </div>

            {/* SOSIAL MEDIA */}
            <div className="flex gap-3 mt-6">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                >
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GARIS */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>
            © 2026 LPPM Universitas Muhammadiyah Cirebon. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Kebijakan Privasi</span>
            <span>Syarat & Ketentuan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
