import { STAGES, stageLabel } from "../api";

export default function Dashboard({ stats }) {
  if (!stats) return null;
  const max = Math.max(1, ...STAGES.map((s) => stats.by_stage[s.key]));
  const funnelMax = Math.max(1, ...stats.funnel.map((f) => f.reached));
  const roleMax = Math.max(1, ...stats.top_roles.map((r) => r.count));

  return (
    <div className="dash">
      <div className="kpis">
        <Kpi label="Total candidates" value={stats.total} />
        <Kpi label="In progress" value={stats.in_progress} />
        <Kpi label="New this week" value={stats.new_this_week} />
        <Kpi label="Hire rate" value={`${stats.hire_rate}%`} hint="Hired out of all decided" />
      </div>

      <section className="panel">
        <h2>Candidates by stage</h2>
        <div className="bars">
          {STAGES.map((s) => (
            <div className="bar-row" key={s.key}>
              <span>{s.label}</span>
              <div className="track"><div className={`fill ${s.key}`} style={{ width: `${(stats.by_stage[s.key] / max) * 100}%` }} /></div>
              <b>{stats.by_stage[s.key]}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="two">
        <section className="panel">
          <h2>Hiring funnel</h2>
          <p className="muted">Candidates who have reached each stage</p>
          <div className="bars">
            {stats.funnel.map((f) => (
              <div className="bar-row" key={f.stage}>
                <span>{stageLabel(f.stage)}</span>
                <div className="track"><div className="fill funnel" style={{ width: `${(f.reached / funnelMax) * 100}%` }} /></div>
                <b>{f.reached}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Open roles by candidates</h2>
          {stats.top_roles.length === 0 && <p className="muted">No data yet.</p>}
          <div className="bars">
            {stats.top_roles.map((r) => (
              <div className="bar-row" key={r.role}>
                <span>{r.role}</span>
                <div className="track"><div className="fill funnel" style={{ width: `${(r.count / roleMax) * 100}%` }} /></div>
                <b>{r.count}</b>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}
