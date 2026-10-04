import { site } from "../config/site.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-mark">{site.team}</div>
      <div className="footer-meta mono">
        <span>{site.problemStatement}</span>
        <span>{site.event}</span>
      </div>
    </footer>
  );
}
