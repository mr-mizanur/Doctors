"use client";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({ page = 1, pages = 0, total = 0, onPageChange }) {
  if (pages < 2) return <p className="px-2 py-4 text-xs text-slate-400">Showing {total} record{total === 1 ? "" : "s"}</p>;
  return <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-5">
    <p className="text-xs font-medium text-slate-500">{total} records · Page {page} of {pages}</p>
    <div className="flex gap-2">
      <button aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="btn-quiet disabled:opacity-40"><FiChevronLeft/> Previous</button>
      <button aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="btn-quiet disabled:opacity-40">Next <FiChevronRight/></button>
    </div>
  </div>;
}
