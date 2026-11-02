import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Destination {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  flightTime: string;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lng: 77.2090,
    flightTime: 'Origin Hub',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lng: 72.8777,
    flightTime: '2h 10m',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    lat: 25.2048,
    lng: 55.2708,
    flightTime: '3h 30m',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    lat: 51.5074,
    lng: -0.1278,
    flightTime: '9h 15m',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    flightTime: '8h 20m',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lng: 12.4964,
    flightTime: '7h 50m',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    lat: 41.0082,
    lng: 28.9784,
    flightTime: '6h 40m',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'bangkok',
    name: 'Bangkok',
    country: 'Thailand',
    lat: 13.7563,
    lng: 100.5018,
    flightTime: '4h 15m',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    flightTime: '5h 30m',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    lat: -8.3405,
    lng: 115.0920,
    flightTime: '7h 10m',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    flightTime: '9h 45m',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    lat: 40.7128,
    lng: -74.0060,
    flightTime: '14h 20m',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80'
  }
];

// Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate Realistic High-Definition Earth Texture with Topography & Golden City Lights
function createRealisticEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Ocean Base (Dark teal & deep emerald oceanic depth)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#041014');
  oceanGrad.addColorStop(0.2, '#071d22');
  oceanGrad.addColorStop(0.5, '#0a262c');
  oceanGrad.addColorStop(0.8, '#061a1e');
  oceanGrad.addColorStop(1, '#030c0e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle coordinate latitude/longitude graticules
  ctx.strokeStyle = 'rgba(113, 134, 117, 0.06)';
  ctx.lineWidth = 1;
  for (let lat = 0; lat < canvas.height; lat += canvas.height / 18) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }
  for (let lng = 0; lng < canvas.width; lng += canvas.width / 36) {
    ctx.beginPath();
    ctx.moveTo(lng, 0);
    ctx.lineTo(lng, canvas.height);
    ctx.stroke();
  }

  // Coordinate mapping helper
  const mapPos = (lat: number, lng: number): [number, number] => [
    ((lng + 180) / 360) * canvas.width,
    ((90 - lat) / 180) * canvas.height
  ];

  // Helper for drawing realistic multi-point landmasses
  const drawComplexLand = (
    points: [number, number][],
    fillColor: string,
    strokeColor: string,
    shelfGlow: boolean = true
  ) => {
    // Optional shallow-water continental shelf glow
    if (shelfGlow) {
      ctx.beginPath();
      points.forEach(([lat, lng], idx) => {
        const [x, y] = mapPos(lat, lng);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.12)';
      ctx.lineWidth = 9;
      ctx.stroke();
    }

    ctx.beginPath();
    points.forEach(([lat, lng], idx) => {
      const [x, y] = mapPos(lat, lng);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  // 2. Realistic Landmass Continents (Detailed organic polygons)
  // Eurasia Main Landmass
  drawComplexLand(
    [
      [71, 28], [72, 55], [74, 80], [70, 110], [67, 142], [65, 170],
      [58, 162], [46, 142], [38, 128], [30, 122], [22, 115], [10, 105],
      [5, 100], [14, 98], [22, 90], [13, 80], [8, 77], [16, 73],
      [24, 69], [25, 60], [30, 48], [37, 36], [41, 28], [55, 14],
      [58, 6], [64, 10], [71, 28]
    ],
    '#13372c',
    '#255845'
  );

  // Indian Subcontinent & Himalayan Arc (High detail)
  drawComplexLand(
    [
      [36, 74], [34, 78], [30, 81], [27, 88], [24, 91], [21, 89],
      [16, 82], [13, 80], [8.5, 77.5], [10, 76], [15, 73.5], [19, 72.8],
      [22, 69], [24, 68], [27, 71], [32, 72], [36, 74]
    ],
    '#1c4a3b',
    '#39795d'
  );

  // Sri Lanka
  drawComplexLand(
    [[9.5, 80], [7, 81.5], [6, 80.5], [8, 79.8]],
    '#1c4a3b',
    '#39795d',
    false
  );

  // Europe Detail & Mediterranean
  drawComplexLand(
    [
      [60, 5], [57, 10], [54, 19], [46, 16], [42, 18], [38, 15],
      [36, -5], [43, -9], [48, -4], [51, 1.5], [55, -2], [58, -3], [60, 5]
    ],
    '#174033',
    '#2d6952'
  );

  // British Isles & Ireland
  drawComplexLand(
    [[58, -4], [55, -1.5], [50, -1], [50, -5], [54, -3], [58, -4]],
    '#153d31',
    '#2c6550',
    false
  );
  drawComplexLand(
    [[55, -6.5], [53, -6], [51.5, -9.5], [54, -10]],
    '#153d31',
    '#2c6550',
    false
  );

  // Africa Continent
  drawComplexLand(
    [
      [37, 10], [32, 32], [22, 38], [12, 44], [-2, 41], [-15, 38],
      [-28, 32], [-34, 20], [-30, 16], [-18, 12], [-5, 10], [5, 4],
      [4, -3], [14, -17], [26, -15], [35, -5], [37, 10]
    ],
    '#1a3d30',
    '#295a46'
  );

  // Madagascar
  drawComplexLand(
    [[-12, 49], [-16, 50], [-25, 47], [-24, 43], [-15, 46]],
    '#16382c',
    '#285945',
    false
  );

  // Middle East & Arabian Peninsula
  drawComplexLand(
    [
      [30, 33], [32, 36], [29, 48], [25, 56], [22, 59], [15, 53],
      [12, 44], [17, 42], [24, 38], [30, 33]
    ],
    '#204436',
    '#396c56'
  );

  // East Asia & Japan
  drawComplexLand(
    [[45, 142], [42, 140], [35, 136], [33, 130], [37, 137], [43, 144]],
    '#153f32',
    '#2c6b54',
    false
  );

  // Southeast Asia & Indonesia
  drawComplexLand(
    [[-2, 100], [-6, 106], [-8, 114], [-7, 110], [-3, 103]],
    '#143d31',
    '#2b6450',
    false
  );

  // North America
  drawComplexLand(
    [
      [71, -158], [69, -132], [62, -88], [55, -58], [44, -66], [30, -82],
      [24, -80], [18, -96], [14, -91], [28, -114], [38, -123], [48, -125],
      [58, -138], [65, -168], [71, -158]
    ],
    '#14382c',
    '#275a46'
  );

  // South America
  drawComplexLand(
    [
      [12, -73], [8, -60], [-4, -36], [-22, -41], [-38, -58], [-54, -68],
      [-48, -75], [-22, -71], [-6, -80], [6, -76], [12, -73]
    ],
    '#143a2e',
    '#295c48'
  );

  // Australia
  drawComplexLand(
    [
      [-12, 132], [-14, 144], [-24, 153], [-37, 148], [-35, 117],
      [-21, 114], [-15, 124], [-12, 132]
    ],
    '#193d31',
    '#2f6350'
  );

  // 3. Topographic Mountain Relief Gradients (Warm Golden-Olive Shading)
  const mountainChains = [
    // Alps
    [[47, 7], [46, 10], [45, 13]],
    // Himalayas
    [[35, 75], [32, 79], [29, 85], [28, 90]],
    // Zagros / Middle East
    [[36, 45], [33, 49], [30, 53]],
    // Urals
    [[65, 60], [58, 59], [52, 57]]
  ];

  ctx.strokeStyle = 'rgba(197, 163, 106, 0.45)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  mountainChains.forEach((chain) => {
    ctx.beginPath();
    chain.forEach(([lat, lng], idx) => {
      const [x, y] = mapPos(lat, lng);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  // 4. Photorealistic Golden City Lights & Continental Night Glow
  const majorMetros = [
    // India & South Asia (Vibrant dense golden lights matching reference)
    [28.61, 77.20, 24, 1.0], [19.07, 72.87, 22, 1.0], [13.08, 80.27, 16, 0.9],
    [22.57, 88.36, 18, 0.9], [12.97, 77.59, 18, 0.9], [17.38, 78.48, 15, 0.85],
    [26.84, 80.94, 14, 0.8], [23.02, 72.57, 14, 0.8], [31.52, 74.35, 12, 0.75],
    // Middle East & Gulf (Intense golden glow)
    [25.20, 55.27, 24, 1.0], [24.45, 54.37, 18, 0.9], [24.71, 46.67, 18, 0.9],
    [29.37, 47.97, 16, 0.85], [21.48, 39.19, 16, 0.85], [32.08, 34.78, 14, 0.8],
    [35.68, 51.38, 16, 0.8], [30.04, 31.23, 20, 0.9], // Cairo/Nile
    // Europe
    [48.85, 2.35, 26, 1.0], [51.50, -0.12, 26, 1.0], [46.55, 8.56, 16, 0.9], // Swiss Alps
    [41.90, 12.49, 18, 0.9], [40.41, -3.70, 18, 0.85], [52.52, 13.40, 18, 0.85],
    [52.36, 4.90, 16, 0.85], [45.46, 9.19, 16, 0.85], [48.13, 11.58, 15, 0.8],
    // East & Southeast Asia
    [35.67, 139.65, 26, 1.0], [31.23, 121.47, 24, 0.95], [22.31, 114.16, 20, 0.9],
    [1.35, 103.81, 20, 0.95], [13.75, 100.50, 18, 0.85], [37.56, 126.97, 20, 0.9],
    // North America & others
    [40.71, -74.00, 24, 0.95], [34.05, -118.24, 22, 0.9], [41.87, -87.62, 18, 0.85]
  ];

  majorMetros.forEach(([lat, lng, radius, opacity]) => {
    const [x, y] = mapPos(lat, lng);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(255, 245, 215, ${opacity})`);
    grad.addColorStop(0.2, `rgba(243, 207, 134, ${opacity * 0.85})`);
    grad.addColorStop(0.5, `rgba(197, 163, 106, ${opacity * 0.5})`);
    grad.addColorStop(0.8, `rgba(141, 113, 66, ${opacity * 0.2})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Hot white pinpoint in center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Additional fine golden stippling along rivers and coasts
  ctx.fillStyle = 'rgba(235, 203, 139, 0.65)';
  for (let i = 0; i < 280; i++) {
    const lat = 10 + Math.random() * 45;
    const lng = 10 + Math.random() * 110;
    const [x, y] = mapPos(lat, lng);
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const TravelGlobe: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeDestIdx, setActiveDestIdx] = useState<number>(0);
  const activeDest = DESTINATIONS[activeDestIdx];
  const activeDestIdxRef = useRef<number>(0);

  // Keep activeDestIdxRef in sync without tearing down the Three.js scene
  useEffect(() => {
    activeDestIdxRef.current = activeDestIdx;
  }, [activeDestIdx]);

  // Auto-cycle destinations every 4.2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDestIdx((prev) => (prev + 1) % DESTINATIONS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 310);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Root Group
    const globeGroup = new THREE.Group();
    // Natural tilt to display the equator, continents, and travel arcs prominently
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.y = -1.45;
    scene.add(globeGroup);

    // Main Globe Radius
    const GLOBE_RADIUS = 75;

    // 1. REALISTIC EARTH SPHERE
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthTexture = createRealisticEarthTexture();

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: new THREE.Color(0x284a44),
      shininess: 24,
      emissive: new THREE.Color(0x0e2a24),
      emissiveIntensity: 0.35
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 2. SOFT GOLDEN & EMERALD ATMOSPHERIC FRESNEL RIM
    const atmoGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 48, 48);
    const atmoMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          vec3 atmosphereColor = vec3(0.82, 0.71, 0.46);
          gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmoMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
    globeGroup.add(atmoMesh);

    // 3. THIN 3D GOLDEN ORBITAL TRAVEL RINGS WRAPPING AROUND EARTH
    const ring1Curve = new THREE.EllipseCurve(
      0, 0,
      GLOBE_RADIUS * 1.34, GLOBE_RADIUS * 1.15,
      0, 2 * Math.PI,
      false,
      0
    );
    const ring1Points = ring1Curve.getPoints(120);
    const ring1Geom = new THREE.BufferGeometry().setFromPoints(ring1Points.map(p => new THREE.Vector3(p.x, p.y, 0)));
    const ring1Mat = new THREE.LineBasicMaterial({
      color: 0xc5a36a,
      transparent: true,
      opacity: 0.65
    });
    const ring1 = new THREE.Line(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3.2;
    ring1.rotation.y = -Math.PI / 5.5;
    globeGroup.add(ring1);

    const ring2Curve = new THREE.EllipseCurve(
      0, 0,
      GLOBE_RADIUS * 1.45, GLOBE_RADIUS * 1.25,
      0, 2 * Math.PI,
      false,
      0
    );
    const ring2Points = ring2Curve.getPoints(120);
    const ring2Geom = new THREE.BufferGeometry().setFromPoints(ring2Points.map(p => new THREE.Vector3(p.x, p.y, 0)));
    const ring2Mat = new THREE.LineBasicMaterial({
      color: 0xe6ca8f,
      transparent: true,
      opacity: 0.50
    });
    const ring2 = new THREE.Line(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI / 4.2;
    ring2.rotation.y = Math.PI / 6.0;
    globeGroup.add(ring2);

    // 4. UNIFORMLY DISTRIBUTED GOLDEN SPARKLES ACROSS THE ENTIRE GLOBE
    // Circular champagne-gold glowing particle canvas sprite
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    pGrad.addColorStop(0, 'rgba(255, 248, 225, 1)');
    pGrad.addColorStop(0.35, 'rgba(230, 202, 143, 0.85)');
    pGrad.addColorStop(0.7, 'rgba(197, 163, 106, 0.25)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.beginPath();
    pCtx.arc(16, 16, 16, 0, Math.PI * 2);
    pCtx.fill();
    const pTexture = new THREE.CanvasTexture(pCanvas);

    // Mathematically uniform equal-area distribution across all spherical angles
    function createUniformSparkleGeometry(count: number, minRad: number, maxRad: number) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const zNorm = 2.0 * v - 1.0;
        const sinPhi = Math.sqrt(Math.max(0, 1.0 - zNorm * zNorm));
        const r = minRad + Math.random() * (maxRad - minRad);

        positions[i * 3] = r * sinPhi * Math.cos(theta);
        positions[i * 3 + 1] = r * zNorm;
        positions[i * 3 + 2] = r * sinPhi * Math.sin(theta);
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geom;
    }

    // 3 layered particle meshes for subtle size and depth variation
    const sparklesLayer1Geom = createUniformSparkleGeometry(100, GLOBE_RADIUS * 1.05, GLOBE_RADIUS * 1.35);
    const sparklesLayer1Mat = new THREE.PointsMaterial({
      size: 2.0,
      map: pTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sparkles1 = new THREE.Points(sparklesLayer1Geom, sparklesLayer1Mat);
    globeGroup.add(sparkles1);

    const sparklesLayer2Geom = createUniformSparkleGeometry(60, GLOBE_RADIUS * 1.08, GLOBE_RADIUS * 1.45);
    const sparklesLayer2Mat = new THREE.PointsMaterial({
      size: 3.0,
      map: pTexture,
      transparent: true,
      opacity: 0.80,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sparkles2 = new THREE.Points(sparklesLayer2Geom, sparklesLayer2Mat);
    globeGroup.add(sparkles2);

    const sparklesLayer3Geom = createUniformSparkleGeometry(25, GLOBE_RADIUS * 1.06, GLOBE_RADIUS * 1.40);
    const sparklesLayer3Mat = new THREE.PointsMaterial({
      size: 4.2,
      map: pTexture,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sparkles3 = new THREE.Points(sparklesLayer3Geom, sparklesLayer3Mat);
    globeGroup.add(sparkles3);

    // 5. GEOGRAPHICAL LOCATION PINS AT EXACT COORDINATES
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const pinObjects: {
      group: THREE.Group;
      destId: string;
      beaconRing: THREE.Mesh;
      pinHead: THREE.Mesh;
    }[] = [];

    DESTINATIONS.forEach((dest) => {
      const pinObj = new THREE.Group();
      const pos = latLngToVector3(dest.lat, dest.lng, GLOBE_RADIUS);
      pinObj.position.copy(pos);
      pinObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      // Needle stem
      const stemGeom = new THREE.CylinderGeometry(0.16, 0.38, 2.0, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xc5a36a });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = 1.0;
      pinObj.add(stem);

      // Glowing Teardrop Pin Head
      const pinGeom = new THREE.SphereGeometry(1.25, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xe6ca8f });
      const pinHead = new THREE.Mesh(pinGeom, pinMat);
      pinHead.position.y = 2.1;
      pinObj.add(pinHead);

      // Central Bright Core
      const coreGeom = new THREE.SphereGeometry(0.6, 10, 10);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pinCore = new THREE.Mesh(coreGeom, coreMat);
      pinCore.position.y = 2.1;
      pinObj.add(pinCore);

      // Animated Pulsing Ripple Ring
      const ringGeom = new THREE.RingGeometry(1.4, 2.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc5a36a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.50
      });
      const beaconRing = new THREE.Mesh(ringGeom, ringMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.position.y = 0.08;
      pinObj.add(beaconRing);

      markerGroup.add(pinObj);
      pinObjects.push({ group: pinObj, destId: dest.id, beaconRing, pinHead });
    });

    // 6. SMALL FLYING AEROPLANES TRAVELLING ALONG CURVED GEOGRAPHICAL ROUTES
    // Routes: Delhi -> Dubai, Dubai -> Paris, London -> Tokyo, Singapore -> Bali
    const FLIGHT_ROUTES = [
      { from: 'Delhi', to: 'Dubai', start: [28.6139, 77.2090], end: [25.2048, 55.2708], speed: 0.12, offset: 0.05, apex: 1.11 },
      { from: 'Dubai', to: 'Paris', start: [25.2048, 55.2708], end: [48.8566, 2.3522], speed: 0.09, offset: 0.38, apex: 1.13 },
      { from: 'London', to: 'Tokyo', start: [51.5074, -0.1278], end: [35.6762, 139.6503], speed: 0.07, offset: 0.70, apex: 1.17 },
      { from: 'Singapore', to: 'Bali', start: [1.3521, 103.8198], end: [-8.3405, 115.0920], speed: 0.14, offset: 0.22, apex: 1.09 }
    ];

    interface PlaneInstance {
      group: THREE.Group;
      trail: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      speed: number;
      offset: number;
    }

    const planeInstances: PlaneInstance[] = [];

    FLIGHT_ROUTES.forEach((r) => {
      const p1 = latLngToVector3(r.start[0], r.start[1], GLOBE_RADIUS);
      const p2 = latLngToVector3(r.end[0], r.end[1], GLOBE_RADIUS);
      const mid = p1.clone().add(p2).normalize().multiplyScalar(GLOBE_RADIUS * r.apex);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

      // Render glowing travel route line
      const arcPoints = curve.getPoints(50);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xc5a36a,
        transparent: true,
        opacity: 0.45
      });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      globeGroup.add(arcLine);

      // Small elegant aeroplane model in champagne-gold / warm ivory
      const planeGroup = new THREE.Group();
      const planeMat = new THREE.MeshBasicMaterial({ color: 0xfff4dc });

      // Fuselage cone
      const fuselageGeom = new THREE.ConeGeometry(0.75, 2.8, 5);
      const fuselage = new THREE.Mesh(fuselageGeom, planeMat);
      fuselage.rotation.x = Math.PI / 2;
      planeGroup.add(fuselage);

      // Wings
      const wingGeom = new THREE.BoxGeometry(3.3, 0.16, 0.7);
      const wing = new THREE.Mesh(wingGeom, planeMat);
      wing.position.set(0, 0, -0.3);
      planeGroup.add(wing);

      // Tail fin
      const tailGeom = new THREE.BoxGeometry(0.16, 0.75, 0.55);
      const tail = new THREE.Mesh(tailGeom, planeMat);
      tail.position.set(0, 0.45, -1.1);
      planeGroup.add(tail);

      globeGroup.add(planeGroup);

      // Glowing trail particle
      const trailGeom = new THREE.SphereGeometry(0.7, 8, 8);
      const trailMat = new THREE.MeshBasicMaterial({
        color: 0xffe8a3,
        transparent: true,
        opacity: 0.70
      });
      const trail = new THREE.Mesh(trailGeom, trailMat);
      globeGroup.add(trail);

      planeInstances.push({
        group: planeGroup,
        trail,
        curve,
        speed: r.speed,
        offset: r.offset
      });
    });

    // 7. SCENE LIGHTING
    const sunLight = new THREE.DirectionalLight(0xfff6dc, 2.4);
    sunLight.position.set(220, 140, 240);
    scene.add(sunLight);

    const warmFill = new THREE.DirectionalLight(0xc5a36a, 1.2);
    warmFill.position.set(-180, 80, 180);
    scene.add(warmFill);

    const ambientLight = new THREE.AmbientLight(0x0c252a, 1.6);
    scene.add(ambientLight);

    // 8. DRAG-TO-ROTATE INTERACTIVITY
    let isDragging = false;
    let previousPos = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPos = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousPos.x;
      const deltaY = clientY - previousPos.y;

      dragVelocity = { x: deltaX * 0.005, y: deltaY * 0.005 };

      globeGroup.rotation.y += dragVelocity.x;
      globeGroup.rotation.x += dragVelocity.y;
      globeGroup.rotation.x = Math.max(-0.8, Math.min(0.8, globeGroup.rotation.x));

      previousPos = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.style.cursor = 'grab';
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // 9. CONTINUOUS 360° AUTOMATIC ROTATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous, fluid, uninterrupted 360° rotation
      if (!isDragging) {
        dragVelocity.x *= 0.95;
        dragVelocity.y *= 0.95;
        globeGroup.rotation.y += 0.0020 + dragVelocity.x;
        globeGroup.rotation.x += dragVelocity.y;
      }

      // Animate subtle golden sparkles across all 3 layers
      sparkles1.rotation.y += 0.0008;
      sparkles1.rotation.x += 0.0002;
      sparkles2.rotation.y += 0.0005;
      sparkles2.rotation.z += 0.0002;
      sparkles3.rotation.y += 0.0010;

      sparklesLayer1Mat.opacity = 0.55 + 0.20 * Math.sin(elapsedTime * 2.2);
      sparklesLayer2Mat.opacity = 0.65 + 0.22 * Math.sin(elapsedTime * 3.1 + 1.0);
      sparklesLayer3Mat.opacity = 0.72 + 0.25 * Math.sin(elapsedTime * 1.8 + 2.2);

      // Animate small aeroplanes travelling along their respective curved routes
      planeInstances.forEach((plane) => {
        const t = ((elapsedTime * plane.speed) + plane.offset) % 1;
        const pos = plane.curve.getPoint(t);
        const tangent = plane.curve.getTangent(t);

        plane.group.position.copy(pos);

        // Correct 3D orientation: forward along travel direction, up outward from center
        const forward = tangent.clone().normalize();
        const up = pos.clone().normalize();
        const right = new THREE.Vector3().crossVectors(forward, up).normalize();
        const correctedUp = new THREE.Vector3().crossVectors(right, forward).normalize();
        const rotMatrix = new THREE.Matrix4().makeBasis(right, correctedUp, forward);
        plane.group.quaternion.setFromRotationMatrix(rotMatrix);

        // Trailing particle slightly behind along the arc
        const trailT = (t - 0.025 + 1) % 1;
        const trailPos = plane.curve.getPoint(trailT);
        plane.trail.position.copy(trailPos);
      });

      // Pulse destination location pins (reads current destination from ref without resetting rotation)
      const currentActive = activeDestIdxRef.current;
      pinObjects.forEach((item, idx) => {
        const isActive = idx === currentActive;
        const scale = isActive ? 1 + 0.42 * Math.sin(elapsedTime * 5.5) : 1;
        item.beaconRing.scale.set(scale, scale, scale);
        const ringMat = item.beaconRing.material as THREE.MeshBasicMaterial;
        ringMat.opacity = isActive ? 0.95 : 0.42;
        const headMat = item.pinHead.material as THREE.MeshBasicMaterial;
        headMat.color.setHex(isActive ? 0xfff0b3 : 0xe6ca8f);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
      renderer.dispose();
      earthGeometry.dispose();
      earthTexture.dispose();
      earthMaterial.dispose();
      atmoGeometry.dispose();
      atmoMaterial.dispose();
      ring1Geom.dispose();
      ring2Geom.dispose();
      sparklesLayer1Geom.dispose();
      sparklesLayer1Mat.dispose();
      sparklesLayer2Geom.dispose();
      sparklesLayer2Mat.dispose();
      sparklesLayer3Geom.dispose();
      sparklesLayer3Mat.dispose();
      pTexture.dispose();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[500px] h-[440px] sm:h-[480px] lg:h-[510px] mx-auto flex items-center justify-center select-none">
      {/* 1. Golden Water Ripple Glow Base on Lake Surface */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-68 h-22 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c5a36a]/30 via-[#c5a36a]/12 to-transparent rounded-[100%] blur-lg transform scale-y-50" />
        <div className="absolute inset-x-4 bottom-2.5 h-10 border-2 border-[#c5a36a]/45 rounded-[100%] transform scale-y-50 animate-pulse" />
        <div className="absolute inset-x-10 bottom-4 h-6 border border-[#c5a36a]/55 rounded-[100%] transform scale-y-50" />
      </div>

      {/* 2. Realistic 3D Three.js WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full relative z-10" />

      {/* 3. WIDGET 1: Top-Left Floating Destination Tag (Reduced refined size) */}
      <div className="absolute top-4 left-1 sm:left-4 z-20">
        <Link
          to="/destinations"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#071d20]/70 hover:bg-[#071d20]/85 backdrop-blur-md border border-[#c5a36a]/30 shadow-md group transition-all"
        >
          <div className="w-5 h-5 rounded-md bg-[#c5a36a]/20 flex items-center justify-center text-[#c5a36a] group-hover:scale-105 transition-transform">
            <MapPin className="w-3 h-3 fill-current" />
          </div>
          <div>
            <span className="text-[8px] uppercase font-bold tracking-wider text-[#c5a36a] block leading-none">
              Discover
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-white leading-tight">
              <span>Destinations</span>
              <ArrowRight className="w-2.5 h-2.5 text-[#c5a36a] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* 4. WIDGET 2: Right Floating Active Destination Card (Reduced compact size) */}
      <div className="absolute top-[28%] -right-1 sm:right-1 z-20">
        <div className="bg-[#071d20]/75 backdrop-blur-md border border-[#c5a36a]/35 rounded-xl p-2.5 shadow-lg w-38 sm:w-42 space-y-1.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[8px] uppercase font-bold tracking-wider text-[#c5a36a]">
              Next Adventure
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a36a] animate-ping" />
          </div>

          <div className="flex items-center gap-2">
            <img
              src={activeDest.image}
              alt={activeDest.name}
              className="w-8 h-8 rounded-md object-cover border border-white/20 shadow-soft-sm flex-shrink-0"
            />
            <div className="leading-tight min-w-0">
              <h4 className="font-serif font-bold text-xs text-white truncate">
                {activeDest.name}
              </h4>
              <p className="text-[9px] text-[#c5a36a] flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="w-2 h-2 text-[#c5a36a] fill-current" />
                <span>{activeDest.flightTime}</span>
              </p>
            </div>
          </div>

          <Link
            to={user ? "/plan" : "#"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openAuthModal('register');
              }
            }}
            className="flex items-center justify-between text-[9px] font-semibold text-white/90 hover:text-white pt-1 border-t border-white/10 group"
          >
            <span>Plan Itinerary</span>
            <ArrowRight className="w-2.5 h-2.5 text-[#c5a36a] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 5. Antique Gold Compass Rose (Bottom-Right) */}
      <div className="absolute bottom-2 right-2 sm:right-4 z-20 pointer-events-none opacity-85 hover:opacity-100 transition-opacity">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-[#c5a36a] filter drop-shadow-[0_2px_8px_rgba(197,163,106,0.45)]"
          >
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />

            <polygon points="50,12 55,45 50,42" fill="#c5a36a" />
            <polygon points="50,12 45,45 50,42" fill="#8d7142" />

            <polygon points="50,88 55,55 50,58" fill="#8d7142" />
            <polygon points="50,88 45,55 50,58" fill="#c5a36a" />

            <polygon points="88,50 55,55 58,50" fill="#c5a36a" />
            <polygon points="88,50 55,45 58,50" fill="#8d7142" />

            <polygon points="12,50 45,55 42,50" fill="#8d7142" />
            <polygon points="12,50 45,45 42,50" fill="#c5a36a" />

            <polygon points="76,24 53,47 50,50" fill="#c5a36a" opacity="0.75" />
            <polygon points="24,76 47,53 50,50" fill="#c5a36a" opacity="0.75" />
            <polygon points="76,76 53,53 50,50" fill="#8d7142" opacity="0.75" />
            <polygon points="24,24 47,47 50,50" fill="#8d7142" opacity="0.75" />

            <text x="50" y="8" textAnchor="middle" fill="#f3f0e7" fontSize="8" fontWeight="bold">N</text>
            <text x="50" y="98" textAnchor="middle" fill="#f3f0e7" fontSize="8" fontWeight="bold">S</text>
            <text x="96" y="53" textAnchor="middle" fill="#f3f0e7" fontSize="8" fontWeight="bold">E</text>
            <text x="5" y="53" textAnchor="middle" fill="#f3f0e7" fontSize="8" fontWeight="bold">W</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
