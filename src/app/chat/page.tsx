"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Zap, Loader2, Box, Download, Layers, Type, Sparkles, ChevronRight, Code2, Eye, ImagePlus } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design a finger-joint box 150mm x 100mm x 80mm for 3mm plywood",
  "Create a phone stand with living hinge for 3mm acrylic",
  "Make a wall sign that says WORKSHOP with mounting holes",
  "Generate a flat-pack shelf organizer, 5 compartments",
];

// Extracts SVG markup from AI response — handles both bare <svg> and ```svg code blocks
function extractSVG(content: string): string | null {
  // 1. Direct <svg> tags
  const directMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  if (directMatch) return directMatch[0];

  // 2. Inside ```svg or ```xml code fences
  const codeBlockMatch = content.match(/```(?:svg|xml)\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].match(/<svg[\s\S]*?<\/svg>/i);
    if (inner) return inner[0];
    // Sometimes model outputs the code block content without wrapping <svg> tags
    if (codeBlockMatch[1].trim().startsWith("<")) return codeBlockMatch[1].trim();
  }

  return null;
}



export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    setError(null);

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "An unknown error occurred.");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        // Auto-detect SVG in response and show live preview
        const svg = extractSVG(data.content);
        if (svg) setSvgPreview(svg);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const downloadSVG = () => {
    if (!svgPreview) return;
    const blob = new Blob([svgPreview], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cutcad_ai_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-muted/20 p-4 gap-4 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <Zap size={16} className="fill-current" />
          </div>
          <span className="font-bold tracking-tight">CutCAD.ai</span>
        </Link>

        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Quick Start</div>
        <div className="flex flex-col gap-2">
          {STARTER_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-3 py-2.5 transition-all duration-200 border border-transparent hover:border-border leading-relaxed"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <Link href="/studio" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-2">
            <Box size={14} />
            Open Parametric Studio
            <ChevronRight size={12} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-semibold">CutCAD AI</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted/50">Beta</span>
          </div>
          <Link href="/studio" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-3 py-1.5 hover:bg-muted">
            <Box size={13} />
            Parametric Studio
          </Link>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <main className="flex-1 overflow-y-auto px-4 py-6 min-w-0">
            {messages.length === 0 ? (
              <EmptyState onSelect={sendMessage} />
            ) : (
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    ⚠️ {error}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </main>

          {/* Project Inspector & Preview Panel */}
          <aside className="hidden xl:flex w-80 flex-col border-l border-border bg-muted/10 shrink-0">
            {/* Inspector Section */}
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Inspector</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase">Thickness</span>
                  <span className="text-xs font-mono font-bold">{messages.find(m => m.content.toLowerCase().includes("mm"))?.content.match(/(\d+)mm/)?.[0] || "---"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase">Laser Kerf</span>
                  <span className="text-xs font-mono font-bold">0.15mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase">Material</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase text-[9px]">Plywood</span>
                </div>
              </div>
            </div>

            {/* SVG Live Preview Panel */}
            {svgPreview && (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex h-12 items-center justify-between border-b border-border px-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewMode("preview")}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${previewMode === "preview" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Eye size={12} /> Preview
                    </button>
                    <button
                      onClick={() => setPreviewMode("code")}
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${previewMode === "code" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Code2 size={12} /> SVG
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  {previewMode === "preview" ? (
                    <div
                      className="w-full bg-white rounded-xl border border-border p-4 flex items-center justify-center min-h-48"
                      dangerouslySetInnerHTML={{ __html: svgPreview }}
                    />
                  ) : (
                    <pre className="text-xs text-green-400 bg-black/30 rounded-xl p-3 overflow-auto leading-relaxed font-mono whitespace-pre-wrap break-all">
                      {svgPreview}
                    </pre>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={downloadSVG}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                  >
                    <Download size={12} />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      const projects = JSON.parse(localStorage.getItem("cutcad_projects") || "[]");
                      const newProject = {
                        id: Date.now().toString(),
                        name: "Untitled Project",
                        type: "AI Generated",
                        date: new Date().toLocaleDateString(),
                        svg: svgPreview
                      };
                      localStorage.setItem("cutcad_projects", JSON.stringify([...projects, newProject]));
                      alert("Saved to Vault, Sir.");
                    }}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white transition-all"
                    title="Save to Vault"
                  >
                    <Box size={14} />
                  </button>
                </div>
              </div>
            )}
          </aside>
      </div>

        {/* Input Area */}
        <div className="border-t border-border p-6 bg-background/50 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3 stark-glass rounded-2xl px-4 py-3 focus-within:border-primary transition-all duration-300 stark-glow group">
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <ImagePlus size={20} />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a project or upload a reference image..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 py-2.5 leading-relaxed"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
                }}
              />
              
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-3 uppercase tracking-widest font-bold">
              Stark Intelligence System • v3.0 Master Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 py-16">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-4 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
          <Zap size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">CutCAD.ai</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          Describe your laser cutting project and I will generate the precise parametric design with kerf compensation and friction-fit joints.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {[
          { icon: <Box size={16} />, label: "Box Generator", prompt: "Design a finger-joint box 200mm x 150mm x 100mm for 3mm plywood with 0.15mm kerf" },
          { icon: <Layers size={16} />, label: "Living Hinge", prompt: "Create a flexible phone case with living hinge pattern for 3mm acrylic" },
          { icon: <Type size={16} />, label: "Custom Sign", prompt: "Make a decorative sign that says 'HOME' with mounting holes for 6mm MDF" },
          { icon: <Download size={16} />, label: "Flat-Pack", prompt: "Generate a flat-pack desk organizer with 3 sections for 4mm birch plywood" },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.prompt)}
            className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 text-left transition-all duration-200 hover:bg-muted/50 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(37,99,235,0.08)] group"
          >
            <span className="mt-0.5 text-primary">{item.icon}</span>
            <div>
              <div className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">{item.label}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{item.prompt}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const hasSVG = !isUser && /<svg/i.test(message.content);
  const displayContent = hasSVG
    ? message.content.replace(/<svg[\s\S]*?<\/svg>/i, "[SVG generated — see Live Preview panel →]")
    : message.content;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        isUser ? "bg-primary text-primary-foreground" : "bg-muted border border-border text-foreground"
      }`}>
        {isUser ? "U" : <Zap size={14} className="text-primary" />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm leading-relaxed"
          : "bg-muted/50 border border-border text-foreground rounded-tl-sm"
      }`}>
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(displayContent)}</div>
        )}
        {hasSVG && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
            <Sparkles size={11} />
            SVG rendered in preview panel
          </div>
        )}
      </div>
    </div>
  );
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="font-semibold text-foreground mt-3 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-foreground mt-4 mb-2 text-base">{line.slice(3)}</h2>;
    if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
      return <li key={i} className="ml-4 list-disc text-muted-foreground">{renderInline(line.slice(2))}</li>;
    }
    if (line.trim() === "") return <span key={i} className="block h-2" />;
    return <p key={i} className="text-muted-foreground leading-relaxed">{renderInline(line)}</p>;
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="font-mono text-xs bg-black/30 px-1 rounded text-green-400">{p.slice(1, -1)}</code>;
    return p;
  });
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
        <Zap size={14} className="text-primary" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted/50 border border-border px-4 py-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
