import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SectionHead from "./SectionHead.jsx";
import { simulation } from "../config/site.js";

const pad = (n) => String(n).padStart(2, "0");

function Slide({ slide, index, eager }) {
  if (!slide.src)
    return (
      <div className="slide-empty mono">
        <span className="slide-empty-id">SLIDE {pad(index + 1)}</span>
        <span>AWAITING MATLAB / SIMULINK EXPORT</span>
      </div>
    );
  return <img src={slide.src} alt={slide.caption || `Simulation slide ${index + 1}`} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />;
}

function Controls({ index, total, go, children }) {
  return (
    <div className="slide-controls mono">
      <button type="button" onClick={() => go(-1)} aria-label="Previous slide">
        ← PREV
      </button>
      <span className="slide-count" aria-live="polite">
        <b>{pad(index + 1)}</b> / {pad(total)}
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next slide">
        NEXT →
      </button>
      {children}
    </div>
  );
}

export default function SimulationShowcase() {
  const slides = simulation.slides;
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const go = useCallback((d) => setIndex((i) => (i + d + total) % total), [total]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  // Touch swipe on the slide frame.
  const [touchX, setTouchX] = useState(null);
  const swipe = {
    onTouchStart: (e) => setTouchX(e.touches[0].clientX),
    onTouchEnd: (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      setTouchX(null);
    },
  };

  if (!total) return null;
  const slide = slides[index];
  const next = slides[(index + 1) % total];

  return (
    <section className="section sim" id="simulation">
      <SectionHead index="02" title="MATLAB / SIMULINK" aside="SIMULATION" />

      <div className="slide-frame" {...swipe}>
        <div className="tech-grid" aria-hidden />
        <div className="frame-corners" aria-hidden>
          <i /><i /><i /><i />
        </div>
        <Slide key={index} slide={slide} index={index} eager />
        {next?.src && <link rel="prefetch" href={next.src} />}
        <span className="slide-caption mono">{slide.caption}</span>
      </div>

      <div className="slide-bar">
        <div className="slide-ticks" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              className={i === index ? "is-on" : ""}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <Controls index={index} total={total} go={go}>
          <button type="button" onClick={() => setOpen(true)}>
            VIEW ⤢
          </button>
          {simulation.pdf ? (
            <a className="is-accent" href={simulation.pdf} download>
              PDF ↓
            </a>
          ) : (
            <span className="is-pending" title="PDF not added yet">
              PDF · PENDING
            </span>
          )}
        </Controls>
      </div>

      {open &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label="Simulation slides" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <div className="lightbox-inner" {...swipe}>
              <Slide slide={slide} index={index} eager />
            </div>
            <div className="lightbox-bar">
              <span className="mono slide-caption-inline">{slide.caption}</span>
              <Controls index={index} total={total} go={go}>
                <button type="button" onClick={() => setOpen(false)} autoFocus>
                  CLOSE ✕
                </button>
              </Controls>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
