"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, MessageSquare, Box, 
  LayoutDashboard, Settings, Info
} from "lucide-react";

const NAV_ITEMS = [
  { icon: <MessageSquare size={20} />, label: "Portal", href: "/chat" },
  { icon: <Box size={20} />, label: "Studio", href: "/studio" },
  { icon: <LayoutDashboard size={20} />, label: "Vault", href: "/dashboard" },
];

export function GlobalNav() {
  const pathname = usePathname();

  if (pathname === "/") return null; // Don't show on landing page

  return (
    <aside className="relative h-full w-20 flex flex-col items-center py-8 border-r border-white/5 bg-black/40 backdrop-blur-2xl z-[100] transition-all hover:w-64 group shrink-0">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-4 mb-12 px-5 w-full">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-[0_0_20px_rgba(37,99,235,0.4)]">
          <Zap size={20} className="fill-current text-white" />
        </div>
        <span className="text-sm font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden whitespace-nowrap">CutCAD.ai</span>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 w-full space-y-4 px-3">
        {NAV_ITEMS.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
              pathname === item.href 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                : "text-white/30 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="shrink-0">{item.icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="w-full px-3 space-y-4">
        <button className="flex items-center gap-4 p-3 rounded-xl text-white/20 hover:text-white transition-all w-full">
          <Info size={20} className="shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden whitespace-nowrap">Intelligence</span>
        </button>
        <button className="flex items-center gap-4 p-3 rounded-xl text-white/20 hover:text-white transition-all w-full">
          <Settings size={20} className="shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden whitespace-nowrap">Protocol</span>
        </button>
      </div>
    </aside>
  );
}
