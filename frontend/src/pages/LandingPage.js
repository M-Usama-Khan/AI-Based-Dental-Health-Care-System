import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const initParticles = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const features = [
        { icon: '🧠', title: 'AI X-Ray Analysis',     desc: 'Deep learning model detects Caries, Bone Loss, Fractures & Impacted Teeth with 90%+ accuracy.' },
        { icon: '📋', title: 'Smart Reports',          desc: 'Auto-generated NLP reports for every X-ray scan — detailed, accurate, and instant.' },
        { icon: '📅', title: 'Appointment Management', desc: 'Seamlessly book and manage patient appointments with real-time scheduling.' },
        { icon: '💻', title: 'Tele-Health',            desc: 'Connect dentists and patients remotely for consultations and follow-ups.' },
        { icon: '🔒', title: 'HIPAA Compliant',        desc: 'Enterprise-grade security ensuring patient data privacy and compliance.' },
        { icon: '📊', title: 'Live Dashboard',         desc: 'Real-time stats and insights to monitor patients, reports and appointments at a glance.' },
    ];

    const stats = [
        { value: '90%+', label: 'Detection Accuracy' },
        { value: '< 3s', label: 'Analysis Time' },
        { value: '100%', label: 'Cloud Backed' },
    ];

    return (
        <div style={{ background: '#060B14', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#E2E8F0', overflowX: 'hidden' }}>

            <Particles id="landing-particles" init={initParticles}
                style={{ position: 'fixed', inset: 0, zIndex: 0 }}
                options={{
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 60 },
                        color: { value: ['#0D9488', '#0891B2'] },
                        links: { enable: true, color: '#0D9488', opacity: 0.07, distance: 140 },
                        move: { enable: true, speed: 0.4 },
                        opacity: { value: { min: 0.05, max: 0.25 } },
                        size: { value: { min: 1, max: 2.5 } },
                    },
                    interactivity: { events: { onHover: { enable: true, mode: 'grab' } }, modes: { grab: { distance: 140, links: { opacity: 0.2 } } } }
                }}
            />

            <motion.div style={{ position: 'fixed', top: '10%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }}
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity }} />
            <motion.div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }}
                animate={{ scale: [1.2, 1, 1.2] }} transition={{ duration: 7, repeat: Infinity }} />

            {/* Navbar */}
            <motion.nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px', height: 70, background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(13,148,136,0.12)' }}
                initial={{ y: -70 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>🦷</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>Deep<span style={{ color: '#0D9488' }}>Sense</span></span>
                    <span style={{ background: 'rgba(13,148,136,0.2)', color: '#14B8A6', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(13,148,136,0.3)' }}>AI</span>
                </div>
                <div style={{ display: 'flex', gap: 32 }}>
                    {['Features', 'Stats', 'Contact'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
                            onMouseEnter={e => e.target.style.color = '#14B8A6'}
                            onMouseLeave={e => e.target.style.color = '#94A3B8'}
                        >{item}</a>
                    ))}
                </div>
                <motion.button
                    style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(13,148,136,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                >
                    Login →
                </motion.button>
            </motion.nav>

            {/* Hero */}
            <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', position: 'relative', zIndex: 2 }}>
                <div>
                    <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: '#0D9488' }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    >
                        <motion.div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D9488' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        AI-Powered Dental Intelligence Platform
                    </motion.div>

                    <motion.h1 style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: '#fff' }}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    >
                        The Future of<br />
                        <span style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Dental Diagnosis
                        </span>
                    </motion.h1>

                    <motion.p style={{ fontSize: 18, color: '#64748B', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    >
                        DeepSense uses cutting-edge AI to analyze dental X-rays, detect conditions with 90%+ accuracy, and generate instant clinical reports — empowering dentists to deliver better care.
                    </motion.p>

                    <motion.div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    >
                        <motion.button
                            style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)', color: '#fff', border: 'none', padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 8px 32px rgba(13,148,136,0.35)' }}
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(13,148,136,0.5)' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            🚀 Get Started
                        </motion.button>
                        <motion.button
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 36px', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 600, fontFamily: 'inherit' }}
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Learn More ↓
                        </motion.button>
                    </motion.div>

                    {mounted && ['🦷', '🔬', '🧬', '💊', '⚕️'].map((icon, i) => (
                        <motion.div key={i} style={{ position: 'absolute', fontSize: 28, opacity: 0.1, left: `${8 + i * 20}%`, top: `${25 + (i % 2) * 30}%`, pointerEvents: 'none' }}
                            animate={{ y: [-20, 20, -20], rotate: [-8, 8, -8] }}
                            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
                        >{icon}</motion.div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section id="stats" style={{ padding: '80px 60px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 800, margin: '0 auto' }}>
                    {stats.map((s, i) => (
                        <motion.div key={i} style={{ background: 'rgba(15,25,45,0.8)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                            whileHover={{ borderColor: 'rgba(13,148,136,0.4)', transform: 'translateY(-4px)' }}
                        >
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#14B8A6', marginBottom: 8 }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: '#64748B' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{ padding: '80px 60px', position: 'relative', zIndex: 2 }}>
                <motion.div style={{ textAlign: 'center', marginBottom: 60 }}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                >
                    <div style={{ fontSize: 12, color: '#0D9488', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>What We Offer</div>
                    <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Powerful Features</h2>
                    <p style={{ color: '#64748B', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>Everything a modern dental practice needs, powered by artificial intelligence.</p>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
                    {features.map((f, i) => (
                        <motion.div key={i} style={{ background: 'rgba(15,25,45,0.8)', border: '1px solid rgba(13,148,136,0.12)', borderRadius: 16, padding: 28 }}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                            whileHover={{ borderColor: 'rgba(13,148,136,0.35)', transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                        >
                            <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</div>
                            <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>{f.desc}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section id="contact" style={{ padding: '80px 60px', position: 'relative', zIndex: 2 }}>
                <motion.div style={{ background: 'rgba(15,25,45,0.8)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: 24, padding: '60px 40px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                >
                    <div style={{ fontSize: 12, color: '#0D9488', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Contact Us</div>
                    <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Get In Touch</h2>
                    <p style={{ color: '#64748B', marginBottom: 32, fontSize: 15 }}>Have questions about DeepSense? We'd love to hear from you.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420, margin: '0 auto' }}>
                        <input placeholder="Your Name" style={inputStyle} />
                        <input placeholder="Email Address" type="email" style={inputStyle} />
                        <textarea placeholder="Your Message" rows={4} style={{ ...inputStyle, resize: 'none' }} />
                        <motion.button
                            style={{ background: 'linear-gradient(135deg, #0D9488, #0891B2)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'inherit' }}
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(13,148,136,0.4)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Send Message 📩
                        </motion.button>
                    </div>
                    <div style={{ marginTop: 32, fontSize: 13, color: '#475569' }}>
                        📧 deepsense.ai@gmail.com
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(13,148,136,0.1)', padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🦷</span>
                    <span style={{ fontWeight: 800, color: '#fff' }}>Deep<span style={{ color: '#0D9488' }}>Sense</span></span>
                </div>
                <div style={{ fontSize: 12, color: '#334155' }}>© 2026 DeepSense AI. All rights reserved.</div>
            </footer>

        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, fontSize: 14, color: '#E2E8F0',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};