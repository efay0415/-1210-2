import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeState, DualPosition, OrnamentProps } from '../types';
import { getTreePoint, getRandomSpherePoint } from '../utils';

interface InstancedOrnamentsProps extends OrnamentProps {
  type: 'SPHERE' | 'BOX';
  color: string;
  metalness: number;
  roughness: number;
  scaleBase: number;
}

export const Ornaments: React.FC<InstancedOrnamentsProps> = ({ 
  count, 
  mode, 
  type, 
  color,
  metalness,
  roughness,
  scaleBase 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-calculate positions
  const data: DualPosition[] = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const treeVec = getTreePoint(11, 4.0); // Slightly inside foliage
      const scatterVec = getRandomSpherePoint(18); // Wider scatter than foliage
      const scale = Math.random() * 0.5 + 0.5;

      return {
        treePosition: [treeVec.x, treeVec.y, treeVec.z],
        scatterPosition: [scatterVec.x, scatterVec.y, scatterVec.z],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: scale * scaleBase,
        speed: Math.random() * 0.5 + 0.2
      };
    });
  }, [count, scaleBase]);

  useLayoutEffect(() => {
    // Initial placement to avoid flicker
    if (meshRef.current) {
        data.forEach((d, i) => {
            dummy.position.set(...d.scatterPosition);
            dummy.scale.setScalar(d.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        })
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, dummy]);

  // Animation Loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isTree = mode === TreeState.TREE_SHAPE;

    // We manually interpolate positions on CPU for instances to allow for
    // physical rotation and scaling that might be hard in pure vertex shader 
    // without custom depth material for shadows.
    
    data.forEach((d, i) => {
      // Get current matrix
      meshRef.current!.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

      // Target Position
      const targetArr = isTree ? d.treePosition : d.scatterPosition;
      const target = new THREE.Vector3(targetArr[0], targetArr[1], targetArr[2]);

      // Float effect logic
      if (!isTree) {
         target.y += Math.sin(time * d.speed + i) * 0.5;
         dummy.rotation.x += delta * 0.2;
         dummy.rotation.y += delta * 0.3;
      } else {
         // Reset rotation to neutral when in tree mode for clean look
         dummy.rotation.x = THREE.MathUtils.lerp(dummy.rotation.x, 0, delta * 2);
         dummy.rotation.z = THREE.MathUtils.lerp(dummy.rotation.z, 0, delta * 2);
         // Rotate slowly around Y (tree axis)
         dummy.rotation.y += 0.001; 
      }

      // Smooth Move
      dummy.position.lerp(target, delta * (isTree ? 2.5 : 1.5));
      
      // Update Matrix
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'BOX' ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <sphereGeometry args={[0.5, 32, 32]} />
      )}
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness}
        emissive={color}
        emissiveIntensity={0.2} 
        envMapIntensity={2}
      />
    </instancedMesh>
  );
};