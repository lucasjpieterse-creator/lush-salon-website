"use client";
import { useEffect, useState } from "react";

export default function SeasonalDecor() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show in October
    const isOct = new Date().getMonth() === 9;
    setShow(isOct);
    // Prevent double by cleaning old pumpkins
    const old = document.querySelectorAll(".pumpkin-decor");
    if(old.length > 2) {
      old.forEach((el, i) => { if(i>1) el.remove() });
    }
  }, []);

  if(!show) return null;

  return (
    <>
      <div className="pumpkin-decor pointer-events-none fixed top-20 left-4 text-4xl animate-bounce z-30">🎃</div>
      <div className="pumpkin-decor pointer-events-none fixed bottom-20 right-4 text-4xl animate-bounce delay-300 z-30">🎃</div>
      <style>{`
        .halloween-card { position: relative; }
      `}</style>
    </>
  );
}