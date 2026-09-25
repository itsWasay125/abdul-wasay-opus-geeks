import { useEffect, useRef } from "react";
import { initNoiseCloudScene } from "../three/scenes";

export default function NoiseCloudBackground() {
  const canvasRef = useRef(null);

  useEffect(() => initNoiseCloudScene(canvasRef.current), []);

  return (
    <div className="noise-cloud-background" aria-hidden="true">
      <canvas ref={canvasRef} className="noise-cloud-background__canvas" />
    </div>
  );
}
