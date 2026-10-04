# POWERHOUSE — SIH 2026 · PS 26098

Engineering showcase site: CAD model viewer, MATLAB / Simulink slideshow, project resources.

Vite + React + React Three Fiber.

## Run

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the build locally
```

## Where things go

| What | Where |
|---|---|
| All links, slides, resource tiles, titles | `src/config/site.js` (the only file you normally edit) |
| 3D model (`website.obj`, `website.mtl`, any textures the MTL references) | `public/model/` |
| MATLAB / Simulink screenshots | `public/simulation/` → list them in `simulation.slides` |
| PDFs, videos, zips for resource tiles | `public/resources/` → set `href: "/resources/…"` |

Any `href` / `src` left as `null` shows as **PENDING** on the site.

Resource `kind`:
- `video` opens an on-page player. Use an `.mp4` / `.webm` path or any YouTube URL.
- `external` opens in a new tab.
- `download` downloads the file.

## Replacing the model

Re-export from Fusion 360 as OBJ and overwrite the files in `public/model/`.
The viewer re-centres and auto-frames the model at any scale or units.
Material finish (metal vs. matte) comes from the Fusion appearance name. The rules
are the `PRESETS` table in `src/three/cadModel.js`. Colours come straight from the MTL.

## Structure

```
src/
  config/site.js          central content + links
  components/             Header, Hero, ModelPreview, SimulationShowcase, Footer, ResourceGrid
  pages/                  Home, ModelViewer (/viewer, lazy-loaded)
  three/                  model loader, camera rig, preview stage (lazy-loaded)
  styles/global.css       design tokens + all styles
public/model/             OBJ / MTL served as-is (also used by "Download OBJ")
_prototype/               previous static HTML prototype (not used by the build)
```

## Performance notes

- Three.js isn't part of the homepage bundle. It loads only when the 3D section nears the viewport, or when you hover "Explore 3D".
- Rendering is on demand: frames are drawn only while the camera moves. The page is idle otherwise.
- Pixel ratio is capped at 1.75. No shadows, no post-processing. Studio reflections are generated once on the GPU, so no HDR file is downloaded.
- Vertices are welded on load, and the model is cached between the homepage and the viewer.

## Deploying

`/viewer` is a client-side route. `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included.
For GitHub Pages, switch `BrowserRouter` to `HashRouter` in `src/App.jsx`.
