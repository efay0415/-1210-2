import * as THREE from 'three';

// Helper to get random point in sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Helper to get point on a cone volume (The Tree)
export const getTreePoint = (height: number, radiusBase: number): THREE.Vector3 => {
  const y = Math.random() * height; // Height from bottom (0) to top (height)
  const percentUp = y / height;
  
  // Radius decreases as we go up
  const currentRadius = radiusBase * (1 - percentUp);
  
  // Place slightly inside the volume, not just on surface
  const r = currentRadius * Math.sqrt(Math.random()); 
  const theta = Math.random() * 2 * Math.PI;

  const x = r * Math.cos(theta);
  const z = r * Math.sin(theta);
  
  // Center the tree vertically
  return new THREE.Vector3(x, y - height / 2, z);
};

// Generate data buffers for shaders
export const generateFoliageData = (count: number) => {
  const positions = new Float32Array(count * 3);
  const scatterPositions = new Float32Array(count * 3);
  const randomness = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Tree Form
    const treePos = getTreePoint(12, 4.5);
    positions[i * 3] = treePos.x;
    positions[i * 3 + 1] = treePos.y;
    positions[i * 3 + 2] = treePos.z;

    // Scatter Form (Exploded view)
    const scatterPos = getRandomSpherePoint(15);
    scatterPositions[i * 3] = scatterPos.x;
    scatterPositions[i * 3 + 1] = scatterPos.y;
    scatterPositions[i * 3 + 2] = scatterPos.z;

    randomness[i] = Math.random();
  }

  return { positions, scatterPositions, randomness };
};
