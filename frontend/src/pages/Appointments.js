import React, { useState, useEffect, useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import API from '../api/axios';
import Navbar from '../components/Navbar';

function AnimatedBG() {
    const init = useCallback(async engine => { await loadSlim(engine); }, []);
    return (
        <>
            <Particles id="appointments-particles" init={init}
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
    table:      { background: 'rgba(15,25,45,0.8)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(13,148,136,0.15)' },
    thead:      { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr 1fr', padding: '12px 20px', background: 'rgba(13,148,136,0.08)', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' },
    trow:       { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 2fr 1fr', padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' },
    overlay:    { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' },
    modal:      { background: '#0F1928', border: '1px solid rgba(13,148,136,0.2)', borderRadius: 16, padding: 32, width: 420, boxShadow: '0 40px 80px rgba(0,0,0,0.5)' },
   input: { 
    width: '100%', padding: 12, 
    border: '1px solid rgba(255,255,255,0.08)', 
    borderRadius: 8, fontSize: 14, marginBottom: 12, 
    boxSizing: 'border-box', 
    background: 'rgba(255,255,255,0.04)', 
    color: '#E2E8F0',
    colorScheme: 'dark',  // ← YE ADD KARO
},
};

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients]         = useState([]);
    const [modal, setModal]               = useState(false);
    const [form, setForm] = useState({ patient_id: '', appointment_date: '', time_slot: '', reason: '' });
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00'];

    useEffect(() => { fetchAppointments(); fetchPatients(); }, []);
    const fetchAppointments = async () => { try { const res = await API.get('/appointments'); setAppointments(res.data); } catch {} };
    const fetchPatients     = async () => { try { const res = await API.get('/patients');     setPatients(res.data);     } catch {} };
    const bookAppointment   = async () => { try { await API.post('/appointments', form); setModal(false); fetchAppointments(); } catch {} };

    const statusColor = s => ({
        booked:    { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
        completed: { bg: 'rgba(13,148,136,0.15)',  color: '#14B8A6' },
        cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#F87171' },
    }[s] || { bg: 'rgba(255,255,255,0.05)', color: '#94A3B8' });

    return (
        <div style={{ minHeight: '100vh', background: '#060B14', position: 'relative' }}>
            <AnimatedBG />
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar />
               <div style={{ padding: '96px 40px 40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>📅 Appointments</h2>
                        <button onClick={() => setModal(true)} style={dark.btn}>+ Book Appointment</button>
                    </div>
                    <div style={dark.table}>
                        <div style={dark.thead}>
                            <span>Patient</span><span>Date</span><span>Time</span><span>Reason</span><span>Status</span>
                        </div>
                        {appointments.map(a => {
                            const sc = statusColor(a.status);
                            return (
                                <div key={a.id} style={dark.trow}>
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{a.patients?.full_name || '—'}</span>
                                    <span style={{ color: '#94A3B8' }}>{a.appointment_date}</span>
                                    <span style={{ color: '#94A3B8' }}>{a.time_slot}</span>
                                    <span style={{ color: '#64748B' }}>{a.reason || '—'}</span>
                                    <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{a.status}</span>
                                </div>
                            );
                        })}
                        {appointments.length === 0 && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>No appointments yet</div>
                        )}
                    </div>
                </div>
            </div>
            {modal && (
                <div style={dark.overlay}>
                    <div style={dark.modal}>
                        <h3 style={{ marginBottom: 20, color: '#fff' }}>Book Appointment</h3>
                        <select style={dark.input} value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                        <input style={dark.input} type="date" value={form.appointment_date} onChange={e => setForm({...form, appointment_date: e.target.value})} />
                        <select style={dark.input} value={form.time_slot} onChange={e => setForm({...form, time_slot: e.target.value})}>
                            <option value="">Select Time Slot</option>
                            {slots.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input style={dark.input} placeholder="Reason" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button style={dark.btn} onClick={bookAppointment}>Book</button>
                            <button style={dark.btnOutline} onClick={() => setModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}