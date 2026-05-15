# ============================================================
# CutCAD.ai — Phase 3.5: LoRA Weight Merge Script
# Merges cutcad-ai-v1 adapter into base model weights
# and uploads the complete, servable model as cutcad-ai-v2
# ============================================================

# Run this in a NEW Colab cell

!pip install -q peft transformers huggingface_hub accelerate bitsandbytes

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
from huggingface_hub import HfApi, notebook_login

# Step 1: Login
notebook_login()

BASE_MODEL_ID   = "Qwen/Qwen2.5-Coder-7B-Instruct"
ADAPTER_REPO_ID = "Savagedzs/cutcad-ai-v1"
MERGED_REPO_ID  = "Savagedzs/cutcad-ai-v2"
MERGED_DIR      = "cutcad_merged"

print("Loading base model (float16 for efficiency)...")
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_ID,
    torch_dtype=torch.float16,
    device_map="cpu",  # CPU merge saves GPU VRAM
    trust_remote_code=True,
)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_ID, trust_remote_code=True)

print("Attaching LoRA adapter weights from cutcad-ai-v1...")
model = PeftModel.from_pretrained(base_model, ADAPTER_REPO_ID)

print("Merging LoRA weights into base model (this takes ~2 minutes)...")
merged_model = model.merge_and_unload()

print(f"Saving merged model to {MERGED_DIR}...")
merged_model.save_pretrained(MERGED_DIR, safe_serialization=True)
tokenizer.save_pretrained(MERGED_DIR)

print("Uploading cutcad-ai-v2 to HuggingFace...")
api = HfApi()
api.create_repo(repo_id=MERGED_REPO_ID, exist_ok=True, private=True)
api.upload_folder(
    folder_path=MERGED_DIR,
    repo_id=MERGED_REPO_ID,
    repo_type="model",
)

print(f"✅ Merged model uploaded to: https://huggingface.co/{MERGED_REPO_ID}")
print("Update your .env.local: HF_MODEL_ID=Savagedzs/cutcad-ai-v2")
