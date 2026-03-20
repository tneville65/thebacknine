"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClubSwing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clubRef = useRef<SVGGElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const club = clubRef.current;
    const ball = ballRef.current;
    const zoom = zoomRef.current;
    if (!section || !club || !ball || !zoom) return;

    // Initial state
    gsap.set(club, { rotation: -65, transformOrigin: "50px 20px" });
    gsap.set(ball, {
      opacity: 0,
      scale: 0.2,
      x: "-50%",
      y: "0%",
      left: "50%",
      top: "50%",
      position: "fixed",
      zIndex: 100,
    });
    gsap.set(zoom, { scale: 1, y: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        end: "bottom 10%",
        scrub: 0.8,
      },
    });

    // Phase 1: Zoom into tee (0 → 0.2)
    tl.to(zoom, { scale: 2.2, y: -60, duration: 0.2, ease: "power2.in" }, 0);

    // Phase 2: Club swings through impact (0.15 → 0.45)
    tl.to(club, {
      rotation: 55,
      transformOrigin: "50px 20px",
      duration: 0.3,
      ease: "power3.in",
    }, 0.15);

    // Phase 3: Ball launches TOWARD viewer — grows from small to large (0.4 → 0.85)
    tl.to(ball, {
      opacity: 1,
      scale: 8,
      y: "-30vh",
      duration: 0.08,
      ease: "none",
    }, 0.4);

    tl.to(ball, {
      scale: 18,
      opacity: 0.6,
      y: "-50vh",
      duration: 0.35,
      ease: "power2.out",
    }, 0.48);

    // Phase 4: Ball fades into clouds (0.83 → 1.0)
    tl.to(ball, {
      scale: 30,
      opacity: 0,
      y: "-65vh",
      duration: 0.17,
      ease: "power1.in",
    }, 0.83);

    // Zoom back out and fade scene
    tl.to(zoom, {
      scale: 1,
      y: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
    }, 0.55);

    return () => ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === section) t.kill(); });
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 flex items-end justify-center pb-8 z-10">
      {/* Ball — fixed position, grows toward viewer */}
      <div
        ref={ballRef}
        style={{
          position: "fixed",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #ffffff, #e0e0e0)",
          boxShadow: "0 0 20px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.4)",
          pointerEvents: "none",
          zIndex: 100,
          opacity: 0,
          transformOrigin: "center center",
        }}
      />

      {/* Club + tee SVG */}
      <div ref={zoomRef} className="flex flex-col items-center pointer-events-none">
        <svg width="180" height="220" viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground shadow */}
          <ellipse cx="90" cy="210" rx="40" ry="5" fill="rgba(0,0,0,0.15)" />

          {/* Ground */}
          <line x1="20" y1="205" x2="160" y2="205" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* Tee post */}
          <rect x="87" y="190" width="6" height="15" rx="1.5" fill="rgba(255,220,100,0.9)" />
          {/* Tee base */}
          <rect x="82" y="203" width="16" height="4" rx="2" fill="rgba(255,220,100,0.6)" />

          {/* Ball on tee (disappears on impact) */}
          <circle cx="90" cy="186" r="9" fill="white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
          {/* Ball seam */}
          <path d="M 84 183 Q 90 188 96 183" stroke="rgba(180,180,180,0.5)" strokeWidth="1" fill="none" />

          {/* Golf club */}
          <g ref={clubRef}>
            {/* Grip */}
            <rect x="55" y="15" width="11" height="22" rx="5.5" fill="rgba(40,20,10,0.9)" />
            {/* Shaft */}
            <line x1="60" y1="33" x2="91" y2="184" stroke="rgba(200,200,210,0.9)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Club head (driver) */}
            <path d="M 80 188 Q 86 178 100 180 Q 110 182 108 192 Q 104 200 90 198 Q 78 196 80 188 Z"
              fill="rgba(160,170,190,0.95)" stroke="rgba(220,225,235,0.8)" strokeWidth="1" />
            {/* Club face line */}
            <line x1="83" y1="192" x2="105" y2="187" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
          </g>

          {/* Backswing trail arc */}
          <path
            d="M 60 33 Q 30 110 91 184"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
        </svg>
      </div>
    </div>
  );
}
