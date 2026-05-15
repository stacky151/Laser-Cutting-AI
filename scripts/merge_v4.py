import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os

def merge_lora():
    print("🚀 CutCAD.ai — Industrial Model Consolidation (v4)")
    print("================================================")
    
    base_model_path = "meta-llama/Llama-3.1-8B" # Adjust based on your actual base model
    lora_path = "savagedzs/cutcad-ai-v4"
    output_path = "./merged_model_v4_final"

    print(f"📦 Loading base model: {base_model_path}")
    tokenizer = AutoTokenizer.from_pretrained(base_model_path)
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_path,
        torch_dtype=torch.float16,
        device_map="auto",
    )

    print(f"🧠 Attaching LoRA Adapters: {lora_path}")
    model = PeftModel.from_pretrained(base_model, lora_path)

    print("🛠️ Merging weights (Folding Phase)...")
    model = model.merge_and_unload()

    print(f"💾 Saving consolidated model to: {output_path}")
    model.save_pretrained(output_path)
    tokenizer.save_pretrained(output_path)

    print("✅ Consolidation complete. Model is ready for Phase 4 Training.")

if __name__ == "__main__":
    merge_lora()
