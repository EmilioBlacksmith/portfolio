"use client";

import { Suspense, useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useProgress } from "@react-three/drei";
import { IsoCamera } from "./camera";
import { SceneLights } from "./lights";
import { ShieldWithFallback } from "./model";
import { SCENE_CONFIG } from "./config";

function LoadOverlay({ label }: { label: string }) {
  const { active, progress } = useProgress();
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        <span className="animate-blink text-steel">▮</span>
        <span>{label}</span>
        <div className="h-px w-24 bg-white/10">
          <div
            className="h-px bg-steel transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function RotatingGroup({
  children,
  containerRef,
}: {
  children: ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<THREE.Group>(null);
  const reduceMotion = useRef(false);
  const visible = useRef(true);
  const hidden = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotion.current = mq.matches;
    const onChange = (event: MediaQueryListEvent) => {
      reduceMotion.current = event.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Pause the render loop while the hero is off-screen. The scene lives in a
  // fixed section; once scrolled past, there is no reason to keep animating.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { rootMargin: "128px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [containerRef]);

  // Also pause when the tab is hidden.
  useEffect(() => {
    const onVisibility = () => {
      hidden.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useFrame((state, delta) => {
    if (reduceMotion.current || !visible.current || hidden.current) return;
    if (!ref.current) return;

    const { clock } = state;
    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      clock.elapsedTime * 0.5,
      2,
      delta
    );
    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      Math.sin(clock.elapsedTime * 0.4) * 0.15,
      2,
      delta
    );
  });

  return <group ref={ref}>{children}</group>;
}

export default function Scene({ label }: { label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <LoadOverlay label={label} />
      <Canvas
        shadows
        dpr={SCENE_CONFIG.render.dpr}
        camera={SCENE_CONFIG.camera}
        gl={{ antialias: SCENE_CONFIG.render.antialias, alpha: true }}
      >
        <IsoCamera />
        <SceneLights />
        <RotatingGroup containerRef={containerRef}>
          <group position={[0, SCENE_CONFIG.modelOffsetY, 0]}>
            <Suspense fallback={null}>
              <ShieldWithFallback />
            </Suspense>
          </group>
        </RotatingGroup>
        <ContactShadows
          position={SCENE_CONFIG.shadow.position}
          opacity={SCENE_CONFIG.shadow.opacity}
          scale={SCENE_CONFIG.shadow.scale}
          blur={SCENE_CONFIG.shadow.blur}
          far={SCENE_CONFIG.shadow.far}
          resolution={SCENE_CONFIG.shadow.resolution}
          frames={SCENE_CONFIG.shadow.frames}
          color="#000000"
        />
      </Canvas>
    </div>
  );
}
