import { Component, useLayoutEffect, type ReactNode } from "react";
import * as THREE from "three";
import { Float, useGLTF } from "@react-three/drei";
import { SCENE_CONFIG } from "./config";

type ModelBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class ModelBoundary extends Component<ModelBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function Shield() {
  const { scene } = useGLTF(SCENE_CONFIG.modelUrl);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z);
    const scale = SCENE_CONFIG.modelSize / max;

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

export function ModelFallback() {
  return (
    <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.2}>
      <mesh castShadow>
        <torusKnotGeometry args={[0.95, 0.3, 220, 32]} />
        <meshStandardMaterial color="#141a22" metalness={0.95} roughness={0.18} />
      </mesh>
      <mesh>
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

export function ShieldWithFallback() {
  return (
    <ModelBoundary fallback={<ModelFallback />}>
      <Shield />
    </ModelBoundary>
  );
}
