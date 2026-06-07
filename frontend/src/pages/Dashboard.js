import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import ParticlesBg from '../components/ParticlesBg';
import API from '../api/axios';

const fadeUp = (delay=0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: [0.16,1,0.3,1] }
});

// ── PATIENT DASHBOARD ─────────────────────────────
function PatientDashboard({ user }) {
    const [appointments, setAppointments] = useState([]);
    const [reports, setReports]           = useState([]);

    useEffect(() => {
        API.get('/appointments').then(r => setAppointments(r.data)).catch(()=>{});
        API.get('/reports').then(r => setReports(r.data)).catch(()=>{});
    }, []);

    return (
        <div style={{ minHeight:'100vh', background:'#060B14' }}>
            <ParticlesBg />
            <Navbar />
            <div style={{ paddingTop: 96, paddingLeft: 40, paddingRight: 40, paddingBottom: 60, position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <motion.div style={{ marginBottom: 40 }} {...fadeUp(0)}>
                    <div style={{ fontSize: 13, color: '#0D9488', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Welcome back</div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{user.full_name} 👋</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>Here's your dental health overview.</p>
                </motion.div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 40, maxWidth: 600 }}>
                    {[
                        { label: 'My Appointments', val: appointments.length, icon: '◷', color: '#F59E0B', glow: 'rgba(245,158,11,0.15)' },
                        { label: 'My Reports',      val: reports.length,      icon: '◈', color: '#8B5CF6', glow: 'rgba(139,92,246,0.15)' },
                    ].map((s, i) => (
                        <motion.div key={i}
                            style={{ background: 'rgba(15,25,45,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${s.color}22`, borderRadius: 16, padding: 24, boxShadow: `0 0 30px ${s.glow}` }}
                            {...fadeUp(0.1 + i * 0.07)}
                            whileHover={{ y: -4, boxShadow: `0 12px 40px ${s.glow}` }}
                        >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16 }}>
                                <div style={{ fontSize: 22, color: s.color }}>{s.icon}</div>
                                <div style={{ background: `${s.color}15`, color: s.color, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</div>
                            </div>
                            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ color: '#64748B', fontSize: 13, marginTop: 6 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* My Appointments */}
                <motion.div style={{ background: 'rgba(15,25,45,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(13,148,136,0.12)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }} {...fadeUp(0.3)}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>📅 My Appointments</div>
                    </div>
                    {appointments.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#334155' }}>No appointments yet</div>
                    ) : appointments.map((a, i) => (
                        <motion.div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
                            whileHover={{ background: 'rgba(13,148,136,0.05)' }}
                        >
                            <div>
                                <div style={{ color:'#E2E8F0', fontSize: 14, fontWeight: 500 }}>{a.appointment_date} — {a.time_slot}</div>
                                <div style={{ color:'#475569', fontSize: 12, marginTop: 2 }}>{a.reason || 'General Checkup'}</div>
                            </div>
                            <div style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{a.status}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* My Reports */}
                <motion.div style={{ background: 'rgba(15,25,45,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(13,148,136,0.12)', borderRadius: 16, overflow: 'hidden' }} {...fadeUp(0.4)}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>📋 My AI Reports</div>
                    </div>
                    {reports.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#334155' }}>No reports yet</div>
                    ) : reports.map((r, i) => {
                        const findings = r.confidence_scores || {};
                        const top = Object.entries(findings).sort((a,b)=>b[1]-a[1])[0];
                        return (
                            <motion.div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                                whileHover={{ background: 'rgba(13,148,136,0.05)' }}
                            >
                                <div>
                                    <div style={{ color:'#E2E8F0', fontSize: 14, fontWeight: 500 }}>{top ? top[0] : 'Analysis'}</div>
                                    <div style={{ color:'#475569', fontSize: 12, marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                                </div>
                                <div style={{ color:'#10B981', fontWeight: 700, fontSize: 14 }}>{top ? `${(top[1]*100).toFixed(0)}%` : '—'}</div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

// ── DENTIST DASHBOARD ─────────────────────────────
function DentistDashboard({ user }) {
    const [stats, setStats]   = useState({ patients:0, reports:0, appointments:0 });
    const [reports, setReports] = useState([]);

    useEffect(() => {
        Promise.all([
            API.get('/patients'),
            API.get('/reports'),
            API.get('/appointments'),
        ]).then(([p,r,a]) => {
            setStats({ patients: p.data.length, reports: r.data.length, appointments: a.data.length });
            setReports(r.data.slice(0,5));
        }).catch(()=>{});
    }, []);

    const statCards = [
        { label:'Total Patients',  val: stats.patients,     icon:'◉', color:'#0D9488', glow:'rgba(13,148,136,0.15)' },
        { label:'AI Reports',      val: stats.reports,      icon:'◈', color:'#8B5CF6', glow:'rgba(139,92,246,0.15)' },
        { label:'Appointments',    val: stats.appointments, icon:'◷', color:'#F59E0B', glow:'rgba(245,158,11,0.15)' },
        { label:'Avg Confidence',  val: '94%',              icon:'◎', color:'#10B981', glow:'rgba(16,185,129,0.15)' },
    ];

    return (
        <div style={{ minHeight:'100vh', background:'#060B14' }}>
            <ParticlesBg />
            <Navbar />
            <div style={{ paddingTop: 96, paddingLeft: 40, paddingRight: 40, paddingBottom: 60, position: 'relative', zIndex: 1 }}>

                <motion.div style={{ marginBottom: 40 }} {...fadeUp(0)}>
                    <div style={{ fontSize: 13, color: '#0D9488', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Welcome back</div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{user.full_name} 👋</h1>
                    <p style={{ color: '#64748B', fontSize: 15 }}>Here's what's happening with your patients today.</p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
                    {statCards.map((s, i) => (
                        <motion.div key={i}
                            style={{ background: 'rgba(15,25,45,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${s.color}22`, borderRadius: 16, padding: 24, boxShadow: `0 0 30px ${s.glow}` }}
                            {...fadeUp(0.1 + i * 0.07)}
                            whileHover={{ y: -4, boxShadow: `0 12px 40px ${s.glow}`, borderColor: `${s.color}44` }}
                        >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16 }}>
                                <div style={{ fontSize: 22, color: s.color }}>{s.icon}</div>
                                <div style={{ background: `${s.color}15`, color: s.color, fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>LIVE</div>
                            </div>
                            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ color: '#64748B', fontSize: 13, marginTop: 6 }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div style={{ background: 'rgba(15,25,45,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(13,148,136,0.12)', borderRadius: 16, overflow: 'hidden' }} {...fadeUp(0.4)}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>Recent AI Findings</div>
                        <div style={{ background: 'rgba(13,148,136,0.15)', color: '#14B8A6', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>● AI Active</div>
                    </div>
                    {reports.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: '#334155' }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                            No AI reports yet
                        </div>
                    ) : reports.map((r, i) => {
                        const findings = r.confidence_scores || {};
                        const top = Object.entries(findings).sort((a,b)=>b[1]-a[1])[0];
                        return (
                            <motion.div key={r.id}
                                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                                whileHover={{ background: 'rgba(13,148,136,0.05)' }}
                            >
                                <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
                                    <div style={{ width: 8, height: 8, borderRadius:'50%', background: '#F59E0B' }}/>
                                    <div>
                                        <div style={{ color:'#E2E8F0', fontSize: 14, fontWeight: 500 }}>{top ? top[0] : 'Analysis'}</div>
                                        <div style={{ color:'#475569', fontSize: 12, marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ color:'#10B981', fontWeight: 700, fontSize: 14 }}>{top ? `${(top[1]*100).toFixed(0)}%` : '—'}</div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

// ── MAIN EXPORT ───────────────────────────────────
export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin'
        ? <DentistDashboard user={user} />
        : <PatientDashboard user={user} />;
}