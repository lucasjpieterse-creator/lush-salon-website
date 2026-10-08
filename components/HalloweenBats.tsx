"use client";

export default function HalloweenBats() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 2147483647,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "10%", left: "-10%", fontSize: "32px", animation: "batFly 12s linear infinite" }}>🦇</div>
        <div style={{ position: "absolute", top: "25%", left: "-15%", fontSize: "24px", animation: "batFly 16s linear infinite 2s" }}>🦇</div>
        <div style={{ position: "absolute", top: "5%", left: "-5%", fontSize: "18px", animation: "batFly 10s linear infinite 1s" }}>🦇</div>
      </div>
      <style>{`
        @keyframes batFly {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(120vw) translateY(-30vh); opacity: 0; }
        }
      `}</style>
    </>
  );
}