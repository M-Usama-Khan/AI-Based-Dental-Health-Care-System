import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import API from '../api/axios';

export default function Login() {
    const [tab, setTab]               = useState('login');
    const [role, setRole]             = useState('dentist');
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [fullName, setFullName]     = useState('');
    const [licenseNumber, setLicense] = useState('');
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState('');
    const [loading, setLoading]       = useState(false);
    const [mounted, setMounted]       = useState(false);

    useEffect(() => setMounted(true), []);

    const initParticles = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const handleLogin = async () => {
        setLoading(true); setError(''); setSuccess('');
        try {
            const res = await API.post('/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/';
        } catch {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true); setError(''); setSuccess('');
        if (role === 'dentist' && !licenseNumber) {
            setError('PMC License number is required for Dentists');
            setLoading(false); return;
        }
        try {
            const backendRole = role === 'dentist' ? 'admin' : 'patient';
            await API.post('/register', {
                full_name: fullName,
                email,
                password,
                role: backendRole,
                license_number: role === 'dentist' ? licenseNumber : null
            });
            // Success — login tab pe le jao
            setSuccess('✅ Account created successfully! Please sign in.');
            setTab('login');
            setEmail('');
            setPassword('');
            setFullName('');
            setLicense('');
            setLoading(false);
        } catch {
            setError('Registration failed. Email already exists.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at 20% 50%, #0a1628 0%, #060b14 50%, #0a0f1e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
        }}>
            <Particles id="login-particles" init={initParticles}
                style={{ position: 'fixed', inset: 0, zIndex: 0 }}
                options={{
                    background: { color: { value: 'transparent' } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 80 },
                        color: { value: ['#0D9488', '#0891B2', '#6366f1'] },
                        links: { enable: true, color: '#0D9488', opacity: 0.08, distance: 150 },
                        move: { enable: true, speed: 0.4, random: true },
                        opacity: { value: { min: 0.05, max: 0.4 }, animation: { enable: true, speed: 0.8 } },
                        size: { value: { min: 1, max: 3 } },
                    },
                    interactivity: {
                        events: { onHover: { enable: true, mode: 'grab' }, onClick: { enable: true, mode: 'push' } },
                        modes: { grab: { distance: 180, links: { opacity: 0.25 } }, push: { quantity: 3 } }
                    }
                }}
            />

            <motion.div style={{ position: 'fixed', top: '10%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }}
                animate={{ scale: [1.2, 1, 1.2], opacity: [1, 0.5, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {mounted && ['🦷', '🔬', '⚕️', '💊', '🧬'].map((icon, i) => (
                <motion.div key={i} style={{ position: 'fixed', fontSize: 22, zIndex: 2, opacity: 0.12, left: `${10 + i * 20}%`, top: `${20 + (i % 3) * 25}%`, pointerEvents: 'none' }}
                    animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5], opacity: [0.08, 0.18, 0.08] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
                >{icon}</motion.div>
            ))}

            <motion.div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(13,148,136,0.4), transparent)', zIndex: 2, pointerEvents: 'none' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Card */}
            <motion.div style={{
                background: 'rgba(10,18,35,0.92)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(13,148,136,0.15)',
                borderRadius: 28, padding: '52px 48px',
                width: 460, position: 'relative', zIndex: 10,
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, #0D9488, transparent)', borderRadius: 1 }} />

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <motion.div style={{ display: 'inline-block' }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(8,145,178,0.2))', border: '1px solid rgba(13,148,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 16px', boxShadow: '0 0 30px rgba(13,148,136,0.15)' }}>🦷</div>
                    </motion.div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 0.5, marginBottom: 4 }}>
                        Deep<span style={{ color: '#0D9488' }}>Sense</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', letterSpacing: 2, textTransform: 'uppercase' }}>AI-Powered Dental Intelligence</div>
                    <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 20, padding: '4px 12px', marginTop: 12, fontSize: 11, color: '#0D9488' }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0D9488' }} />
                        Neural Network Active
                    </motion.div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    {['login', 'register'].map(t => (
                        <motion.button key={t} style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, background: tab === t ? 'rgba(13,148,136,0.2)' : 'transparent', color: tab === t ? '#14B8A6' : '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}
                            onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {t === 'login' ? '🔐 Sign In' : '✨ Sign Up'}
                        </motion.button>
                    ))}
                </div>

                {/* Role selector */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    {['dentist', 'patient'].map(r => (
                        <motion.button key={r} style={{ flex: 1, padding: '11px 0', border: `1px solid ${role === r ? '#0D9488' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, background: role === r ? 'rgba(13,148,136,0.12)' : 'rgba(255,255,255,0.02)', color: role === r ? '#14B8A6' : '#475569', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 600 }}
                            onClick={() => setRole(r)}
                            whileTap={{ scale: 0.97 }}
                        >
                            {r === 'dentist' ? '👨‍⚕️ Dentist' : '🙋 Patient'}
                        </motion.button>
                    ))}
                </div>

                {/* Success message */}
                <AnimatePresence>
                    {success && (
                        <motion.div style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', color: '#14B8A6', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >{success}</motion.div>
                    )}
                </AnimatePresence>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        >⚠️ {error}</motion.div>
                    )}
                </AnimatePresence>

                {/* Fields */}
                <AnimatePresence>
                    {tab === 'register' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input style={iStyle} placeholder="Full Name"
                                value={fullName} onChange={e => setFullName(e.target.value)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {tab === 'register' && role === 'dentist' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <input style={{ ...iStyle, borderColor: licenseNumber ? 'rgba(13,148,136,0.5)' : 'rgba(255,255,255,0.07)' }}
                                placeholder="PMC License Number"
                                value={licenseNumber}
                                onChange={e => setLicense(e.target.value)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <input style={iStyle} type="email" placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)} />
                <input style={iStyle} type="password" placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleRegister())}
                />

                {/* Submit */}
                <motion.button style={{
                    width: '100%', padding: '15px 0', marginTop: 8,
                    background: loading ? 'rgba(13,148,136,0.3)' : 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 8px 32px rgba(13,148,136,0.35)',
                }}
                    onClick={tab === 'login' ? handleLogin : handleRegister}
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, boxShadow: '0 12px 40px rgba(13,148,136,0.5)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                >
                    {loading
                        ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>⚡ Processing...</motion.span>
                        : tab === 'login' ? '🔐 Sign In to DeepSense' : '🚀 Create Account'
                    }
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#334155' }}>
                    Protected by AI Security • HIPAA Compliant
                </div>
            </motion.div>
        </div>
    );
}

const iStyle = {
    width: '100%', padding: '13px 16px', marginBottom: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, fontSize: 14, color: '#E2E8F0',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
};