// Gera dashboard.svg com o estado dos deploys da Vercel e do Render.
// Node 20+ (fetch nativo). Sem dependências.
//
// Variáveis de ambiente:
//   VERCEL_TOKEN       (obrigatória)  token criado em vercel.com/account/tokens
//   VERCEL_TEAM_SLUG   (recomendada)  ex.: paulo-araujo  (slug da URL vercel.com/paulo-araujo)
//   VERCEL_TEAM_ID     (opcional)     team_xxx — tem prioridade sobre o slug
//   RENDER_API_KEY     (obrigatória)  Render > Account Settings > API Keys

import { writeFileSync } from "node:fs";

const {
  VERCEL_TOKEN,
  VERCEL_TEAM_SLUG = "paulo-araujo",
  VERCEL_TEAM_ID,
  RENDER_API_KEY,
} = process.env;

async function getJson(url, headers) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${new URL(url).host}`);
  return res.json();
}

async function fetchVercel() {
  if (!VERCEL_TOKEN) throw new Error("VERCEL_TOKEN ausente");
  const qs = new URLSearchParams({ limit: "100" });
  if (VERCEL_TEAM_ID) qs.set("teamId", VERCEL_TEAM_ID);
  else if (VERCEL_TEAM_SLUG) qs.set("slug", VERCEL_TEAM_SLUG);

  const data = await getJson(`https://api.vercel.com/v9/projects?${qs}`, {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
  });

  return (data.projects ?? []).map((p) => {
    const dep = p.targets?.production ?? p.latestDeployments?.[0];
    return {
      name: p.name,
      kind: p.framework ?? "project",
      online: dep?.readyState === "READY",
      ts: dep?.createdAt ?? p.updatedAt,
    };
  });
}

async function fetchRender() {
  if (!RENDER_API_KEY) throw new Error("RENDER_API_KEY ausente");
  const data = await getJson("https://api.render.com/v1/services?limit=100", {
    Authorization: `Bearer ${RENDER_API_KEY}`,
  });
  return data.map(({ service: s }) => ({
    name: s.name,
    kind: String(s.type).replace(/_/g, " "),
    online: s.suspended !== "suspended",
    ts: s.updatedAt,
  }));
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

function age(ts) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 60000));
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
}

const MAX_ROWS = 7;

function card({ x, title, icon, color, items, error }) {
  const online = items.filter((i) => i.online).length;
  const sorted = [...items].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const shown = sorted.slice(0, MAX_ROWS);
  const extra = sorted.length - shown.length;

  let body = "";
  if (error) {
    body = `<text x="${x + 280}" y="330" text-anchor="middle" class="muted">// falha na sincronização</text>
    <text x="${x + 280}" y="356" text-anchor="middle" class="muted small">${esc(error)}</text>`;
  } else if (!items.length) {
    body = `<text x="${x + 280}" y="340" text-anchor="middle" class="muted">// nenhum projeto encontrado</text>`;
  } else {
    body = shown
      .map((p, i) => {
        const y = 232 + i * 44;
        const dot = p.online ? "#39ff88" : "#ff5d73";
        return `<circle cx="${x + 40}" cy="${y - 5}" r="5" fill="${dot}"/>
    <text x="${x + 62}" y="${y}" class="name">${esc(p.name)}</text>
    <text x="${x + 330}" y="${y}" class="muted small">${esc(p.kind)}</text>
    <text x="${x + 540}" y="${y}" text-anchor="end" class="muted">${age(p.ts)}</text>`;
      })
      .join("\n    ");
    if (extra > 0) body += `\n    <text x="${x + 62}" y="${232 + MAX_ROWS * 44}" class="muted small">+${extra} projetos</text>`;
  }

  return `<rect x="${x}" y="120" width="580" height="390" rx="22" class="card" stroke="${color}"/>
  <text x="${x + 28}" y="168" class="cardtitle" fill="${color}">${icon} ${title}</text>
  <text x="${x + 552}" y="168" text-anchor="end" class="muted"><tspan class="count">${online}</tspan>/${items.length} online</text>
  <line x1="${x + 28}" y1="190" x2="${x + 552}" y2="190" stroke="${color}" stroke-opacity=".25"/>
    ${body}`;
}

const [v, r] = await Promise.allSettled([fetchVercel(), fetchRender()]);
for (const [n, res] of [["Vercel", v], ["Render", r]]) {
  if (res.status === "rejected") console.log(`::warning::${n}: ${res.reason.message}`);
}

const vItems = v.status === "fulfilled" ? v.value : [];
const rItems = r.status === "fulfilled" ? r.value : [];
const total = vItems.length + rItems.length;
const stamp = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 600" width="1240" height="600" role="img" aria-label="Painel de deploys Vercel e Render">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05060f"/><stop offset="1" stop-color="#14102b"/></linearGradient>
    <linearGradient id="title" x1="0" x2="1"><stop offset="0" stop-color="#00f5ff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#7c9cff" stroke-opacity=".05"/></pattern>
  </defs>
  <style>
    text{font-family:'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace}
    .card{fill:#0d0d1f;fill-opacity:.85;stroke-width:1.5}
    .cardtitle{font-size:22px;font-weight:700;letter-spacing:3px}
    .name{font-size:18px;fill:#e8ecff}
    .muted{font-size:15px;fill:#8791c4}
    .small{font-size:14px;letter-spacing:1px}
    .count{font-size:22px;font-weight:700;fill:#fff}
  </style>
  <rect width="1240" height="600" rx="18" fill="url(#bg)"/>
  <rect width="1240" height="600" rx="18" fill="url(#grid)"/>
  <text x="50" y="70" font-size="34" font-weight="700" letter-spacing="4" fill="url(#title)">DEPLOY CONTROL CENTER</text>
  <text x="50" y="98" class="muted">Vercel + Render · ${total} projetos monitorados</text>
  ${card({ x: 40, title: "VERCEL", icon: "▲", color: "#00f5ff", items: vItems, error: v.status === "rejected" ? v.reason.message : null })}
  ${card({ x: 620, title: "RENDER", icon: "◆", color: "#a78bfa", items: rItems, error: r.status === "rejected" ? r.reason.message : null })}
  <text x="620" y="560" text-anchor="middle" class="muted small">SYNC ${stamp}</text>
</svg>
`;

writeFileSync("dashboard.svg", svg);
console.log(`dashboard.svg gerado: Vercel ${vItems.length}, Render ${rItems.length}`);
