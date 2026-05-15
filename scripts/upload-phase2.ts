import fs from "fs";
import path from "path";

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("❌ ERROR: HF_TOKEN environment variable not set.");
  process.exit(1);
}
const REPO = "Savagedzs/cutcad-phase2-data";
const FILE = path.join(process.cwd(), "dataset", "phase2", "phase2.jsonl");

async function upload() {
  // Trim to 4000 records to stay under 10MB HF limit
  console.log("Trimming dataset to 4000 records...");
  const lines = fs.readFileSync(FILE, "utf-8").split("\n").filter(Boolean);
  const trimmed = lines.slice(0, 4000).join("\n");
  const sizeMB = (Buffer.byteLength(trimmed, "utf-8") / 1024 / 1024).toFixed(2);
  console.log(`Trimmed size: ${sizeMB} MB (${4000} records)`);

  console.log("Creating dataset repo...");
  await fetch("https://huggingface.co/api/repos/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "cutcad-phase2-data", organization: "Savagedzs", type: "dataset", private: true }),
  });

  const base64 = Buffer.from(trimmed, "utf-8").toString("base64");

  console.log("Uploading to HuggingFace...");
  const commitRes = await fetch(`https://huggingface.co/api/datasets/${REPO}/commit/main`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: "Add Phase 2 training dataset (4000 prompt→SVG pairs)",
      files: [{ path: "phase2.jsonl", content: base64, encoding: "base64" }],
    }),
  });

  const data = await commitRes.json();
  if (!commitRes.ok) throw new Error(JSON.stringify(data));
  console.log("✅ DONE:", `https://huggingface.co/datasets/${REPO}`);
}

upload().catch((e) => { console.error("❌ Error:", e.message); process.exit(1); });
