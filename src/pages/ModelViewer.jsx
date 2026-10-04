import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useCadModel } from "../three/useCadModel.js";
import { CameraRig, StudioEnvironment, StudioLights, canvasProps } from "../three/SceneKit.jsx";
import { LoadState, ModelReadout } from "../three/Readouts.jsx";
import { model as modelConfig, site } from "../config/site.js";

const VIEW = [0.62, 0.3, 1];

function FloorGrid({ data }) {
  const grid = useMemo(() => {
    const span = Math.max(data.size.x, data.size.z) * 2.2;
    const g = new THREE.GridHelper(span, 22, 0x3a3f36, 0x1c1f1b);
    g.position.y = data.box.min.y - data.size.y * 0.02;
    g.material.transparent = true;
    g.material.opacity = 0.7;
    g.material.depthWrite = false;
    return g;
  }, [data]);
  useEffect(() => () => (grid.geometry.dispose(), grid.material.dispose()), [grid]);
  return <primitive object={grid} />;
}

const label = (name) => name.replace(/_/g, " ").trim().toUpperCase() || "BODY";

export default function ModelViewer() {
  const { status, progress, data } = useCadModel();
  const shell = useRef();
  const rig = useRef();
  const invalidateRef = useRef(() => {});
  const az = useRef(), el = useRef(), dist = useRef();

  const [wire, setWire] = useState(false);
  const [grid, setGrid] = useState(true);
  const [hidden, setHidden] = useState(() => new Set());
  const [isFull, setIsFull] = useState(false);
  const [panel, setPanel] = useState(false);
  const canFull = typeof document !== "undefined" && document.fullscreenEnabled;

  useEffect(() => {
    document.title = `3D Viewer — ${site.team} · ${site.problemStatement}`;
    const onFs = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Apply view modes to the shared model; restore on leave so the homepage stays clean.
  useEffect(() => {
    if (!data) return;
    data.materials.forEach((m) => (m.wireframe = wire));
    data.parts.forEach((p) => (p.visible = !hidden.has(p.uuid)));
    invalidateRef.current();
  }, [data, wire, hidden]);
  useEffect(
    () => () => {
      if (!data) return;
      data.materials.forEach((m) => (m.wireframe = false));
      data.parts.forEach((p) => (p.visible = true));
    },
    [data],
  );

  const onCamera = useCallback(({ azimuth, elevation, distance }) => {
    if (az.current) az.current.textContent = `${azimuth.toFixed(1)}°`;
    if (el.current) el.current.textContent = `${elevation.toFixed(1)}°`;
    if (dist.current) dist.current.textContent = distance.toFixed(2);
  }, []);

  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : shell.current?.requestFullscreen());

  const togglePart = (uuid) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(uuid) ? next.delete(uuid) : next.add(uuid);
      return next;
    });

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "r") rig.current?.reset();
      else if (k === "f") rig.current?.fit();
      else if (k === "w") setWire((v) => !v);
      else if (k === "g") setGrid((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="viewer" ref={shell}>
      <header className="viewer-bar">
        <Link to="/" className="viewer-back">
          <span aria-hidden>←</span> BACK
        </Link>
        <div className="viewer-id">
          <strong>{site.team}</strong>
          <span>DIGITAL MODEL</span>
        </div>
        <div className="viewer-meta">
          <span>{site.event}</span>
          <span>{site.problemStatement}</span>
        </div>
      </header>

      <div className="viewer-stage">
        <div className="tech-grid" aria-hidden />
        {data && (
          <Canvas {...canvasProps} className="stage-canvas" onCreated={(s) => (canvasProps.onCreated(s), (invalidateRef.current = s.invalidate))}>
            <StudioEnvironment />
            <StudioLights />
            <primitive object={data.root} dispose={null} />
            {grid && <FloorGrid data={data} />}
            <CameraRig ref={rig} points={data.points} viewDir={VIEW} margin={1.3} insetRight={330} onCamera={onCamera} />
          </Canvas>
        )}
        <LoadState status={status} progress={progress} />

        <div className="frame-corners" aria-hidden>
          <i /><i /><i /><i />
        </div>

        <dl className="readout readout-camera">
          <div><dt>AZ</dt><dd ref={az}>—</dd></div>
          <div><dt>EL</dt><dd ref={el}>—</dd></div>
          <div><dt>DIST</dt><dd ref={dist}>—</dd></div>
        </dl>

        {data && (
          <aside className={`viewer-panel ${panel ? "is-open" : ""}`}>
            <button className="panel-toggle" type="button" onClick={() => setPanel((v) => !v)} aria-expanded={panel}>
              BODIES <span>{String(data.parts.length).padStart(2, "0")}</span>
            </button>
            <ul className="part-list">
              {data.parts.map((p, i) => {
                const on = !hidden.has(p.uuid);
                const color = Array.isArray(p.material) ? p.material[0].color : p.material.color;
                return (
                  <li key={p.uuid}>
                    <button type="button" className={on ? "" : "is-off"} onClick={() => togglePart(p.uuid)} aria-pressed={on}>
                      <i style={{ background: `#${color.getHexString(THREE.SRGBColorSpace)}` }} />
                      <span className="pi">{String(i + 1).padStart(2, "0")}</span>
                      <span className="pn">{label(p.name)}</span>
                      <span className="ps">{on ? "ON" : "OFF"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <ModelReadout data={data} className="readout-stack" />
          </aside>
        )}

        <nav className="viewer-tools" aria-label="Viewer controls">
          <button type="button" onClick={() => rig.current?.reset()} disabled={!data}>
            RESET <kbd>R</kbd>
          </button>
          <button type="button" onClick={() => rig.current?.fit()} disabled={!data}>
            FIT <kbd>F</kbd>
          </button>
          <button type="button" onClick={() => setWire((v) => !v)} aria-pressed={wire} disabled={!data}>
            WIRE <kbd>W</kbd>
          </button>
          <button type="button" onClick={() => setGrid((v) => !v)} aria-pressed={grid} disabled={!data}>
            GRID <kbd>G</kbd>
          </button>
          {canFull && (
            <button type="button" onClick={toggleFull}>
              {isFull ? "EXIT FULL" : "FULLSCREEN"}
            </button>
          )}
          <a className="is-accent" href={modelConfig.obj} download={modelConfig.downloadName}>
            DOWNLOAD OBJ <span aria-hidden>↓</span>
          </a>
        </nav>

        <p className="viewer-hint">
          <span className="hint-mouse">DRAG ROTATE · RIGHT-DRAG PAN · WHEEL ZOOM</span>
          <span className="hint-touch">DRAG ROTATE · PINCH ZOOM · TWO-FINGER PAN</span>
        </p>
      </div>
    </div>
  );
}
