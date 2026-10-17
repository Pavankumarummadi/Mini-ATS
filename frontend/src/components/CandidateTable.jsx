import { STAGES, stageLabel } from "../api";

export default function CandidateTable({ candidates, stageFilter, setStageFilter, onMove, onOpen }) {
  return (
    <div className="panel">
      <div className="filters">
        <label>
          Stage
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <span className="muted">{candidates.length} candidate{candidates.length === 1 ? "" : "s"}</span>
      </div>
      {!candidates.length ? (
        <p className="empty">No candidates match these filters.</p>
      ) : (
        <div className="scroll">
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th>Skills</th><th>Experience</th><th>Applied</th><th>Stage</th></tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id}>
                  <td><button className="link" onClick={() => onOpen(c)}>{c.name}</button><div className="muted">{c.email}</div></td>
                  <td>{c.role}</td>
                  <td>{c.skills || "—"}</td>
                  <td>{Number(c.experience_years)} yrs</td>
                  <td>{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td>
                    <select className={`pill ${c.stage}`} value={c.stage} aria-label={`Stage for ${c.name}`} onChange={(e) => onMove(c.id, e.target.value)}>
                      {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
