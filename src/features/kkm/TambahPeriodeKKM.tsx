import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TambahPeriodeKKMProps {
  onBack: () => void;
}

export default function TambahPeriodeKKM({ onBack }: TambahPeriodeKKMProps) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Kembali
      </button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Tambah Periode KKM</h1>
        <p className="text-gray-500 mt-2">Form untuk menambah periode KKM baru - dalam pengembangan</p>
      </div>
    </div>
  );
}
