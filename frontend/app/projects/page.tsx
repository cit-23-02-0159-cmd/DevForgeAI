"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Project = { id: string; name: string; description: string; status: string; created_at: string; updated_at: string };
const statuses = ["draft", "active", "completed", "archived"];

async function api<T>(path = "", method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/projects${path}`, { method, cache: "no-store",
    headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(typeof data.detail === "string" ? data.detail : "Please check the project fields and try again.");
  }
  return response.status === 204 ? undefined as T : response.json();
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const load = useCallback(async (page = 0) => {
    setLoading(true); setError("");
    try {
      const data = await api<Project[]>(`?offset=${page}&limit=24`);
      setProjects(data); setOffset(page); setHasMore(data.length === 24);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);

  async function open(id: string) {
    setBusy(true); setError("");
    try { setSelected(await api<Project>(`/${id}`)); setEditing(false); setDeleting(false); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const project = await api<Project>(creating ? "" : `/${selected!.id}`, creating ? "POST" : "PATCH",
        { name: form.get("name"), description: form.get("description"), status: form.get("status") });
      setSelected(project); setCreating(false); setEditing(false); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError("");
    try { await api(`/${selected!.id}`, "DELETE"); setSelected(null); setDeleting(false); await load(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  const formVisible = creating || editing;
  return <div className="workspace">
    <aside className="sidebar">
      <Link className="brand" href="/"> <span className="brand-mark">D</span><span>DevForge <b>AI</b></span></Link>
      <div className="workspace-label">ENGINEERING WORKSPACE</div>
      <nav aria-label="Main navigation"><Link className="nav-link" href="/">Overview</Link><Link className="nav-link active" href="/projects" aria-current="page">Projects</Link><Link className="nav-link" href="/#platform">Platform status</Link></nav>
    </aside>
    <main><header className="topbar"><span>Workspace / <strong>Projects</strong></span><span className="version">Phase 2A</span></header>
      <div className="content"><div className="page-heading"><div><p className="eyebrow">YOUR PROJECT WORKSPACE</p><h1>Ideas, ready to take shape.</h1><p>Organize your work from first draft to completion.</p></div>
        <button className="button primary" disabled={busy} onClick={() => { setCreating(true); setSelected(null); setError(""); }}>+ Create Project</button></div>
        {error && <div className="project-error" role="alert">{error} <button className="button secondary" disabled={busy || loading} onClick={() => void load(offset)}>Refresh list</button></div>}
        <section aria-label="Project list" aria-busy={loading}>
          {loading ? <p role="status">Loading projects…</p> : projects.length === 0 ? <div className="project-empty"><h2>Your next project starts here.</h2><p>Create a project to capture its purpose and track its progress.</p></div> :
            <div className="project-grid">{projects.map(project => <button className="project-card" key={project.id} disabled={busy} onClick={() => void open(project.id)}>
              <span className={`project-status status-${project.status}`}>{project.status}</span><h2>{project.name}</h2><p>{project.description || "No description yet."}</p><small>Updated {new Date(project.updated_at).toLocaleDateString()}</small>
            </button>)}</div>}
          <div className="project-actions"><button className="button secondary" disabled={loading || busy || offset === 0} onClick={() => void load(Math.max(0, offset - 24))}>Previous</button><button className="button secondary" disabled={loading || busy || !hasMore} onClick={() => void load(offset + 24)}>Next</button></div>
        </section>
        {(creating || selected) && <section className="project-detail" aria-labelledby="detail-title">
          <div className="section-heading"><h2 id="detail-title">{creating ? "Create project" : editing ? "Edit project" : selected!.name}</h2><button className="button secondary" disabled={busy} onClick={() => { setSelected(null); setCreating(false); setEditing(false); setDeleting(false); }}>Close</button></div>
          {formVisible ? <form key={creating ? "new" : selected!.id} onSubmit={save} className="project-form">
            <label>Name<input name="name" required maxLength={200} pattern=".*\S.*" defaultValue={creating ? "" : selected!.name} disabled={busy} autoFocus /></label>
            <label>Description<textarea name="description" maxLength={10000} rows={5} defaultValue={creating ? "" : selected!.description} disabled={busy} /></label>
            <label>Status<select name="status" defaultValue={creating ? "draft" : selected!.status} disabled={busy}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            <div className="project-actions"><button className="button primary" disabled={busy}>{busy ? "Saving…" : "Save project"}</button><button type="button" className="button secondary" disabled={busy} onClick={() => { setEditing(false); setCreating(false); }}>Cancel</button></div>
          </form> : <><span className={`project-status status-${selected!.status}`}>{selected!.status}</span><p className="project-description">{selected!.description || "No description yet."}</p><p>Created {new Date(selected!.created_at).toLocaleString()} · Updated {new Date(selected!.updated_at).toLocaleString()}</p>
            {deleting ? <div role="alert"><p>Delete “{selected!.name}”? This permanently removes the project.</p><div className="project-actions"><button className="button danger" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting…" : "Confirm delete"}</button><button className="button secondary" disabled={busy} onClick={() => setDeleting(false)}>Cancel</button></div></div> : <div className="project-actions"><button className="button secondary" disabled={busy} onClick={() => setEditing(true)}>Edit project</button><button className="button danger" disabled={busy} onClick={() => setDeleting(true)}>Delete project</button></div>}</>}
        </section>}
      </div>
    </main>
  </div>;
}
