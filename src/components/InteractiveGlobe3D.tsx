import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, MapPin } from 'lucide-react';

interface CityPin {
  name: string;
  lat: number;
  lng: number;
  color: number;
}

const INDIA_PINS: CityPin[] = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, color: 0xC86D51 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, color: 0xD4AF37 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081, color: 0xE8A87C },
  { name: 'Udaipur', lat: 24.5854, lng: 73.7125, color: 0xD4AF37 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739, color: 0xC86D51 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, color: 0x5C8068 },
  { name: 'Goa', lat: 15.2993, lng: 74.1240, color: 0x5C8068 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723, color: 0xD4AF37 },
  { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, color: 0x5C8068 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, color: 0x223325 }
];

// Convert latitude and longitude to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const InteractiveGlobe3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePin, setActivePin] = useState<string>('Delhi');
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 360;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.4);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7A8B7B, 0.8);
    dirLight2.position.set(-5, -3, -4);
    scene.add(dirLight2);

    // Master Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Orient initially toward India (latitude ~22°N, longitude ~78°E)
    globeGroup.rotation.y = -Math.PI / 1.7;
    globeGroup.rotation.x = 0.28;

    const globeRadius = 1.75;

    // 1. Core Sphere (Warm Terracotta / Deep Green tint)
    const globeGeo = new THREE.SphereGeometry(globeRadius, 48, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x223325,
      roughness: 0.65,
      metalness: 0.15,
      wireframe: false
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Latitude & Longitude Grid Ring Mesh (Stylized Architectural Wireframe)
    const wireGeo = new THREE.SphereGeometry(globeRadius * 1.01, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x7A8B7B,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Atmosphere Glow Halo
    const atmosphereGeo = new THREE.SphereGeometry(globeRadius * 1.15, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0xE8D5B5,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // 4. India Pins
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    INDIA_PINS.forEach((city) => {
      const pos = latLngToVector3(city.lat, city.lng, globeRadius);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.8, roughness: 0.2 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.copy(pos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      // Glowing pin beacon sphere
      const beaconGeo = new THREE.SphereGeometry(0.065, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: city.color,
        emissive: city.color,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos.clone().add(pos.clone().normalize().multiplyScalar(0.12)));

      pinGroup.add(stem);
      pinGroup.add(beacon);
    });

    // Interactive Drag / Orbit Handlers
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotate = !prefersReducedMotion;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      autoRotate = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
      // Resume slow rotation after a brief idle pause
      setTimeout(() => {
        if (!isDragging && !prefersReducedMotion) autoRotate = true;
      }, 3000);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      globeGroup.rotation.y += deltaX * 0.008;
      globeGroup.rotation.x += deltaY * 0.008;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };
    const onTouchEnd = () => {
      isDragging = false;
      setTimeout(() => {
        if (!isDragging && !prefersReducedMotion) autoRotate = true;
      }, 3000);
    };

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate) {
        globeGroup.rotation.y += 0.0035;
      }

      // Gentle floating pulse
      const t = clock.getElapsedTime();
      atmosphere.scale.setScalar(1 + Math.sin(t * 1.5) * 0.015);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cycling active destination label for interactivity
    const interval = setInterval(() => {
      setActivePin(prev => {
        const idx = INDIA_PINS.findIndex(p => p.name === prev);
        const nextIdx = (idx + 1) % INDIA_PINS.length;
        return INDIA_PINS[nextIdx].name;
      });
    }, 2800);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (currentMount) currentMount.innerHTML = '';
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-sage/20 to-ivory rounded-3xl border border-border flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-deep-green text-ivory flex items-center justify-center">
          <MapPin className="w-8 h-8 text-sage-light" />
        </div>
        <h4 className="font-serif font-bold text-lg text-text">Pan-India Odyssey Network</h4>
        <p className="text-xs text-text-muted max-w-xs">
          Interactive planning connecting Delhi, Rajasthan, Golden Triangle, Western Ghats & Coastal India.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Interactive Badge */}
      <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-md border border-border/80 px-3.5 py-1.5 rounded-xl shadow-soft-sm text-xs flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
        <span className="font-semibold text-text">Exploring Hub:</span>
        <span className="font-bold text-deep-green">{activePin}</span>
      </div>

      <div className="absolute top-3 right-4 bg-deep-green/10 backdrop-blur-md border border-sage/30 px-3 py-1 rounded-full text-[10px] font-bold text-deep-green pointer-events-none uppercase tracking-wider flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-terracotta" />
        <span>3D Interactive India Hubs</span>
      </div>
    </div>
  );
};

