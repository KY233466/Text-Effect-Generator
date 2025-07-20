import { useState } from "react";

export function useWarpSettings(defaultType = "wave", defaultIntensity = 50) {
  const [warpType, setWarpType] = useState(defaultType);
  const [intensity, setIntensity] = useState(defaultIntensity);

  return {
    warpType,
    setWarpType,
    intensity,
    setIntensity,
  };
} 