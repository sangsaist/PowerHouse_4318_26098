let done = false;

/* Warm the viewer chunk + model on hover intent, so the viewer opens instantly. */
export function prefetchViewer() {
  if (done) return;
  done = true;
  import("../pages/ModelViewer.jsx");
  import("../three/cadModel.js").then((m) => m.loadCadModel());
}
