"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
const ClubSwing = dynamic(() => import("@/components/ClubSwing"), { ssr: false });
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ── CURSOR ────────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.05, ease: "none" });
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.45, ease: "power2.out" });
    };
    const enter = () => ring.current?.classList.add("hovering");
    const leave = () => ring.current?.classList.remove("hovering");
    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, input").forEach(el => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot hidden md:block" />
      <div ref={ring} className="cursor-ring hidden md:block" />
    </>
  );
}

// ── CLOUDS ────────────────────────────────────────────────────────────────────
function Cloud({ style, size = 1 }: { style?: React.CSSProperties; size?: number }) {
  const w = 120 * size;
  const h = 48 * size;
  return (
    <div className="absolute pointer-events-none select-none" style={style}>
      <div style={{ position: "relative", width: w, height: h }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: w, height: h * 0.6, borderRadius: 999, background: "rgba(255,255,255,0.92)" }} />
        <div style={{ position: "absolute", bottom: h * 0.3, left: w * 0.15, width: w * 0.55, height: h * 0.75, borderRadius: 999, background: "rgba(255,255,255,0.95)" }} />
        <div style={{ position: "absolute", bottom: h * 0.35, left: w * 0.45, width: w * 0.38, height: h * 0.6, borderRadius: 999, background: "rgba(255,255,255,0.88)" }} />
        <div style={{ position: "absolute", bottom: h * 0.2, left: w * 0.65, width: w * 0.3, height: h * 0.5, borderRadius: 999, background: "rgba(255,255,255,0.85)" }} />
      </div>
    </div>
  );
}

// ── TREES (silhouette) ────────────────────────────────────────────────────────
function Trees({ className = "", opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div className={`absolute bottom-0 pointer-events-none ${className}`} style={{ opacity }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-28">
        <path d="M0,120 L0,80 Q60,20 80,60 Q100,20 120,50 Q150,10 170,50 Q200,0 230,40 Q260,5 280,45 Q310,10 340,50 Q380,0 410,45 Q440,15 470,50 Q500,5 530,55 Q560,20 590,50 Q620,0 660,45 Q700,15 730,55 Q760,5 800,50 Q840,0 880,45 Q920,10 950,55 Q990,5 1020,50 Q1060,0 1100,45 Q1140,10 1170,55 Q1200,5 1240,50 Q1280,10 1310,55 Q1340,5 1380,45 Q1410,15 1440,60 L1440,120 Z" fill="rgba(20,60,15,0.8)" />
        <path d="M0,120 L0,90 Q40,50 70,70 Q110,30 140,65 Q180,25 220,60 Q260,30 300,65 Q340,20 380,60 Q420,30 460,65 Q500,20 540,65 Q580,30 620,65 Q660,25 700,65 Q740,20 780,60 Q820,30 860,65 Q900,20 940,60 Q980,30 1020,65 Q1060,25 1100,60 Q1140,30 1180,65 Q1220,25 1260,65 Q1300,30 1340,65 Q1380,25 1420,65 L1440,120 Z" fill="rgba(30,75,20,0.6)" />
      </svg>
    </div>
  );
}

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function CountUp({ end, prefix = "", suffix = "", duration = 2.2 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const fps = 60;
    const total = duration * fps;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / total;
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * end);
      setVal(start);
      if (frame >= total) {
        setVal(end);
        setGlowing(true);
        clearInterval(timer);
      }
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={glowing ? "number-glow" : ""}>
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
}

// ── MAGNETIC BUTTON ───────────────────────────────────────────────────────────
function MagneticBtn({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.25);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ── FADE UP ───────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── SPLIT TEXT REVEAL ─────────────────────────────────────────────────────────
function SplitReveal({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

// ── CALCULATOR ────────────────────────────────────────────────────────────────
function Calculator() {
  const [seasons, setSeasons] = useState(5);

  // NFLPA pension: $836/month per credited season, payable at 55
  const nflMonthly55 = seasons * 836;
  const nflAnnual55 = nflMonthly55 * 12;
  // At 65: monthly nearly doubles (~$2,200/month per season based on NFL data)
  const nflMonthly65 = seasons * 2200;
  const nflAnnual65 = nflMonthly65 * 12;

  // KeyArx static numbers (based on $250K/yr example)
  const opt1 = 727819;
  const opt2 = 1318516;

  // How many credited seasons would equal KeyArx Option 2 (at age 65 rate)?
  const seasonsToMatchKeyArx65 = Math.round(opt2 / (2200 * 12));
  const seasonsToMatchKeyArx55 = Math.round(opt2 / (836 * 12));
  // How many to match Option 1?
  const seasonsToMatchOpt1_65 = Math.round(opt1 / (2200 * 12));
  const seasonsToMatchOpt1_55 = Math.round(opt1 / (836 * 12));

  const fmt = (n: number) => "$" + n.toLocaleString();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Static KeyArx numbers */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-6 text-center">Based on $250,000/year · 10-year program</p>

        <div className="space-y-4 mb-6">
          <div className="border border-gray-100 rounded-xl p-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 text-sm">Option 1 — Overfunded Life Insurance</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Tax-Free</span>
            </div>
            <div className="font-serif text-4xl font-bold text-gray-900 mt-2 tabular-nums">{fmt(opt1)}</div>
            <div className="text-gray-400 text-xs mt-1">per year · age 51 to 100</div>
          </div>

          <div className="border-2 border-[#c0392b] rounded-xl p-6 relative overflow-hidden bg-red-50/30">
            <div className="absolute top-3 right-3 bg-[#c0392b] text-white text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">Premium Financing</div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">Option 2 — Premium Financing</span>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Tax-Free</span>
            </div>
            <div className="font-serif text-5xl font-bold text-[#c0392b] mt-2 tabular-nums">{fmt(opt2)}</div>
            <div className="text-gray-500 text-xs mt-1">per year · age 51 to 100</div>
          </div>
        </div>

        {/* Disclosure */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-[11px] leading-relaxed">
            <strong className="text-gray-500">Disclosure:</strong> The figures above — $727,819/year and $1,318,516/year — are based on a specific illustrated example using a $250,000 annual contribution over 10 years. All numbers are subject to change based on individual premium, underwriting, and carrier terms. Eligibility for this program is not guaranteed and is subject to underwriting approval. Results will vary.
          </p>
        </div>

        <MagneticBtn
          href="mailto:paul@keyarx.com?subject=The Back Nine — Let%27s Talk"
          className="block w-full text-center bg-[#c0392b] hover:bg-[#a93226] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all duration-200 hover:shadow-[0_8px_30px_rgba(192,57,43,0.4)]"
        >
          Talk to KeyArx
        </MagneticBtn>
      </div>

      {/* NFL Pension Comparison */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-2 text-center">The NFL Pension — Put in Perspective</p>
        <p className="text-gray-500 text-sm text-center leading-relaxed mb-8 max-w-lg mx-auto">
          The league already knows athletes need a private pension. The NFLPA Retirement Plan (est. 1968) pays <strong className="text-gray-700">$836/month per Credited Season</strong> starting at age 55 — or nearly <strong className="text-gray-700">$2,200/month per season</strong> if you wait until 65.
        </p>

        {/* Credited Seasons Slider */}
        <div className="mb-2">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-gray-600 text-xs uppercase tracking-widest font-medium">Your Credited Seasons</p>
            <span className="font-serif text-4xl font-bold text-gray-900">{seasons}</span>
          </div>
          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={seasons}
            onChange={e => setSeasons(Number(e.target.value))}
            className="w-full mb-8"
          />
        </div>

        {/* NFL pension results */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">NFL Pension at 55</p>
            <p className="font-serif text-2xl font-bold text-gray-700">{fmt(nflAnnual55)}</p>
            <p className="text-gray-400 text-xs mt-1">per year</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">NFL Pension at 65</p>
            <p className="font-serif text-2xl font-bold text-gray-700">{fmt(nflAnnual65)}</p>
            <p className="text-gray-400 text-xs mt-1">per year</p>
          </div>
        </div>

        {/* The comparison punchline */}
        <div className="border-2 border-[#c0392b]/30 rounded-xl p-6 bg-red-50/20 text-center mb-4">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">To match the KeyArx program at age 65</p>
          <p className="font-serif text-5xl font-bold text-[#c0392b] mb-2">{seasonsToMatchKeyArx65}</p>
          <p className="text-gray-500 text-sm">Credited NFL seasons needed to equal <strong>{fmt(opt2)}/year</strong> from the pension alone</p>

        </div>

        <div className="bg-[#c0392b]/5 rounded-xl p-5 text-center">
          <p className="text-gray-600 text-sm leading-relaxed">
            The NFL pension is <strong>a start</strong> — not a plan. A KeyArx structure on a $250K/year contribution delivers <strong className="text-[#c0392b]">{fmt(opt2)}/year tax-free</strong> — more than most players will ever see from the league pension, regardless of how long they played.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const ballRef = useRef<HTMLDivElement>(null);
  const skySection = useRef<HTMLDivElement>(null);

  // Ball arc on scroll
  useEffect(() => {
    const ball = ballRef.current;
    const sky = skySection.current;
    if (!ball || !sky) return;

    gsap.set(ball, { x: "10vw", y: "80vh", opacity: 0, scale: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sky,
        start: "top 60%",
        end: "center 30%",
        scrub: 1.2,
      },
    });

    tl.to(ball, { opacity: 1, duration: 0.05 }, 0)
      .to(ball, {
        x: "88vw",
        y: "25vh",
        ease: "power1.inOut",
        duration: 0.6,
      }, 0)
      .to(ball, {
        x: "75vw",
        y: "75vh",
        ease: "power1.in",
        duration: 0.35,
      }, 0.6)
      .to(ball, { opacity: 0, duration: 0.05 }, 0.95);

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  // Parallax refs
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const treesY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const skyY = useTransform(heroScroll, [0, 1], ["0%", "15%"]);
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  // Sky cloud parallax
  const { scrollYProgress: skyProgress } = useScroll({ target: skySection, offset: ["start end", "end start"] });
  const c1x = useTransform(skyProgress, [0, 1], ["-8vw", "8vw"]);
  const c2x = useTransform(skyProgress, [0, 1], ["6vw", "-6vw"]);
  const c3x = useTransform(skyProgress, [0, 1], ["-4vw", "5vw"]);

  return (
    <div className="overflow-x-hidden">
      <Cursor />

      {/* ── ACT 1: THE FAIRWAY ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative hero-sky overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* NOTE: SWAP golf-aerial.jpg with a real course photo for production */}
        {/* bg-image layer: <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/golf-aerial.jpg')" }} /> */}

        {/* Parallax sky layer */}
        <motion.div style={{ y: skyY }} className="absolute inset-0">
          {/* Sun */}
          <div className="absolute top-[12%] right-[18%] w-20 h-20 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,248,200,0.9) 0%, rgba(255,220,100,0.4) 50%, transparent 70%)" }} />
          <div className="absolute top-[10%] right-[17%] w-10 h-10 rounded-full" style={{ background: "rgba(255,255,240,0.85)", boxShadow: "0 0 40px 20px rgba(255,240,150,0.3)" }} />

          {/* Static clouds */}
          <Cloud style={{ top: "6%", left: "4%" }} size={1.3} />
          <Cloud style={{ top: "4%", left: "52%" }} size={0.8} />
          <Cloud style={{ top: "10%", right: "5%" }} size={1.0} />
          <Cloud style={{ top: "18%", left: "30%" }} size={0.65} />
          <Cloud style={{ top: "22%", right: "25%" }} size={0.5} />
        </motion.div>

        {/* Parallax trees */}
        <motion.div style={{ y: treesY }} className="absolute bottom-0 left-0 right-0 z-10">
          <Trees opacity={1} />
        </motion.div>

        {/* Fairway ground */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4" style={{ background: "linear-gradient(0deg, #3d6b20, #5a9040)", borderRadius: "50% 50% 0 0 / 10px 10px 0 0" }} />

        {/* Flag 1 — flag at TOP of pole */}
        <div className="absolute z-20 flex flex-col items-center" style={{ bottom: "18%", left: "62%" }}>
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ originY: 1 }} className="flex flex-col items-start">
            <div className="w-7 h-5 bg-[#c0392b] mb-0" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
            <div className="w-px h-20 bg-gray-700 ml-0" />
          </motion.div>
        </div>

        {/* Flag 2 (distant) — flag at TOP of pole */}
        <div className="absolute z-20 opacity-40 flex flex-col items-center" style={{ bottom: "22%", left: "80%" }}>
          <div className="flex flex-col items-start">
            <div className="w-5 h-3.5 bg-white mb-0" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
            <div className="w-px h-12 bg-gray-700" />
          </div>
        </div>

        {/* Hero text */}
        <motion.div style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-8 pb-32 pt-24">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-green-900/55 text-xs uppercase tracking-[0.5em] mb-8 font-medium">
            The KeyArx Group
          </motion.p>

          <div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-green-950 leading-none sky-text block"
            >
              The front nine
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-12">
            <motion.h1
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-green-900/45 leading-none italic sky-text block"
            >
              is your career.
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
            <MagneticBtn
              href="#tee"
              className="bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-12 py-4 uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgba(192,57,43,0.5)]"
            >
              See the Back Nine →
            </MagneticBtn>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-green-900/30 text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-green-900/40 to-transparent" />
        </motion.div>
      </section>

      {/* ── ACT 2: ADDRESS ──────────────────────────────────────────────────── */}
      <section id="tee" className="fairway-section relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Fairway texture lines */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 60px)", backgroundSize: "60px 100%" }} />

        {/* Club swing animation */}
        <ClubSwing />

        {/* Trees silhouette */}
        <Trees className="z-10" opacity={0.5} />

        {/* Content */}
        <div className="relative z-20 text-center px-8 max-w-3xl">
          <FadeUp delay={0}>
            <p className="text-white/40 text-xs uppercase tracking-[0.5em] mb-8">The setup</p>
          </FadeUp>
          <SplitReveal
            text="Most athletes walk off the course not knowing what they left behind."
            delay={0.1}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-8 sky-text"
          />
          <FadeUp delay={0.3}>
            <p className="text-white/70 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-14">
              Not because of bad decisions.<br />
              <span className="text-white/50">Because nobody showed them a better structure.</span>
            </p>
          </FadeUp>
          <FadeUp delay={0.45}>
            <MagneticBtn
              href="#sky"
              className="inline-block border-2 border-white/70 hover:border-white hover:bg-white hover:text-green-800 text-white font-bold px-12 py-4 uppercase tracking-widest text-sm transition-all duration-300"
            >
              Step up to the tee
            </MagneticBtn>
          </FadeUp>
        </div>
      </section>

      {/* ── ACT 3: THE SKY ──────────────────────────────────────────────────── */}
      <section id="sky" ref={skySection} className="open-sky relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Parallax clouds */}
        <motion.div style={{ x: c1x, position: "absolute", top: "8%", left: "4%" }}>
          <Cloud size={1.5} />
        </motion.div>
        <motion.div style={{ x: c2x, position: "absolute", top: "14%", right: "8%" }}>
          <Cloud size={1.1} />
        </motion.div>
        <motion.div style={{ x: c3x, position: "absolute", top: "5%", left: "42%" }}>
          <Cloud size={0.8} />
        </motion.div>
        <Cloud style={{ position: "absolute", top: "28%", left: "18%" }} size={0.6} />
        <Cloud style={{ position: "absolute", top: "22%", right: "30%" }} size={0.9} />
        <Cloud style={{ position: "absolute", top: "35%", right: "12%" }} size={0.55} />

        {/* Animated ball */}
        <div
          ref={ballRef}
          className="fixed z-50 pointer-events-none"
          style={{ top: 0, left: 0, width: 18, height: 18 }}
        >
          <div className="w-full h-full rounded-full bg-white" style={{ boxShadow: "0 0 15px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.15)" }} />
        </div>

        {/* Ball trail path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path
            d="M 12% 82% Q 52% -5% 90% 72%"
            fill="none"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
        </svg>

        {/* THE question */}
        <div className="relative z-10 text-center px-8 max-w-5xl">
          <SplitReveal
            text="Over the course of your life,"
            delay={0}
            className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-snug sky-text"
          />
          <SplitReveal
            text="would an extra"
            delay={0.2}
            className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-snug sky-text"
          />
          <FadeUp delay={0.5} className="my-4">
            <div
              className="font-serif font-bold text-center"
              style={{
                fontSize: "clamp(4.5rem, 13vw, 10rem)",
                lineHeight: 1.0,
                color: "#cc2200",
                textShadow: "2px 2px 0px rgba(120,10,0,0.4), 0 0 40px rgba(200,30,0,0.3)",
                WebkitTextStroke: "2px rgba(100,0,0,0.15)",
                letterSpacing: "-0.02em",
              }}
            >
              $30 million
            </div>
          </FadeUp>
          <SplitReveal
            text="mean something to you?"
            delay={0.8}
            className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-snug mb-14 sky-text"
          />

          <FadeUp delay={1.1}>
            <MagneticBtn
              href="#calculator"
              className="inline-block bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-14 py-5 uppercase tracking-widest text-base transition-all duration-300 hover:shadow-[0_8px_50px_rgba(192,57,43,0.6)]"
            >
              Run My Numbers →
            </MagneticBtn>
          </FadeUp>
        </div>
      </section>

      {/* ── ACT 4: BACK NINE + CALCULATOR ──────────────────────────────────── */}
      <section id="calculator" className="relative py-40 overflow-hidden" style={{ background: "linear-gradient(180deg, #a8d8f0 0%, #d4ecc0 8%, #f5f0e8 18%)" }}>
        {/* Landing flag */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-20">
          <div className="w-px h-16 bg-gray-600" />
          <div className="w-6 h-4 bg-[#c0392b] mb-1" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-medium mt-1">Hole 10</p>
        </div>

        <div className="max-w-3xl mx-auto px-8 pt-12">
          <FadeUp className="text-center mb-16">
            <p className="text-gray-400 text-xs uppercase tracking-[0.5em] mb-6">The back nine</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Same investment.<br />
              <span className="text-[#c0392b]">Different structure.</span><br />
              <span className="text-[#c0392b] font-serif font-bold">
                <CountUp end={30} prefix="$" suffix="M+ difference." duration={2.5} />
              </span>
            </h2>
            <p className="text-gray-500 mt-6 text-lg">Use the slider to see how your NFL pension compares.</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <Calculator />
          </FadeUp>
        </div>
      </section>

      {/* ── ACT 5: THE CLUBHOUSE ────────────────────────────────────────────── */}
      <section className="py-40 relative overflow-hidden" style={{ background: "#f5f0e8" }}>
        {/* Subtle fairway lines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(0,0,0,1) 80px, rgba(0,0,0,1) 81px)" }} />

        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          {/* Hole marker */}
          <FadeUp>
            <div className="inline-flex flex-col items-center mb-12 opacity-25">
              <div className="w-px h-16 bg-gray-700" />
              <div className="w-7 h-5 bg-[#c0392b]" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mt-2">The 19th Hole</p>
            </div>
          </FadeUp>

          <SplitReveal
            text="Ready to talk about the back nine?"
            delay={0}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8"
          />

          <FadeUp delay={0.3}>
            <p className="text-gray-500 text-xl leading-relaxed max-w-xl mx-auto mb-14">
              No pitch. No pressure. A straight conversation about what your money could actually be doing — built for your career window.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <MagneticBtn
              href="mailto:paul@keyarx.com?subject=The Back Nine — Let%27s Talk"
              className="inline-block bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-16 py-5 uppercase tracking-widest text-sm transition-all duration-300 hover:shadow-[0_8px_50px_rgba(192,57,43,0.5)]"
            >
              Start the Conversation
            </MagneticBtn>
          </FadeUp>

          <FadeUp delay={0.6} className="mt-20 pt-12 border-t border-gray-200">
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="font-semibold text-gray-600">The KeyArx Group</span> · Paul Cella, CLU, ChFC<br />
              <a href="mailto:paul@keyarx.com" className="hover-line text-gray-400 hover:text-gray-600 transition-colors">paul@keyarx.com</a>
              {" · "}
              <a href="tel:7329839830" className="hover-line text-gray-400 hover:text-gray-600 transition-colors">(732) 983-9830</a>
            </p>
            <p className="text-gray-300 text-xs mt-4 max-w-lg mx-auto leading-relaxed">
              Securities offered through League Capital Markets, LLC, Member FINRA/SIPC. Investment advice offered through Research Financial Strategies and Alliance Global Partners, registered investment advisors.
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
