import React, { useState, useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import API from '../api/axios';
import Navbar from '../components/Navbar';

function AnimatedBG() {
    const init = useCallback(async engine => { await loadSlim(engine); }, []);
    return (
        <>
            <Particles id="analysis-particles" init={init}
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

export default function AIAnalysis() {
    const [file, setFile]       = useState(null);
    const [result, setResult]   = useState(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await API.post('/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResult(res.data);
        } catch (err) { console.log(err); }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#060B14', position: 'relative' }}>
            <AnimatedBG />
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar />
                <div style={{ padding: '32px 40px' }}>
                    <h2 style={{ color: '#fff', marginBottom: 24, fontSize: 24, fontWeight: 700 }}>🧠 AI Analysis</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div style={{ background: 'rgba(15,25,45,0.8)', borderRadius: 12, padding: 24, border: '1px solid rgba(13,148,136,0.15)' }}>
                            <h3 style={{ marginBottom: 16, color: '#fff' }}>Upload X-ray</h3>
                            <div style={{ border: '2px dashed rgba(13,148,136,0.3)', borderRadius: 8, padding: 40, textAlign: 'center', marginBottom: 16, background: 'rgba(13,148,136,0.03)' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🦷</div>
                                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ color: '#94A3B8' }} />
                                <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>DICOM, PNG, JPEG · Max 20MB</p>
                            </div>
                            <button onClick={analyze} disabled={!file || loading} style={{
                                width: '100%', padding: 14,
                                background: loading ? 'rgba(13,148,136,0.3)' : 'linear-gradient(135deg, #0D9488, #0891B2)',
                                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600,
                                boxShadow: loading ? 'none' : '0 8px 24px rgba(13,148,136,0.3)'
                            }}>
                                {loading ? '⚡ Analyzing...' : 'Analyze X-ray'}
                            </button>
                        </div>
                        <div style={{ background: 'rgba(15,25,45,0.8)', borderRadius: 12, padding: 24, border: '1px solid rgba(13,148,136,0.15)' }}>
                            <h3 style={{ marginBottom: 16, color: '#fff' }}>AI Findings</h3>
                            {result ? (
                                <div>
                                    <div style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                                        <div style={{ fontWeight: 700, color: '#14B8A6' }}>Primary: {result.detected}</div>
                                        <div style={{ color: '#14B8A6', fontSize: 28, fontWeight: 800 }}>{(result.confidence * 100).toFixed(1)}%</div>
                                    </div>
                                    {Object.entries(result.all_findings).map(([k,v]) => (
                                        <div key={k} style={{ marginBottom: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#94A3B8' }}>
                                                <span>{k}</span><span>{(v*100).toFixed(1)}%</span>
                                            </div>
                                            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                                                <div style={{ height: 6, width: `${v*100}%`, background: 'linear-gradient(90deg, #0D9488, #0891B2)', borderRadius: 3 }} />
                                            </div>
                                        </div>
                                    ))}
                                    <pre style={{ marginTop: 16, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', padding: 12, borderRadius: 8, fontSize: 11, whiteSpace: 'pre-wrap', color: '#64748B' }}>
                                        {result.nlp_report}
                                    </pre>
                                </div>
                            ) : (
                                <div style={{ color: '#475569', textAlign: 'center', paddingTop: 60 }}>Upload an X-ray to see AI analysis</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}