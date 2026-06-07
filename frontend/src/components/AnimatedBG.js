import React, { useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';

export default function AnimatedBG() {
    const init = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    return (
        <>
            <Particles id="bg-particles" init={init}
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
                    interactivity: {
                        events: { onHover: { enable: true, mode: 'grab' } },
                        modes: { grab: { distance: 140, links: { opacity: 0.2 } } }
                    }
                }}
            />
            {/* Glow orbs */}
            <div style={{ position: 'fixed', top: '15%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'fixed', bottom: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        </>
    );
}