import fs from "fs";
import path from "path";

const DATASET_PATH = path.join(process.cwd(), "dataset", "phase2_5");
if (!fs.existsSync(DATASET_PATH)) fs.mkdirSync(DATASET_PATH, { recursive: true });

function generateEditPair() {
  const baseWidth = Math.floor(Math.random() * 200) + 50;
  const baseHeight = Math.floor(Math.random() * 200) + 50;
  const thickness = 3;
  const kerf = 0.15;

  const originalSvg = `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${kerf}" y="${kerf}" width="${baseWidth - kerf * 2}" height="${baseHeight - kerf * 2}" fill="none" stroke="black" stroke-width="0.5"/>
</svg>`;

  const edits = [
    {
      instruction: `Make the width ${baseWidth + 50}mm and add a 10mm hole in the center.`,
      result: `<svg width="${baseWidth + 50}" height="${baseHeight}" viewBox="0 0 ${baseWidth + 50} ${baseHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${kerf}" y="${kerf}" width="${baseWidth + 50 - kerf * 2}" height="${baseHeight - kerf * 2}" fill="none" stroke="black" stroke-width="0.5"/>
  <circle cx="${(baseWidth + 50) / 2}" cy="${baseHeight / 2}" r="5" fill="none" stroke="red" stroke-width="0.5"/>
</svg>`
    },
    {
      instruction: `Add 4 mounting holes (5mm diameter) at the corners, 10mm from the edges.`,
      result: `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${kerf}" y="${kerf}" width="${baseWidth - kerf * 2}" height="${baseHeight - kerf * 2}" fill="none" stroke="black" stroke-width="0.5"/>
  <circle cx="10" cy="10" r="2.5" fill="none" stroke="red" stroke-width="0.5"/>
  <circle cx="${baseWidth - 10}" cy="10" r="2.5" fill="none" stroke="red" stroke-width="0.5"/>
  <circle cx="10" cy="${baseHeight - 10}" r="2.5" fill="none" stroke="red" stroke-width="0.5"/>
  <circle cx="${baseWidth - 10}" cy="${baseHeight - 10}" r="2.5" fill="none" stroke="red" stroke-width="0.5"/>
</svg>`
    }
  ];

  const edit = edits[Math.floor(Math.random() * edits.length)];

  return {
    messages: [
      { role: "user", content: `Here is my current design:\n${originalSvg}\n\n${edit.instruction}` },
      { role: "assistant", content: edit.result }
    ]
  };
}

const entries = [];
for (let i = 0; i < 2000; i++) {
  entries.push(JSON.stringify(generateEditPair()));
}

fs.writeFileSync(path.join(DATASET_PATH, "phase2_5.jsonl"), entries.join("\n"));
console.log("✅ Phase 2.5 Dataset Generated: 2000 Edit Pairs");
