import React, { useCallback } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';

export default function ParticlesBg() {
    const init = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={init}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100%', height: '100%',
                zIndex: 0, pointerEvents: 'none'
            }}
            options={{
                background: { color: { value: 'transparent' } },
                fpsLimit: 60,
                particles: {
                    number: { value: 60, density: { enable: true, area: 800 } },
                    color: { value: ['#0D9488', '#14B8A6', '#0891B2'] },
                    links: {
                        enable: true,
                        color: '#0D9488',
                        distance: 150,
                        opacity: 0.15,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 0.8,
                        direction: 'none',
                        random: true,
                        outModes: { default: 'bounce' }
                    },
                    opacity: { value: { min: 0.1, max: 0.4 } },
                    shape: { type: 'circle' },
                    size: { value: { min: 1, max: 3 } },
                },
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: 'grab' },
                        onClick: { enable: true, mode: 'push' }
                    },
                    modes: {
                        grab: { distance: 140, links: { opacity: 0.4 } },
                        push: { quantity: 3 }
                    }
                },
                detectRetina: true,
            }}
        />
    );
}