"use client";

import { Component, Suspense, useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  OrthographicCamera,
  useGLTF,
} from "@react-three/drei";

const MODEL_URL = "/models/shield.glb";
const MODEL_SIZE = 2.6;

type ModelBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class ModelBoundary extends Component<
  ModelBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function Shield() {
  const { scene } = useGLTF(MODEL_URL);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z);
    const scale = MODEL_SIZE / max;
    scene.scale.setScalar(scale);
    scene.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale
    );
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function Placeholder() {
  return (
    <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.2}>
      <mesh castShadow>
        <torusKnotGeometry args={[0.95, 0.3, 220, 32]} />
        <meshStandardMaterial color="#141a22" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial
          color="#0d1117"
          metalness={0.2}
          roughness={0.6}
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  );
}

function IsoCamera() {
  const size = useThree((s) => s.size);

  return (
    <OrthographicCamera
      makeDefault
      position={[4.6, 3.1, 4.6]}
      zoom={Math.max(1, size.height / 8)}
      near={0.1}
      far={100}
      onUpdate={(self) => self.lookAt(0, 0, 0)}
    />
  );
}

function Rig({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const { clock } = state;
    if (!ref.current) return;
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

export default function Scene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [4.2, 4.2, 4.2],
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <IsoCamera />

        <ambientLight intensity={0.5} />

        <directionalLight
          position={[6, 10, 5]}
          intensity={4.6}
          color="#eaf2fb"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-bias={-0.0004}
        />

        <pointLight
          position={[-5, 0.5, -4]}
          intensity={24}
          distance={0}
          decay={2}
          color="#22d3ee"
        />
        <pointLight
          position={[4, 6, -6]}
          intensity={14}
          distance={0}
          decay={2}
          color="#4d7fff"
        />
        <pointLight
          position={[3, 1, 5]}
          intensity={12}
          distance={0}
          decay={2}
          color="#eaf2fb"
        />

        <Rig>
          <group position={[0, -0.9, 0]}>
            <Suspense fallback={null}>
              <ModelBoundary fallback={<Placeholder />}>
                <Shield />
              </ModelBoundary>
            </Suspense>
          </group>
        </Rig>

        <ContactShadows
          position={[0, -2.3, 0]}
          opacity={0.55}
          scale={9}
          blur={2.6}
          far={3.2}
          color="#000000"
        />

        <Environment resolution={256}>
          <Lightformer
            intensity={4.6}
            position={[0, 5, -9]}
            scale={[12, 12, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={3}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[20, 1, 1]}
            color="#22d3ee"
          />
          <Lightformer
            intensity={2.8}
            rotation-y={-Math.PI / 2}
            position={[10, 2, 0]}
            scale={[20, 1.4, 1]}
            color="#e8f0ff"
          />
          <Lightformer
            intensity={1.6}
            rotation-x={Math.PI / 2}
            position={[0, -5, 0]}
            scale={[10, 2, 10]}
            color="#22d3ee"
          />
          <Lightformer
            intensity={2.2}
            rotation-y={Math.PI}
            position={[0, 3, 8]}
            scale={[8, 1, 1]}
            color="#ffffff"
          />
        </Environment>
      </Canvas>
    </div>
  );
}
