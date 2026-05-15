# ============================================================
# CutCAD.ai — Phase 2 Fine-Tuning Script
# Trains cutcad-ai-v2 on prompt→SVG pairs (LoRA adapter)
# Result: cutcad-ai-v3 — a model that always outputs valid SVG
# ============================================================

# ── 1. Install dependencies ──────────────────────────────────
!pip install -q transformers==4.46.3 peft datasets trl accelerate huggingface_hub

# ── 2. Setup ─────────────────────────────────────────────────
import os, torch, json
from google.colab import userdata
os.environ["HF_TOKEN"] = userdata.get("HF_TOKEN").strip()

from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer
from datasets import Dataset
from huggingface_hub import HfApi

BASE_MODEL   = "Savagedzs/cutcad-ai-v2"   # start from our merged model
ADAPTER_NAME = "Savagedzs/cutcad-ai-v3"   # upload result here
LOCAL_ADAPTER = "cutcad_v3_adapter"
HF_TOKEN     = os.environ["HF_TOKEN"]

# ── 3. Load dataset from HuggingFace ─────────────────────────
# First upload phase2.jsonl via: huggingface-cli upload Savagedzs/cutcad-phase2-data phase2.jsonl
# OR load locally if uploaded to Colab files
print("Loading dataset...")
from huggingface_hub import hf_hub_download
local_file = hf_hub_download(
    repo_id="Savagedzs/cutcad-phase2-data",
    filename="phase2.jsonl",
    repo_type="dataset",
    token=HF_TOKEN,
)
with open(local_file) as f:
    raw = [json.loads(line) for line in f]

def format_record(record):
    msgs = record["messages"]
    text = ""
    for m in msgs:
        text += f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>\n"
    text += "<|im_start|>assistant\n"
    return {"text": text}

dataset = Dataset.from_list([format_record(r) for r in raw])
dataset = dataset.train_test_split(test_size=0.02)
print(f"Train: {len(dataset['train'])} | Val: {len(dataset['test'])}")

# ── 4. Load base model ───────────────────────────────────────
import logging
logging.getLogger("transformers").setLevel(logging.ERROR)

print("Loading base model...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, token=HF_TOKEN, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL, token=HF_TOKEN,
    torch_dtype=torch.float16, device_map="auto", trust_remote_code=True,
)

# ── 5. Apply LoRA ────────────────────────────────────────────
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# ── 6. Training ──────────────────────────────────────────────
training_args = TrainingArguments(
    output_dir=LOCAL_ADAPTER,
    num_train_epochs=2,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    fp16=True,
    logging_steps=50,
    save_steps=200,
    evaluation_strategy="steps",
    eval_steps=200,
    warmup_ratio=0.05,
    lr_scheduler_type="cosine",
    report_to="none",
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    dataset_text_field="text",
    max_seq_length=2048,
    args=training_args,
)

print("Starting Phase 2 training...")
trainer.train()
print("Training complete!")

# ── 7. Save & Upload adapter ─────────────────────────────────
model.save_pretrained(LOCAL_ADAPTER)
tokenizer.save_pretrained(LOCAL_ADAPTER)

api = HfApi(token=HF_TOKEN)
api.create_repo(repo_id=ADAPTER_NAME, exist_ok=True, private=True)
api.upload_folder(folder_path=LOCAL_ADAPTER, repo_id=ADAPTER_NAME, repo_type="model")
print(f"DONE: Adapter uploaded to https://huggingface.co/{ADAPTER_NAME}")
