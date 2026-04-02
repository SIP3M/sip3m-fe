import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const pageNumbers: (number | string)[] = [];

  // Generate page numbers
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);

    // Show dots if needed
    if (page > 3) {
      pageNumbers.push("...");
    }

    // Show pages around current page
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    // Show dots if needed
    if (page < totalPages - 2) {
      pageNumbers.push("...");
    }

    // Always show last page
    pageNumbers.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || isLoading}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((num, idx) => (
          <button
            key={idx}
            onClick={() => typeof num === "number" && onPageChange(num)}
            disabled={num === "..." || isLoading}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition
              ${
                num === page
                  ? "bg-red-600 text-white"
                  : num === "..."
                    ? "cursor-default text-gray-400"
                    : "border border-gray-300 hover:bg-gray-50 text-gray-700"
              }
              ${(num === "..." || isLoading) ? "cursor-not-allowed" : ""}
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || isLoading}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
