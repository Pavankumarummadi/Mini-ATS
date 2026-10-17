import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import Dashboard from "./components/Dashboard.jsx";
import Pipeline from "./components/Pipeline.jsx";
import CandidateTable from "./components/CandidateTable.jsx";
import CandidateModal from "./components/CandidateModal.jsx";

const TABS = [
  { key: "pipeline", label: "Pipeline" },
  { key: "candidates", label: "Candidates" },
  { key: "dashboard", label: "Dashboard" },
];

export default function App() {
  const [tab, setTab] = useState("pipeline");
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | {candidate?: obj}
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, dash] = await Promise.all([
        api.list({ search, stage: tab === "candidates" ? stageFilter : "" }),
        api.dashboard(),
      ]);
      setCandidates(list);
      setStats(dash);
      setError("");
    } catch {
      setError("Can't reach the server. Check that the API is running and VITE_API_URL is correct.");
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, tab]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const moveStage = async (id, stage) => {
    const prev = candidates;
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, stage } : c)));
    try {
      await api.update(id, { stage });
      flash("Stage updated");
      load();
    } catch {
      setCandidates(prev);
      flash("Couldn't update the stage");
    }
  };

  const save = async (id, body) => {
    const saved = id ? await api.update(id, body) : await api.create(body);
    flash(id ? "Candidate saved" : "Candidate added");
    await load();
    return saved;
  };

  const remove = async (id) => {
    await api.remove(id);
    flash("Candidate deleted");
    setModal(null);
    load();
  };

  return (
    <div className="app">
      <header className="top">
        <div className="brand">Mini ATS</div>
        <nav aria-label="Views">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "tab on" : "tab"} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="actions">
          <input
            type="search"
            className="search"
            placeholder="Search name, role, skill, email"
            aria-label="Search candidates"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn primary" onClick={() => setModal({})}>Add candidate</button>
        </div>
      </header>

      <main>
        {error && <div className="banner" role="alert">{error}</div>}
        {loading && !error && <p className="muted pad">Loading candidates…</p>}
        {!loading && !error && (
          <>
            {tab === "dashboard" && <Dashboard stats={stats} />}
            {tab === "pipeline" && (
              <Pipeline candidates={candidates} onMove={moveStage} onOpen={(c) => setModal({ candidate: c })} search={search} />
            )}
            {tab === "candidates" && (
              <CandidateTable
                candidates={candidates}
                stageFilter={stageFilter}
                setStageFilter={setStageFilter}
                onMove={moveStage}
                onOpen={(c) => setModal({ candidate: c })}
              />
            )}
          </>
        )}
      </main>

      {modal && (
        <CandidateModal
          candidate={modal.candidate}
          onClose={() => setModal(null)}
          onSave={save}
          onDelete={remove}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
