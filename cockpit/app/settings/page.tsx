import { loadDomain } from "@/lib/weaveHome";
import { MirrorBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const domain = await loadDomain();
  return (
    <>
      <h1 className="page-title">Settings / Data Source</h1>
      <p className="page-sub">Make the proof boundary explicit and honest</p>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div>
          <div className="panel">
            <div className="h2">Data source</div>
            <div className="row" style={{ borderColor: domain.source === "fixture" ? "var(--accent)" : undefined }}>
              <div>
                <div className="sec">Fixture data {domain.source === "fixture" && "· selected"}</div>
                <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>bundled demo Domain</div>
              </div>
            </div>
            <div className="row">
              <div>
                <div className="sec">Live local Domain {domain.source === "live" && "· selected"}</div>
                <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>set the WEAVE_HOME env var to a real runs/ home</div>
              </div>
            </div>
            <div className="kv" style={{ marginTop: 10 }}>
              <span className="k">Resolved path</span>
              <span className="mono muted">{domain.source_path}</span>
            </div>
          </div>

          <div className="panel">
            <div className="h2">Node</div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 10 }}>
              the local host this cockpit reads — Agents run and state is kept here
            </div>
            <div className="kv"><span className="k">Node ID</span><span className="mono">{domain.node?.node_id ?? "local-node"}</span></div>
            <div className="kv"><span className="k">Kind</span><span>{domain.node?.kind ?? "local"}</span></div>
            <div className="kv"><span className="k">Host</span><span>{domain.node?.host ?? "local machine"}</span></div>
            <div className="kv"><span className="k">State path</span><span className="mono muted">{domain.node?.state_path ?? domain.source_path}</span></div>
            {domain.node?.hosts_agents && domain.node.hosts_agents.length > 0 && (
              <div className="kv"><span className="k">Agents</span><span>{domain.node.hosts_agents.join(" · ")}</span></div>
            )}
          </div>

          <div className="panel">
            <div className="h2">Proof boundary</div>
            <ul className="tight muted" style={{ fontSize: "var(--fs-sm)" }}>
              <li>Local-only cockpit — reads/writes files on this machine only.</li>
              <li>No secrets are read, requested, or shown.</li>
              <li>External actions (deploy, Slack/Linear/GitHub writes) are SIMULATED only.</li>
              <li>Owner actions persist to a local overlay file (survives refresh / restart).</li>
              <li>Not production · not externally verified.</li>
            </ul>
            <div className="row" style={{ display: "block", marginTop: 8 }}>
              <div className="muted" style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>What this proves vs. doesn’t</div>
              <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>
                proves: the cockpit renders WEAVE state &amp; records local decisions — nothing external.
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="h2">Mirrors</div>
          <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 10 }}>
            reflect or carry state — never the source of truth
          </div>
          {domain.mirrors.map((m) => (
            <div key={m.tool} className="row" style={{ display: "block" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <MirrorBadge mirror={m} />
                <span className="spacer" />
                <span className="tag">{m.connection}</span>
              </div>
            </div>
          ))}
          <div className="row" style={{ display: "block", marginTop: 8 }}>
            <div className="sec" style={{ fontWeight: 700 }}>About</div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>WEAVE 0.2 — draft, not final. Owner cockpit MVP · local sprint deliverable.</div>
          </div>
        </div>
      </div>
    </>
  );
}
