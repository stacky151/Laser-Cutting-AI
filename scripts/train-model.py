import os
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# ==========================================
# CutCAD.ai - Phase 3 Training Pipeline
# ==========================================

# 1. Configuration
MODEL_ID = "Qwen/Qwen2.5-Coder-7B" # Base AI Model (Extremely strong at coding/XML)
DATASET_PATH = "../dataset/metadata.csv"
OUTPUT_DIR = "../model_output"

print("🚀 Initializing CutCAD.ai Training Pipeline...")

# 2. Load the Dataset
print("Loading synthetic ground-truth dataset...")
# The dataset has 'filename', 'prompt', and 'parameters'
# We need to format the input for the AI to understand the relationship
def format_prompt(example):
    # We read the actual SVG content from the file to teach it the output
    svg_file = f"../dataset/svgs/{example['filename']}"
    try:
        with open(svg_file, 'r') as f:
            svg_content = f.read()
    except Exception:
        svg_content = "<svg></svg>" # Fallback, shouldn't happen with our generated data
    
    # Instruction format
    text = f"<|im_start|>user\n{example['prompt']}<|im_end|>\n<|im_start|>assistant\n{svg_content}<|im_end|>"
    return {"text": text}

dataset = load_dataset("csv", data_files=DATASET_PATH, split="train")
dataset = dataset.map(format_prompt)

# 3. Load Tokenizer & Model
print(f"Downloading base model weights: {MODEL_ID}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
)

# Load model in 4-bit precision to save massive amounts of VRAM
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    device_map="auto",
    torch_dtype=torch.float16,
    quantization_config=bnb_config
)

# 4. Apply LoRA (Low-Rank Adaptation)
# This prevents the entire brain from being rewritten, focusing only on our SVG logic
print("Injecting LoRA adapters...")
lora_config = LoraConfig(
    r=16, 
    lora_alpha=32, 
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# 5. Training Setup
print("Configuring SFTTrainer...")
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    optim="paged_adamw_32bit",
    save_steps=500,
    logging_steps=10,
    learning_rate=2e-4,
    weight_decay=0.001,
    fp16=True,
    max_grad_norm=0.3,
    max_steps=-1, # Train on full epochs
    num_train_epochs=3,
    warmup_ratio=0.03,
    group_by_length=True,
    lr_scheduler_type="cosine",
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    max_seq_length=1024, # SVGs are relatively short
    tokenizer=tokenizer,
    args=training_args,
)

# 6. Execute Training
print("🔥 Initiating Reinforcement Training Loop. This will take hours...")
trainer.train()

# 7. Save Final Model
print("✅ Training Complete. Saving CutCAD.ai specialized weights...")
trainer.model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Model saved to {OUTPUT_DIR}. Ready for deployment.")
