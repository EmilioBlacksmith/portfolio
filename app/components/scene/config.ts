const v3 = (x: number, y: number, z: number): [number, number, number] => [
  x,
  y,
  z,
];

export const SCENE_CONFIG = {
  modelUrl: "/models/shield.glb",
  modelSize: 2.6,
  modelOffsetY: -0.9,
  camera: {
    position: v3(4.2, 4.2, 4.2),
    near: 0.1,
    far: 100,
  },
  isoCamera: {
    position: v3(4.6, 3.1, 4.6),
    near: 0.1,
    far: 100,
    zoomDivisor: 8,
    viewportFallback: 800,
  },
  shadow: {
    position: v3(0, -2.3, 0),
    opacity: 0.55,
    scale: 9,
    blur: 2.6,
    far: 3.2,
  },
  lights: {
    ambient: 0.5,
    directional: {
      position: v3(6, 10, 5),
      intensity: 4.6,
      color: "#eaf2fb",
    },
    rimSteel: {
      position: v3(-5, 0.5, -4),
      intensity: 24,
      color: "#22d3ee",
    },
    rimBlue: {
      position: v3(4, 6, -6),
      intensity: 14,
      color: "#4d7fff",
    },
    fill: {
      position: v3(3, 1, 5),
      intensity: 12,
      color: "#eaf2fb",
    },
  },
};
