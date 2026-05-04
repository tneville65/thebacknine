"use client";
import React from "react";

// ─── easing + interpolation ───────────────────────────────────────────────────
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type EaseFn = (t: number) => number;

const Easing: Record<string, EaseFn> = {
  linear: t => t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInCubic: t => t * t * t,
  easeOutBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};

function interpolate(input: number[], output: number[], ease: EaseFn | EaseFn[] = Easing.linear) {
  return (t: number) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// ─── timeline context ─────────────────────────────────────────────────────────
const TimelineCtx = React.createContext<{ time: number }>({ time: 0 });
const useTime = () => React.useContext(TimelineCtx).time;

interface SpriteValue { localTime: number; progress: number; duration: number; }
const SpriteCtx = React.createContext<SpriteValue>({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteCtx);

function Sprite({ start = 0, end = Infinity, children }: {
  start?: number; end?: number;
  children: React.ReactNode | ((v: SpriteValue) => React.ReactNode);
}) {
  const { time } = React.useContext(TimelineCtx);
  if (time < start || time > end) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 ? clamp(localTime / duration, 0, 1) : 0;
  const value: SpriteValue = { localTime, progress, duration };
  return (
    <SpriteCtx.Provider value={value}>
      {typeof children === "function" ? (children as (v: SpriteValue) => React.ReactNode)(value) : children}
    </SpriteCtx.Provider>
  );
}

// ─── Stage ────────────────────────────────────────────────────────────────────
function Stage({ width, height, duration, children }: {
  width: number; height: number; duration: number; children: React.ReactNode;
}) {
  const [time, setTime] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const ref = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const s = Math.min(el.clientWidth / width, el.clientHeight / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [width, height]);

  React.useEffect(() => {
    const step = (ts: number) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setTime(t => {
        let n = t + dt;
        if (n >= duration) n = n % duration;
        return n;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [duration]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", overflow: "hidden" }}>
      <div style={{ width, height, position: "relative", transform: `scale(${scale})`, transformOrigin: "center", flexShrink: 0, overflow: "hidden" }}>
        <TimelineCtx.Provider value={{ time }}>{children}</TimelineCtx.Provider>
      </div>
    </div>
  );
}

// ─── iOS status bar ───────────────────────────────────────────────────────────
function IOSStatusBar() {
  const c = "#fff";
  return (
    <div style={{ display: "flex", gap: 154, alignItems: "center", justifyContent: "center", padding: "21px 24px 19px", boxSizing: "border-box", position: "relative", zIndex: 20, width: "100%" }}>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "-apple-system, system-ui", fontWeight: 590, fontSize: 17, color: c }}>9:41</span>
      </div>
      <div style={{ flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <svg width="19" height="12" viewBox="0 0 19 12">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill={c} />
          <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill={c} />
          <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill={c} />
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill={c} />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12">
          <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c} />
          <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c} />
          <circle cx="8.5" cy="10.5" r="1.5" fill={c} />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={c} strokeOpacity="0.35" fill="none" />
          <rect x="2" y="2" width="20" height="9" rx="2" fill={c} />
        </svg>
      </div>
    </div>
  );
}

// ─── scene ────────────────────────────────────────────────────────────────────
const DUR = 9;

const Wallpaper = () => (
  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 30% 20%, #2a2a2e 0%, #18181b 45%, #0a0a0c 100%)" }}>
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28, padding: "0 32px", opacity: 0.5 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} style={{ width: 62, height: 62, borderRadius: 14, background: `linear-gradient(140deg, hsl(${(i * 23) % 360} 8% 28%), hsl(${(i * 23) % 360} 8% 18%))`, justifySelf: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  </div>
);

const SheetBackdrop = () => {
  const t = useTime();
  const dim = interpolate([0, 0.6, 7.8, 9], [0, 0.55, 0.55, 0], Easing.easeOutCubic)(t);
  return <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dim})`, pointerEvents: "none" }} />;
};

const Card = () => {
  const t = useTime();
  const y = interpolate([1.0, 2.0, 2.4, 4.2, 5.4], [40, 0, 0, -6, 0], [Easing.easeOutBack, Easing.linear, Easing.easeInOutSine, Easing.easeInOutSine])(t);
  const opacity = interpolate([1.0, 1.8], [0, 1], Easing.easeOutCubic)(t);
  const sheen = interpolate([2.4, 4.2], [-30, 130], Easing.easeInOutSine)(t);
  return (
    <div style={{ margin: "4px 20px 0", transform: `translateY(${y}px)`, opacity }}>
      <div style={{ position: "relative", aspectRatio: "1.586 / 1", borderRadius: 18, overflow: "hidden", background: "linear-gradient(135deg, #1a1a1d 0%, #0a0a0c 60%, #000 100%)", boxShadow: "0 10px 30px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 0.5px rgba(255,255,255,0.04)", fontFamily: "-apple-system, system-ui", color: "#e7e7ea" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 80% 0%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(60% 40% at 10% 100%, rgba(255,255,255,0.035), transparent 60%)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sheen}%`, width: "30%", background: "linear-gradient(100deg, transparent 10%, rgba(255,255,255,0.09) 50%, transparent 90%)", transform: "skewX(-18deg)", filter: "blur(2px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "16%", left: "7%", right: "7%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 38, height: 28, borderRadius: 5, background: "linear-gradient(135deg, #7a7566 0%, #bcb499 40%, #8a8472 100%)", position: "relative", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)" }}>
            <div style={{ position: "absolute", inset: "18% 22%", background: "linear-gradient(0deg, transparent 45%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.35) 55%, transparent 55%), linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.35) 55%, transparent 55%)" }} />
          </div>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ opacity: 0.85 }}>
            <path d="M4 6 Q7 11 4 16" stroke="#d9d9de" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M9 4 Q14 11 9 18" stroke="#d9d9de" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M14 2 Q21 11 14 20" stroke="#d9d9de" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ position: "absolute", left: "7%", right: "7%", top: "54%", display: "flex", gap: "6%", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 500, letterSpacing: 1.6, color: "rgba(231,231,234,0.92)" }}>
          <span>••••</span><span>••••</span><span>••••</span><span>4242</span>
        </div>
        <div style={{ position: "absolute", left: "7%", right: "7%", bottom: "8%", display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(231,231,234,0.75)", fontWeight: 500 }}>
          <div>P. Cella</div><div>07 / 29</div>
        </div>
        <div style={{ position: "absolute", right: "7%", top: "8%", width: 20, height: 20, borderRadius: 10, border: "1px solid rgba(231,231,234,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: "rgba(231,231,234,0.6)" }} />
        </div>
      </div>
    </div>
  );
};

const HoldNearReader = () => {
  const { localTime } = useSprite();
  const opacity = interpolate([0, 0.25, 1.55, 1.8], [0, 1, 1, 0], Easing.easeInOutSine)(localTime);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 16, opacity, fontFamily: "-apple-system, system-ui" }}>
      <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
        {[0, 1, 2].map(i => {
          const phase = (localTime * 0.9 + i * 0.33) % 1;
          return <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid #fff", transform: `scale(${0.5 + phase * 0.9})`, opacity: (1 - phase) * 0.5 }} />;
        })}
        <div style={{ position: "absolute", inset: "35%", borderRadius: "50%", background: "rgba(255,255,255,0.95)" }} />
      </div>
      <div>
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: -0.2, marginBottom: 2 }}>Hold Near Reader</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Bring phone close to the terminal</div>
      </div>
    </div>
  );
};

const Processing = () => {
  const { localTime } = useSprite();
  const opacity = interpolate([0, 0.2, 1.0, 1.4], [0, 1, 1, 0], Easing.easeInOutSine)(localTime);
  const rot = localTime * 360 * 1.3;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 16, opacity, fontFamily: "-apple-system, system-ui" }}>
      <div style={{ width: 56, height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: `rotate(${rot}deg)` }}>
          <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
          <circle cx="22" cy="22" r="18" stroke="#fff" strokeWidth="3" fill="none" strokeDasharray="28 100" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: -0.2, marginBottom: 2 }}>Processing</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Authorizing with your bank</div>
      </div>
    </div>
  );
};

const Success = () => {
  const { localTime } = useSprite();
  const circleScale = interpolate([0, 0.4], [0.3, 1], Easing.easeOutBack)(localTime);
  const circleOpacity = interpolate([0, 0.2], [0, 1], Easing.easeOutCubic)(localTime);
  const checkLen = 22;
  const checkProg = interpolate([0.25, 0.65], [0, 1], Easing.easeOutCubic)(localTime);
  const dashOffset = checkLen * (1 - checkProg);
  const textOpacity = interpolate([0.3, 0.6, 2.0, 2.4], [0, 1, 1, 0], Easing.easeInOutSine)(localTime);
  const flash = interpolate([0.2, 0.55, 1.0], [0, 0.35, 0], Easing.easeOutCubic)(localTime);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: "-apple-system, system-ui" }}>
      <div style={{ position: "absolute", left: -40, top: -40, width: 136, height: 136, borderRadius: "50%", background: `radial-gradient(circle, rgba(120,220,160,${flash}) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg, #2ea866 0%, #1e8a4f 100%)", boxShadow: "0 4px 14px rgba(46,168,102,0.35), inset 0 1px 0 rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${circleScale})`, opacity: circleOpacity }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 16.5 L14 22 L24 11" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={checkLen} strokeDashoffset={dashOffset} pathLength={checkLen} />
          </svg>
        </div>
        <div style={{ opacity: textOpacity }}>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: -0.2, marginBottom: 2 }}>Done</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>$1,000,000 paid · The Front Nine</div>
        </div>
      </div>
    </div>
  );
};

const StatusArea = () => (
  <div style={{ margin: "18px 20px 0", height: 120, position: "relative" }}>
    <Sprite start={2.4} end={4.3}><HoldNearReader /></Sprite>
    <Sprite start={4.15} end={5.55}><Processing /></Sprite>
    <Sprite start={5.4} end={7.8}><Success /></Sprite>
  </div>
);

const PaymentSheet = () => {
  const t = useTime();
  const sheetY = interpolate([0, 1.0, 7.8, 9], [100, 0, 0, 100], [Easing.easeOutCubic, Easing.linear, Easing.easeInCubic])(t);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, transform: `translateY(${sheetY}%)`, willChange: "transform" }}>
      <div style={{ margin: "0 8px 8px", borderRadius: 36, background: "linear-gradient(180deg, #1c1c1f 0%, #0f0f11 100%)", boxShadow: "0 -20px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.08)", overflow: "hidden", paddingBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.18)" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 24px 16px" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #3a3a3e, #1e1e22)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 18 }}>M</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Pay</div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 600, letterSpacing: -0.2 }}>The Front Nine comes with Expense</div>
          </div>
        </div>
        <Card />
        <div style={{ margin: "18px 20px 0", padding: "16px 18px", borderRadius: 18, background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Total</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, letterSpacing: -0.3, fontVariantNumeric: "tabular-nums" }}>$1,000,000</div>
        </div>
        <StatusArea />
      </div>
    </div>
  );
};

const SideButtonHint = () => (
  <Sprite start={0.2} end={1.4}>
    {({ localTime }: SpriteValue) => {
      const op = interpolate([0, 0.25, 1.0, 1.2], [0, 1, 1, 0], Easing.easeInOutSine)(localTime);
      return (
        <div style={{ position: "absolute", right: -4, top: 200, transform: "translateX(100%)", opacity: op, display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.85)", fontSize: 13, whiteSpace: "nowrap" }}>
          <div style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(30,30,34,0.85)", border: "0.5px solid rgba(255,255,255,0.08)" }}>Double-click side button</div>
          <svg width="24" height="10" viewBox="0 0 24 10">
            <path d="M22 5H2M2 5l5-4M2 5l5 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    }}
  </Sprite>
);

const PhoneInFrame = () => {
  const t = useTime();
  const tilt = Math.sin(t * 0.6) * 0.6;
  const lift = Math.sin(t * 0.6) * 4;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 380, height: 822, borderRadius: 54, background: "linear-gradient(160deg, #2a2a2d 0%, #141416 50%, #050506 100%)", padding: 9, boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 0.5px rgba(255,255,255,0.06)", transform: `translateY(${lift}px) rotate(${tilt}deg)` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: "#000" }}>
          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <Wallpaper />
            <IOSStatusBar />
            <SheetBackdrop />
            <PaymentSheet />
            <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 80 }}>
              <div style={{ width: 139, height: 5, borderRadius: 100, background: "rgba(255,255,255,0.7)" }} />
            </div>
          </div>
          <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 120, height: 35, borderRadius: 24, background: "#000", zIndex: 90 }} />
        </div>
        <div style={{ position: "absolute", right: -2, top: 190, width: 3, height: 64, borderRadius: 2, background: "#0a0a0c" }} />
        <div style={{ position: "absolute", left: -2, top: 150, width: 3, height: 32, borderRadius: 2, background: "#0a0a0c" }} />
        <div style={{ position: "absolute", left: -2, top: 200, width: 3, height: 50, borderRadius: 2, background: "#0a0a0c" }} />
        <div style={{ position: "absolute", left: -2, top: 266, width: 3, height: 50, borderRadius: 2, background: "#0a0a0c" }} />
      </div>
      <SideButtonHint />
    </div>
  );
};

const Scene = () => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 50% at 50% 40%, #2e2e33 0%, #18181a 45%, #09090b 100%)" }} />
    <div style={{ position: "absolute", left: "50%", bottom: 60, width: 500, height: 120, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.04), transparent 70%)", filter: "blur(8px)" }} />
    <PhoneInFrame />
  </div>
);

export default function PaymentAnimation() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0a0a0a" }}>
      <Stage width={900} height={1000} duration={DUR}>
        <Scene />
      </Stage>
    </div>
  );
}
