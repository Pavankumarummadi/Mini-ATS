import { useState } from "react";
import { STAGES, stageLabel } from "../api";

const EMPTY = { name: "", email: "", phone: "", role: "", skills: "", experience_years: 0, resume_url: "", notes: "", stage: "applied" };

export default function CandidateModal({ candidate, onClose, onSave, onDelete }) {
  const editing = Boolean(candidate);
  const [form, setForm] = useState(editing ? { ...EMPTY, ...candidate } : EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const local = {};
    if (!form.name.trim()) local.name = "Enter the candidate's name.";
    if (!form.email.trim()) local.email = "Enter an email address.";
    if (!form.role.trim()) local.role = "Enter the role they applied for.";
    if (Object.keys(local).length) return setErrors(local);

    setSaving(true);
    const { history, id, created_at, updated_at, ...body } = form;
    try {
      await onSave(editing ? candidate.id : null, { ...body, experience_years: Number(body.experience_years) || 0 });
      onClose();
    } catch (err) {
      const fe = {};
      Object.entries(err.fields || {}).forEach(([k, v]) => (fe[k] = Array.isArray(v) ? v[0] : String(v)));
      setErrors(Object.keys(fe).length ? fe : { form: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const field = (k, label, props = {}) => (
    <label className={errors[k] ? "f err" : "f"}>
      {label}
      <input value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  );

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={editing ? "Edit candidate" : "Add candidate"}>
        <h2>{editing ? candidate.name : "Add candidate"}</h2>
        <form onSubmit={submit} noValidate>
          <div className="grid">
            {field("name", "Full name")}
            {field("email", "Email", { type: "email" })}
            {field("phone", "Phone")}
            {field("role", "Role applied for")}
            {field("skills", "Skills (comma separated)")}
            {field("experience_years", "Years of experience", { type: "number", min: 0, step: "0.5" })}
            {field("resume_url", "Resume link", { type: "url", placeholder: "https://" })}
            <label className="f">
              Stage
              <select value={form.stage} onChange={set("stage")}>
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <label className="f">
            Notes
            <textarea rows="3" value={form.notes} onChange={set("notes")} />
          </label>
          {errors.form && <div className="banner">{errors.form}</div>}

          {editing && candidate.history?.length > 0 && (
            <div className="history">
              <h3>Stage history</h3>
              <ol>
                {candidate.history.map((h, i) => (
                  <li key={i}>
                    {h.from_stage ? `${stageLabel(h.from_stage)} to ${stageLabel(h.to_stage)}` : `Added as ${stageLabel(h.to_stage)}`}
                    <span className="muted"> {new Date(h.changed_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="foot">
            {editing && (
              <button type="button" className="btn danger" onClick={() => window.confirm(`Delete ${candidate.name}?`) && onDelete(candidate.id)}>
                Delete candidate
              </button>
            )}
            <span className="spacer" />
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button className="btn primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add candidate"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
