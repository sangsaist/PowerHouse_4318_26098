import { Link } from "react-router-dom";
import { site } from "../config/site.js";
import { prefetchViewer } from "./prefetch.js";

export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label={`${site.team} — top`}>
        <span className="brand-mark" aria-hidden />
        {site.team}
      </a>
      <div className="header-meta mono">
        <span>{site.event}</span>
        <i aria-hidden />
        <span>{site.problemStatement}</span>
      </div>
      <nav className="header-nav mono" aria-label="Primary">
        <a href="#model">MODEL</a>
        <a href="#simulation">SIMULATION</a>
        <a href="#resources">RESOURCES</a>
        <Link to="/viewer" className="nav-cta" onPointerEnter={prefetchViewer} onFocus={prefetchViewer}>
          3D VIEWER <span aria-hidden>↗</span>
        </Link>
      </nav>
    </header>
  );
}
