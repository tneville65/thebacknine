"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClubSwing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clubGroupRef = useRef<SVGGElement>(null);
  const teeBallRef = useRef<SVGCircleElement>(null); // ball is INSIDE the SVG on the tee
  const flyBallRef = useRef<HTMLDivElement>(null);   // flying ball only appears after contact
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const clubGroup = clubGroupRef.current;
    const teeBall = teeBallRef.current;
    const flyBall = flyBallRef.current;
    const zoom = zoomRef.current;
    if (!section || !clubGroup || !teeBall || !flyBall || !zoom) return;

    // Club in backswing position
    gsap.set(clubGroup, { rotation: 55, transformOrigin: "200px 80px" });
    gsap.set(zoom, { scale: 1, y: 0, opacity: 1 });
    // Tee ball visible on tee, fly ball hidden
    gsap.set(teeBall, { opacity: 1 });
    gsap.set(flyBall, { opacity: 0, scale: 0.3 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 65%",
        end: "bottom 5%",
        scrub: 0.7,
      },
    });

    // 0 → 0.2: zoom in
    tl.to(zoom, { scale: 2.0, y: -55, duration: 0.2, ease: "power1.in" }, 0);

    // 0.15 → 0.48: swing
    tl.to(clubGroup, {
      rotation: -65,
      transformOrigin: "200px 80px",
      duration: 0.33,
      ease: "power3.in",
    }, 0.15);

    // 0.46: tee ball vanishes at contact
    tl.to(teeBall, { opacity: 0, duration: 0.03, ease: "none" }, 0.46);

    // 0.47: fly ball appears at exact tee position and launches toward viewer
    tl.to(flyBall, {
      opacity: 1,
      scale: 1,
      duration: 0.03,
      ease: "none",
    }, 0.47);
    tl.to(flyBall, {
      scale: 12,
      opacity: 0.9,
      y: "-45vh",
      duration: 0.3,
      ease: "power2.out",
    }, 0.50);
    tl.to(flyBall, {
      scale: 28,
      opacity: 0,
      y: "-72vh",
      duration: 0.2,
      ease: "power1.in",
    }, 0.80);

    // Zoom out + fade
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

      {/* ── Flying ball — position:absolute so it stays in section ── */}
      {/* Starts at tee position, flies up toward viewer on contact */}
      <div
        ref={flyBallRef}
        style={{
          position: "absolute",
          bottom: "22%",   // matches tee height in SVG
          left: "50%",
          width: 20,
          height: 20,
          marginLeft: -10,
          marginBottom: -10,
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 33%, #ffffff 0%, #e8eef4 60%, #c0d0e0 100%)",
          boxShadow: "0 0 12px rgba(255,255,255,0.95), 0 0 35px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.08)",
          pointerEvents: "none",
          zIndex: 50,
          transformOrigin: "center center",
          opacity: 0,
        }}
      />

      {/* ── Club + Tee SVG ── */}
      <div ref={zoomRef} className="pointer-events-none select-none" style={{ position: "relative", marginBottom: "-20px" }}>
        <svg
          width="300"
          height="280"
          viewBox="0 0 300 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shaftGrad" x1="240" y1="50" x2="155" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(195,200,210,0.95)" />
              <stop offset="50%" stopColor="rgba(165,172,185,0.85)" />
              <stop offset="100%" stopColor="rgba(130,140,155,0.7)" />
            </linearGradient>
            <linearGradient id="headGrad" x1="120" y1="218" x2="182" y2="258" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#42474f" />
              <stop offset="50%" stopColor="#2a2d34" />
              <stop offset="100%" stopColor="#1c1e24" />
            </linearGradient>
            <linearGradient id="headSheen" x1="120" y1="218" x2="182" y2="248" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(220,230,240,0.18)" />
              <stop offset="100%" stopColor="rgba(220,230,240,0)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="150" cy="274" rx="55" ry="5" fill="rgba(0,0,0,0.14)" />

          {/* Tee post */}
          <rect x="147" y="255" width="6" height="18" rx="1.5" fill="rgba(255,210,60,0.95)" />
          {/* Tee flange */}
          <rect x="141" y="271" width="18" height="4" rx="2" fill="rgba(255,195,30,0.65)" />

          {/* Subtle swing arc */}
          <path
            d="M 265 22 Q 275 140 150 246"
            fill="none"
            stroke="rgba(255,255,255,0.055)"
            strokeWidth="1.5"
            strokeDasharray="4 9"
          />

          {/* ── CLUB ── */}
          <g ref={clubGroupRef}>

            {/* Grip — wrapped leather look */}
            <rect x="230" y="16" width="13" height="52" rx="6.5" fill="#18100a" />
            {/* Grip texture lines */}
            {[26, 34, 42, 50, 58].map(y => (
              <line key={y} x1="230" y1={y} x2="243" y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            ))}
            {/* Grip top cap */}
            <ellipse cx="236.5" cy="18" rx="6.5" ry="3" fill="#111" />

            {/* Shaft — tapers, has slight perspective twist */}
            <path
              d="M 236 65 C 220 100 190 160 152 230"
              stroke="url(#shaftGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Shaft edge highlight */}
            <path
              d="M 237 65 C 221 100 191 160 153 229"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
            />

            {/* Hosel — connects shaft to head */}
            <path
              d="M 152 230 C 150 236 148 240 148 244"
              stroke="rgba(140,148,160,0.8)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* WEDGE head — wider sole, compact, open loft */}
            {/* Main body */}
            <path
              d="M 130 252
                 C 126 244 127 236 134 230
                 C 139 226 148 224 158 226
                 C 166 228 170 234 170 242
                 C 170 250 164 256 156 258
                 C 146 260 132 258 130 252 Z"
              fill="url(#headGrad)"
              stroke="rgba(130,145,165,0.5)"
              strokeWidth="1.2"
            />
            {/* Sheen */}
            <path
              d="M 130 252
                 C 126 244 127 236 134 230
                 C 139 226 148 224 158 226
                 C 166 228 170 234 170 242
                 C 170 250 164 256 156 258
                 C 146 260 132 258 130 252 Z"
              fill="url(#headSheen)"
            />
            {/* Face — wedge face is more upright / open */}
            <path
              d="M 158 226 C 165 228 170 234 170 242 L 168 244 C 168 236 163 230 157 228 Z"
              fill="rgba(215,225,238,0.25)"
            />
            {/* Face grooves */}
            <line x1="158" y1="232" x2="169" y2="231" stroke="rgba(200,210,225,0.18)" strokeWidth="0.7" />
            <line x1="158" y1="236" x2="169" y2="235" stroke="rgba(200,210,225,0.18)" strokeWidth="0.7" />
            <line x1="158" y1="240" x2="169" y2="239" stroke="rgba(200,210,225,0.18)" strokeWidth="0.7" />
            <line x1="158" y1="244" x2="169" y2="243" stroke="rgba(200,210,225,0.18)" strokeWidth="0.7" />
            <line x1="158" y1="248" x2="169" y2="247" stroke="rgba(200,210,225,0.18)" strokeWidth="0.7" />
            {/* Leading edge — sharp bottom edge of face */}
            <path
              d="M 130 252 L 170 242"
              fill="none"
              stroke="rgba(200,215,230,0.5)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Bounce angle — sole curves back */}
            <path
              d="M 130 252 Q 150 262 170 254"
              fill="none"
              stroke="rgba(100,110,130,0.4)"
              strokeWidth="0.75"
            />
            {/* Cavity back detail */}
            <path
              d="M 133 246 Q 150 252 164 246"
              fill="none"
              stroke="rgba(80,90,110,0.35)"
              strokeWidth="0.75"
            />
          </g>

          {/* Ball on tee — inside SVG so it's clipped with section */}
          <circle
            ref={teeBallRef}
            cx="150"
            cy="243"
            r="11"
            fill="white"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.85))" }}
          />
          {/* Ball seam */}
          <path d="M 143 240 Q 150 246 157 240" stroke="rgba(170,170,170,0.4)" strokeWidth="0.75" fill="none" />
        </svg>
      </div>
    </div>
  );
}
