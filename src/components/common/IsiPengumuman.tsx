import { parseIsiPengumuman } from "@/utils/pengumuman";

/**
 * Render isi pengumuman: paragraf + **teks** → tebal.
 * Dirender sebagai node React (bukan HTML mentah) sehingga aman dari XSS.
 */
export default function IsiPengumuman({
  isi,
  className = "",
}: {
  isi: string;
  className?: string;
}) {
  const paragraphs = parseIsiPengumuman(isi);

  if (paragraphs.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((paragraf, i) => (
        <p key={`p-${i}`} className="leading-relaxed">
          {paragraf.segments.map((segment, j) =>
            segment.bold ? (
              <strong key={`s-${j}`} className="font-semibold text-gray-900">
                {segment.text}
              </strong>
            ) : (
              <span key={`s-${j}`}>{segment.text}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
