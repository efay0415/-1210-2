import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { TreeState } from '../types';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeState;
}

const Rig = () => {
  useFrame((state) => {
    // Subtle mouse parallax
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 15 + state.pointer.x * 2, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Top Star Component
const StarTopper = ({ mode }: { mode: TreeState }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if(!meshRef.current) return;
        
        // Float logic
        const targetY = mode === TreeState.TREE_SHAPE ? 6.5 : 10;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, delta * 2);
        
        // Spin
        meshRef.current.rotation.y += delta * 0.5;
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    })

    return (
        <mesh ref={meshRef} position={[0, 10, 0]}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
        </mesh>
    )
}

export const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[15, 2, 15]} fov={45} />
        <Rig />
        
        {/* Cinematic Environment */}
        <color attach="background" args={['#050a05']} />
        <fog attach="fog" args={['#050a05', 10, 40]} />
        
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={10} castShadow shadow-mapSize={[2048, 2048]} color="#fffaed" />
        <pointLight position={[-10, -10, -10]} intensity={5} color="#00ff00" />
        <pointLight position={[0, 5, 0]} intensity={2} color="#ffd700" distance={10} decay={2} />

        <group position={[0, -4, 0]}>
            {/* The Main Tree Foliage */}
            <Foliage mode={treeState} />

            {/* Decorations Layer 1: Gold Orbs */}
            <Ornaments 
                count={150} 
                mode={treeState} 
                type="SPHERE" 
                color="#FFD700" 
                metalness={0.9} 
                roughness={0.1}
                scaleBase={0.6}
            />

            {/* Decorations Layer 2: Red Velvet Boxes */}
            <Ornaments 
                count={40} 
                mode={treeState} 
                type="BOX" 
                color="#8B0000" 
                metalness={0.3} 
                roughness={0.8}
                scaleBase={0.8}
            />
            
             {/* Decorations Layer 3: Silver/Diamond Fillers */}
             <Ornaments 
                count={200} 
                mode={treeState} 
                type="SPHERE" 
                color="#E0FFFF" 
                metalness={1} 
                roughness={0}
                scaleBase={0.2}
            />

            <StarTopper mode={treeState} />
        </group>

        {/* Background Elements */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="city" />

        {/* Post Processing for the "Arix Signature" Glow */}
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5} 
            minPolarAngle={Math.PI / 3}
            maxDistance={30}
            minDistance={8}
            autoRotate={treeState === TreeState.TREE_SHAPE}
            autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
