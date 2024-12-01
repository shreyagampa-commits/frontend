import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const App = () => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background
        renderer.setPixelRatio(window.devicePixelRatio); // For high-res devices
        container.appendChild(renderer.domElement);

        // Plane Geometry
        const geometry = new THREE.PlaneGeometry(40, 40); // Double the size
        const material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(
                'https://via.placeholder.com/1024x512' // Default texture
            ),
            side: THREE.DoubleSide,
            transparent: true,
        });
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // Adjust Camera
        camera.position.set(0, 0, 30);

        // Rotate using Mouse Drag
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const onMouseDown = () => {
            isDragging = true;
        };

        const onMouseMove = (event) => {
            if (isDragging) {
                const deltaX = event.clientX - previousMousePosition.x;
                const deltaY = event.clientY - previousMousePosition.y;

                plane.rotation.y += deltaX * 0.005;
                plane.rotation.x += deltaY * 0.005;
            }
            previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const onMouseUp = () => {
            isDragging = false;
        };

        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseup', onMouseUp);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            container.removeChild(renderer.domElement);
            container.removeEventListener('mousedown', onMouseDown);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const img = new Image();
            const reader = new FileReader();

            // Load the file into the image
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Convert canvas content to PNG format
                const pngURL = canvas.toDataURL('image/png');

                // Create a new texture from the PNG URL
                const texture = new THREE.TextureLoader().load(pngURL);

                // Set texture filtering to nearest-neighbor to maintain sharpness
                texture.minFilter = THREE.NearestFilter;
                texture.magFilter = THREE.NearestFilter;

                // Update the material of the plane with the new PNG texture
                const scene = sceneRef.current;
                const plane = scene.children.find((obj) => obj.isMesh);
                if (plane) {
                    plane.material.map = texture;
                    plane.material.needsUpdate = true;
                }
            };

            img.onerror = () => {
                console.error("Failed to load the uploaded image.");
            };
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>360° Image Viewer</h1>
            <div style={{ textAlign: 'center', margin: '20px' }}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ marginBottom: '20px' }}
                />
            </div>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '500px',
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                }}
            ></div>
        </div>
    );
};

export default App;