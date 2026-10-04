/*
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Every link, file and slide on the site is set here.
 *  Leave a value as `null` and the UI shows it as "PENDING".
 *
 *  Files placed in /public are served from the site root, e.g.
 *    public/resources/report.pdf  →  "/resources/report.pdf"
 * ─────────────────────────────────────────────────────────────
 */

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
  obj: "/model/website.obj",
  mtl: "/model/website.mtl",
  basePath: "/model/",
  downloadName: "powerhouse-ps26098.obj",
};

/* MATLAB / Simulink slideshow.
 * Add screenshots to public/simulation/ and list them here:
 *   { src: "/simulation/01.png", caption: "Closed-loop response" }
 * Entries with `src: null` render as empty placeholder frames. */
export const simulation = {
  pdf: null, // e.g. "/resources/simulation-slides.pdf"
  slides: [
    { src: null, caption: "Slide placeholder" },
    { src: null, caption: "Slide placeholder" },
    { src: null, caption: "Slide placeholder" },
  ],
};

/* Project resources — 8 tiles below the footer.
 * kind:
 *   "video"    → opens in an on-page player (mp4/webm file or YouTube embed URL)
 *   "external" → opens in a new tab
 *   "download" → downloads the file */
export const resources = [
  { id: "01", label: "VIDEO DEMO",    note: "Demonstration video",   kind: "video",    href: null },
  { id: "02", label: "YOUTUBE",       note: "Channel / playlist",    kind: "external", href: null },
  { id: "03", label: "MATLAB",        note: "Scripts & project",     kind: "download", href: null },
  { id: "04", label: "SIMULINK",      note: "Model files",           kind: "download", href: null },
  { id: "05", label: "DOCUMENTATION", note: "PDF / document",        kind: "external", href: null },
  { id: "06", label: "GITHUB",        note: "Repository",            kind: "external", href: null },
  { id: "07", label: "PPT / PDF",     note: "Presentation",          kind: "download", href: null },
  { id: "08", label: "PROJECT FILES", note: "Downloadable assets",   kind: "download", href: null },
];
