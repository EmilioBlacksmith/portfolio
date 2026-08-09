"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs tracking-widest text-faint">
      <span className="animate-blink">▮</span>&nbsp;loading model
    </div>
  ),
});

export function SceneLoader() {
  return <Scene />;
}
