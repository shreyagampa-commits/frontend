// Jewelry3DImageView.js
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const Jewelry3DImage = ({ imageUrl }) => {
  const meshRef = useRef();

  // Load the jewelry image as a texture and create a displacement map from it
  const [texture, displacementMap] = useTexture([
    imageUrl,
    imageUrl, // Reuse the texture as a displacement map
  ]);

  // Create a material with displacement and texture
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    displacementMap: displacementMap,
    displacementScale: 0.3, // Adjust for desired depth
  });

  // Rotate mesh for a dynamic view
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      {/* Geometry - adjust width and height */}
      <planeGeometry args={[5, 5, 100, 100]} />
    </mesh>
  );
};

const Jewelry3DImageView = ({ imageUrl }) => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <Suspense fallback={<div>Loading 3D Jewelry...</div>}>
          <Jewelry3DImage imageUrl={imageUrl} />
        </Suspense>
        
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};

export default Jewelry3DImageView;
