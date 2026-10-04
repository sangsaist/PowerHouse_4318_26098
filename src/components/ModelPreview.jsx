import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SectionHead from "./SectionHead.jsx";
import { prefetchViewer } from "./prefetch.js";

// Three.js + the model are fetched only once this section approaches the viewport.
const PreviewStage = lazy(() => import("../three/PreviewStage.jsx"));

export default function ModelPreview() {
  const ref = useRef();
  const [near, setNear] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section model" id="model">
      <SectionHead index="01" title="DIGITAL MODEL" aside="FUSION 360 → OBJ / MTL" />

      <div className="stage" ref={ref}>
        <div className="tech-grid" aria-hidden />
        <span className="stage-axis stage-axis--x" aria-hidden />
        <span className="stage-axis stage-axis--y" aria-hidden />
        <div className="frame-corners" aria-hidden>
          <i /><i /><i /><i />
        </div>

        {near && (
          <Suspense fallback={null}>
            <PreviewStage />
          </Suspense>
        )}

        <span className="stage-tag mono">VIEW · ISO</span>
        <span className="stage-hint mono">DRAG TO ROTATE</span>

        <Link to="/viewer" className="btn btn--solid stage-cta" onPointerEnter={prefetchViewer} onFocus={prefetchViewer}>
          OPEN 3D VIEWER <span aria-hidden>↗</span>
        </Link>
      </div>
    </section>
  );
}
