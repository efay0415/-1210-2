import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState } from '../types';
import { generateFoliageData } from '../utils';

// SHADERS
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scattered, 1 = Tree
  
  attribute vec3 aScatterPos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;

  // Emerald Colors
  const vec3 colorDeep = vec3(0.0, 0.2, 0.1);
  const vec3 colorLight = vec3(0.1, 0.6, 0.3);
  const vec3 colorGold = vec3(1.0, 0.84, 0.0);

  void main() {
    // Morph Logic
    vec3 targetPos = position; // The buffer geometry position is the TREE position
    vec3 startPos = aScatterPos;
    
    // Add some noise to the movement based on time and randomness
    float noise = sin(uTime * 2.0 + aRandom * 10.0) * 0.2;
    
    // Lerp position
    vec3 finalPos = mix(startPos, targetPos, uProgress);
    
    // Add breathing effect when in tree mode
    if (uProgress > 0.8) {
      finalPos.x += noise * 0.1;
      finalPos.z += noise * 0.1;
    } 
    // Add floating effect when scattered
    else {
      finalPos.y += noise * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = (60.0 * aRandom + 20.0) * (1.0 / -mvPosition.z);

    // Color mixing logic
    float heightMix = (targetPos.y + 6.0) / 12.0; // Normalized height
    vColor = mix(colorDeep, colorLight, heightMix * aRandom);
    
    // Add Gold tips randomly
    if (aRandom > 0.9) {
      vColor = mix(vColor, colorGold, 0.8);
    }

    vAlpha = 1.0;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Circular particle
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Soft glow edge
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  mode: TreeState;
}

export const Foliage: React.FC<FoliageProps> = ({ mode }) => {
  const mesh = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const count = 15000; // High density for luxury look

  const { positions, scatterPositions, randomness } = useMemo(() => generateFoliageData(count), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      
      const targetProgress = mode === TreeState.TREE_SHAPE ? 1.0 : 0.0;
      // Smooth lerp for the uProgress uniform
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        targetProgress,
        delta * 2.0 // Speed of transition
      );
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randomness}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
        }}
      />
    </points>
  );
};
