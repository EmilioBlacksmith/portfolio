import { Environment, Lightformer } from "@react-three/drei";
import { SCENE_CONFIG } from "./config";

export function SceneLights() {
  const { ambient, directional, rimSteel, rimBlue, fill } =
    SCENE_CONFIG.lights;

  return (
    <>
      <ambientLight intensity={ambient} />

      <directionalLight
        position={directional.position}
        intensity={directional.intensity}
        color={directional.color}
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
        position={rimSteel.position}
        intensity={rimSteel.intensity}
        distance={0}
        decay={2}
        color={rimSteel.color}
      />
      <pointLight
        position={rimBlue.position}
        intensity={rimBlue.intensity}
        distance={0}
        decay={2}
        color={rimBlue.color}
      />
      <pointLight
        position={fill.position}
        intensity={fill.intensity}
        distance={0}
        decay={2}
        color={fill.color}
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
    </>
  );
}
