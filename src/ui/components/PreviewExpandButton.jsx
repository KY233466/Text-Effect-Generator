import React, { useState } from "react";

export default function PreviewExpandButton({
  onClick,
  isLoading = false,
  previewHovered = false,
}) {
  const [focused, setFocused] = useState(false);
  const visible = previewHovered || focused || isLoading;

  if (!onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Open larger editor"
      title="Open larger editor"
      style={{
        position: "absolute",
        right: "12px",
        bottom: "14px",
        zIndex: 3,
        width: "34px",
        height: "34px",
        padding: 0,
        display: "grid",
        placeItems: "center",
        border: "1px solid rgba(255, 255, 255, 0.9)",
        borderRadius: "8px",
        background: "rgba(0, 123, 255, 0.82)",
        color: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        cursor: isLoading ? "wait" : "pointer",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 140ms ease, transform 140ms ease",
      }}
    >
      {isLoading ? (
        <span aria-hidden="true">…</span>
      ) : (
        <svg
          aria-hidden="true"
          width="17"
          height="17"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M7 3H3V7M13 3H17V7M17 13V17H13M7 17H3V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
