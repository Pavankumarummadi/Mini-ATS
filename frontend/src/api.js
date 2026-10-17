const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error("Request failed");
    err.fields = data;
    throw err;
  }
  return data;
}

export const STAGES = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];
export const stageLabel = (k) => STAGES.find((s) => s.key === k)?.label ?? k;

export const api = {
  list: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/candidates/${q ? `?${q}` : ""}`).then((d) => d.results);
  },
  create: (body) => request("/candidates/", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/candidates/${id}/`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id) => request(`/candidates/${id}/`, { method: "DELETE" }),
  dashboard: () => request("/dashboard/"),
};
