// Gera hero.svg, stack.svg, dashboard.svg e activity.svg. Uso: node dashboard/generate.mjs
import { readFileSync, writeFileSync } from "node:fs";

const { VERCEL_TOKEN, VERCEL_TEAM_ID, RENDER_API_KEY, GH_TOKEN, GITHUB_TOKEN, DATA_FILE } = process.env;
const OWNER = "pauloaraujodeveloper", NAME = "PAULO ARAÚJO";
const OK = ["READY", "LIVE"];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ago = (d) => { const m = (Date.now() - new Date(d)) / 6e4; return m < 60 ? `${~~m}m` : m < 1440 ? `${~~(m / 60)}h` : `${~~(m / 1440)}d`; };
const safe = async (fn, fb = []) => { try { return await fn(); } catch (e) { console.warn(fn.name, "falhou:", e.message); return fb; } };
const save = (f, s) => { writeFileSync(f, s); console.log("gerado", f); };

// ---------- moldura compartilhada ----------
const frame = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#04060d"/><stop offset=".55" stop-color="#0b1028"/><stop offset="1" stop-color="#150f33"/></linearGradient>
  <linearGradient id="ttl" x1="0" x2="1"><stop offset="0" stop-color="#00f5ff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00f5ff" stop-opacity=".45"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></linearGradient>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#7aa2ff" stroke-opacity=".07"/></pattern>
  <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <style>
    text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
    .h{font-size:20px;font-weight:700;letter-spacing:2px}
    .t{font-size:15px;font-weight:700;letter-spacing:1.5px}
    .n{font-size:13px;fill:#dbe7ff}
    .k{font-size:11px;fill:#7d8fb8;letter-spacing:.5px}
  </style>
</defs>
<rect width="${w}" height="${h}" rx="18" fill="url(#bg)"/><rect width="${w}" height="${h}" rx="18" fill="url(#grid)"/>
<rect y="-2" width="${w}" height="3" fill="#00f5ff" fill-opacity=".22"><animate attributeName="y" values="0;${h};0" dur="9s" repeatCount="indefinite"/></rect>
${body}
</svg>`;

// ---------- hero ----------
function hero() {
  const lines = ["Construindo o futuro linha a linha", "Desenvolvedor de software | Web & Automação", "Transformando ideias em produtos reais", "Sempre aprendendo, sempre evoluindo"];
  const typed = lines.map((l, i) => `<text x="48" y="190" font-size="18" fill="#00f5ff" opacity="0">› ${esc(l)}<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.04;.21;.25;1" dur="16s" begin="${i * 4}s" repeatCount="indefinite"/></text>`).join("");
  const ring = (r, d, dir) => `<circle cx="730" cy="120" r="${r}" fill="none" stroke="#a78bfa" stroke-opacity=".45" stroke-dasharray="${d}"><animateTransform attributeName="transform" type="rotate" from="0 730 120" to="${dir * 360} 730 120" dur="${r / 3}s" repeatCount="indefinite"/></circle>`;
  return frame(860, 240, `
<circle cx="730" cy="120" r="5" fill="#00f5ff" filter="url(#glow)"/>${ring(36, "4 10", 1)}${ring(66, "2 14", -1)}${ring(98, "30 18", 1)}
<circle cx="52" cy="46" r="4" fill="#39ff88"><animate attributeName="opacity" values="1;.25;1" dur="2s" repeatCount="indefinite"/></circle>
<text x="66" y="50" class="k">STATUS · ONLINE · DISPONÍVEL PARA PROJETOS</text>
<text x="48" y="112" font-size="54" font-weight="800" letter-spacing="3" fill="url(#ttl)" filter="url(#glow)">${NAME}</text>
<text x="50" y="142" font-size="14" letter-spacing="5" fill="#a78bfa">DEVELOPER • BUILDING THE FUTURE</text>
${typed}`);
}

// ---------- stack ----------
function stack() {
  const items = [["JavaScript", "#f7df1e"], ["TypeScript", "#3178c6"], ["HTML5", "#e44d26"], ["CSS3", "#2965f1"], ["React", "#61dafb"], ["Next.js", "#ffffff"], ["Node.js", "#5fa04e"], ["PostgreSQL", "#4169e1"], ["Git", "#f05032"], ["GitHub", "#c9d1d9"], ["Vercel", "#ffffff"], ["Render", "#46e3b7"]];
  const pills = items.map(([n, c]) => ({ n, c, w: Math.round(n.length * 8 + 44) }));
  const rows = []; let cur = [], cw = 0;
  for (const p of pills) { if (cw + p.w > 800 && cur.length) { rows.push(cur); cur = []; cw = 0; } cur.push(p); cw += p.w + 12; }
  rows.push(cur);
  const body = rows.map((r, ri) => {
    let x = (860 - (r.reduce((a, p) => a + p.w + 12, 0) - 12)) / 2;
    return r.map((p) => { const g = `<g transform="translate(${x} ${70 + ri * 48})"><rect width="${p.w}" height="34" rx="17" fill="#0a1020" fill-opacity=".8" stroke="${p.c}" stroke-opacity=".5" filter="url(#glow)"/><circle cx="18" cy="17" r="4" fill="${p.c}"/><text x="32" y="22" class="n">${esc(p.n)}</text></g>`; x += p.w + 12; return g; }).join("");
  }).join("");
  return frame(860, 80 + rows.length * 48, `<text x="30" y="40" class="h" fill="url(#ttl)">STACK // FERRAMENTAS</text>${body}`);
}

// ---------- dashboard (Vercel + Render) ----------
const vercel = async () => {
  if (!VERCEL_TOKEN) return [];
  const team = VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : "";
  const r = await fetch(`https://api.vercel.com/v9/projects?limit=20${team}`, { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
  return ((await r.json()).projects || []).map((p) => { const d = p.latestDeployments?.[0]; return { name: p.name, kind: p.framework || "static", state: d?.readyState || "—", at: d?.createdAt ?? p.updatedAt }; });
};
const render = async () => {
  if (!RENDER_API_KEY) return [];
  const r = await fetch("https://api.render.com/v1/services?limit=20", { headers: { Authorization: `Bearer ${RENDER_API_KEY}` } });
  return (await r.json()).map(({ service: s }) => ({ name: s.name, kind: s.type.replace("_", " "), state: s.suspended === "suspended" ? "SUSPENDED" : "LIVE", at: s.updatedAt }));
};

function panel(x, title, glyph, color, items) {
  const live = items.filter((i) => OK.includes(i.state)).length;
  const rows = items.slice(0, 6).map((it, i) => {
    const ok = OK.includes(it.state), c = ok ? "#39ff88" : it.state === "BUILDING" ? "#ffc247" : "#ff4d6d";
    return `<g transform="translate(18 ${64 + i * 34})"><circle cx="6" cy="12" r="4" fill="${c}">${ok ? `<animate attributeName="opacity" values="1;.25;1" dur="2.4s" begin="${i * 0.35}s" repeatCount="indefinite"/>` : ""}</circle><text x="22" y="16" class="n">${esc(it.name.slice(0, 22))}</text><text x="268" y="16" class="k" text-anchor="end">${esc(it.kind)}</text><text x="364" y="16" class="k" text-anchor="end">${it.at ? ago(it.at) : "—"}</text></g>`;
  }).join("");
  const empty = items.length ? "" : `<text x="200" y="150" class="k" text-anchor="middle">// aguardando sincronização</text>`;
  return `<g transform="translate(${x} 88)"><rect width="400" height="288" rx="14" fill="#0a1020" fill-opacity=".72" stroke="${color}" stroke-opacity=".55" filter="url(#glow)"/><text x="18" y="34" class="t" fill="${color}">${glyph} ${title}</text><text x="382" y="34" class="t" text-anchor="end" fill="#e8f1ff">${live}<tspan class="k">/${items.length} online</tspan></text><line x1="18" y1="48" x2="382" y2="48" stroke="${color}" stroke-opacity=".3"/>${rows}${empty}</g>`;
}
const dashboard = (d) => frame(860, 410, `
<text x="30" y="46" class="h" fill="url(#ttl)">DEPLOY CONTROL CENTER</text>
<text x="30" y="68" class="k">Vercel + Render · ${d.vercel.length + d.render.length} projetos monitorados</text>
${panel(20, "VERCEL", "▲", "#00f5ff", d.vercel)}${panel(440, "RENDER", "◆", "#a78bfa", d.render)}
<text x="430" y="398" class="k" text-anchor="middle">SYNC ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC</text>`);

// ---------- atividade (GitHub GraphQL) ----------
const activityData = async () => {
  const token = GH_TOKEN || GITHUB_TOKEN; if (!token) return [];
  const query = `query($l:String!,$f:DateTime!,$t:DateTime!){user(login:$l){contributionsCollection(from:$f,to:$t){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
  const r = await fetch("https://api.github.com/graphql", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ query, variables: { l: OWNER, f: new Date(Date.now() - 32 * 864e5).toISOString(), t: new Date().toISOString() } }) });
  const j = await r.json();
  return j.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount })).slice(-31);
};
function activity(days) {
  const W = 860, H = 300, L = 56, R = 30, T = 96, B = 46;
  const head = `<text x="30" y="46" class="h" fill="url(#ttl)">ATIVIDADE // ÚLTIMOS 31 DIAS</text>`;
  if (!days.length) return frame(W, H, `${head}<text x="430" y="170" class="k" text-anchor="middle">// aguardando primeira sincronização</text>`);
  const max = Math.max(1, ...days.map((d) => d.count)), total = days.reduce((a, d) => a + d.count, 0);
  const pts = days.map((d, i) => [L + (i * (W - L - R)) / Math.max(1, days.length - 1), T + (H - T - B) * (1 - d.count / max)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const peak = days.findIndex((d) => d.count === max);
  const grid = [0, 1, 2, 3].map((i) => { const y = T + ((H - T - B) * i) / 3; return `<line x1="${L}" y1="${y}" x2="${W - R}" y2="${y}" stroke="#7aa2ff" stroke-opacity=".12"/><text x="${L - 10}" y="${y + 4}" class="k" text-anchor="end">${Math.round(max * (1 - i / 3))}</text>`; }).join("");
  const xl = days.map((d, i) => (i % 5 === 0 ? `<text x="${pts[i][0]}" y="${H - 18}" class="k" text-anchor="middle">${d.date.slice(8)}/${d.date.slice(5, 7)}</text>` : "")).join("");
  return frame(W, H, `${head}
<text x="30" y="68" class="k">${total} contribuições · pico de ${max} em ${days[peak].date.slice(8)}/${days[peak].date.slice(5, 7)} · média ${(total / days.length).toFixed(1)}/dia</text>
${grid}${xl}
<path d="${line} L${pts.at(-1)[0]},${H - B} L${pts[0][0]},${H - B}Z" fill="url(#area)"/>
<path d="${line}" fill="none" stroke="#00f5ff" stroke-width="2.4" stroke-linejoin="round" filter="url(#glow)"/>
<circle cx="${pts[peak][0]}" cy="${pts[peak][1]}" r="5" fill="#fff" filter="url(#glow)"><animate attributeName="r" values="5;8;5" dur="2.4s" repeatCount="indefinite"/></circle>`);
}

// ---------- execução ----------
const fixture = DATA_FILE ? JSON.parse(readFileSync(DATA_FILE, "utf8")) : null;
const data = fixture ?? { vercel: await safe(vercel), render: await safe(render), activity: await safe(activityData) };
save("hero.svg", hero());
save("stack.svg", stack());
save("dashboard.svg", dashboard(data));
save("activity.svg", activity(data.activity || []));
