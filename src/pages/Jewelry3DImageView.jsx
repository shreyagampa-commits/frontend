
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import jewelryImage from '../img/ab.png'; // Update path accordingly

const Jewelry3DView = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(jewelryImage, (texture) => {
      console.log("Texture loaded:", texture); // Confirm texture load

      const geometry = new THREE.CylinderGeometry(3, 3, 5, 50, 1, true);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const object3D = new THREE.Mesh(geometry, material);
      scene.add(object3D);

      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);

      const animate = () => {
        requestAnimationFrame(animate);
        object3D.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Jewelry3DView;
