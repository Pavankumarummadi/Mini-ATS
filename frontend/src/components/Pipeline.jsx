import { useState } from "react";
import { STAGES } from "../api";

export default function Pipeline({ candidates, onMove, onOpen, search }) {
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  if (!candidates.length) {
    return (
      <p className="empty">
        {search ? `No candidates match "${search}".` : "No candidates yet. Add your first candidate to start the pipeline."}
      </p>
    );
  }

  return (
    <div className="board">
      {STAGES.map((s) => {
        const items = candidates.filter((c) => c.stage === s.key);
        return (
          <section
            key={s.key}
            className={`col ${s.key} ${overStage === s.key ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOverStage(s.key); }}
            onDragLeave={() => setOverStage(null)}
            onDrop={() => {
              const c = candidates.find((x) => x.id === dragId);
              if (c && c.stage !== s.key) onMove(c.id, s.key);
              setDragId(null); setOverStage(null);
            }}
          >
            <h2><span className="dot" />{s.label}<span className="count">{items.length}</span></h2>
            <div className="cards">
              {items.map((c) => (
                <article
                  key={c.id}
                  className={`card ${dragId === c.id ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragEnd={() => { setDragId(null); setOverStage(null); }}
                >
                  <button className="card-main" onClick={() => onOpen(c)}>
                    <strong>{c.name}</strong>
                    <span>{c.role}</span>
                    <span className="muted">{Number(c.experience_years)} yrs experience</span>
                  </button>
                  {c.skills && (
                    <div className="chips">
                      {c.skills.split(",").slice(0, 3).map((k) => <span key={k} className="chip">{k.trim()}</span>)}
                    </div>
                  )}
                  <select aria-label={`Move ${c.name} to stage`} value={c.stage} onChange={(e) => onMove(c.id, e.target.value)}>
                    {STAGES.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </article>
              ))}
              {!items.length && <p className="col-empty">Drop a candidate here</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
