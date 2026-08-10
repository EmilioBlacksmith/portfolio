"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export function SceneLoader({ label }: { label: string }) {
  return <Scene label={label} />;
}
