import { Search } from "lucide-react";

type SearchPillProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
};

export default function SearchPill({
  value,
  onChange,
  onSubmit,
  placeholder,
}: SearchPillProps) {
  return (
    <div className="flex items-center w-full max-w-2xl bg-white shadow-sm rounded-full px-4 py-2 border">
      <Search className="text-gray-400 mr-2" size={18} />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        type="text"
        placeholder={placeholder}
        className="flex-1 outline-none text-sm"
      />

      <button
        onClick={onSubmit}
        className="bg-red-600 text-white text-sm px-5 py-1.5 rounded-full cursor-pointer hover:bg-red-700"
      >
        Cari
      </button>
    </div>
  );
}
