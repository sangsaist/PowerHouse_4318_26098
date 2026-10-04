export default function SectionHead({ index, title, aside }) {
  return (
    <div className="section-head mono">
      <span className="section-index">{index}</span>
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" aria-hidden />
      {aside && <span className="section-aside">{aside}</span>}
    </div>
  );
}
