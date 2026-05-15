import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// ============================================================
// CutCAD.ai — Phase 4: Layer 2 Dataset Generator
// Generates edit-instruction training pairs:
// Input: existing SVG + modification instruction
// Output: modified SVG
// This teaches the AI to EDIT existing designs, not just create
// ============================================================

const DATASET_DIR = path.join(process.cwd(), "dataset");
const SVGS_DIR = path.join(DATASET_DIR, "svgs");
const LAYER2_DIR = path.join(DATASET_DIR, "layer2");
const LAYER2_CSV = path.join(LAYER2_DIR, "edit_instructions.csv");

interface EditPair {
  source_file: string;
  instruction: string;
  result_description: string;
  param_change: string;
}

// Edit instruction templates — the core of Layer 2 training
const EDIT_TEMPLATES = [
  {
    instruction: (w: number, newW: number) => `Make the box ${newW - w}mm wider`,
    result: (newW: number, d: number, h: number, t: number) =>
      `A finger-joint box ${newW}mm wide, ${d}mm deep, ${h}mm tall for ${t}mm material`,
    paramChange: (w: number, newW: number) => `width: ${w}→${newW}`,
    modify: (p: Record<string, number>) => ({ ...p, width: p.width + [10, 20, 25, 50][Math.floor(Math.random() * 4)] }),
  },
  {
    instruction: (h: number, newH: number) => `Increase the height to ${newH}mm`,
    result: (w: number, d: number, newH: number, t: number) =>
      `A finger-joint box ${w}mm wide, ${d}mm deep, ${newH}mm tall for ${t}mm material`,
    paramChange: (h: number, newH: number) => `height: ${h}→${newH}`,
    modify: (p: Record<string, number>) => ({ ...p, height: p.height + [10, 15, 20, 30][Math.floor(Math.random() * 4)] }),
  },
  {
    instruction: (t: number, newT: number) => `Change the material thickness from ${t}mm to ${newT}mm and recalculate all joints`,
    result: (w: number, d: number, h: number, newT: number) =>
      `A finger-joint box ${w}mm wide, ${d}mm deep, ${h}mm tall for ${newT}mm material with recalculated tab widths`,
    paramChange: (t: number, newT: number) => `thickness: ${t}→${newT}`,
    modify: (p: Record<string, number>) => {
      const options = [3, 4, 5, 6].filter((v) => v !== p.thickness);
      return { ...p, thickness: options[Math.floor(Math.random() * options.length)] };
    },
  },
  {
    instruction: (_k: number, newK: number) => `Adjust kerf compensation to ${newK}mm for a more precise fit`,
    result: (w: number, d: number, h: number, t: number, newK: number) =>
      `A finger-joint box ${w}mm wide, ${d}mm deep, ${h}mm tall for ${t}mm material with ${newK}mm kerf offset`,
    paramChange: (k: number, newK: number) => `kerf: ${k}→${newK}`,
    modify: (p: Record<string, number>) => {
      const options = [0.1, 0.12, 0.15, 0.18, 0.2].filter((v) => v !== p.kerf);
      return { ...p, kerf: options[Math.floor(Math.random() * options.length)] };
    },
  },
];

function generateEditPairs(batchSize: number): EditPair[] {
  // Load existing metadata to use as source files
  const csvContent = fs.readFileSync(path.join(DATASET_DIR, "metadata.csv"), "utf-8");
  const records = parse(csvContent, { columns: true, skip_empty_lines: true });

  const pairs: EditPair[] = [];
  const sampleSize = Math.min(batchSize, records.length);
  const sample = records.slice(0, sampleSize);

  for (const record of sample) {
    // Parse params from the existing record
    const params = JSON.parse(record.parameters);

    // Apply a random edit template
    const template = EDIT_TEMPLATES[Math.floor(Math.random() * EDIT_TEMPLATES.length)];
    const modified = template.modify(params);

    // Build the edit instruction pair
    const instructionFns: Record<string, (a: number, b: number) => string> = {
      width: (a, b) => `Make the box ${b - a}mm wider`,
      height: (a, b) => `Increase the height to ${b}mm`,
      thickness: (a, b) => `Change the material thickness from ${a}mm to ${b}mm and recalculate all joints`,
      kerf: (a, b) => `Adjust kerf compensation to ${b}mm for a more precise fit`,
    };

    // Find what changed
    const changedKey = Object.keys(modified).find((k) => modified[k] !== params[k]) ?? "width";
    const instruction = instructionFns[changedKey]?.(params[changedKey], modified[changedKey]) ??
      `Update the ${changedKey} to ${modified[changedKey]}mm`;

    pairs.push({
      source_file: record.filename,
      instruction,
      result_description: `A finger-joint box ${modified.width}mm wide, ${modified.depth}mm deep, ${modified.height}mm tall for ${modified.thickness}mm material with ${modified.kerf}mm kerf`,
      param_change: `${changedKey}: ${params[changedKey]}→${modified[changedKey]}`,
    });
  }

  return pairs;
}

async function main() {
  const BATCH_SIZE = 10000;

  console.log("\n🔧 CutCAD.ai Layer 2 Dataset Generator");
  console.log("=========================================");
  console.log(`Target: ${BATCH_SIZE} edit instruction pairs\n`);

  fs.mkdirSync(LAYER2_DIR, { recursive: true });

  const pairs = generateEditPairs(BATCH_SIZE);

  // Write CSV
  const header = "source_file,instruction,result_description,param_change\n";
  const rows = pairs
    .map(
      (p) =>
        `"${p.source_file}","${p.instruction.replace(/"/g, "'")}","${p.result_description.replace(/"/g, "'")}","${p.param_change}"`
    )
    .join("\n");

  fs.writeFileSync(LAYER2_CSV, header + rows, "utf-8");

  console.log(`✅ Layer 2 dataset generated!`);
  console.log(`   ${pairs.length} edit instruction pairs`);
  console.log(`   Saved to: ${LAYER2_CSV}`);
  console.log("\nNext step: Run the Layer 2 training script in Colab with this dataset.");
}

main().catch(console.error);
