import { Link } from "react-router-dom";
import { site } from "../config/site.js";
import { prefetchViewer } from "./prefetch.js";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="tech-grid tech-grid--fade" aria-hidden />
      <span className="crosshair crosshair--tl" aria-hidden />
      <span className="crosshair crosshair--br" aria-hidden />

      <div className="hero-top mono">
        <span>
          <b>00</b> ENGINEERING SHOWCASE
        </span>
        <span className="hero-top-r">
          {site.event} <i aria-hidden>/</i> {site.problemStatement}
        </span>
      </div>

      <h1 className="hero-mark" aria-label={site.team}>
        {site.team.split("").map((c, i) => (
          <span key={i} style={{ "--i": i }}>
            {c}
          </span>
        ))}
      </h1>

      <div className="hero-base">
        <ol className="hero-title">
          {site.title.map((word, i) => (
            <li key={word} style={{ "--i": i }}>
              <span className="mono">0{i + 1}</span>
              {word}
            </li>
          ))}
        </ol>

        <div className="hero-side">
          <p className="hero-sub">{site.subtitle}</p>
          <div className="hero-actions">
            <Link to="/viewer" className="btn btn--solid" onPointerEnter={prefetchViewer} onFocus={prefetchViewer}>
              EXPLORE 3D <span aria-hidden>↗</span>
            </Link>
            <a href="#simulation" className="btn">
              VIEW SIMULATION <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </div>

      <div className="ruler" aria-hidden />
    </section>
  );
}
