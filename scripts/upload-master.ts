import fs from "fs";
import path from "path";

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ ERROR: HF_TOKEN environment variable not set.");
  process.exit(1);
}
const REPO = "Savagedzs/cutcad-phase2-data";
const FILE = path.join(process.cwd(), "dataset", "master_phase2.jsonl");

async function upload() {
  console.log("Reading master dataset...");
  const content = fs.readFileSync(FILE);
  const base64 = content.toString("base64");
  const sizeMB = (content.length / 1024 / 1024).toFixed(2);
  console.log(`Dataset size: ${sizeMB} MB`);

  console.log("Uploading Master Phase 2 Dataset to HuggingFace...");
  const commitRes = await fetch(`https://huggingface.co/api/datasets/${REPO}/commit/main`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: "Add Master Phase 2 dataset (6000 Build & Edit pairs)",
      files: [{ path: "master_phase2.jsonl", content: base64, encoding: "base64" }],
    }),
  });

  const data = await commitRes.json();
  if (!commitRes.ok) throw new Error(JSON.stringify(data));
  console.log("✅ DONE: https://huggingface.co/datasets/Savagedzs/cutcad-phase2-data");
}

upload().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
