/**
 * Hero3DAnimation.jsx — Hyper-Realistic Medical Anatomy Models
 *
 * Organs: Brain, Lungs, Liver, Pancreas, Stomach
 * Bones:  Skull, Hand (left), Leg/Femur
 * Heart removed per user request.
 * Full organ visibility ensured — adjusted scaling.
 */

import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import './Hero3DAnimation.css';

// ── CONFIG ───────────────────────────────────────────────────────────────────
const TOTAL_PARTICLES = 32000;
const MORPH_SPEED = 0.012;
const ROTATION_SPEED = 0.12;

const morphSequence = [
    { shape: 'brain', duration: 4500 },
    { shape: 'lungs', duration: 4500 },
    { shape: 'liver', duration: 4500 },
    { shape: 'stomach', duration: 4500 },
    { shape: 'pancreas', duration: 4000 },
    { shape: 'skull', duration: 4500 },
    { shape: 'hand', duration: 4000 },
    { shape: 'leg', duration: 4000 },
];

const COLORS = {
    CYAN: new THREE.Color('#22d3ee'),
    MAGENTA: new THREE.Color('#e879f9'),
    WHITE: new THREE.Color('#ffffff'),
    GOLD: new THREE.Color('#fbbf24'),
};

const safe = (v) => (isFinite(v) && !isNaN(v) ? v : 0);

// ── PROCEDURAL GENERATORS ────────────────────────────────────────────────────

/** Brain — two cerebral hemispheres with surface wrinkles */
function genBrain(count) {
    const pos = new Float32Array(count * 3);
    const half = Math.floor(count / 2);

    const genHemisphere = (base, n, side) => {
        for (let i = 0; i < n; i++) {
            const idx = (base + i) * 3;
            const t = Math.random() * Math.PI * 2;
            const p = Math.random() * Math.PI;
            // ellipsoid base
            let x = 0.9 * Math.sin(p) * Math.cos(t);
            let y = 0.75 * Math.cos(p);
            let z = 0.65 * Math.sin(p) * Math.sin(t);
            // surface wrinkles via noise-like sinusoids
            const wrinkle = 0.08 * Math.sin(t * 6 + p * 4) + 0.05 * Math.cos(t * 9 - p * 3);
            x += wrinkle * Math.sin(p) * Math.cos(t);
            y += wrinkle * 0.7;
            z += wrinkle * Math.sin(p) * Math.sin(t);
            // flatten bottom
            if (y < -0.3) y = -0.3 + (y + 0.3) * 0.4;
            // hemisphere clamp
            if (side === -1 && x > 0) x = -Math.abs(x) * 0.05;
            if (side === 1 && x < 0) x = Math.abs(x) * 0.05;
            // offset halves apart slightly
            x += side * 0.05;

            pos[idx] = safe(x * 1.55);
            pos[idx + 1] = safe(y * 1.55 + 0.05);
            pos[idx + 2] = safe(z * 1.55);
        }
    };

    genHemisphere(0, half, -1);
    genHemisphere(half, count - half, 1);
    return pos;
}

/** Lungs — two lobed ellipsoids with bronchial texture */
function genLungs(count) {
    const pos = new Float32Array(count * 3);
    const half = Math.floor(count / 2);

    const genLobe = (base, n, side) => {
        for (let i = 0; i < n; i++) {
            const idx = (base + i) * 3;
            const t = Math.random() * Math.PI * 2;
            const p = Math.random() * Math.PI;
            // base ellipsoid: wide horizontally, tall vertically
            const r = 0.85 + 0.18 * Math.cos(t * 2.5) * Math.sin(p * 2);
            let x = r * 0.78 * Math.sin(p) * Math.cos(t);
            let y = r * 1.9 * Math.cos(p);
            let z = r * 0.6 * Math.sin(p) * Math.sin(t);
            // bronchial ridge texture
            const ridge = 0.06 * Math.sin(p * 5) * Math.cos(t * 3);
            x += ridge;
            y += ridge * 0.5;
            // taper bottom
            if (y < -1.3) y = -1.3 + (y + 1.3) * 0.3;
            // notch at top-center (mediastinum)
            if (Math.abs(x) < 0.12 && y > 0.8) y -= 0.3;

            pos[idx] = safe(x + side * 1.05);
            pos[idx + 1] = safe(y);
            pos[idx + 2] = safe(z);
        }
    };

    genLobe(0, half, -1);
    genLobe(half, count - half, 1);
    return pos;
}

/** Liver — large right-dominant wedge with gallbladder bump */
function genLiver(count) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI;
        // right-heavy dome shape
        const rx = 1.9 + 0.25 * Math.cos(t * 1.3);
        const ry = 0.72;
        const rz = 1.0 + 0.15 * Math.sin(t * 2);
        let x = rx * Math.cos(t) * Math.sin(p);
        let y = ry * Math.cos(p);
        let z = rz * Math.sin(t) * Math.sin(p);
        // Kupffer surface texture
        const surf = 0.06 * Math.sin(t * 7 + p * 5);
        x += surf; y += surf * 0.4;
        // right lobe bias (shift right)
        x -= 0.35;
        // gallbladder bump on inferior surface
        if (x > 0.1 && y < -0.25 && z > -0.25 && z < 0.25) y -= 0.18;

        pos[i3] = safe(x);
        pos[i3 + 1] = safe(y);
        pos[i3 + 2] = safe(z);
    }
    return pos;
}

/** Stomach — J-shaped pouch with rugae folds */
function genStomach(count) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = (i / count) * Math.PI * 2.4;
        const p = Math.random() * Math.PI;
        const r = 0.62 + 0.32 * Math.sin(t * 1.2);
        // J-curve trajectory
        const cx = 0.55 * Math.sin(t * 0.45);
        const cy = t * 0.72 - 1.75;
        const cz = 0.0;
        // Rugae (mucosal folds)
        const rugae = 0.07 * Math.sin(t * 8 + p * 2);
        let x = cx + (r + rugae) * Math.sin(p) * Math.cos(t);
        let y = cy + (r + rugae) * Math.cos(p) * 0.38;
        let z = cz + r * Math.sin(p) * Math.sin(t) * 0.7;
        // cardiac sphincter at top
        if (t < 0.25) { x *= 0.45; y = t * 1.3 - 1.75; }

        pos[i3] = safe(x);
        pos[i3 + 1] = safe(y);
        pos[i3 + 2] = safe(z);
    }
    return pos;
}

/** Pancreas — tadpole/elongated gland with lobular texture */
function genPancreas(count) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = i / count;
        // width tapers from head to tail
        const headW = 0.52 - t * 0.38;
        const headH = 0.28 - t * 0.18;
        const lengthX = t * 3.0 - 1.5;
        // gentle S-curve
        const curveY = Math.sin(t * Math.PI) * 0.28;
        const curveZ = Math.cos(t * Math.PI * 1.5) * 0.12;
        // lobular surface
        const lobe = 0.06 * Math.sin(t * 14 + Math.random() * 2);
        const rx = (Math.random() - 0.5) * headW * 2;
        const ry = (Math.random() - 0.5) * headH * 2 + curveY + lobe;
        const rz = (Math.random() - 0.5) * headH * 1.2 + curveZ;

        pos[i3] = safe(lengthX);
        pos[i3 + 1] = safe(ry);
        pos[i3 + 2] = safe(rz);
    }
    return pos;
}

/** Skull — cranium + mandible + orbital ridges */
function genSkull(count) {
    const pos = new Float32Array(count * 3);
    const craniumCount = Math.floor(count * 0.70);
    const faceCount = Math.floor(count * 0.20);
    const jawCount = count - craniumCount - faceCount;

    // Cranium
    for (let i = 0; i < craniumCount; i++) {
        const idx = i * 3;
        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI;
        const rx = 1.05, ry = 1.0, rz = 1.0;
        let x = rx * Math.sin(p) * Math.cos(t);
        let y = ry * Math.cos(p);
        let z = rz * Math.sin(p) * Math.sin(t);
        // only upper half
        if (y < -0.15) y = -0.15 + (y + 0.15) * 0.25;
        // frontal bone flatness
        if (z < -0.6) z = -0.6 + (z + 0.6) * 0.35;
        // surface detail
        const detail = 0.04 * Math.sin(t * 5 + p * 4);
        x += detail; y += detail * 0.5;
        pos[idx] = safe(x);
        pos[idx + 1] = safe(y + 0.35);
        pos[idx + 2] = safe(z);
    }

    // Facial skeleton (cheekbones, orbits, nasal)
    for (let i = 0; i < faceCount; i++) {
        const idx = (craniumCount + i) * 3;
        const t = Math.random() * Math.PI * 2;
        const faceT = Math.random();
        const side = (Math.random() > 0.5 ? 1 : -1);
        let x, y, z;
        if (faceT < 0.45) {
            // orbital rims
            x = side * (0.38 + 0.04 * Math.cos(t));
            y = 0.12 + 0.06 * Math.sin(t) + (Math.random() - 0.5) * 0.05;
            z = -0.7 + 0.04 * Math.cos(t * 2);
        } else if (faceT < 0.75) {
            // cheekbones
            x = side * (0.55 + 0.06 * Math.random());
            y = -0.08 + Math.random() * 0.08;
            z = -0.55 + Math.random() * 0.08;
        } else {
            // nasal bridge
            x = (Math.random() - 0.5) * 0.14;
            y = 0.0 + Math.random() * 0.18;
            z = -0.82 + Math.random() * 0.1;
        }
        pos[idx] = safe(x);
        pos[idx + 1] = safe(y + 0.35);
        pos[idx + 2] = safe(z);
    }

    // Mandible (lower jaw)
    for (let i = 0; i < jawCount; i++) {
        const idx = (craniumCount + faceCount + i) * 3;
        const t = Math.random() * Math.PI * 1.15 - Math.PI * 0.575;
        const jawR = 0.62;
        let x = jawR * Math.sin(t);
        let y = -0.52 + (Math.random() - 0.5) * 0.08;
        let z = -jawR * 0.55 * Math.cos(t) - 0.12;
        pos[idx] = safe(x);
        pos[idx + 1] = safe(y + 0.35);
        pos[idx + 2] = safe(z);
    }
    return pos;
}

/** Hand — wrist, metacarpals, and 5 digit outlines */
function genHand(count) {
    const pos = new Float32Array(count * 3);
    const palmCount = Math.floor(count * 0.30);
    const wristCount = Math.floor(count * 0.12);
    const digitCount = count - palmCount - wristCount;
    const S = 1.0;

    // Palm (trapezoid)
    for (let i = 0; i < palmCount; i++) {
        const idx = i * 3;
        const u = (Math.random() - 0.5) * 0.9;
        const v = Math.random() * 1.1;
        const taper = 1 - v * 0.18;
        const surf = 0.035 * Math.sin(u * 8 + v * 5);
        pos[idx] = safe((u * taper + surf) * S);
        pos[idx + 1] = safe((v - 0.55 + surf * 0.5) * S);
        pos[idx + 2] = safe((Math.random() - 0.5) * 0.14 * S);
    }

    // Wrist (oval)
    for (let i = 0; i < wristCount; i++) {
        const idx = (palmCount + i) * 3;
        const t = Math.random() * Math.PI * 2;
        pos[idx] = safe(0.42 * Math.cos(t) * S);
        pos[idx + 1] = safe((-0.55 + 0.14 * Math.sin(t)) * S);
        pos[idx + 2] = safe((Math.random() - 0.5) * 0.12 * S);
    }

    // Digits — 5 fingers
    const fingers = [
        { ox: -0.38, len: 0.82, ang: -0.12 }, // pinky
        { ox: -0.19, len: 1.05, ang: -0.04 }, // ring
        { ox: 0.01, len: 1.15, ang: 0.00 }, // middle
        { ox: 0.20, len: 1.08, ang: 0.04 }, // index
        { ox: 0.42, len: 0.85, ang: 0.30 }, // thumb (wider angle)
    ];
    const perFinger = Math.floor(digitCount / 5);

    fingers.forEach((f, fi) => {
        for (let i = 0; i < perFinger; i++) {
            const idx = (palmCount + wristCount + fi * perFinger + i) * 3;
            const t = Math.random();
            const phalangeNoise = 0.04 * Math.sin(t * Math.PI * 3);
            const x = f.ox + t * Math.sin(f.ang) * f.len + (Math.random() - 0.5) * 0.07 + phalangeNoise * 0.5;
            const y = 0.55 + t * Math.cos(f.ang) * f.len + (Math.random() - 0.5) * 0.07 + phalangeNoise;
            const z = (Math.random() - 0.5) * 0.10;
            pos[idx] = safe(x * S);
            pos[idx + 1] = safe(y * S);
            pos[idx + 2] = safe(z * S);
        }
    });

    return pos;
}

/** Leg/Femur — full femur shaft + condyles at bottom + femoral head at top */
function genLeg(count) {
    const pos = new Float32Array(count * 3);
    const shaftCount = Math.floor(count * 0.60);
    const headCount = Math.floor(count * 0.20);
    const condylCount = count - shaftCount - headCount;
    const S = 0.55;

    // Shaft — slightly curved cylinder
    for (let i = 0; i < shaftCount; i++) {
        const idx = i * 3;
        const t = i / shaftCount;
        const y = (t * 3.8 - 1.9) * S;
        const curveX = 0.12 * Math.sin(t * Math.PI) * S;
        const r = (0.22 - 0.04 * Math.sin(t * Math.PI)) * S;
        const ang = Math.random() * Math.PI * 2;
        const ridgeDetail = 1 + 0.04 * Math.sin(ang * 4 + t * 8);
        pos[idx] = safe(curveX + r * ridgeDetail * Math.cos(ang));
        pos[idx + 1] = safe(y);
        pos[idx + 2] = safe(r * ridgeDetail * Math.sin(ang));
    }

    // Femoral head (ball at top)
    for (let i = 0; i < headCount; i++) {
        const idx = (shaftCount + i) * 3;
        const t = Math.random() * Math.PI * 2;
        const p = Math.random() * Math.PI;
        const r = 0.28 * S;
        pos[idx] = safe(r * Math.sin(p) * Math.cos(t) - 0.30 * S);
        pos[idx + 1] = safe(1.92 * S + r * Math.cos(p));
        pos[idx + 2] = safe(r * Math.sin(p) * Math.sin(t));
    }

    // Condyles at bottom (two bumps)
    for (let i = 0; i < condylCount; i++) {
        const idx = (shaftCount + headCount + i) * 3;
        const side = i < condylCount / 2 ? -1 : 1;
        const t = Math.random() * Math.PI * 2;
        const r = 0.22 * S;
        pos[idx] = safe(side * 0.20 * S + r * 0.6 * Math.cos(t));
        pos[idx + 1] = safe(-1.92 * S + r * 0.55 * Math.sin(t));
        pos[idx + 2] = safe(r * 0.7 * Math.cos(t * 2));
    }

    return pos;
}

const GENERATORS = {
    brain: genBrain,
    lungs: genLungs,
    liver: genLiver,
    stomach: genStomach,
    pancreas: genPancreas,
    skull: genSkull,
    hand: genHand,
    leg: genLeg,
};

// Colour palette per shape
const SHAPE_COLORS = {
    brain: [new THREE.Color('#a78bfa'), new THREE.Color('#22d3ee')],
    lungs: [new THREE.Color('#fb7185'), new THREE.Color('#f9a8d4')],
    liver: [new THREE.Color('#c2410c'), new THREE.Color('#fb923c')],
    stomach: [new THREE.Color('#059669'), new THREE.Color('#34d399')],
    pancreas: [new THREE.Color('#d97706'), new THREE.Color('#fbbf24')],
    skull: [new THREE.Color('#e5e7eb'), new THREE.Color('#94a3b8')],
    hand: [new THREE.Color('#f3e8ff'), new THREE.Color('#c084fc')],
    leg: [new THREE.Color('#cbd5e1'), new THREE.Color('#64748b')],
};

// ── PARTICLE COMPONENT ────────────────────────────────────────────────────────
function ParticleSystem() {
    const ref = useRef();
    const colorRef = useRef();
    const currentIdx = useRef(0);
    const targetIdx = useRef(0);
    const progress = useRef(1);
    const timer = useRef(0);

    const shapes = useMemo(() => {
        const s = {};
        morphSequence.forEach(({ shape }) => { s[shape] = GENERATORS[shape](TOTAL_PARTICLES); });
        return s;
    }, []);

    const { geometry, initialColors } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(shapes.brain), 3));

        const colors = new Float32Array(TOTAL_PARTICLES * 3);
        const sizes = new Float32Array(TOTAL_PARTICLES);
        const [c1, c2] = SHAPE_COLORS.brain;
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const c = i % 2 === 0 ? c1 : c2;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
            sizes[i] = Math.random() * 2.0 + 0.6;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        return { geometry: geo, initialColors: colors };
    }, [shapes]);

    const material = useMemo(() => new THREE.PointsMaterial({
        size: 0.030,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
    }), []);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const posArr = geometry.attributes.position.array;
        const colorArr = geometry.attributes.color.array;
        timer.current += delta;

        const curDuration = morphSequence[currentIdx.current].duration / 1000;
        if (timer.current > curDuration) {
            targetIdx.current = (currentIdx.current + 1) % morphSequence.length;
            progress.current = 0;
            timer.current = 0;
        }

        if (progress.current < 1) {
            progress.current = Math.min(progress.current + MORPH_SPEED, 1);
            const t = THREE.MathUtils.smoothstep(progress.current, 0, 1);
            const tar = shapes[morphSequence[targetIdx.current].shape];

            for (let i = 0; i < TOTAL_PARTICLES * 3; i++) {
                posArr[i] = THREE.MathUtils.lerp(posArr[i], tar[i], t);
            }

            // Blend colours toward target shape palette
            const [c1, c2] = SHAPE_COLORS[morphSequence[targetIdx.current].shape];
            for (let i = 0; i < TOTAL_PARTICLES; i++) {
                const c = i % 2 === 0 ? c1 : c2;
                colorArr[i * 3] = THREE.MathUtils.lerp(colorArr[i * 3], c.r, t * 0.08);
                colorArr[i * 3 + 1] = THREE.MathUtils.lerp(colorArr[i * 3 + 1], c.g, t * 0.08);
                colorArr[i * 3 + 2] = THREE.MathUtils.lerp(colorArr[i * 3 + 2], c.b, t * 0.08);
            }

            if (progress.current >= 1) currentIdx.current = targetIdx.current;
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
        }

        ref.current.rotation.y += ROTATION_SPEED * delta;
        ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12 + 0.3;
    });

    return <points ref={ref} geometry={geometry} material={material} />;
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
const Hero3DAnimation = () => {
    return (
        <div className="hero-3d-wrapper">
            <div className="canvas-container">
                <Canvas camera={{ position: [0, 0, 5.2], fov: 44 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[8, 10, 8]} intensity={2.2} color="#a78bfa" />
                    <pointLight position={[-8, -10, -8]} intensity={2.0} color="#22d3ee" />
                    <pointLight position={[0, 5, -10]} intensity={1.2} color="#f9a8d4" />
                    <Suspense fallback={null}>
                        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
                            <ParticleSystem />
                        </Float>
                        <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
                </Canvas>
            </div>
        </div>
    );
};

export default Hero3DAnimation;