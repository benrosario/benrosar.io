import { ImageResponse } from "next/og";
export const alt = "Ben Rosario | Developer & Cognitive Science Student at UC Berkeley";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "70px 80px",
        background: "#f8f7f3",
        color: "#253b33",
      }}
    >
      <div style={{ display: "flex", fontSize: 27 }}>
        ben rosario <span style={{ color: "#c3623e", marginLeft: 14 }}>*</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 88,
          letterSpacing: -4,
        }}
      >
        <span>Ben Rosario.</span>
        <span style={{ fontSize: 40, letterSpacing: -1 }}>Developer. Cognitive Science at UC Berkeley.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#70756d",
        }}
      >
        <span>San Francisco Bay Area</span>
        <span>benrosar.io</span>
      </div>
    </div>,
    size,
  );
}
