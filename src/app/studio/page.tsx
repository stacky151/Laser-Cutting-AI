"use client";

import { useState, useMemo } from "react";
import { 
  Box, Type, Settings2, Download, Layers, 
  MousePointer2, Maximize, Zap, ArrowLeft,
  ChevronRight, Ruler, PenTool, Scissors,
  Cpu, Layout
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateBoxSVG, BoxConfig } from "@/lib/maker-engine";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudioPage() {
  const [activeTool, setActiveTool] = useState("box");
  const [zoom, setZoom] = useState(1);

  const [config, setConfig] = useState<BoxConfig>({
    width: 150,
    depth: 100,
    height: 80,
    thickness: 3.0,
    kerf: 0.15,
    tabWidth: 15,
  });

  const svgOutput = useMemo(() => {
    try {
      if (activeTool === "box") return generateBoxSVG(config);
      return "";
    } catch (e) {
      console.error("Geometry Generation Error:", e);
      return "";
    }
  }, [config, activeTool]);

  const handleConfigChange = (key: keyof BoxConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) setConfig((prev) => ({ ...prev, [key]: num }));
  };

  const handleExport = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cutcad_${activeTool}_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      {/* Cinematic Header */}
      <header className="flex h-16 items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group">
            <div className="p-1.5 rounded-lg border border-transparent group-hover:border-white/10 group-hover:bg-white/5 transition-all">
              <ArrowLeft size={16} />
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Zap size={18} className="fill-current text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-tighter leading-none">Studio</span>
              <span className="text-[9px] text-primary font-bold uppercase tracking-widest leading-none mt-1">Parametric Engine v2.4</span>
            </div>
          </div>
          <div className="ml-6 flex items-center gap-2 h-7 rounded-full border border-white/5 bg-white/5 px-3 text-[10px] font-black uppercase tracking-widest text-white/40">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            xTool D1 Pro • {config.thickness}mm Material
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/chat" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10">
            <Cpu size={14} />
            Neural Link
          </Link>
          <button
            onClick={handleExport}
            disabled={!svgOutput}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            Export SVG
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Toolbox */}
        <aside className="flex w-20 flex-col items-center border-r border-white/5 bg-black/20 py-6 gap-6 z-40 backdrop-blur-xl">
          <ToolButton icon={<MousePointer2 size={20} />} label="Pointer" isActive={activeTool === "select"} onClick={() => setActiveTool("select")} />
          <div className="w-10 h-[1px] bg-white/5" />
          <ToolButton icon={<Box size={20} />} label="Box Generator" isActive={activeTool === "box"} onClick={() => setActiveTool("box")} />
          <ToolButton icon={<Layers size={20} />} label="Living Hinge" isActive={activeTool === "hinge"} onClick={() => setActiveTool("hinge")} />
          <ToolButton icon={<Type size={20} />} label="Typography" isActive={activeTool === "text"} onClick={() => setActiveTool("text")} />
          <ToolButton icon={<Layout size={20} />} label="Panels" isActive={activeTool === "panel"} onClick={() => setActiveTool("panel")} />
          <div className="mt-auto">
             <ToolButton icon={<Settings2 size={20} />} label="Machine Settings" isActive={false} onClick={() => {}} />
          </div>
        </aside>

        {/* CAD Canvas */}
        <main className="relative flex-1 bg-background overflow-hidden flex items-center justify-center animate-stark-reveal">
          {/* Hardware Accelerated Infinite Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: `${40 * zoom}px ${40 * zoom}px`
            }} 
          />
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: `${8 * zoom}px ${8 * zoom}px`
            }} 
          />

          {/* Controls */}
          <div className="absolute bottom-8 left-8 flex items-center gap-4 z-40">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 text-white/40 hover:text-white transition-colors">-</button>
              <span className="text-[10px] font-black uppercase tracking-widest w-12 text-center text-white/60">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 text-white/40 hover:text-white transition-colors">+</button>
            </div>
            <button className="p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-white/40 hover:text-white transition-all shadow-2xl">
              <Maximize size={18} />
            </button>
          </div>

          {/* The Geometry View */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-20 overflow-visible transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom})` }}>
            {activeTool === "box" && svgOutput ? (
              <div className="relative group">
                <div className="absolute -inset-8 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative stark-glass p-12 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 animate-stark-reveal flex items-center justify-center bg-white" 
                     dangerouslySetInnerHTML={{ __html: svgOutput }} />
                
                {/* Floating Dimension Badges */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-black text-white uppercase tracking-widest shadow-xl">
                  {config.width}mm Width
                </div>
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 -rotate-90 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                  {config.height}mm Height
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 opacity-20 group">
                <div className="p-10 rounded-full border-4 border-dashed border-white/10 group-hover:border-primary/20 transition-all duration-700">
                  <Scissors size={80} className="text-white group-hover:rotate-12 transition-transform duration-700" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-white">Initialize Design Sequence</p>
              </div>
            )}
          </div>
        </main>

        {/* Right Inspector */}
        <aside className="w-85 flex flex-col border-l border-white/5 bg-black/40 backdrop-blur-2xl z-40 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
            <div className="flex items-center gap-2">
              <Ruler size={16} className="text-primary" />
              <h2 className="text-[11px] font-black uppercase tracking-widest">Inspector</h2>
            </div>
            <div className="p-1 rounded bg-primary/10 text-[9px] font-black uppercase text-primary tracking-widest px-2">Metric</div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {/* Dimension Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Geometric Constraints</h3>
                <div className="h-[1px] flex-1 bg-white/5 ml-4" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <InputGroup label="Width (X)" value={config.width} unit="mm" onChange={(val) => handleConfigChange("width", val)} />
                <InputGroup label="Depth (Y)" value={config.depth} unit="mm" onChange={(val) => handleConfigChange("depth", val)} />
                <InputGroup label="Height (Z)" value={config.height} unit="mm" onChange={(val) => handleConfigChange("height", val)} />
              </div>
            </div>

            {/* Material Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Material Intelligence</h3>
                <div className="h-[1px] flex-1 bg-white/5 ml-4" />
              </div>
              <div className="space-y-4">
                <InputGroup label="Core Thickness" value={config.thickness} unit="mm" onChange={(val) => handleConfigChange("thickness", val)} />
                <InputGroup label="Laser Kerf Offset" value={config.kerf} unit="mm" onChange={(val) => handleConfigChange("kerf", val)} />
              </div>
            </div>

            {/* Joinery Block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Joinery Synthesis</h3>
                <div className="h-[1px] flex-1 bg-white/5 ml-4" />
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Tab Logic</span>
                     <span className="text-xs font-mono text-primary">{config.tabWidth}mm</span>
                   </div>
                   <input 
                     type="range" 
                     className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary" 
                     min="5" max="40" 
                     value={config.tabWidth} 
                     onChange={(e) => handleConfigChange("tabWidth", e.target.value)} 
                   />
                   <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/20 font-black">
                     <span>Finer</span>
                     <span>Coarser</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500", 
        isActive 
          ? "bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110" 
          : "text-white/30 hover:bg-white/5 hover:text-white"
      )} 
      title={label}
    >
      {isActive && (
        <div className="absolute -right-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
      )}
      {icon}
    </button>
  );
}

function InputGroup({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{label}</label>
      <div className="relative flex items-center group">
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="h-12 w-full rounded-2xl border border-white/5 bg-white/5 pl-4 pr-12 text-sm font-bold text-white outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:stark-glow" 
        />
        <span className="absolute right-4 text-[10px] font-black uppercase tracking-widest text-white/20 group-focus-within:text-primary transition-colors">{unit}</span>
      </div>
    </div>
  );
}
