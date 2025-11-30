import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, Color, Vector3, Matrix4, Quaternion, Shape, ExtrudeGeometry, Group } from 'three';
import { latLonToVector3 } from '../utils/hexagonUtils';

interface EarthProps {
  autoRotate?: boolean;
  rotationSpeed?: number;
  onHexagonClick?: (data: { lat: number; lon: number; type: 'green' | 'white' | 'sand'; color: string }) => void;
}

// Create hexagon shape for cartoon continents
function createHexagonShape(size: number): Shape {
  const shape = new Shape();
  const radius = size;
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  
  return shape;
}

// Check if two hexagons are too close to each other
function areHexagonsTooClose(lat1: number, lon1: number, size1: number, lat2: number, lon2: number, size2: number): boolean {
  const pos1 = latLonToVector3(lat1, lon1, 1);
  const pos2 = latLonToVector3(lat2, lon2, 1);
  const distance = pos1.distanceTo(pos2);
  const minDistance = (size1 + size2) * 0.9; // Reduced buffer to allow closer placement
  return distance < minDistance;
}

// Cartoon continent component with hexagon shapes
function CartoonContinent({ 
  lat, 
  lon, 
  size, 
  color, 
  onClick 
}: { 
  lat: number; 
  lon: number; 
  size: number; 
  color: string;
  onClick?: () => void;
}) {
  const position = latLonToVector3(lat, lon, 1.001);
  
  // Create hexagon geometry
  const hexagonShape = useMemo(() => createHexagonShape(size), [size]);
  const geometry = useMemo(() => new ExtrudeGeometry(hexagonShape, { 
    depth: 0.002, 
    bevelEnabled: false 
  }), [hexagonShape]);
  
  // Calculate rotation to align with sphere surface
  const up = position.clone().normalize();
  const right = new Vector3(1, 0, 0).cross(up).normalize();
  if (right.length() < 0.1) {
    right.set(0, 1, 0).cross(up).normalize();
  }
  const forward = up.clone().cross(right).normalize();
  const rotationMatrix = new Matrix4().makeBasis(right, forward, up);
  
  return (
    <mesh 
      position={position} 
      quaternion={new Quaternion().setFromRotationMatrix(rotationMatrix)}
      geometry={geometry}
      renderOrder={2}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
      }}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.0}
        roughness={0.8}
        emissive={new Color(color)}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

export default function Earth({ autoRotate = true, rotationSpeed = 0.8, onHexagonClick }: EarthProps) {
  const meshRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const earthGroupRef = useRef<Group>(null);
  
  // Auto-rotate Earth sphere continuously (continents stay fixed)
  useFrame((state, delta) => {
    if (earthGroupRef.current && autoRotate) {
      // Rotate Earth sphere group from west to east
      // Continents are outside this group so they stay fixed
      earthGroupRef.current.rotation.y += rotationSpeed * delta * 0.02;
    }
  });

  // Cartoon-style continents as hexagons with non-intersecting positions
  const continents = useMemo(() => {
    const allContinents = [
      // North America - many hexagons
      { lat: 55, lon: -110, size: 0.18, color: '#66BB6A' },
      { lat: 50, lon: -100, size: 0.20, color: '#66BB6A' },
      { lat: 45, lon: -95, size: 0.18, color: '#81C784' },
      { lat: 40, lon: -100, size: 0.17, color: '#66BB6A' },
      { lat: 35, lon: -110, size: 0.16, color: '#66BB6A' },
      { lat: 30, lon: -85, size: 0.15, color: '#A5D6A7' },
      { lat: 25, lon: -105, size: 0.15, color: '#66BB6A' },
      { lat: 20, lon: -100, size: 0.12, color: '#66BB6A' },
      { lat: 45, lon: -75, size: 0.14, color: '#81C784' },
      { lat: 50, lon: -70, size: 0.13, color: '#66BB6A' },
      { lat: 40, lon: -80, size: 0.15, color: '#81C784' },
      { lat: 35, lon: -90, size: 0.14, color: '#66BB6A' },
      // South America - more coverage
      { lat: -5, lon: -55, size: 0.17, color: '#9CCC65' },
      { lat: -10, lon: -60, size: 0.18, color: '#9CCC65' },
      { lat: -15, lon: -50, size: 0.16, color: '#AED581' },
      { lat: -20, lon: -50, size: 0.15, color: '#AED581' },
      { lat: -25, lon: -65, size: 0.16, color: '#AED581' },
      { lat: -30, lon: -55, size: 0.15, color: '#9CCC65' },
      { lat: -35, lon: -60, size: 0.14, color: '#9CCC65' },
      { lat: -40, lon: -65, size: 0.13, color: '#AED581' },
      // Europe - expanded
      { lat: 55, lon: 0, size: 0.15, color: '#4CAF50' },
      { lat: 50, lon: 10, size: 0.14, color: '#4CAF50' },
      { lat: 45, lon: 20, size: 0.12, color: '#66BB6A' },
      { lat: 55, lon: 15, size: 0.13, color: '#66BB6A' },
      { lat: 50, lon: 5, size: 0.13, color: '#66BB6A' },
      { lat: 45, lon: 10, size: 0.12, color: '#81C784' },
      // Africa - more hexagons
      { lat: 20, lon: 10, size: 0.17, color: '#388E3C' },
      { lat: 15, lon: 15, size: 0.18, color: '#388E3C' },
      { lat: 10, lon: 20, size: 0.20, color: '#388E3C' },
      { lat: 5, lon: 35, size: 0.16, color: '#4CAF50' },
      { lat: 0, lon: 30, size: 0.18, color: '#4CAF50' },
      { lat: -5, lon: 20, size: 0.15, color: '#66BB6A' },
      { lat: -10, lon: 25, size: 0.15, color: '#66BB6A' },
      { lat: -5, lon: 15, size: 0.14, color: '#66BB6A' },
      { lat: 5, lon: 10, size: 0.14, color: '#388E3C' },
      { lat: 0, lon: 5, size: 0.13, color: '#4CAF50' },
      // Asia - extensive coverage
      { lat: 60, lon: 95, size: 0.20, color: '#66BB6A' },
      { lat: 55, lon: 100, size: 0.22, color: '#66BB6A' },
      { lat: 50, lon: 85, size: 0.18, color: '#81C784' },
      { lat: 45, lon: 110, size: 0.20, color: '#81C784' },
      { lat: 40, lon: 95, size: 0.17, color: '#66BB6A' },
      { lat: 35, lon: 105, size: 0.18, color: '#66BB6A' },
      { lat: 30, lon: 120, size: 0.16, color: '#A5D6A7' },
      { lat: 25, lon: 90, size: 0.18, color: '#A5D6A7' },
      { lat: 20, lon: 105, size: 0.15, color: '#66BB6A' },
      { lat: 55, lon: 115, size: 0.19, color: '#81C784' },
      { lat: 50, lon: 125, size: 0.17, color: '#66BB6A' },
      { lat: 45, lon: 100, size: 0.18, color: '#81C784' },
      { lat: 40, lon: 110, size: 0.16, color: '#66BB6A' },
      { lat: 35, lon: 90, size: 0.17, color: '#A5D6A7' },
      { lat: 30, lon: 100, size: 0.15, color: '#66BB6A' },
      { lat: 25, lon: 115, size: 0.16, color: '#A5D6A7' },
      // Australia - more coverage
      { lat: -20, lon: 125, size: 0.15, color: '#8BC34A' },
      { lat: -25, lon: 135, size: 0.16, color: '#8BC34A' },
      { lat: -30, lon: 145, size: 0.14, color: '#9CCC65' },
      { lat: -20, lon: 140, size: 0.14, color: '#8BC34A' },
      { lat: -25, lon: 120, size: 0.13, color: '#9CCC65' },
      // Additional islands/landmasses around the world
      { lat: 25, lon: -80, size: 0.12, color: '#66BB6A' },
      { lat: 10, lon: -75, size: 0.11, color: '#81C784' },
      { lat: 60, lon: -150, size: 0.13, color: '#66BB6A' },
      { lat: 40, lon: 140, size: 0.14, color: '#66BB6A' },
      { lat: 20, lon: -70, size: 0.12, color: '#81C784' },
      { lat: 15, lon: -60, size: 0.11, color: '#66BB6A' },
      { lat: 30, lon: 50, size: 0.13, color: '#66BB6A' },
      { lat: 25, lon: 45, size: 0.12, color: '#81C784' },
      { lat: 35, lon: 70, size: 0.14, color: '#66BB6A' },
      { lat: 40, lon: 60, size: 0.13, color: '#81C784' },
      { lat: -15, lon: -45, size: 0.12, color: '#9CCC65' },
      { lat: -5, lon: -40, size: 0.11, color: '#AED581' },
      // Sand-colored hexagons (beaches/deserts) - extensively expanded
      // North America deserts
      { lat: 40, lon: -110, size: 0.13, color: '#F4A460' }, // North America desert
      { lat: 35, lon: -105, size: 0.13, color: '#F4A460' }, // North America desert
      { lat: 30, lon: -100, size: 0.13, color: '#F4A460' }, // North America desert
      { lat: 25, lon: -95, size: 0.12, color: '#DEB887' }, // North America sand
      { lat: 20, lon: -105, size: 0.11, color: '#D2B48C' }, // Mexico sand
      { lat: 15, lon: -100, size: 0.11, color: '#DEB887' }, // Mexico sand
      { lat: 20, lon: -95, size: 0.11, color: '#F4A460' }, // Mexico desert
      { lat: 15, lon: -90, size: 0.10, color: '#DEB887' }, // Mexico beach
      // South America deserts
      { lat: 0, lon: -80, size: 0.12, color: '#F4A460' }, // South America desert
      { lat: -5, lon: -75, size: 0.12, color: '#F4A460' }, // South America desert
      { lat: -10, lon: -70, size: 0.12, color: '#F4A460' }, // South America desert
      { lat: -15, lon: -75, size: 0.11, color: '#DEB887' }, // South America sand
      { lat: -20, lon: -70, size: 0.11, color: '#D2B48C' }, // South America sand
      { lat: -25, lon: -65, size: 0.11, color: '#DEB887' }, // South America sand
      { lat: -30, lon: -70, size: 0.10, color: '#D2B48C' }, // South America sand
      // Sahara Desert - extensive coverage
      { lat: 35, lon: 5, size: 0.12, color: '#F4A460' }, // Sahara desert
      { lat: 30, lon: 10, size: 0.12, color: '#F4A460' }, // Sahara desert
      { lat: 25, lon: 15, size: 0.12, color: '#F4A460' }, // Sahara desert
      { lat: 20, lon: 10, size: 0.13, color: '#DEB887' }, // Sahara sand
      { lat: 15, lon: 5, size: 0.11, color: '#D2B48C' }, // Sahara sand
      { lat: 10, lon: 0, size: 0.11, color: '#DEB887' }, // Sahara sand
      { lat: 5, lon: 10, size: 0.11, color: '#D2B48C' }, // Sahara sand
      { lat: 0, lon: 5, size: 0.11, color: '#DEB887' }, // Sahara sand
      { lat: -5, lon: 10, size: 0.10, color: '#D2B48C' }, // Sahara sand
      { lat: 30, lon: 0, size: 0.11, color: '#F4A460' }, // Sahara desert
      { lat: 25, lon: 5, size: 0.11, color: '#DEB887' }, // Sahara sand
      { lat: 20, lon: 0, size: 0.11, color: '#D2B48C' }, // Sahara sand
      // Middle East deserts
      { lat: 40, lon: 40, size: 0.12, color: '#F4A460' }, // Middle East desert
      { lat: 35, lon: 45, size: 0.12, color: '#F4A460' }, // Middle East desert
      { lat: 30, lon: 50, size: 0.12, color: '#F4A460' }, // Middle East desert
      { lat: 25, lon: 55, size: 0.11, color: '#DEB887' }, // Middle East sand
      { lat: 20, lon: 50, size: 0.11, color: '#D2B48C' }, // Middle East sand
      { lat: 25, lon: 45, size: 0.11, color: '#DEB887' }, // Middle East sand
      { lat: 30, lon: 40, size: 0.11, color: '#D2B48C' }, // Middle East sand
      // Central Asia deserts
      { lat: 45, lon: 95, size: 0.13, color: '#F4A460' }, // Central Asia desert
      { lat: 40, lon: 95, size: 0.13, color: '#F4A460' }, // Central Asia desert
      { lat: 35, lon: 100, size: 0.13, color: '#F4A460' }, // Central Asia desert
      { lat: 40, lon: 90, size: 0.12, color: '#DEB887' }, // Central Asia sand
      { lat: 45, lon: 85, size: 0.12, color: '#D2B48C' }, // Central Asia sand
      { lat: 35, lon: 90, size: 0.12, color: '#DEB887' }, // Central Asia sand
      { lat: 30, lon: 95, size: 0.11, color: '#D2B48C' }, // Central Asia sand
      // Australian deserts
      { lat: -10, lon: 130, size: 0.12, color: '#F4A460' }, // Australia desert
      { lat: -15, lon: 125, size: 0.12, color: '#F4A460' }, // Australia desert
      { lat: -20, lon: 120, size: 0.12, color: '#F4A460' }, // Australia desert
      { lat: -25, lon: 130, size: 0.11, color: '#DEB887' }, // Australia sand
      { lat: -30, lon: 125, size: 0.11, color: '#D2B48C' }, // Australia sand
      { lat: -10, lon: 135, size: 0.11, color: '#DEB887' }, // Australia sand
      { lat: -15, lon: 135, size: 0.11, color: '#D2B48C' }, // Australia sand
      { lat: -20, lon: 130, size: 0.11, color: '#DEB887' }, // Australia sand
      // Additional beach/coastal sand areas - extensively expanded
      // North American beaches
      { lat: 35, lon: -120, size: 0.11, color: '#DEB887' }, // California coast
      { lat: 30, lon: -120, size: 0.11, color: '#DEB887' }, // California coast
      { lat: 25, lon: -110, size: 0.10, color: '#D2B48C' }, // Baja California
      { lat: 20, lon: -105, size: 0.10, color: '#DEB887' }, // Mexico coast
      { lat: 45, lon: -70, size: 0.11, color: '#DEB887' }, // East coast beach
      { lat: 40, lon: -75, size: 0.10, color: '#D2B48C' }, // East coast beach
      // Central/South American beaches
      { lat: 15, lon: -90, size: 0.11, color: '#DEB887' }, // Central America beach
      { lat: 10, lon: -80, size: 0.11, color: '#DEB887' }, // Central America beach
      { lat: 5, lon: -75, size: 0.10, color: '#D2B48C' }, // South America beach
      { lat: 0, lon: -80, size: 0.10, color: '#DEB887' }, // South America beach
      { lat: -5, lon: -85, size: 0.10, color: '#D2B48C' }, // South America beach
      { lat: -10, lon: -80, size: 0.10, color: '#DEB887' }, // South America beach
      // European beaches
      { lat: 55, lon: 5, size: 0.11, color: '#DEB887' }, // European beach
      { lat: 50, lon: 10, size: 0.11, color: '#DEB887' }, // European beach
      { lat: 45, lon: 5, size: 0.10, color: '#D2B48C' }, // European beach
      { lat: 40, lon: 0, size: 0.11, color: '#D2B48C' }, // European beach
      { lat: 50, lon: -5, size: 0.10, color: '#DEB887' }, // European beach
      // African beaches
      { lat: 20, lon: 15, size: 0.11, color: '#DEB887' }, // African coast
      { lat: 15, lon: 30, size: 0.11, color: '#DEB887' }, // African coast
      { lat: 10, lon: 35, size: 0.10, color: '#D2B48C' }, // African coast
      { lat: 5, lon: 30, size: 0.10, color: '#DEB887' }, // African coast
      { lat: 0, lon: 15, size: 0.10, color: '#D2B48C' }, // African coast
      { lat: -5, lon: 10, size: 0.10, color: '#DEB887' }, // African coast
      // Middle East/Indian beaches
      { lat: 30, lon: 35, size: 0.11, color: '#DEB887' }, // Middle East coast
      { lat: 25, lon: 50, size: 0.11, color: '#DEB887' }, // Middle East coast
      { lat: 25, lon: 60, size: 0.11, color: '#DEB887' }, // Indian coast
      { lat: 20, lon: 70, size: 0.10, color: '#D2B48C' }, // Indian coast
      { lat: 15, lon: 75, size: 0.10, color: '#DEB887' }, // Indian coast
      { lat: 10, lon: 80, size: 0.10, color: '#D2B48C' }, // Indian coast
      // Asian beaches
      { lat: 35, lon: 125, size: 0.11, color: '#DEB887' }, // Asian coast
      { lat: 30, lon: 130, size: 0.11, color: '#DEB887' }, // Asian coast
      { lat: 25, lon: 135, size: 0.10, color: '#D2B48C' }, // Asian coast
      { lat: 20, lon: 120, size: 0.10, color: '#DEB887' }, // Asian coast
      { lat: 15, lon: 125, size: 0.10, color: '#D2B48C' }, // Asian coast
      // Australian/Pacific beaches
      { lat: -15, lon: 140, size: 0.11, color: '#DEB887' }, // Australian beach
      { lat: -20, lon: 145, size: 0.10, color: '#D2B48C' }, // Australian beach
      { lat: -25, lon: 150, size: 0.10, color: '#DEB887' }, // Australian beach
      { lat: -10, lon: 145, size: 0.10, color: '#D2B48C' }, // Australian beach
      // More desert areas
      { lat: 28, lon: -102, size: 0.12, color: '#F4A460' }, // More North America desert
      { lat: 32, lon: -108, size: 0.12, color: '#DEB887' }, // More North America desert
      { lat: -8, lon: -72, size: 0.11, color: '#F4A460' }, // More South America desert
      { lat: -12, lon: -68, size: 0.11, color: '#DEB887' }, // More South America desert
      { lat: 28, lon: 8, size: 0.11, color: '#F4A460' }, // More Sahara
      { lat: 22, lon: 12, size: 0.11, color: '#DEB887' }, // More Sahara
      { lat: 18, lon: 8, size: 0.10, color: '#D2B48C' }, // More Sahara
      { lat: 12, lon: 2, size: 0.10, color: '#DEB887' }, // More Sahara
      { lat: 38, lon: 48, size: 0.11, color: '#F4A460' }, // More Middle East
      { lat: 33, lon: 52, size: 0.11, color: '#DEB887' }, // More Middle East
      { lat: 42, lon: 92, size: 0.12, color: '#F4A460' }, // More Central Asia
      { lat: 38, lon: 88, size: 0.11, color: '#DEB887' }, // More Central Asia
      { lat: -12, lon: 128, size: 0.11, color: '#F4A460' }, // More Australia
      { lat: -18, lon: 123, size: 0.11, color: '#DEB887' }, // More Australia
      { lat: -28, lon: 128, size: 0.10, color: '#D2B48C' }, // More Australia
      // Lighter blue hexagons (shallow water/coastal areas) - expanded
      { lat: 35, lon: -95, size: 0.14, color: '#87CEEB' }, // Gulf of Mexico
      { lat: 30, lon: -90, size: 0.14, color: '#87CEEB' }, // Gulf of Mexico
      { lat: 25, lon: -85, size: 0.13, color: '#B0E0E6' }, // Caribbean
      { lat: 20, lon: -80, size: 0.12, color: '#87CEEB' }, // Caribbean
      { lat: 15, lon: -75, size: 0.12, color: '#B0E0E6' }, // Caribbean
      { lat: 10, lon: -70, size: 0.13, color: '#B0E0E6' }, // South America coast
      { lat: 5, lon: -75, size: 0.12, color: '#87CEEB' }, // South America coast
      { lat: 0, lon: -70, size: 0.12, color: '#B0E0E6' }, // South America coast
      { lat: 55, lon: -5, size: 0.13, color: '#87CEEB' }, // North Sea
      { lat: 50, lon: 0, size: 0.13, color: '#87CEEB' }, // North Sea
      { lat: 50, lon: 5, size: 0.12, color: '#B0E0E6' }, // North Sea
      { lat: 45, lon: 5, size: 0.12, color: '#B0E0E6' }, // Mediterranean
      { lat: 40, lon: 10, size: 0.12, color: '#87CEEB' }, // Mediterranean
      { lat: 35, lon: 15, size: 0.12, color: '#B0E0E6' }, // Mediterranean
      { lat: 30, lon: 20, size: 0.11, color: '#87CEEB' }, // Mediterranean
      { lat: 20, lon: 35, size: 0.12, color: '#87CEEB' }, // Red Sea
      { lat: 15, lon: 40, size: 0.13, color: '#87CEEB' }, // Red Sea
      { lat: 10, lon: 45, size: 0.12, color: '#B0E0E6' }, // Red Sea
      { lat: 30, lon: 45, size: 0.13, color: '#87CEEB' }, // Persian Gulf
      { lat: 25, lon: 50, size: 0.13, color: '#87CEEB' }, // Persian Gulf
      { lat: 20, lon: 55, size: 0.12, color: '#B0E0E6' }, // Persian Gulf
      { lat: 35, lon: 125, size: 0.14, color: '#87CEEB' }, // East China Sea
      { lat: 30, lon: 120, size: 0.14, color: '#87CEEB' }, // East China Sea
      { lat: 30, lon: 125, size: 0.13, color: '#B0E0E6' }, // East China Sea
      { lat: 25, lon: 125, size: 0.13, color: '#B0E0E6' }, // South China Sea
      { lat: 20, lon: 110, size: 0.12, color: '#87CEEB' }, // South China Sea
      { lat: 15, lon: 115, size: 0.12, color: '#B0E0E6' }, // South China Sea
      { lat: 10, lon: 110, size: 0.12, color: '#87CEEB' }, // South China Sea
      { lat: -5, lon: 105, size: 0.13, color: '#87CEEB' }, // Indonesia
      { lat: -10, lon: 110, size: 0.13, color: '#87CEEB' }, // Indonesia
      { lat: -5, lon: 115, size: 0.12, color: '#B0E0E6' }, // Indonesia
      { lat: 0, lon: 120, size: 0.12, color: '#87CEEB' }, // Indonesia
      { lat: -15, lon: 150, size: 0.13, color: '#87CEEB' }, // Pacific islands
      { lat: -20, lon: 150, size: 0.13, color: '#87CEEB' }, // Pacific islands
      { lat: -15, lon: 145, size: 0.12, color: '#B0E0E6' }, // Pacific islands
      { lat: -10, lon: 140, size: 0.12, color: '#87CEEB' }, // Pacific islands
      { lat: 20, lon: -60, size: 0.12, color: '#87CEEB' }, // Atlantic islands
      { lat: 15, lon: -55, size: 0.11, color: '#B0E0E6' }, // Atlantic islands
      { lat: 50, lon: -20, size: 0.12, color: '#87CEEB' }, // Atlantic
      { lat: 45, lon: -15, size: 0.11, color: '#B0E0E6' }, // Atlantic
    ];

    // Filter out overlapping hexagons (very relaxed to allow more hexagons)
    const filteredContinents = [];
    for (const continent of allContinents) {
      let overlaps = false;
      for (const existing of filteredContinents) {
        if (areHexagonsTooClose(
          continent.lat, continent.lon, continent.size,
          existing.lat, existing.lon, existing.size
        )) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        filteredContinents.push(continent);
      }
    }

    // Log for debugging
    console.log(`Total continents: ${allContinents.length}, Filtered: ${filteredContinents.length}`);
    
    return filteredContinents;
  }, []);

  // Snow hexagons at the poles
  const snowHexagons = useMemo(() => {
    const snow = [];
    // North pole snow
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = 70; lat <= 85; lat += 8) {
        snow.push({ lat, lon, size: 0.12, color: '#FFFFFF' });
      }
    }
    // South pole snow - enhanced coverage
    for (let lon = -180; lon < 180; lon += 20) {
      for (let lat = -85; lat >= -60; lat -= 6) {
        snow.push({ lat, lon, size: 0.12, color: '#FFFFFF' });
      }
    }
    // Additional south pole coverage for more visibility
    for (let lon = -180; lon < 180; lon += 15) {
      for (let lat = -70; lat >= -80; lat -= 5) {
        snow.push({ lat, lon, size: 0.13, color: '#FFFFFF' });
      }
    }
    return snow;
  }, []);

  return (
    <>
      {/* Rotating Earth sphere group - everything rotates together */}
      <group ref={earthGroupRef}>
        {/* Cartoon-style Earth base - bright vibrant blue ocean */}
        <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={1}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            color={new Color(0x42A5F5)} // Bright cartoon blue
            metalness={0.0}
            roughness={1.0}
            emissive={new Color(0x1E88E5)}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Simple atmospheric ring */}
        <mesh ref={atmosphereRef} position={[0, 0, 0]} renderOrder={0}>
          <sphereGeometry args={[1.02, 32, 32]} />
          <meshBasicMaterial
            color={new Color(0x81D4FA)} // Bright sky blue
            transparent
            opacity={0.25}
            side={2}
          />
        </mesh>
        
        {/* Snow hexagons at poles - rotate with Earth */}
        {snowHexagons.map((snow, i) => (
          <CartoonContinent
            key={`snow-${i}`}
            lat={snow.lat}
            lon={snow.lon}
            size={snow.size}
            color={snow.color}
            onClick={() => onHexagonClick?.({ lat: snow.lat, lon: snow.lon, type: 'white', color: snow.color })}
          />
        ))}
        
        {/* Cartoon continents as hexagons - rotate with Earth */}
        {continents.map((continent, i) => {
          // Determine hexagon type based on color
          const isGreen = continent.color.includes('66BB6A') || continent.color.includes('81C784') || 
                         continent.color.includes('4CAF50') || continent.color.includes('388E3C') ||
                         continent.color.includes('9CCC65') || continent.color.includes('AED581') ||
                         continent.color.includes('8BC34A') || continent.color.includes('A5D6A7');
          const isSand = continent.color.includes('F4A460') || continent.color.includes('DEB887') || 
                        continent.color.includes('D2B48C');
          const isLightBlue = continent.color.includes('87CEEB') || continent.color.includes('B0E0E6');
          
          // Light blue hexagons show as sand (coastal/beach areas)
          const hexagonType = isGreen ? 'green' : (isSand || isLightBlue) ? 'sand' : 'white';
          
          return (
            <CartoonContinent
              key={`continent-${i}`}
              lat={continent.lat}
              lon={continent.lon}
              size={continent.size}
              color={continent.color}
              onClick={() => onHexagonClick?.({ lat: continent.lat, lon: continent.lon, type: hexagonType, color: continent.color })}
            />
          );
        })}
      </group>
    </>
  );
}
