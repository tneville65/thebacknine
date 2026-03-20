"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ClubSwing({ onBallLaunch }: { onBallLaunch?: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const clubRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const arcBallRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const club = clubRef.current;
    const ball = ballRef.current;
    const zoom = zoomRef.current;
    if (!section || !club || !ball || !zoom) return;

    // Start: club up high (backswing)
    gsap.set(club, { rotation: -70, transformOrigin: "50px 20px" });
    gsap.set(ball, { opacity: 1 });
    gsap.set(zoom, { scale: 1, y: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
      },
    });

    // Zoom into tee as we approach
    tl.to(zoom, { scale: 1.8, y: -40, duration: 0.3, ease: "power1.in" }, 0);

    // Club swings through — arc from backswing to follow-through
    tl.to(club, {
      rotation: 50,
      transformOrigin: "50px 20px",
      duration: 0.35,
      ease: "power3.in",
    }, 0.15);

    // Ball launches at moment of impact
    tl.to(ball, { opacity: 0, y: -8, x: 8, duration: 0.1, ease: "power3.out" }, 0.45);

    // Zoom out / fade after launch
    tl.to(zoom, { scale: 1, y: 0, opacity: 0, duration: 0.4, ease: "power2.out" }, 0.5);

    return () => ScrollTrigger.getAll().forEach(t => { if (t.vars?.trigger === section) t.kill(); });
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 flex items-end justify-center pb-12 pointer-events-none z-10">
      <div ref={zoomRef} className="flex flex-col items-center">
        <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground line */}
          <line x1="0" y1="185" x2="160" y2="185" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Tee */}
          <rect x="76" y="170" width="8" height="15" rx="1" fill="rgba(255,255,255,0.7)" />
          <rect x="72" y="183" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />

          {/* Ball on tee */}
          <circle ref={ballRef} cx="80" cy="167" r="8" fill="white" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />

          {/* Golf club */}
          <g ref={clubRef}>
            {/* Shaft */}
            <line x1="50" y1="20" x2="82" y2="164" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" />
            {/* Club head */}
            <ellipse cx="85" cy="170" rx="14" ry="6" fill="rgba(200,200,210,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            {/* Grip */}
            <rect x="44" y="14" width="12" height="18" rx="6" fill="rgba(50,30,20,0.8)" />
          </g>

          {/* Swing arc guide (ghost) */}
          <path
            d="M 50 20 Q 20 100 82 164"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </svg>
      </div>
    </div>
  );
}
