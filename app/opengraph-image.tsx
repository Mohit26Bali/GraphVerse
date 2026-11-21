import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GraphVerse — an interactive platform for exploring mathematical functions";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#14161a",
          padding: "80px 96px",
          position: "relative",
        }}
      >
        <svg
          width="440"
          height="230"
          viewBox="0 0 440 230"
          fill="none"
          style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)" }}
        >
          <path
            d="M12 190 C 90 30, 160 30, 220 120 C 280 210, 350 210, 428 40"
            stroke="#19c3e6"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M12 90 C 100 170, 200 10, 280 90 C 340 150, 390 150, 428 100"
            stroke="#ff3d9a"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
          <circle cx="12" cy="190" r="11" fill="#ffd23f" />
          <circle cx="220" cy="120" r="11" fill="#5ad27a" />
          <circle cx="428" cy="40" r="11" fill="#ffd23f" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 14,
              background: "#1a1d22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <path
                d="M8 66 C 24 20, 40 20, 50 50 C 60 80, 76 80, 92 34"
                stroke="#19c3e6"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ fontSize: 30, color: "#e9ebee", fontWeight: 600, letterSpacing: -0.5 }}>GraphVerse</div>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 60,
            fontWeight: 700,
            color: "#e9ebee",
            letterSpacing: -1.5,
            lineHeight: 1.08,
            maxWidth: 700,
          }}
        >
          See the math move.
        </div>

        <div style={{ marginTop: 22, fontSize: 26, color: "#9aa1ad", maxWidth: 620, lineHeight: 1.4 }}>
          22 interactive modules — functions, calculus, and chaos, visualized and animated in real time.
        </div>
      </div>
    ),
    { ...size },
  );
}
