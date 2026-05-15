"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowRight, Building2, Factory, BarChart3, Settings2, ShieldCheck, Database, Cpu } from "lucide-react";

const CASE_STUDIES = [
  {
    title: "Structural Precision",
    desc: "Automating the design of formwork for pre-cast concrete frames, reducing manual engineering time by 85%.",
    metric: "85% Gain"
  },
  {
    title: "Production Velocity",
    desc: "Generating production-ready vector paths for large-scale industrial laser systems.",
    metric: "0.01mm"
  },
  {
    title: "Material Optimization",
    desc: "Intelligent nesting to minimize waste in expensive industrial alloys.",
    metric: "22% Saved"
  }
];

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#020617', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '15px' }}>
      
      {/* High-Contrast Navigation */}
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
        height: '80px', backgroundColor: '#020617', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            height: '40px', width: '40px', backgroundColor: '#3b82f6', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)'
          }}>
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>CutCAD<span style={{ color: '#3b82f6' }}>.ai</span></span>
            <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Industrial Intelligence</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>
          <a href="#solutions" style={{ textDecoration: 'none', color: 'inherit' }}>Solutions</a>
          <a href="#precision" style={{ textDecoration: 'none', color: 'inherit' }}>Precision</a>
          <a href="#support" style={{ textDecoration: 'none', color: 'inherit' }}>Support</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/chat" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', textDecoration: 'none' }}>Login</Link>
          <Link href="/chat" style={{ 
            backgroundColor: '#fff', color: '#020617', padding: '0.8rem 1.6rem', 
            borderRadius: '6px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', 
            letterSpacing: '0.15em', textDecoration: 'none' 
          }}>
            Launch Engine
          </Link>
        </div>
      </nav>

      {/* Hero Section - Maximum Legibility */}
      <section style={{ 
        paddingTop: '200px', paddingBottom: '100px', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '1100px', width: '100%', padding: '0 2rem' }}>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '1rem', 
            border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '0.75rem 1.5rem', borderRadius: '6px', fontSize: '10px', fontWeight: 800, 
            textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', marginBottom: '4rem' 
          }}>
            <Building2 size={14} color="#3b82f6" />
            Fabrication Intelligence for Enterprise Partners
          </div>

          <h1 style={{ 
            fontSize: '5rem', fontWeight: 950, letterSpacing: '-0.04em', 
            lineHeight: 0.95, marginBottom: '4rem', textTransform: 'uppercase', color: '#ffffff'
          }}>
            Operational <span style={{ color: '#3b82f6' }}>Velocity.</span><br />
            Geometric <span style={{ color: 'rgba(255,255,255,0.15)' }}>Authority.</span>
          </h1>

          <div style={{ 
            maxWidth: '700px', margin: '0 auto 5rem', borderLeft: '6px solid #3b82f6', 
            paddingLeft: '3rem', textAlign: 'left' 
          }}>
            <p style={{ 
              color: '#94a3b8', fontSize: '1.5rem', fontWeight: 500, 
              lineHeight: 1.5, letterSpacing: '0.01em' 
            }}>
              Automating the complex geometry required for industrial fabrication. 
              Eliminating manual engineering bottlenecks in pre-cast molding and structural enclosures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <Link href="/chat" style={{ 
              backgroundColor: '#3b82f6', color: '#fff', padding: '1.25rem 3rem', 
              borderRadius: '8px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', 
              letterSpacing: '0.2em', textDecoration: 'none', boxShadow: '0 20px 40px rgba(59,130,246,0.2)'
            }}>
              Enterprise Portal
            </Link>
            <Link href="/studio" style={{ 
              border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', 
              color: '#fff', padding: '1.25rem 3rem', borderRadius: '8px', fontSize: '13px', 
              fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', textDecoration: 'none' 
            }}>
              Technical Studio
            </Link>
          </div>

          {/* Metric Grid */}
          <div style={{ 
            marginTop: '120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem', width: '100%' 
          }}>
            {[
              { label: "Tolerance", value: "0.01mm" },
              { label: "Efficiency", value: "85%" },
              { label: "Savings", value: "22%" },
              { label: "Uptime", value: "99.9%" }
            ].map((m) => (
              <div key={m.label} style={{ 
                padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', 
                backgroundColor: 'rgba(255,255,255,0.03)', textAlign: 'left', borderRadius: '8px' 
              }}>
                <span style={{ display: 'block', fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', fontFamily: 'monospace' }}>{m.value}</span>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#475569' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section - Balanced Contrast */}
      <section id="solutions" style={{ 
        padding: '160px 4rem', backgroundColor: 'rgba(255,255,255,0.02)', 
        borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' 
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '8rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <h2 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#3b82f6' }}>01. Applications</h2>
            <h3 style={{ fontSize: '4rem', fontWeight: 950, textTransform: 'uppercase', lineHeight: 0.9, color: '#ffffff' }}>Industrial <br/><span style={{ color: 'rgba(255,255,255,0.1)' }}>Scenarios.</span></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {CASE_STUDIES.map((study) => (
                <div key={study.title} style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020617', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', color: '#fff' }}>{study.title}</h4>
                  <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, lineHeight: 1.6 }}>{study.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', 
            padding: '6rem 4rem', border: '1px solid rgba(255,255,255,0.08)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
          }}>
            <Factory size={64} color="#3b82f6" style={{ marginBottom: '3rem' }} />
            <h4 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2rem', color: '#fff' }}>API Engine</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', maxWidth: '280px', lineHeight: 1.8 }}>
              Direct ERP integration for automated fabrication blueprints.
            </p>
          </div>
        </div>
      </section>

      <footer style={{ padding: '80px 4rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Zap size={32} color="#3b82f6" />
          <span style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', color: '#ffffff' }}>CutCAD.ai</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#334155' }}>© 2026 Industrial Division — Precision Matters</span>
      </footer>
    </div>
  );
}
