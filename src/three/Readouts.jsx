/* Telemetry overlays. Every number shown is measured from the loaded model. */

const fmt = (n) => n.toFixed(2);

export function ModelReadout({ data, className = "" }) {
  const { size, triangles, parts } = data;
  return (
    <dl className={`readout ${className}`}>
      <div>
        <dt>EXTENTS · CAD UNITS</dt>
        <dd>
          {fmt(size.x)} <i>×</i> {fmt(size.y)} <i>×</i> {fmt(size.z)}
        </dd>
      </div>
      <div>
        <dt>BODIES</dt>
        <dd>{String(parts.length).padStart(2, "0")}</dd>
      </div>
      <div>
        <dt>TRIANGLES</dt>
        <dd>{triangles.toLocaleString("en-US")}</dd>
      </div>
    </dl>
  );
}

export function LoadState({ status, progress }) {
  if (status === "ready") return null;
  if (status === "error")
    return (
      <div className="load-state is-error" role="alert">
        <span>ASSET NOT FOUND</span>
        <small>Expected /model/website.obj + website.mtl</small>
      </div>
    );
  return (
    <div className="load-state" aria-live="polite">
      <span>LOADING MODEL</span>
      <div className="load-bar">
        <i style={{ transform: `scaleX(${Math.max(progress, 0.04)})` }} />
      </div>
      <small>{String(Math.round(progress * 100)).padStart(3, "0")}%</small>
    </div>
  );
}
