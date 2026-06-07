import React, { useState, useEffect, useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import API from '../api/axios';
import Navbar from '../components/Navbar';

function AnimatedBG() {
    const init = useCallback(async engine => { await loadSlim(engine); }, []);
    return (
        <>
            <Particles id="patients-particles" init={init}
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

const dark = {
    btn:        { background: 'linear-gradient(135deg, #0D9488, #0891B2)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
    btnOutline: { background: 'transparent', color: '#0D9488', border: '1px solid #0D9488', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
    search:     { width: '100%', padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0' },
    table:      { background: 'rgba(15,25,45,0.8)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(13,148,136,0.15)' },
    thead:      { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '12px 20px', background: 'rgba(13,148,136,0.08)', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' },
    trow:       { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
    badge:      { background: 'rgba(13,148,136,0.15)', color: '#14B8A6', padding: '3px 10px', borderRadius: 20, fontSize: 12 },
    overlay:    { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' },
    modal:      { background: '#0F1928', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 16, padding: 32, width: 420, boxShadow: '0 40px 80px rgba(0,0,0,0.5)' },
    input:      { width: '100%', padding: 12, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', color: '#E2E8F0' },
};

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch]     = useState('');
    const [modal, setModal]       = useState(false);
    const [form, setForm]         = useState({ full_name: '', email: '', date_of_birth: '' });

    useEffect(() => { fetchPatients(); }, []);

    const fetchPatients = async () => {
        try { const res = await API.get('/patients'); setPatients(res.data); }
        catch (err) { console.log(err); }
    };

    const addPatient = async () => {
        try {
            await API.post('/patients', form);
            setModal(false);
            setForm({ full_name: '', email: '', date_of_birth: '' });
            fetchPatients();
        } catch (err) { console.log(err); }
    };

    const filtered = patients.filter(p =>
        p.full_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', background: '#060B14', position: 'relative' }}>
            <AnimatedBG />
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar />
                <div style={{ padding: '32px 40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>👥 Patients</h2>
                        <button onClick={() => setModal(true)} style={dark.btn}>+ Add Patient</button>
                    </div>
                    <input style={dark.search} placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
                    <div style={dark.table}>
                        <div style={dark.thead}>
                            <span>Name</span><span>Email</span><span>Date of Birth</span><span>Status</span>
                        </div>
                        {filtered.map(p => (
                            <div key={p.id} style={dark.trow}>
                                <span style={{ fontWeight: 600, color: '#fff' }}>{p.full_name}</span>
                                <span style={{ color: '#64748B' }}>{p.email || '—'}</span>
                                <span style={{ color: '#64748B' }}>{p.date_of_birth || '—'}</span>
                                <span><span style={dark.badge}>Active</span></span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No patients found</div>
                        )}
                    </div>
                </div>
            </div>
            {modal && (
                <div style={dark.overlay}>
                    <div style={dark.modal}>
                        <h3 style={{ marginBottom: 20, color: '#fff' }}>Add New Patient</h3>
                        <input style={dark.input} placeholder="Full Name *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                        <input style={dark.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        <input style={dark.input} type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                            <button style={dark.btn} onClick={addPatient}>Add</button>
                            <button style={dark.btnOutline} onClick={() => setModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}