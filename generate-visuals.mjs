// Gera os visuais do perfil: badges.svg, stack.svg e deploys.svg (somente Render).
// Node 20+ (fetch nativo). Sem dependências.
//
// Variáveis de ambiente:
//   RENDER_API_KEY  Render > Account Settings > API Keys
//   DEMO=1          usa dados de exemplo (sem chamar a API), útil para testar o visual
//
// Para mudar sua stack, edite o array STACK logo abaixo.

import { writeFileSync } from "node:fs";

const { RENDER_API_KEY, DEMO } = process.env;

/* ───────────────────────── STACK (edite aqui) ───────────────────────── */
// [nome, monograma, cor]
const STACK = [
  { group: "FRONT-END", color: "#00f5ff", items: [
    ["HTML5", "H5", "#e34f26"], ["CSS3", "C3", "#1c9bef"], ["JavaScript", "JS", "#f7df1e"],
    ["TypeScript", "TS", "#3b8eea"], ["React", "Re", "#61dafb"],
  ]},
  { group: "BACK-END", color: "#a78bfa", items: [
    ["Node.js", "No", "#6cc24a"], ["Express", "Ex", "#e8ecff"], ["REST API", "API", "#a78bfa"], ["JWT", "JWT", "#ff4d8d"],
  ]},
  { group: "DADOS", color: "#39ff88", items: [
    ["PostgreSQL", "Pg", "#5b9bd5"], ["Neon", "Ne", "#39ff88"],
  ]},
  { group: "AUTOMAÇÃO", color: "#ffb454", items: [
    ["Chatbot", "Bot", "#ffb454"], ["Webhooks", "Wh", "#ff8fab"], ["CI/CD", "CI", "#2f9bff"],
  ]},
  { group: "INFRA", color: "#46e3b7", items: [
    ["Render", "Rn", "#46e3b7"], ["GitHub", "Gh", "#e8ecff"], ["Git", "Gt", "#f05032"],
  ]},
];

/* ───────────────────────── Utilidades ───────────────────────── */
const FONT = "'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace";
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));

function age(ts) {
  const m = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 60000));
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}d`;
}

const baseDefs = (id) => `
  <defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#05060f"/><stop offset="1" stop-color="#120e28"/></linearGradient>
    <linearGradient id="${id}edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00f5ff"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
    <linearGradient id="${id}title" x1="0" x2="1"><stop offset="0" stop-color="#00f5ff"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient>
    <radialGradient id="${id}glowA" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7c3aed" stop-opacity=".35"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}glowB" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#00f5ff" stop-opacity=".22"/><stop offset="1" stop-color="#00f5ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}sweep" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#9fe8ff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="${id}grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#7c9cff" stroke-opacity=".05"/></pattern>
    <clipPath id="${id}clip"><rect width="__W__" height="__H__" rx="22"/></clipPath>
  </defs>`;

const baseStyle = `
  <style>
    text{font-family:${FONT}}
    .muted{fill:#8791c4}
    .tile{transform-box:fill-box}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes sweep{from{transform:translateX(-360px)}to{transform:translateX(1500px)}}
    @keyframes ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
    @keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
    .float{animation:float 4.5s ease-in-out infinite}
    .sweep{animation:sweep 8s linear infinite}
    .ping{transform-box:fill-box;transform-origin:center;animation:ping 2.2s ease-out infinite}
    .rise{animation:rise .6s ease-out both}
    .blink{animation:blink 1.6s ease-in-out infinite}
  </style>`;

function frame(id, W, H, inner) {
  const defs = baseDefs(id).replaceAll("__W__", W).replaceAll("__H__", H);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
${defs}${baseStyle}
  <rect width="${W}" height="${H}" rx="22" fill="url(#${id}bg)"/>
  <rect width="${W}" height="${H}" rx="22" fill="url(#${id}grid)"/>
  <circle cx="${W - 120}" cy="40" r="260" fill="url(#${id}glowA)"/>
  <circle cx="90" cy="${H - 30}" r="240" fill="url(#${id}glowB)"/>
  <g clip-path="url(#${id}clip)"><rect class="sweep" x="0" y="0" width="360" height="${H}" fill="url(#${id}sweep)"/></g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21.5" fill="none" stroke="url(#${id}edge)" stroke-opacity=".55" stroke-width="1.5"/>
${inner}
</svg>
`;
}

/* ───────────────────────── Dados do Render ───────────────────────── */
const TYPE_LABEL = {
  web_service: "web service", static_site: "static site", background_worker: "worker",
  cron_job: "cron job", private_service: "private service",
};

async function fetchRender() {
  if (DEMO) {
    const now = Date.now();
    const d = (name, type, min) => ({ name, kind: TYPE_LABEL[type], online: true, ts: new Date(now - min * 60000).toISOString(), url: `${name}.onrender.com` });
    return [
      d("agendfy-chatbot", "web_service", 53), d("agendfy", "web_service", 60),
      d("nexora", "static_site", 8 * 1440), d("omnitask", "static_site", 11 * 1440),
      d("to-do-list", "static_site", 16 * 1440), d("linktree", "static_site", 24 * 1440),
    ];
  }
  if (!RENDER_API_KEY) throw new Error("RENDER_API_KEY ausente");
  const res = await fetch("https://api.render.com/v1/services?limit=100", {
    headers: { Accept: "application/json", Authorization: `Bearer ${RENDER_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Render API: HTTP ${res.status}`);
  const data = await res.json();
  return data.map(({ service: s }) => ({
    name: s.name,
    kind: TYPE_LABEL[s.type] ?? String(s.type).replace(/_/g, " "),
    online: s.suspended !== "suspended",
    ts: s.updatedAt,
    url: (s.serviceDetails?.url ?? "").replace(/^https?:\/\//, ""),
  }));
}

/* ───────────────────────── deploys.svg ───────────────────────── */
function deploysSvg(items, error, stamp) {
  const W = 1240, ROW = 58, MAX = 8;
  const sorted = [...items].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const shown = sorted.slice(0, MAX);
  const extra = sorted.length - shown.length;
  const online = items.filter((i) => i.online).length;
  const total = items.length;
  const rows = Math.max(shown.length, 4);
  const panelH = rows * ROW + 48;
  const top = 118;
  const H = top + panelH + 64;

  const C = 2 * Math.PI * 78;
  const pct = total ? Math.round((online / total) * 100) : 0;
  const filled = total ? (C * online) / total : 0;
  const cx = 205, cy = top + panelH / 2 - 14;

  let list = "";
  if (error) {
    list = `<text x="795" y="${top + panelH / 2 - 6}" text-anchor="middle" font-size="17" class="muted">// falha na sincronização</text>
    <text x="795" y="${top + panelH / 2 + 22}" text-anchor="middle" font-size="13" class="muted">${esc(error)}</text>`;
  } else if (!total) {
    list = `<text x="795" y="${top + panelH / 2}" text-anchor="middle" font-size="17" class="muted">// nenhum serviço encontrado</text>`;
  } else {
    list = shown.map((p, i) => {
      const ry = top + 24 + i * ROW;
      const color = p.online ? "#39ff88" : "#ff5d73";
      return `<g class="rise" style="animation-delay:${0.08 * i}s">
      <rect x="418" y="${ry}" width="752" height="48" rx="13" fill="#10142b" stroke="#2a3060" stroke-opacity=".7"/>
      <rect x="418" y="${ry}" width="4" height="48" rx="2" fill="${color}"/>
      <circle class="ping" cx="446" cy="${ry + 24}" r="5" fill="${color}"/>
      <circle cx="446" cy="${ry + 24}" r="5" fill="${color}"/>
      <text x="470" y="${ry + 21}" font-size="18" fill="#f1f4ff" font-weight="600">${esc(p.name)}</text>
      <text x="470" y="${ry + 38}" font-size="12" class="muted">${esc(p.url || "—")}</text>
      <rect x="872" y="${ry + 12}" width="130" height="24" rx="12" fill="#a78bfa" fill-opacity=".12" stroke="#a78bfa" stroke-opacity=".5"/>
      <text x="937" y="${ry + 28}" text-anchor="middle" font-size="12" fill="#c4b5fd" letter-spacing="1">${esc(p.kind)}</text>
      <text x="1042" y="${ry + 29}" font-size="12" fill="${color}" letter-spacing="2" font-weight="700">${p.online ? "LIVE" : "OFF"}</text>
      <text x="1152" y="${ry + 30}" text-anchor="end" font-size="16" fill="#cfd6ff">${age(p.ts)}</text>
    </g>`;
    }).join("\n    ");
    if (extra > 0) list += `\n    <text x="418" y="${top + 24 + shown.length * ROW + 6}" font-size="13" class="muted">+${extra} serviços</text>`;
  }

  const inner = `
  <text x="50" y="68" font-size="34" font-weight="800" letter-spacing="4" fill="url(#dtitle)">DEPLOY CONTROL CENTER</text>
  <text x="50" y="96" font-size="14" letter-spacing="1" class="muted">Render · ${total} ${total === 1 ? "serviço monitorado" : "serviços monitorados"} · produção</text>

  <rect x="1060" y="46" width="130" height="32" rx="16" fill="#39ff88" fill-opacity=".1" stroke="#39ff88" stroke-opacity=".6"/>
  <circle class="ping" cx="1082" cy="62" r="4" fill="#39ff88"/><circle cx="1082" cy="62" r="4" fill="#39ff88"/>
  <text x="1102" y="67" font-size="13" font-weight="700" letter-spacing="3" fill="#39ff88" class="blink">LIVE</text>

  <rect x="40" y="${top}" width="340" height="${panelH}" rx="20" fill="#0b0e22" fill-opacity=".85" stroke="#46e3b7" stroke-opacity=".55" stroke-width="1.5"/>
  <defs><linearGradient id="dring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00f5ff"/><stop offset="1" stop-color="#39ff88"/></linearGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="#1b2048" stroke-width="12"/>
  <circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="url(#dring)" stroke-width="12" stroke-linecap="round"
          stroke-dasharray="${filled.toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})">
    <animate attributeName="stroke-dasharray" from="0 ${C.toFixed(1)}" to="${filled.toFixed(1)} ${C.toFixed(1)}" dur="1.4s" fill="freeze"/>
  </circle>
  <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="42" font-weight="800" fill="#fff">${online}<tspan font-size="24" fill="#8791c4">/${total}</tspan></text>
  <text x="${cx}" y="${cy + 32}" text-anchor="middle" font-size="13" letter-spacing="4" fill="#46e3b7">ONLINE</text>
  <text x="${cx}" y="${cy + 78 + 34}" text-anchor="middle" font-size="13" letter-spacing="2" class="muted">${pct}% OPERACIONAL</text>

  <rect x="400" y="${top}" width="800" height="${panelH}" rx="20" fill="#0b0e22" fill-opacity=".85" stroke="url(#dedge)" stroke-opacity=".7" stroke-width="1.5"/>
    ${list}

  <text x="${W / 2}" y="${H - 26}" text-anchor="middle" font-size="12" letter-spacing="3" class="muted">SYNC ${stamp}</text>`;

  return frame("d", W, H, inner);
}

/* ───────────────────────── stack.svg ───────────────────────── */
function stackSvg() {
  const W = 1240, ROW = 78, top = 112, LX = 50, CX0 = 262, CW = 168, GAP = 12;
  const H = top + STACK.length * ROW + 28;

  const rows = STACK.map((g, r) => {
    const y = top + r * ROW;
    const chips = g.items.map(([name, mono, color], i) => {
      const x = CX0 + i * (CW + GAP);
      const mfs = mono.length > 2 ? 12 : 15;
      return `<g class="float" style="animation-delay:${((r * 5 + i) * 0.37).toFixed(2)}s">
      <rect x="${x}" y="${y}" width="${CW}" height="52" rx="14" fill="#10142b" stroke="${color}" stroke-opacity=".38"/>
      <rect x="${x + 9}" y="${y + 9}" width="34" height="34" rx="9" fill="${color}" fill-opacity=".14" stroke="${color}" stroke-opacity=".7"/>
      <text x="${x + 26}" y="${y + 31}" text-anchor="middle" font-size="${mfs}" font-weight="800" fill="${color}">${esc(mono)}</text>
      <text x="${x + 54}" y="${y + 31}" font-size="14" fill="#e8ecff">${esc(name)}</text>
    </g>`;
    }).join("\n    ");
    return `<rect x="${LX}" y="${y + 6}" width="4" height="40" rx="2" fill="${g.color}"/>
    <text x="${LX + 18}" y="${y + 31}" font-size="14" font-weight="700" letter-spacing="3" fill="${g.color}">${esc(g.group)}</text>
    ${chips}`;
  }).join("\n    ");

  const inner = `
  <text x="50" y="68" font-size="34" font-weight="800" letter-spacing="4" fill="url(#stitle)">STACK &amp; FERRAMENTAS</text>
  <text x="50" y="96" font-size="14" letter-spacing="1" class="muted">Do banco de dados ao deploy · web, SaaS e automação</text>
    ${rows}`;
  return frame("s", W, H, inner);
}

/* ───────────────────────── badges.svg ───────────────────────── */
function badgesSvg(onlineCount) {
  const W = 1240, H = 64;
  const pills = [
    { text: "ONLINE", color: "#39ff88", dot: true },
    { text: "WEB · AUTOMAÇÃO · SaaS", color: "#00f5ff" },
    { text: "FORTALEZA / CE", color: "#a78bfa" },
    { text: `${onlineCount} DEPLOYS NO AR`, color: "#46e3b7" },
  ].map((p) => ({ ...p, w: p.text.length * 10.4 + (p.dot ? 62 : 44) }));

  const gap = 16;
  const total = pills.reduce((s, p) => s + p.w, 0) + gap * (pills.length - 1);
  let x = (W - total) / 2;
  const body = pills.map((p) => {
    const px = x; x += p.w + gap;
    const tx = px + (p.dot ? 42 : 22);
    return `<g>
    <rect x="${px}" y="14" width="${p.w}" height="36" rx="18" fill="${p.color}" fill-opacity=".1" stroke="${p.color}" stroke-opacity=".6"/>
    ${p.dot ? `<circle class="ping" cx="${px + 24}" cy="32" r="5" fill="${p.color}"/><circle cx="${px + 24}" cy="32" r="5" fill="${p.color}"/>` : ""}
    <text x="${tx}" y="37" font-size="14" font-weight="700" letter-spacing="2" fill="${p.color}">${esc(p.text)}</text>
  </g>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Status do perfil">
  ${baseStyle}
  ${body}
</svg>
`;
}

/* ───────────────────────── Execução ───────────────────────── */
let items = [], error = null;
try {
  items = await fetchRender();
} catch (e) {
  error = e.message;
  console.log(`::warning::${error}`);
}

const stamp = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
const online = items.filter((i) => i.online).length;

// Se a API falhar, preserva os arquivos anteriores de deploys/badges e só regenera a stack.
writeFileSync("stack.svg", stackSvg());
if (!error) {
  writeFileSync("deploys.svg", deploysSvg(items, null, stamp));
  writeFileSync("badges.svg", badgesSvg(online));
} else if (DEMO || process.env.FORCE_ERROR_SVG) {
  writeFileSync("deploys.svg", deploysSvg([], error, stamp));
}
console.log(`Gerado: stack.svg${error ? "" : ", deploys.svg, badges.svg"} (Render: ${items.length} serviços, ${online} online)`);
