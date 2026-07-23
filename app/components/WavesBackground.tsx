"use client";

import Waves from "@/components/Waves";

interface WavesBackgroundProps {
  linecolor?: string;
}

export default function WavesBackground({ linecolor = "#800000" }: WavesBackgroundProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        filter: "blur(4px)",
      }}
    >
      <Waves
        lineColor={linecolor}
        backgroundColor="transparent"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={30}
        friction={0.9}
        tension={0.08}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
    </div>
  );
}
