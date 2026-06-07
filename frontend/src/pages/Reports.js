import React, { useState, useEffect, useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import API from '../api/axios';
import Navbar from '../components/Navbar';

function AnimatedBG() {
    const init = useCallback(async engine => { await loadSlim(engine); }, []);
    return (
        <>
            <Particles id="reports-particles" init={init}
                style={{ position: 'fixed', inset: 0, zIndex: 0 }}
                options={{
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 60 },
                        color: { value: ['#0D9488', '#0891B2'] },
                        links: { enable: true, color: '#0D9488', opacity: 0.07, distance: 140 },
                        move: { enable: true, speed: 0.4 },
                        opacity: { value: { min: 0.05, max: 0.3 } },
                        size: { value: { min: 1, max: 2.5 } },
                    },
                    interactivity: { events: { onHover: { enable: true, mode: 'grab' } }, modes: { grab: { distance: 140, links: { opacity: 0.2 } } } }
                }}
            />
            <div style={{ position: 'fixed', top: '15%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'fixed', bottom: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        </>
    );
}

export default function Reports() {
    const [reports, setReports] = useState([]);
    useEffect(() => { API.get('/reports').then(r => setReports(r.data)); }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#060B14', position: 'relative' }}>
            <AnimatedBG />
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar />
                <div style={{ padding: '32px 40px' }}>
                    <h2 style={{ color: '#fff', marginBottom: 24, fontSize: 24, fontWeight: 700 }}>📋 Reports</h2>
                    <div style={{ background: 'rgba(15,25,45,0.8)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(13,148,136,0.15)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr', padding: '12px 20px', background: 'rgba(13,148,136,0.08)', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                            <span>Patient</span><span>Finding</span><span>Confidence</span><span>Date</span><span>Action</span>
                        </div>
                        {reports.map(r => {
                            const findings = r.confidence_scores || {};
                            const top = Object.entries(findings).sort((a,b) => b[1]-a[1])[0];
                            return (
                                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1fr', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{r.patients?.full_name || '—'}</span>
                                    <span><span style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{top ? top[0] : '—'}</span></span>
                                    <span style={{ color: '#14B8A6', fontWeight: 700 }}>{top ? `${(top[1]*100).toFixed(0)}%` : '—'}</span>
                                    <span style={{ color: '#64748B', fontSize: 13 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                    <span><button style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }} onClick={() => alert(r.nlp_report)}>View Report</button></span>
                                </div>
                            );
                        })}
                        {reports.length === 0 && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No reports yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}