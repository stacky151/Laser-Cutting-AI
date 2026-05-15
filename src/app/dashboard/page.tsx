"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, Box, Download, Trash2, ExternalLink, 
  LayoutGrid, List, Search, Clock, Plus,
  ChevronRight, ArrowLeft
} from "lucide-react";

interface SavedProject {
  id: string;
  name: string;
  type: string;
  date: string;
  svg: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const saved = localStorage.getItem("cutcad_projects");
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem("cutcad_projects", JSON.stringify(updated));
  };

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-2xl px-8 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Zap size={20} className="fill-current text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-tighter leading-none">The Vault</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-1">Project Archive</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search Archives..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-64 rounded-xl border border-white/5 bg-white/5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
            />
          </div>
          <Link href="/chat" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]">
            <Plus size={16} />
            New Design
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 animate-stark-reveal">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Stored Geometry</h1>
            <p className="text-muted-foreground text-sm font-medium">Manage your production-ready blueprints and parametric designs.</p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5">
            <button 
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-primary text-white shadow-lg" : "text-white/20 hover:text-white"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 stark-glass rounded-[3rem] border-dashed border-white/10">
            <div className="p-8 rounded-full bg-white/5 mb-6">
              <Box size={48} className="text-white/10" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-2">Archive Empty</h3>
            <p className="text-muted-foreground text-sm mb-8">No saved projects found in the local vault.</p>
            <Link href="/chat" className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-8">
              Initiate First Generation
            </Link>
          </div>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {filtered.map((project) => (
              <div key={project.id} className={`group stark-glass p-6 rounded-3xl hover:border-primary/40 transition-all duration-500 ${view === "list" ? "flex items-center justify-between" : ""}`}>
                <div className={view === "grid" ? "mb-6" : "flex items-center gap-6"}>
                  <div className={`aspect-video rounded-2xl bg-white flex items-center justify-center p-6 mb-4 overflow-hidden shadow-inner ${view === "list" ? "h-20 w-32 mb-0" : ""}`}
                       dangerouslySetInnerHTML={{ __html: project.svg }} />
                  <div>
                    <h3 className="text-lg font-black uppercase leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span className="flex items-center gap-1"><Clock size={10} /> {project.date}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{project.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 ${view === "grid" ? "mt-4" : ""}`}>
                  <Link href={`/studio?id=${project.id}`} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    <ExternalLink size={12} />
                    Open
                  </Link>
                  <button onClick={() => deleteProject(project.id)} className="p-3 rounded-xl border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
