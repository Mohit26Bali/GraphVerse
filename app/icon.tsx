import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14161a",
          borderRadius: 14,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 100 100" fill="none">
          <path
            d="M8 66 C 24 20, 40 20, 50 50 C 60 80, 76 80, 92 34"
            stroke="#19c3e6"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="8" cy="66" r="7" fill="#ffd23f" />
          <circle cx="92" cy="34" r="7" fill="#5ad27a" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
