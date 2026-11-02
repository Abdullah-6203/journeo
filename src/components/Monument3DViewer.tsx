import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Moon, RotateCcw, Sparkles } from 'lucide-react';
import { HeritageSite } from '../data/heritageSites';

interface Monument3DViewerProps {
  site: HeritageSite;
}

export const Monument3DViewer: React.FC<Monument3DViewerProps> = ({ site }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [lightingMode, setLightingMode] = useState<'day' | 'golden' | 'twilight'>('golden');
  const [isRotating, setIsRotating] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 400;
    const height = currentMount.clientHeight || 300;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(lightingMode === 'twilight' ? 0x1E1A29 : 0xF5EFEB);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffd59e, 1.5);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Architectural Model (Mughal Chhatri / Pavilion)
    const monumentGroup = new THREE.Group();
    groupRef.current = monumentGroup;

    // Material: Indian Red Sandstone
    const sandstoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xBA6B57,
      roughness: 0.75,
      metalness: 0.1
    });

    const marbleInlayMaterial = new THREE.MeshStandardMaterial({
      color: 0xF4EFEA,
      roughness: 0.3,
      metalness: 0.05
    });

    const goldFinialMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.25,
      metalness: 0.8
    });

    // 1. Plinth Platform (Multi-tiered base)
    const baseGeo1 = new THREE.BoxGeometry(4.2, 0.3, 4.2);
    const base1 = new THREE.Mesh(baseGeo1, sandstoneMaterial);
    base1.position.y = 0.15;
    base1.receiveShadow = true;
    monumentGroup.add(base1);

    const baseGeo2 = new THREE.BoxGeometry(3.6, 0.25, 3.6);
    const base2 = new THREE.Mesh(baseGeo2, marbleInlayMaterial);
    base2.position.y = 0.425;
    base2.receiveShadow = true;
    monumentGroup.add(base2);

    // 2. Pillars (8 Sandstone Columns)
    const pillarRadius = 0.12;
    const pillarHeight = 1.8;
    const radius = 1.35;
    const pillarCount = 8;

    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const colGeo = new THREE.CylinderGeometry(pillarRadius * 0.9, pillarRadius, pillarHeight, 16);
      const col = new THREE.Mesh(colGeo, sandstoneMaterial);
      col.position.set(x, 0.55 + pillarHeight / 2, z);
      col.castShadow = true;
      monumentGroup.add(col);

      // Ornate Capital & Base
      const capGeo = new THREE.BoxGeometry(0.35, 0.1, 0.35);
      const cap = new THREE.Mesh(capGeo, marbleInlayMaterial);
      cap.position.set(x, 0.55 + pillarHeight, z);
      monumentGroup.add(cap);
    }

    // 3. Central Cenotaph / Dais
    const daisGeo = new THREE.BoxGeometry(1.0, 0.4, 0.7);
    const dais = new THREE.Mesh(daisGeo, marbleInlayMaterial);
    dais.position.set(0, 0.75, 0);
    dais.castShadow = true;
    monumentGroup.add(dais);

    // 4. Overhanging Chhajja (Eaves)
    const chhajjaGeo = new THREE.ConeGeometry(2.1, 0.35, 8);
    const chhajja = new THREE.Mesh(chhajjaGeo, sandstoneMaterial);
    chhajja.position.set(0, 2.45, 0);
    chhajja.rotation.y = Math.PI / 8;
    chhajja.castShadow = true;
    monumentGroup.add(chhajja);

    // 5. Drum (Octagonal base for dome)
    const drumGeo = new THREE.CylinderGeometry(1.3, 1.35, 0.4, 8);
    const drum = new THREE.Mesh(drumGeo, marbleInlayMaterial);
    drum.position.set(0, 2.75, 0);
    drum.castShadow = true;
    monumentGroup.add(drum);

    // 6. Fluted Onion Dome
    const domeGeo = new THREE.SphereGeometry(1.3, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const dome = new THREE.Mesh(domeGeo, marbleInlayMaterial);
    dome.position.set(0, 2.9, 0);
    dome.scale.set(1, 1.15, 1);
    dome.castShadow = true;
    monumentGroup.add(dome);

    // 7. Gold Finial (Kalasa)
    const finialGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.7, 12);
    const finial = new THREE.Mesh(finialGeo, goldFinialMaterial);
    finial.position.set(0, 4.4, 0);
    finial.castShadow = true;
    monumentGroup.add(finial);

    const bulbGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const bulb = new THREE.Mesh(bulbGeo, goldFinialMaterial);
    bulb.position.set(0, 4.65, 0);
    monumentGroup.add(bulb);

    scene.add(monumentGroup);

    // Mouse drag rotation controls
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      monumentGroup.rotation.y += deltaX * 0.01;
      prevMouseX = e.clientX;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating && !isDragging) {
        monumentGroup.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (currentMount) currentMount.innerHTML = '';
    };
  }, [lightingMode, isRotating, site.id]);

  // Handle Lighting presets
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !ambientLightRef.current) return;
    if (lightingMode === 'day') {
      sceneRef.current.background = new THREE.Color(0xF5EFEB);
      dirLightRef.current.color.setHex(0xFFFFFF);
      dirLightRef.current.intensity = 1.4;
      ambientLightRef.current.color.setHex(0xFFFFFF);
      ambientLightRef.current.intensity = 0.7;
    } else if (lightingMode === 'golden') {
      sceneRef.current.background = new THREE.Color(0xFCEFDc);
      dirLightRef.current.color.setHex(0xFFAA44);
      dirLightRef.current.intensity = 1.9;
      ambientLightRef.current.color.setHex(0xFFE2C2);
      ambientLightRef.current.intensity = 0.5;
    } else {
      sceneRef.current.background = new THREE.Color(0x1F1A2A);
      dirLightRef.current.color.setHex(0x9488C9);
      dirLightRef.current.intensity = 0.8;
      ambientLightRef.current.color.setHex(0x3B3353);
      ambientLightRef.current.intensity = 0.4;
    }
  }, [lightingMode]);

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-b from-[#F5EFEB] to-[#EADECB] rounded-xl overflow-hidden border border-border-soft shadow-soft-md group">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-sandstone-light shadow-soft-sm flex items-center gap-2 text-xs font-semibold text-espresso">
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        <span>3D Architectural Model: {site.name.split('(')[0].trim()}</span>
      </div>

      {/* Lighting & Rotation Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-lg border border-border-soft shadow-soft-sm text-xs">
        <button
          onClick={() => setLightingMode('day')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            lightingMode === 'day' ? 'bg-maroon text-white font-medium' : 'text-espresso hover:bg-sandstone-light/40'
          }`}
          title="Bright Daylight"
        >
          <Sun className="w-3 h-3" /> Day
        </button>
        <button
          onClick={() => setLightingMode('golden')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            lightingMode === 'golden' ? 'bg-maroon text-white font-medium' : 'text-espresso hover:bg-sandstone-light/40'
          }`}
          title="Golden Hour (Sunset)"
        >
          <Sparkles className="w-3 h-3" /> Sunset
        </button>
        <button
          onClick={() => setLightingMode('twilight')}
          className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
            lightingMode === 'twilight' ? 'bg-maroon text-white font-medium' : 'text-espresso hover:bg-sandstone-light/40'
          }`}
          title="Royal Twilight"
        >
          <Moon className="w-3 h-3" /> Twilight
        </button>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded hover:bg-sandstone-light/40 transition-colors ${
            isRotating ? 'text-maroon' : 'text-secondary'
          }`}
          title={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag instruction helper */}
      <div className="absolute bottom-3 left-3 text-[11px] text-secondary pointer-events-none bg-white/70 backdrop-blur-sm px-2 py-0.5 rounded border border-sandstone-light/50">
        🖱️ Click & drag to rotate 3D view
      </div>
    </div>
  );
};
