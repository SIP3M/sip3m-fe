import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    <ShadcnPagination>
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text=""
            onClick={(e) => {
              e.preventDefault();
              if (page > 1 && !isLoading) {
                onPageChange(page - 1);
              }
            }}
            aria-disabled={page === 1 || isLoading}
            className={`size-8 p-0 rounded-lg border border-gray-300 hover:bg-gray-50 ${page === 1 || isLoading ? "pointer-events-none opacity-50" : ""
              }`}
          />
        </PaginationItem>

        {pageNumbers.map((num, idx) => (
          <PaginationItem key={idx}>
            {num === "..." ? (
              <PaginationEllipsis className="text-gray-400" />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    onPageChange(num as number);
                  }
                }}
                isActive={num === page}
                aria-disabled={isLoading}
                className={
                  num === page
                    ? "rounded-lg border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                    : `rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 ${isLoading ? "pointer-events-none opacity-50" : ""}`
                }
              >
                {num}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            text=""
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages && !isLoading) {
                onPageChange(page + 1);
              }
            }}
            aria-disabled={page === totalPages || isLoading}
            className={`size-8 p-0 rounded-lg border border-gray-300 hover:bg-gray-50 ${page === totalPages || isLoading
              ? "pointer-events-none opacity-50"
              : ""
              }`}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}
