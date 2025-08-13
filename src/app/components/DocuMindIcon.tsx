"use client";
import React from "react";

export default function DocuMindIcon({
  className = "w-8 h-8 text-blue-600",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Document with folded corner */}
      <path d="M7 3h7l5 5v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" />
      <path d="M14 3v5h5" />

      {/* Neural/brain motif */}
      <g>
        <circle cx="10" cy="11" r="1.2" />
        <circle cx="14.5" cy="9.5" r="1.1" />
        <circle cx="15" cy="13.5" r="1.1" />
        <circle cx="11.5" cy="15.5" r="1.1" />
        <path d="M11.2 11.6 L13.2 10.2" />
        <path d="M11.6 12.2 L14.4 13" />
        <path d="M10.8 12.4 L11.2 14.6" />
      </g>
    </svg>
  );
}
