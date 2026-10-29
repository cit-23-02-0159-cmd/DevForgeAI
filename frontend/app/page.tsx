"use client";

import { useCallback, useEffect, useState } from "react";

type Health = { status: "healthy" | "degraded" | "unavailable"; database: "connected" | "unavailable" | "unknown" };
const capabilities = [
  ["01", "Understand", "Requirements & architecture", "Turn product intent into a clear engineering plan."],
  ["02", "Build", "Database design & coding", "Bring a plan to life with coordinated AI agents."],
  ["03", "Validate", "Testing & security", "Make quality a part of every development cycle."],
  ["04", "Operate", "Delivery & monitoring", "Ship, observe, and continuously improve software."],
];

export default function Dashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [checking, setChecking] = useState(true);
  const [updated, setUpdated] = useState<string | null>(null);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/health", { cache: "no-store", signal });
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("status" in data) || !("database" in data)
        || !["healthy", "degraded", "unavailable"].includes(String(data.status))
        || !["connected", "unavailable", "unknown"].includes(String(data.database))) throw new Error("Invalid health response");
      setHealth(data as Health);
      setUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      if (signal?.aborted) return;
      setHealth({ status: "unavailable", database: "unknown" });
      setUpdated(new Date().toLocaleTimeString());
    } finally { if (!signal?.aborted) setChecking(false); }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initial = setTimeout(() => void refresh(controller.signal), 0);
    const timer = setInterval(() => void refresh(controller.signal), 30000);
    return () => { controller.abort(); clearTimeout(initial); clearInterval(timer); };
  }, [refresh]);

  const apiUp = health?.status === "healthy" || health?.status === "degraded";
  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#overview"><span className="brand-mark">D<span>↗</span></span><span>DevForge <b>AI</b></span></a>
        <div className="workspace-label">ENGINEERING WORKSPACE</div>
        <nav aria-label="Main navigation">
          <a className="nav-link active" href="#overview"><span>◈</span> Overview</a>
          <a className="nav-link" href="/projects"><span>▦</span> Projects</a>
          <a className="nav-link" href="#platform"><span>▦</span> Platform status</a>
          <a className="nav-link" href="#roadmap"><span>↗</span> Roadmap</a>
        </nav>
        <div className="sidebar-note"><span className="eyebrow">BUILT TO EVOLVE</span><h3>A strong foundation.<br />An ambitious future.</h3><p>One workspace for the entire software lifecycle.</p><span className="phase-tag">Phase 01 · Foundation</span></div>
        <div className="sidebar-footer"><span className="avatar">DF</span><div>Local workspace<small>Development environment</small></div></div>
      </aside>
      <main id="overview">
        <header className="topbar"><span>Workspace <span className="divider">/</span> <strong>Overview</strong></span><span className="version">v0.1.0 <span className="dot" /> Phase 1</span></header>
        <div className="content">
          <div className="page-heading"><div><p className="eyebrow">YOUR ENGINEERING COMMAND CENTER</p><h1>Build what comes next.</h1><p>A connected foundation for intelligent software engineering.</p></div><a className="button secondary" href="#roadmap">Explore the roadmap <span>↗</span></a></div>
          <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><span className="hero-label"><span className="dot" /> FOUNDATION RELEASE</span><h2 id="hero-title">From first idea.<br />To software that ships.</h2><p>DevForge AI is taking shape. Your interface, API, and data layer are connected in one modular engineering workspace.</p><a className="button primary" href="#platform">View platform health <span>↓</span></a></div><div className="forge-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="forge-core">D<span>↗</span></div><span className="art-label label-one">INTERFACE</span><span className="art-label label-two">API</span><span className="art-label label-three">DATA</span></div></section>
          <section id="platform" aria-labelledby="platform-title"><div className="section-heading"><div><h2 id="platform-title">Platform health</h2><p>Live infrastructure status · refreshes every 30 seconds</p></div><button className="button secondary" onClick={() => { setChecking(true); void refresh(); }} disabled={checking}>{checking ? "Checking…" : "↻ Refresh"}</button></div>
            <div className="status-grid" aria-live="polite" aria-busy={checking}>
              <StatusCard symbol="▣" title="Frontend" subtitle="Next.js · TypeScript" state="Operational" healthy />
              <StatusCard symbol="⌘" title="Backend API" subtitle="Python · FastAPI" state={!health ? "Checking" : apiUp ? "Operational" : "Unavailable"} healthy={apiUp} />
              <StatusCard symbol="▤" title="Database" subtitle="PostgreSQL · Persistent storage" state={!health ? "Checking" : health.database === "connected" ? "Connected" : health.database === "unknown" ? "Unknown" : "Unavailable"} healthy={health?.database === "connected"} />
            </div><p className="health-note">{updated ? `Last checked at ${updated}` : "Connecting to the platform…"}{health && health.status !== "healthy" ? " · Start the backend and PostgreSQL to bring all services online." : ""}</p>
          </section>
          <section id="roadmap" aria-labelledby="roadmap-title"><div className="section-heading"><div><h2 id="roadmap-title">The road ahead</h2><p>A foundation today. An autonomous engineering lifecycle tomorrow.</p></div><span className="muted-pill">PLANNED CAPABILITIES</span></div><div className="capability-grid">{capabilities.map(([number, title, subtitle, description]) => <article className="capability" key={number}><div className="capability-top"><span>{number}</span><span className="planned">Planned</span></div><h3>{title}</h3><h4>{subtitle}</h4><p>{description}</p></article>)}</div></section>
          <div className="foundation-note"><span className="note-icon">◇</span><div><h3>Designed for the long run</h3><p>Modular services, typed interfaces, and containerized infrastructure. Advanced AI workflows will arrive in future phases.</p></div><span className="phase-tag">FOUNDATION READY</span></div>
          <footer>DevForge AI <span>Engineering, thoughtfully connected.</span></footer>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ symbol, title, subtitle, state, healthy }: { symbol: string; title: string; subtitle: string; state: string; healthy?: boolean }) {
  return <article className="status-card"><div className="status-top"><span className="service-icon" aria-hidden="true">{symbol}</span><span className={`service-state ${healthy ? "good" : "pending"}`}><span className="dot" />{state}</span></div><h3>{title}</h3><p>{subtitle}</p></article>;
}
