import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SectionHead from "./SectionHead.jsx";
import { resources, site } from "../config/site.js";

const ACTION = { video: "PLAY ▶", external: "OPEN ↗", download: "DOWNLOAD ↓" };

/* Accepts youtube.com/watch?v=, youtu.be/ and /embed/ URLs. */
function youtubeEmbed(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0` : null;
}

function VideoModal({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  const yt = youtubeEmbed(src);
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Video demo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lightbox-inner lightbox-video">
        {yt ? (
          <iframe src={yt} title="Video demo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <video src={src} controls autoPlay playsInline />
        )}
      </div>
      <div className="lightbox-bar">
        <span className="mono slide-caption-inline">VIDEO DEMO</span>
        <div className="slide-controls mono">
          <button type="button" onClick={onClose} autoFocus>
            CLOSE ✕
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Tile({ r, onPlay }) {
  const body = (
    <>
      <span className="tile-id mono">{r.id}</span>
      <strong className="tile-label">{r.label}</strong>
      <span className="tile-note">{r.note}</span>
      <span className="tile-state mono">{r.href ? ACTION[r.kind] : "PENDING"}</span>
    </>
  );

  if (!r.href)
    return (
      <div className="tile is-pending" aria-disabled="true">
        {body}
      </div>
    );
  if (r.kind === "video")
    return (
      <button type="button" className="tile" onClick={() => onPlay(r.href)}>
        {body}
      </button>
    );
  return (
    <a className="tile" href={r.href} {...(r.kind === "download" ? { download: "" } : { target: "_blank", rel: "noopener noreferrer" })}>
      {body}
    </a>
  );
}

export default function ResourceGrid() {
  const [video, setVideo] = useState(null);
  const close = useCallback(() => setVideo(null), []);
  return (
    <section className="section resources" id="resources">
      <SectionHead index="03" title="PROJECT RESOURCES" aside={`${resources.filter((r) => r.href).length} / ${resources.length} AVAILABLE`} />
      <div className="tile-grid">
        {resources.map((r) => (
          <Tile key={r.id} r={r} onPlay={setVideo} />
        ))}
      </div>
      <div className="end-strip mono">
        <span>
          {site.team} · {site.problemStatement} · {site.event}
        </span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
      {video && <VideoModal src={video} onClose={close} />}
    </section>
  );
}
