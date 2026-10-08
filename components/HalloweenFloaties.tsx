"use client";

export default function HalloweenFloaties(_props: {} = {}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: "100px",
        pointerEvents: "none",
        zIndex: 2147483646,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", bottom: "20px", left: "10px", fontSize: "40px", opacity: 0.9 }}>🎃</div>
      <div style={{ position: "absolute", bottom: "10px", right: "20px", fontSize: "36px", opacity: 0.9 }}>🎃</div>
    </div>
  );
}