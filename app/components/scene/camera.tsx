import { useEffect, useState } from "react";
import { OrthographicCamera } from "@react-three/drei";
import { SCENE_CONFIG } from "./config";

export function IsoCamera() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const zoom = Math.max(
    1,
    (viewportHeight ?? SCENE_CONFIG.isoCamera.viewportFallback) /
      SCENE_CONFIG.isoCamera.zoomDivisor
  );

  return (
    <OrthographicCamera
      makeDefault
      position={SCENE_CONFIG.isoCamera.position}
      zoom={zoom}
      near={SCENE_CONFIG.isoCamera.near}
      far={SCENE_CONFIG.isoCamera.far}
      onUpdate={(self) => self.lookAt(0, 0, 0)}
    />
  );
}
