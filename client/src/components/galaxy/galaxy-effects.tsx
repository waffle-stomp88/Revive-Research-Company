import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  ShaderPass,
  GammaCorrectionShader,
} from "three-stdlib";
import type { GalaxyVfxConfig } from "./galaxy-vfx-config";

interface GalaxyEffectsProps {
  config: GalaxyVfxConfig["bloom"];
}

export function GalaxyEffects({ config }: GalaxyEffectsProps) {
  const { gl, scene, camera, size } = useThree();
  const bloomRef = useRef<UnrealBloomPass | null>(null);

  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      config.strength,
      config.radius,
      config.threshold
    );
    bloomRef.current = bloom;
    c.addPass(bloom);
    const gamma = new ShaderPass(GammaCorrectionShader);
    c.addPass(gamma);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  // Update bloom params when variant changes
  useEffect(() => {
    const bloom = bloomRef.current;
    if (!bloom) return;
    bloom.strength = config.strength;
    bloom.radius = config.radius;
    bloom.threshold = config.threshold;
  }, [config.strength, config.radius, config.threshold]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(gl.getPixelRatio());
  }, [composer, gl, size.width, size.height]);

  // Dispose composer + passes on unmount to release GPU resources
  useEffect(() => {
    return () => {
      const passes = (composer as unknown as { passes: { dispose?: () => void }[] }).passes;
      for (const p of passes) {
        if (typeof p.dispose === "function") {
          try {
            p.dispose();
          } catch {
            // ignore
          }
        }
      }
      try {
        composer.dispose();
      } catch {
        // ignore
      }
      bloomRef.current = null;
    };
  }, [composer]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}
