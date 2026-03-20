"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClubSwing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const golferRef = useRef<SVGGElement>(null);
  const teeBallRef = useRef<HTMLDivElement>(null); // THE ONE ball — starts on tee, flies toward viewer
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const golfer = golferRef.current;
    const teeBall = teeBallRef.current;
    const zoom = zoomRef.current;
    if (!section || !golfer || !teeBall || !zoom) return;

    // The ball sits at the tee position initially — we'll move it to fixed after impact
    gsap.set(golfer, { rotation: -45, transformOrigin: "110px 60px" });
    gsap.set(zoom, { scale: 1, y: 0, opacity: 1 });

    // Ball starts as an SVG circle overlay on the tee — we fade it out when flying starts
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 65%",
        end: "bottom 5%",
        scrub: 0.7,
      },
    });

    // 0 → 0.2: zoom in toward tee
    tl.to(zoom, { scale: 2.0, y: -50, duration: 0.2, ease: "power1.in" }, 0);

    // 0.15 → 0.48: swing
    tl.to(golfer, {
      rotation: 40,
      transformOrigin: "110px 60px",
      duration: 0.33,
      ease: "power3.in",
    }, 0.15);

    // 0.47: at impact — ball LAUNCHES from tee position toward viewer
    // The ball div is fixed-positioned at tee center, then scales up massively
    tl.fromTo(teeBall,
      { opacity: 1, scale: 1, y: 0 },
      { opacity: 1, scale: 3, y: "-8vh", duration: 0.06, ease: "power4.out" },
      0.47
    );
    tl.to(teeBall, {
      scale: 12,
      opacity: 0.9,
      y: "-40vh",
      duration: 0.28,
      ease: "power2.out",
    }, 0.53);
    tl.to(teeBall, {
      scale: 28,
      opacity: 0,
      y: "-68vh",
      duration: 0.18,
      ease: "power1.in",
    }, 0.81);

    // Zoom out + fade scene
    tl.to(zoom, {
      scale: 0.9,
      y: 30,
      opacity: 0,
      duration: 0.42,
      ease: "power2.inOut",
    }, 0.55);

    return () => ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === section) t.kill(); });
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 flex items-end justify-center pb-4 z-0 overflow-hidden">

      {/* ── THE BALL — one single object, starts at tee, flies toward viewer ── */}
      <div
        ref={teeBallRef}
        style={{
          position: "fixed",
          top: "calc(50% + 80px)", // roughly where the tee sits in the view
          left: "50%",
          width: 22,
          height: 22,
          marginLeft: -11,
          marginTop: -11,
          borderRadius: "50%",
          background: "radial-gradient(circle at 33% 33%, #ffffff 0%, #e8eef4 55%, #c8d8e8 100%)",
          boxShadow: "0 0 10px rgba(255,255,255,0.95), 0 0 30px rgba(255,255,255,0.5), inset 0 -2px 5px rgba(0,0,0,0.07)",
          pointerEvents: "none",
          zIndex: 50,
          transformOrigin: "center center",
        }}
      />

      {/* ── Golfer + Tee SVG ── */}
      <div ref={zoomRef} className="pointer-events-none select-none relative">
        <svg width="280" height="320" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground shadow */}
          <ellipse cx="140" cy="312" rx="70" ry="7" fill="rgba(0,0,0,0.18)" />

          {/* Tee post */}
          <rect x="135" y="280" width="8" height="22" rx="2.5" fill="rgba(255,210,60,0.95)" />
          <rect x="128" y="299" width="22" height="5" rx="2.5" fill="rgba(255,200,40,0.7)" />

          {/* Ball placeholder on tee — hidden since the real ball is a div overlay */}
          {/* We show this only before the animation fires — fades handled by GSAP on the div */}
          <circle cx="139" cy="274" r="11" fill="transparent" />

          {/* Swing trail */}
          <path d="M 110 50 Q 55 160 136 272" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" strokeDasharray="5 10" />

          {/* ── Golfer silhouette ── */}
          <g ref={golferRef}>
            {/* Club shaft */}
            <path d="M 105 63 L 138 268" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
            {/* Club grip */}
            <rect x="98" y="38" width="14" height="28" rx="7" fill="#111" />
            {/* Club head — driver */}
            <path d="M 128 274 C 120 260 122 252 132 250 C 140 248 156 250 162 258 C 168 266 166 278 158 282 C 148 287 130 284 128 274 Z"
              fill="#2a2a2a" stroke="rgba(180,190,200,0.7)" strokeWidth="1.5" />
            <line x1="131" y1="277" x2="157" y2="262" stroke="rgba(220,230,240,0.35)" strokeWidth="1" />

            {/* Head */}
            <circle cx="130" cy="52" r="19" fill="#111" />
            {/* Cap */}
            <rect x="112" y="30" width="40" height="10" rx="4" fill="#111" />
            <rect x="148" y="33" width="14" height="5" rx="2" fill="#0a0a0a" />

            {/* Neck */}
            <rect x="124" y="68" width="12" height="14" rx="4" fill="#111" />

            {/* Torso */}
            <path d="M 96 80 C 88 82 82 92 84 108 L 86 148 C 87 162 92 170 104 172 L 148 172 C 158 170 164 162 162 148 L 158 108 C 160 92 156 82 148 80 Z" fill="#111" />

            {/* Lead arm */}
            <path d="M 105 90 C 82 110 68 148 82 188 L 90 192 C 80 152 92 115 112 95 Z" fill="#111" />
            <ellipse cx="86" cy="195" rx="9" ry="7" fill="#111" />

            {/* Trail arm */}
            <path d="M 142 88 C 162 100 168 125 158 155 L 150 152 C 158 125 152 104 136 93 Z" fill="#111" />
            <ellipse cx="105" cy="72" rx="8" ry="6" fill="#111" />
            <ellipse cx="100" cy="65" rx="7" ry="5" fill="#111" />

            {/* Belt */}
            <rect x="100" y="168" width="56" height="12" rx="5" fill="#0d0d0d" />

            {/* Left leg */}
            <path d="M 104 178 C 100 200 96 230 94 260 L 86 280 L 98 282 L 106 262 C 108 240 112 212 114 186 Z" fill="#111" />
            <ellipse cx="90" cy="283" rx="16" ry="6" fill="#0a0a0a" />

            {/* Right leg */}
            <path d="M 148 178 C 152 200 158 228 162 256 L 168 278 L 156 282 L 150 262 C 146 236 142 208 138 186 Z" fill="#111" />
            <ellipse cx="163" cy="282" rx="18" ry="6" fill="#0a0a0a" />
          </g>
        </svg>
      </div>
    </div>
  );
}
