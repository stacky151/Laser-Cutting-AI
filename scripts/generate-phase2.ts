import fs from "fs";
import path from "path";

// ============================================================
// CutCAD.ai — Phase 2 Dataset Generator
// Generates PROMPT → SVG pairs with mathematically correct geometry.
// This teaches the model to OUTPUT valid SVG, not just describe it.
// ============================================================

const OUT_DIR = path.join(process.cwd(), "dataset", "phase2");
const JSONL_PATH = path.join(OUT_DIR, "phase2.jsonl");

// ─────────────────────────────────────────────────────────────
// SVG MATH LIBRARY
// ─────────────────────────────────────────────────────────────

/** Wrap paths in a properly-sized SVG document */
function makeSVG(width: number, height: number, paths: string[]): string {
  const pad = 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}" width="${width + pad * 2}mm" height="${height + pad * 2}mm">
  <g fill="none" stroke="#000000" stroke-width="0.1">
    ${paths.join("\n    ")}
  </g>
</svg>`;
}

/** Round to 3 decimal places */
const r = (n: number) => Math.round(n * 1000) / 1000;

// ─────────────────────────────────────────────────────────────
// DESIGN GENERATORS
// ─────────────────────────────────────────────────────────────

/** 1. Simple rectangle (calibration cuts, signs, nameplates) */
function genRectangle(params: {
  width: number; height: number; kerf: number;
  cornerRadius?: number; hasHoles?: boolean;
}): string {
  const { width, height, kerf, cornerRadius = 0, hasHoles = false } = params;
  const k = kerf / 2;
  const w = r(width - k); const h = r(height - k);
  const paths: string[] = [];

  if (cornerRadius > 0) {
    const cr = r(cornerRadius);
    paths.push(`<rect x="0" y="0" width="${w}" height="${h}" rx="${cr}" ry="${cr}"/>`);
  } else {
    paths.push(`<rect x="0" y="0" width="${w}" height="${h}"/>`);
  }

  if (hasHoles) {
    const holeD = r(4 - kerf);
    const margin = 8;
    paths.push(`<circle cx="${margin}" cy="${margin}" r="${holeD / 2}"/>`);
    paths.push(`<circle cx="${r(w - margin)}" cy="${margin}" r="${holeD / 2}"/>`);
    paths.push(`<circle cx="${margin}" cy="${r(h - margin)}" r="${holeD / 2}"/>`);
    paths.push(`<circle cx="${r(w - margin)}" cy="${r(h - margin)}" r="${holeD / 2}"/>`);
  }

  return makeSVG(width, height, paths);
}

/** 2. Finger-joint box panel */
function genFingerJointPanel(params: {
  panelW: number; panelH: number; thickness: number; kerf: number;
  fingersW: boolean; fingersH: boolean; tabCount?: number;
}): string {
  const { panelW, panelH, thickness: t, kerf, fingersW, fingersH } = params;
  const k = kerf / 2;
  const tabSize = r(t * 2); // tab width = 2× material thickness

  function fingerPath(length: number, hasTabs: boolean): number[] {
    const pts: number[] = [0];
    const numTabs = Math.max(3, Math.floor(length / (tabSize * 2)));
    const segment = r(length / (numTabs * 2));
    for (let i = 0; i < numTabs * 2; i++) {
      pts.push(r(pts[pts.length - 1] + segment));
    }
    return pts;
  }

  const hSegs = fingerPath(panelW, fingersH);
  const vSegs = fingerPath(panelH, fingersW);
  const tabDepth = r(t - k);

  // Build path using M/L commands
  let d = `M 0,0 `;

  // Top edge
  if (fingersH) {
    hSegs.forEach((x, i) => {
      const y = i % 2 === 0 ? 0 : -tabDepth;
      if (i < hSegs.length - 1) d += `L ${r(x - k)},${y} L ${r(x - k + (i % 2 === 0 ? k : k))},${i % 2 === 0 ? -tabDepth : 0} `;
    });
  }
  d += `L ${r(panelW)},0 `;

  // Right edge
  if (fingersW) {
    vSegs.forEach((y, i) => {
      const x = i % 2 === 0 ? panelW : panelW + tabDepth;
      if (i < vSegs.length - 1) d += `L ${x},${r(y + k)} `;
    });
  }
  d += `L ${r(panelW)},${r(panelH)} `;

  // Bottom edge (reversed)
  d += `L 0,${r(panelH)} `;

  // Left edge (reversed)
  d += `Z`;

  return makeSVG(panelW + t, panelH + t, [`<path d="${d}"/>`]);
}

/** 3. Living hinge pattern */
function genLivingHinge(params: {
  width: number; height: number; kerf: number;
  slitLength?: number; slitSpacing?: number; rowSpacing?: number;
}): string {
  const {
    width, height, kerf,
    slitLength = 0, // 0 = auto: 80% of width
    slitSpacing = 3,
    rowSpacing = 2,
  } = params;

  const effectiveSlitLen = slitLength > 0 ? slitLength : r(width * 0.8);
  const offset = r((width - effectiveSlitLen) / 2);
  const paths: string[] = [];

  // Outer boundary
  paths.push(`<rect x="0" y="0" width="${r(width)}" height="${r(height)}"/>`);

  // Slit pattern — alternating offset rows
  let y = rowSpacing;
  let rowIndex = 0;
  while (y < height - rowSpacing) {
    const isOdd = rowIndex % 2 === 1;
    const x1 = isOdd ? 0 : offset;
    const x2 = isOdd ? r(width - offset) : width;
    paths.push(`<line x1="${r(x1)}" y1="${r(y)}" x2="${r(x2)}" y2="${r(y)}"/>`);
    y = r(y + slitSpacing);
    rowIndex++;
  }

  return makeSVG(width, height, paths);
}

/** 4. L-bracket / shelf support */
function genLBracket(params: {
  armLen: number; armWidth: number; thickness: number; kerf: number;
}): string {
  const { armLen, armWidth, thickness: t, kerf } = params;
  const k = kerf / 2;
  const al = r(armLen - k); const aw = r(armWidth - k); const tk = r(t - k);
  const d = `M 0,0 L ${al},0 L ${al},${aw} L ${tk},${aw} L ${tk},${al} L 0,${al} Z`;
  return makeSVG(armLen, armLen, [`<path d="${d}"/>`]);
}

/** 5. Phone stand (two-panel with slot) */
function genPhoneStand(params: {
  width: number; height: number; angle: number; thickness: number; kerf: number;
}): string {
  const { width, height, angle, thickness: t, kerf } = params;
  const k = kerf / 2;
  const rad = (angle * Math.PI) / 180;
  const slotW = r(t + kerf);
  const slotH = r(height / 2);
  const paths: string[] = [];

  // Base panel
  paths.push(`<rect x="0" y="0" width="${r(width - k)}" height="${r(height - k)}"/>`);
  // Slot for upright
  const slotX = r(width / 2 - slotW / 2);
  const slotY = r(height / 2);
  paths.push(`<rect x="${slotX}" y="${slotY}" width="${slotW}" height="${slotH}"/>`);

  // Upright panel (offset below)
  const uprightY = r(height + 20);
  paths.push(`<rect x="0" y="${uprightY}" width="${r(width - k)}" height="${r(height - k)}"/>`);
  // Slot in upright (top half)
  paths.push(`<rect x="${slotX}" y="${uprightY}" width="${slotW}" height="${slotH}"/>`);

  return makeSVG(width, uprightY + height, paths);
}

// ─────────────────────────────────────────────────────────────
// PROMPT TEMPLATE LIBRARY
// ─────────────────────────────────────────────────────────────

const RECT_PROMPTS = [
  (w: number, h: number, k: number) => `Generate SVG for a ${w}x${h}mm flat panel with ${k}mm kerf compensation.`,
  (w: number, h: number, k: number) => `Output only SVG. Rectangle ${w}mm wide, ${h}mm tall, kerf ${k}mm.`,
  (w: number, h: number, k: number) => `SVG cut file: flat sheet ${w}×${h}mm, laser kerf ${k}mm.`,
  (w: number, h: number, k: number) => `Create a laser cut rectangle ${w}mm x ${h}mm for a ${k}mm kerf laser.`,
];

const RECT_HOLE_PROMPTS = [
  (w: number, h: number, k: number) => `Generate SVG for a ${w}x${h}mm panel with 4mm mounting holes in each corner. Kerf: ${k}mm.`,
  (w: number, h: number, k: number) => `SVG nameplate ${w}×${h}mm with corner mounting holes, ${k}mm kerf.`,
];

const HINGE_PROMPTS = [
  (w: number, h: number, k: number) => `Generate an SVG living hinge pattern ${w}x${h}mm for ${k}mm kerf acrylic.`,
  (w: number, h: number, k: number) => `Create a flexible living hinge cut file, ${w}mm wide ${h}mm tall, ${k}mm kerf.`,
  (w: number, h: number, k: number) => `Output only SVG. Living hinge panel ${w}×${h}mm, kerf offset ${k}mm.`,
];

const BRACKET_PROMPTS = [
  (a: number, w: number, t: number, k: number) => `Generate SVG for an L-bracket with ${a}mm arms, ${w}mm wide, ${t}mm material, ${k}mm kerf.`,
  (a: number, w: number, t: number, k: number) => `Create an L-shaped shelf support: arm length ${a}mm, thickness ${t}mm, kerf ${k}mm. Output SVG only.`,
];

const STAND_PROMPTS = [
  (w: number, h: number, a: number, t: number, k: number) =>
    `Generate SVG for a phone stand ${w}x${h}mm at ${a}° angle, ${t}mm material, ${k}mm kerf.`,
  (w: number, h: number, a: number, t: number, k: number) =>
    `Create a 2-panel phone holder. Panel size ${w}x${h}mm, tilt ${a}°, material ${t}mm, kerf ${k}mm. Output SVG.`,
];

// ─────────────────────────────────────────────────────────────
// PARAMETER RANGES
// ─────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min: number, max: number, step = 5): number {
  return Math.round((min + Math.random() * (max - min)) / step) * step;
}

// ─────────────────────────────────────────────────────────────
// TRAINING RECORD BUILDER
// ─────────────────────────────────────────────────────────────

interface TrainingRecord {
  messages: Array<{ role: string; content: string }>;
}

function makeRecord(prompt: string, svg: string): TrainingRecord {
  return {
    messages: [
      {
        role: "system",
        content:
          "You are CutCAD.ai, a laser cutting AI. When asked to generate a design, output ONLY valid SVG markup — no explanation, no markdown fences. The SVG must be ready to send to a laser cutter with correct kerf compensation applied.",
      },
      { role: "user", content: prompt },
      { role: "assistant", content: svg },
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN — Generate Dataset
// ─────────────────────────────────────────────────────────────

const KERFS = [0.1, 0.12, 0.15, 0.18, 0.2, 0.25];
const THICKNESSES = [3, 4, 5, 6];
const TARGET = 8000;

async function main() {
  console.log("\n⚡ CutCAD.ai Phase 2 Dataset Generator");
  console.log("========================================");
  console.log(`Target: ${TARGET} prompt→SVG training pairs\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const records: TrainingRecord[] = [];

  // ── 1. Rectangles ────────────────────────────
  const rectTarget = Math.floor(TARGET * 0.2);
  for (let i = 0; i < rectTarget; i++) {
    const w = rnd(60, 400, 5);
    const h = rnd(40, 300, 5);
    const k = pick(KERFS);
    const hasHoles = Math.random() > 0.6;
    const svg = genRectangle({ width: w, height: h, kerf: k, hasHoles });
    const prompts = hasHoles ? RECT_HOLE_PROMPTS : RECT_PROMPTS;
    const prompt = pick(prompts)(w, h, k);
    records.push(makeRecord(prompt, svg));
  }

  // ── 2. Living hinges ─────────────────────────
  const hingeTarget = Math.floor(TARGET * 0.25);
  for (let i = 0; i < hingeTarget; i++) {
    const w = rnd(60, 200, 5);
    const h = rnd(80, 300, 5);
    const k = pick(KERFS);
    const slitSpacing = pick([2, 2.5, 3, 3.5]);
    const svg = genLivingHinge({ width: w, height: h, kerf: k, slitSpacing });
    const prompt = pick(HINGE_PROMPTS)(w, h, k);
    records.push(makeRecord(prompt, svg));
  }

  // ── 3. L-brackets ────────────────────────────
  const bracketTarget = Math.floor(TARGET * 0.2);
  for (let i = 0; i < bracketTarget; i++) {
    const armLen = rnd(40, 150, 5);
    const armW = rnd(20, 60, 5);
    const t = pick(THICKNESSES);
    const k = pick(KERFS);
    const svg = genLBracket({ armLen, armWidth: armW, thickness: t, kerf: k });
    const prompt = pick(BRACKET_PROMPTS)(armLen, armW, t, k);
    records.push(makeRecord(prompt, svg));
  }

  // ── 4. Phone stands ───────────────────────────
  const standTarget = Math.floor(TARGET * 0.15);
  for (let i = 0; i < standTarget; i++) {
    const w = rnd(70, 120, 5);
    const h = rnd(80, 150, 5);
    const angle = pick([45, 60, 65, 70, 75]);
    const t = pick(THICKNESSES);
    const k = pick(KERFS);
    const svg = genPhoneStand({ width: w, height: h, angle, thickness: t, kerf: k });
    const prompt = pick(STAND_PROMPTS)(w, h, angle, t, k);
    records.push(makeRecord(prompt, svg));
  }

  // ── 5. Finger-joint panels ────────────────────
  const fingerTarget = TARGET - records.length;
  for (let i = 0; i < fingerTarget; i++) {
    const w = rnd(80, 300, 5);
    const h = rnd(60, 200, 5);
    const t = pick(THICKNESSES);
    const k = pick(KERFS);
    const side = pick(["front", "side", "bottom", "top"]);
    const svg = genFingerJointPanel({
      panelW: w, panelH: h, thickness: t, kerf: k,
      fingersW: true, fingersH: true,
    });
    const prompt = `Generate SVG for the ${side} panel of a finger-joint box. Panel: ${w}x${h}mm, material: ${t}mm, kerf: ${k}mm. Output SVG only.`;
    records.push(makeRecord(prompt, svg));
  }

  // Shuffle
  for (let i = records.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [records[i], records[j]] = [records[j], records[i]];
  }

  // Write JSONL
  const jsonl = records.map((r) => JSON.stringify(r)).join("\n");
  fs.writeFileSync(JSONL_PATH, jsonl, "utf-8");

  console.log(`✅ Phase 2 dataset complete!`);
  console.log(`   ${records.length} prompt→SVG training pairs`);
  console.log(`   Rectangles:      ${Math.floor(TARGET * 0.2)}`);
  console.log(`   Living hinges:   ${Math.floor(TARGET * 0.25)}`);
  console.log(`   L-brackets:      ${Math.floor(TARGET * 0.2)}`);
  console.log(`   Phone stands:    ${Math.floor(TARGET * 0.15)}`);
  console.log(`   Finger panels:   remaining`);
  console.log(`\n   Output: ${JSONL_PATH}`);
  console.log("\nNext: Upload phase2.jsonl to HuggingFace and run the Colab fine-tuning script.");
}

main().catch(console.error);
