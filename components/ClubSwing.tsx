"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Face-on view: club swings from viewer's right (backswing) across to left (follow-through)
// Ball sits on tee at center, gets hit toward the screen

export default function ClubSwing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clubGroupRef = useRef<SVGGElement>(null);
  const teeBallRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const clubGroup = clubGroupRef.current;
    const teeBall = teeBallRef.current;
    const zoom = zoomRef.current;
    if (!section || !clubGroup || !teeBall || !zoom) return;

    // Face-on swing: club starts high right (backswing), sweeps left through impact
    // Pivot point is roughly where the hands would be at address
    gsap.set(clubGroup, { rotation: 55, transformOrigin: "200px 80px" }); // backswing — club up right
    gsap.set(zoom, { scale: 1, y: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 65%",
        end: "bottom 5%",
        scrub: 0.7,
      },
    });

    // 0 → 0.2: zoom in toward tee
    tl.to(zoom, { scale: 2.1, y: -60, duration: 0.2, ease: "power1.in" }, 0);

    // 0.15 → 0.48: club sweeps left through impact
    tl.to(clubGroup, {
      rotation: -65, // follow-through — club past ball to left
      transformOrigin: "200px 80px",
      duration: 0.33,
      ease: "power3.in",
    }, 0.15);

    // 0.47: impact — ball launches toward viewer
    tl.fromTo(teeBall,
      { opacity: 1, scale: 1, y: 0 },
      { opacity: 1, scale: 3.5, y: "-10vh", duration: 0.06, ease: "power4.out" },
      0.47
    );
    tl.to(teeBall, {
      scale: 14,
      opacity: 0.9,
      y: "-42vh",
      duration: 0.28,
      ease: "power2.out",
    }, 0.53);
    tl.to(teeBall, {
      scale: 30,
      opacity: 0,
      y: "-70vh",
      duration: 0.19,
      ease: "power1.in",
    }, 0.81);

    // Zoom out + fade scene
    tl.to(zoom, {
      scale: 0.9,
      y: 30,
      opacity: 0,
      duration: 0.42,
      ease: "power2.inOut",
    }, 0.56);

    return () => ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === section) t.kill(); });
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 flex items-end justify-center pb-0 z-0 overflow-hidden">

      {/* ── Ball — one object, starts at tee, flies toward viewer ── */}
      <div
        ref={teeBallRef}
        style={{
          position: "fixed",
          top: "calc(50% + 90px)",
          left: "50%",
          width: 20,
          height: 20,
          marginLeft: -10,
          marginTop: -10,
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 33%, #ffffff 0%, #e8eef4 60%, #c0d0e0 100%)",
          boxShadow: "0 0 10px rgba(255,255,255,0.95), 0 0 30px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.08)",
          pointerEvents: "none",
          zIndex: 50,
          transformOrigin: "center center",
        }}
      />

      {/* ── Club SVG — face-on view ── */}
      <div ref={zoomRef} className="pointer-events-none select-none" style={{ position: "relative", marginBottom: "-30px" }}>
        <svg
          width="340"
          height="300"
          viewBox="0 0 340 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground */}
          <ellipse cx="170" cy="292" rx="80" ry="6" fill="rgba(0,0,0,0.12)" />

          {/* Tee */}
          <rect x="166" y="268" width="8" height="22" rx="2" fill="rgba(255,210,60,0.95)" />
          <rect x="158" y="287" width="24" height="5" rx="2.5" fill="rgba(255,195,30,0.7)" />

          {/* Swing arc — subtle ghost path */}
          <path
            d="M 290 30 Q 300 160 170 262"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.5"
            strokeDasharray="5 10"
          />

          {/* ── CLUB — face-on perspective ── */}
          <g ref={clubGroupRef}>
            {/*
              Face-on: golfer is standing behind the screen, club swings across.
              We see the club from the front — shaft coming down from upper right,
              club head at lower left at address/impact point (near tee).
            */}

            {/* Grip wrap texture */}
            <rect x="265" y="22" width="16" height="58" rx="8" fill="#1a1008" />
            <line x1="265" y1="35" x2="281" y2="35" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="265" y1="45" x2="281" y2="45" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="265" y1="55" x2="281" y2="55" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="265" y1="65" x2="281" y2="65" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Shaft — tapers from grip to head */}
            <line
              x1="273" y1="76"
              x2="172" y2="258"
              stroke="url(#shaftGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Driver club head — face-on: we see the sole/back of the head */}
            {/* Main head body */}
            <path
              d="M 140 256
                 C 128 246 126 236 134 228
                 C 140 222 158 220 174 224
                 C 190 228 200 238 198 250
                 C 196 262 182 270 166 270
                 C 150 270 142 264 140 256 Z"
              fill="url(#headGrad)"
              stroke="rgba(160,180,200,0.6)"
              strokeWidth="1.5"
            />
            {/* Crown highlight */}
            <path
              d="M 140 242 C 148 230 168 226 182 232"
              fill="none"
              stroke="rgba(220,230,240,0.35)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Face edge (front face of driver) */}
            <path
              d="M 172 224 C 188 228 198 238 198 250 L 196 252 C 196 240 186 230 172 226 Z"
              fill="rgba(200,210,225,0.25)"
            />
            {/* Hosel */}
            <path
              d="M 172 224 C 172 220 173 216 174 212 L 172 210 C 170 214 169 218 170 224 Z"
              fill="#333"
            />

            {/* Shaft gradient def */}
            <defs>
              <linearGradient id="shaftGrad" x1="273" y1="76" x2="172" y2="258" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(180,185,195,0.9)" />
                <stop offset="100%" stopColor="rgba(140,148,160,0.75)" />
              </linearGradient>
              <linearGradient id="headGrad" x1="130" y1="225" x2="200" y2="270" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3a3f4a" />
                <stop offset="60%" stopColor="#252830" />
                <stop offset="100%" stopColor="#1a1c22" />
              </linearGradient>
            </defs>
          </g>
        </svg>
      </div>
    </div>
  );
}
