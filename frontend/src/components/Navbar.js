import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const allLinks = [
    { path: '/',             label: 'Dashboard',    icon: '⬡' },
    { path: '/analysis',     label: 'AI Analysis',  icon: '◈' },
    { path: '/patients',     label: 'Patients',     icon: '◉' },
    { path: '/appointments', label: 'Appointments', icon: '◷' },
    { path: '/reports',      label: 'Reports',      icon: '◧' },
    { path: '/telehealth',   label: 'Tele-Health',  icon: '◎' },
];

const patientLinks = [
    { path: '/',             label: 'Dashboard',    icon: '⬡' },
    { path: '/appointments', label: 'Appointments', icon: '◷' },
    { path: '/telehealth',   label: 'Tele-Health',  icon: '◎' },
];

export default function Navbar() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const user  = JSON.parse(localStorage.getItem('user') || '{}');
    const links = user.role === 'admin' ? allLinks : patientLinks;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.nav
            style={{
                ...styles.nav,
                background: scrolled ? 'rgba(6,11,20,0.95)' : 'rgba(6,11,20,0.7)',
                backdropFilter: 'blur(20px)',
                boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
            }}
            initial={{ y: -80 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            {/* Logo */}
            <motion.div style={styles.logo} whileHover={{ scale: 1.05 }} onClick={() => navigate('/')}>
                <motion.span style={styles.logoIcon}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                >🦷</motion.span>
                <span style={styles.logoText}>DeepSense</span>
                <span style={styles.logoBadge}>AI</span>
            </motion.div>

            {/* Links */}
            <div style={styles.links}>
                {links.map((l, i) => {
                    const active = location.pathname === l.path;
                    return (
                        <motion.button key={l.path}
                            style={{ ...styles.link, color: active ? '#14B8A6' : '#94A3B8' }}
                            onClick={() => navigate(l.path)}
                            whileHover={{ color: '#14B8A6', y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                        >
                            <span style={{ marginRight: 6, fontSize: 14 }}>{l.icon}</span>
                            {l.label}
                            {active && (
                                <motion.div style={styles.activeLine}
                                    layoutId="activeLine"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* User */}
            <motion.div style={styles.userArea} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div style={styles.avatar}>
                    {user.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.full_name}</div>
                    <div style={styles.userRole}>{user.role === 'admin' ? 'Dentist' : 'Patient'}</div>
                </div>
                <motion.button style={styles.logout}
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    whileHover={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444' }}
                    whileTap={{ scale: 0.95 }}
                >
                    Sign out
                </motion.button>
            </motion.div>
        </motion.nav>
    );
}

const styles = {
    nav: {
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: 64,
        borderBottom: '1px solid rgba(13,148,136,0.15)',
        transition: 'background 0.3s, box-shadow 0.3s',
    },
    logo:      { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 40 },
    logoIcon:  { fontSize: 22 },
    logoText:  { fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: 0.5 },
    logoBadge: { background: 'rgba(13,148,136,0.2)', color: '#14B8A6', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(13,148,136,0.3)' },
    links:     { display: 'flex', gap: 4, flex: 1 },
    link: {
        background: 'none', border: 'none', padding: '8px 14px',
        borderRadius: 8, cursor: 'pointer', fontSize: 13,
        fontWeight: 500, position: 'relative', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center',
    },
    activeLine: {
        position: 'absolute', bottom: -2, left: 8, right: 8,
        height: 2, background: '#14B8A6', borderRadius: 2,
    },
    userArea:  { display: 'flex', alignItems: 'center', gap: 12 },
    avatar:    { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0D9488,#0891B2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 },
    userInfo:  { display: 'flex', flexDirection: 'column' },
    userName:  { fontSize: 13, fontWeight: 600, color: '#E2E8F0' },
    userRole:  { fontSize: 10, color: '#64748B', textTransform: 'capitalize' },
    logout:    { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', transition: 'all 0.2s' },
};