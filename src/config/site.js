/*
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Every link, file and slide on the site is set here.
 *  Leave a value as `null` and the UI shows it as "PENDING".
 *
 *  Files placed in /public are referenced with asset(), which adds
 *  the deploy base path (e.g. /PowerHouse_4318_26098/ on GitHub Pages):
 *    public/resources/report.pdf  →  asset("resources/report.pdf")
 * ─────────────────────────────────────────────────────────────
 */

/* Resolves a file in /public against the deploy base path. */
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

export const site = {
  team: "POWERHOUSE",
  event: "SIH 2026",
  problemStatement: "PS 26098",
  title: ["Precision", "Guidance", "Demonstrator"],
  subtitle:
    "Engineering showcase — CAD, MATLAB / Simulink simulation, demonstrations and project resources.",
};

/* 3D model — Fusion 360 OBJ export. Textures referenced by the MTL
 * must sit in the same folder (public/model/). */
export const model = {
  obj: asset("model/website.obj"),
  mtl: asset("model/website.mtl"),
  basePath: asset("model/"),
  downloadName: "powerhouse-ps26098.obj",
};

/* MATLAB / Simulink slideshow.
 * Add screenshots to public/simulation/ and list them here:
 *   { src: asset("simulation/01.png"), caption: "Closed-loop response" }
 * Recommended filenames are 01.png, 02.png and 03.png. PNG or JPG both work.
 * Entries with `src: null` render as empty placeholder frames. */
export const simulation = {
  pdf: null, // e.g. asset("resources/simulation-slides.pdf")
  slides: [
    { src: asset("simulation/01.png"), caption: "MATLAB / Simulink model" },
    { src: asset("simulation/02.png"), caption: "Simulation result" },
    { src: asset("simulation/03.png"), caption: "Closed-loop response" },
  ],
};

/* Project resources — the four links shown below the footer.
 * kind:
 *   "video"    → opens in an on-page player (mp4/webm file or YouTube embed URL)
 *   "external" → opens in a new tab
 *   "download" → downloads the file */
export const resources = [
  { id: "01", label: "YOUTUBE",       note: "Demonstration video",   kind: "external", href: "https://www.youtube.com/watch?v=ySFLTF1MEMk" },
  { id: "02", label: "MATLAB",        note: "Scripts & project",     kind: "external", href: "https://drive.google.com/drive/folders/1iLn8LiCNA1cuAoj9p4wSmjlwYpoXcDvt?usp=sharing" },
  { id: "03", label: "DOCUMENTATION", note: "PDF / document",        kind: "external", href: "https://drive.google.com/drive/folders/1iLn8LiCNA1cuAoj9p4wSmjlwYpoXcDvt?usp=sharing" },
  { id: "04", label: "PPT / PDF",     note: "Presentation",          kind: "external", href: "https://drive.google.com/drive/folders/1iLn8LiCNA1cuAoj9p4wSmjlwYpoXcDvt?usp=sharing" },
];
