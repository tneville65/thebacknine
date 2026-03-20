"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClubSwing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const golferRef = useRef<SVGGElement>(null);       // full golfer silhouette group
  const teeBallRef = useRef<SVGCircleElement>(null); // ball sitting on tee — disappears at impact
  const flyBallRef = useRef<HTMLDivElement>(null);   // flying ball — grows toward viewer
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const golfer = golferRef.current;
    const teeBall = teeBallRef.current;
    const flyBall = flyBallRef.current;
    const zoom = zoomRef.current;
    if (!section || !golfer || !teeBall || !flyBall || !zoom) return;

    // Initial state
    gsap.set(golfer, { rotation: -45, transformOrigin: "110px 60px" }); // backswing
    gsap.set(teeBall, { opacity: 1 });
    gsap.set(flyBall, { opacity: 0, scale: 0.15 });
    gsap.set(zoom, { scale: 1, y: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 65%",
        end: "bottom 5%",
        scrub: 0.7,
      },
    });

    // 0 → 0.2: zoom camera in toward tee
    tl.to(zoom, { scale: 2.0, y: -50, duration: 0.2, ease: "power1.in" }, 0);

    // 0.15 → 0.48: golfer swings — backswing to follow-through
    tl.to(golfer, {
      rotation: 40,
      transformOrigin: "110px 60px",
      duration: 0.33,
      ease: "power3.in",
    }, 0.15);

    // 0.46: impact — tee ball vanishes
    tl.to(teeBall, { opacity: 0, scale: 1.3, duration: 0.04, ease: "power3.out" }, 0.46);

    // 0.48: fly ball appears and grows TOWARD viewer (z-axis)
    tl.fromTo(flyBall,
      { opacity: 0, scale: 0.15, y: "0px" },
      { opacity: 1, scale: 1.0, y: "-5vh", duration: 0.05, ease: "none" },
      0.48
    );
    tl.to(flyBall, {
      scale: 8,
      opacity: 0.85,
      y: "-35vh",
      duration: 0.3,
      ease: "power2.out",
    }, 0.53);
    tl.to(flyBall, {
      scale: 22,
      opacity: 0,
      y: "-65vh",
      duration: 0.2,
      ease: "power1.in",
    }, 0.83);

    // zoom back out + fade scene as ball flies
    tl.to(zoom, {
      scale: 0.9,
      y: 30,
      opacity: 0,
      duration: 0.45,
      ease: "power2.inOut",
    }, 0.55);

    return () => ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === section) t.kill(); });
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 flex items-end justify-center pb-4 z-0 overflow-hidden">

      {/* Flying ball — grows toward viewer */}
      <div
        ref={flyBallRef}
        style={{
          position: "fixed",
          top: "62%",
          left: "50%",
          width: 24,
          height: 24,
          marginLeft: -12,
          marginTop: -12,
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 33%, #ffffff 0%, #dde8f0 55%, #b8c8d8 100%)",
          boxShadow: "0 0 12px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.08)",
          pointerEvents: "none",
          zIndex: 50,
          opacity: 0,
          transformOrigin: "center center",
        }}
      />

      {/* Golfer SVG */}
      <div ref={zoomRef} className="pointer-events-none select-none" style={{ position: "relative" }}>
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Ground shadow ── */}
          <ellipse cx="140" cy="312" rx="70" ry="7" fill="rgba(0,0,0,0.18)" />

          {/* ── Tee ── */}
          {/* Post */}
          <rect x="135" y="280" width="8" height="22" rx="2.5" fill="rgba(255,210,60,0.95)" />
          {/* Base flange */}
          <rect x="128" y="299" width="22" height="5" rx="2.5" fill="rgba(255,200,40,0.7)" />

          {/* ── Ball on tee ── */}
          <circle ref={teeBallRef} cx="139" cy="274" r="12" fill="white" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.95))" }} />
          {/* Dimple lines */}
          <path d="M 131 271 Q 139 277 147 271" stroke="rgba(180,180,180,0.45)" strokeWidth="1" fill="none" />
          <path d="M 133 278 Q 139 282 145 278" stroke="rgba(180,180,180,0.3)" strokeWidth="0.75" fill="none" />

          {/* ── Swing trail (faint arc behind golfer) ── */}
          <path
            d="M 110 50 Q 55 160 136 272"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="2"
            strokeDasharray="5 10"
          />

          {/* ── Golfer silhouette ── */}
          {/* All black fill, layered behind ball/tee via SVG ordering */}
          <g ref={golferRef}>
            {/* === CLUB SHAFT + HEAD === */}
            {/* Grip end */}
            <rect x="98" y="38" width="14" height="28" rx="7" fill="#111" />
            {/* Shaft — tapers from grip to head */}
            <path d="M 105 63 L 138 268" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            {/* Club head — modern driver shape */}
            <path
              d="M 128 274 
                 C 120 260 122 252 132 250 
                 C 140 248 156 250 162 258 
                 C 168 266 166 278 158 282 
                 C 148 287 130 284 128 274 Z"
              fill="#2a2a2a"
              stroke="rgba(180,190,200,0.7)"
              strokeWidth="1.5"
            />
            {/* Club face highlight */}
            <line x1="131" y1="277" x2="157" y2="262" stroke="rgba(220,230,240,0.4)" strokeWidth="1" />
            {/* Hosel */}
            <path d="M 136 266 L 138 268" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />

            {/* === BODY — silhouette === */}
            {/* Head */}
            <circle cx="130" cy="52" r="19" fill="#111" />
            {/* Cap brim */}
            <ellipse cx="132" cy="36" rx="20" ry="6" fill="#0a0a0a" />
            <rect x="112" y="30" width="40" height="10" rx="4" fill="#111" />
            <rect x="148" y="33" width="14" height="5" rx="2" fill="#0a0a0a" />

            {/* Neck */}
            <rect x="124" y="68" width="12" height="14" rx="4" fill="#111" />

            {/* Torso */}
            <path
              d="M 96 80 
                 C 88 82 82 92 84 108 
                 L 86 148 
                 C 87 162 92 170 104 172 
                 L 148 172 
                 C 158 170 164 162 162 148 
                 L 158 108 
                 C 160 92 156 82 148 80 
                 Z"
              fill="#111"
            />

            {/* Left arm (lead arm — extended toward ball) */}
            <path
              d="M 105 90 C 82 110 68 148 82 188 L 90 192 C 80 152 92 115 112 95 Z"
              fill="#111"
            />
            {/* Left hand */}
            <ellipse cx="86" cy="195" rx="9" ry="7" fill="#111" />

            {/* Right arm (trail arm — bent) */}
            <path
              d="M 142 88 C 162 100 168 125 158 155 L 150 152 C 158 125 152 104 136 93 Z"
              fill="#111"
            />
            {/* Right hand on grip */}
            <ellipse cx="105" cy="72" rx="8" ry="6" fill="#111" />
            <ellipse cx="100" cy="65" rx="7" ry="5" fill="#111" />

            {/* Hip/belt area */}
            <rect x="100" y="168" width="56" height="12" rx="5" fill="#0d0d0d" />

            {/* Left leg */}
            <path
              d="M 104 178 
                 C 100 200 96 230 94 260 
                 L 86 280 
                 L 98 282 
                 L 106 262 
                 C 108 240 112 212 114 186 Z"
              fill="#111"
            />
            {/* Left foot */}
            <ellipse cx="90" cy="283" rx="16" ry="6" fill="#0a0a0a" />

            {/* Right leg */}
            <path
              d="M 148 178 
                 C 152 200 158 228 162 256 
                 L 168 278 
                 L 156 282 
                 L 150 262 
                 C 146 236 142 208 138 186 Z"
              fill="#111"
            />
            {/* Right foot */}
            <ellipse cx="163" cy="282" rx="18" ry="6" fill="#0a0a0a" />
          </g>
        </svg>
      </div>
    </div>
  );
}
