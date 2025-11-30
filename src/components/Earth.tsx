import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, Vector3, Matrix4, Quaternion, Shape, ExtrudeGeometry, Group } from 'three';
import { latLonToVector3 } from '../utils/hexagonUtils';

interface EarthProps {
  autoRotate?: boolean;
  rotationSpeed?: number;
  onHexagonClick?: (data: { lat: number; lon: number; type: 'green' | 'white' | 'sand' | 'beach' | 'water'; color: string }) => void;
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
  useFrame((_state, delta) => {
    if (earthGroupRef.current && autoRotate) {
      // Rotate Earth sphere group from west to east
      // Continents are outside this group so they stay fixed
      earthGroupRef.current.rotation.y += rotationSpeed * delta * 0.02;
    }
  });

  // Cartoon-style continents as hexagons with non-intersecting positions
  const continents = useMemo(() => {
    const allContinents = [
      // Beach hexagons - yellow color (#FFFF00 = pure yellow) - placed FIRST to avoid filtering
      // North American beaches - isolated coastal areas
      { lat: 42, lon: -70, size: 0.15, color: '#FFFF00' }, // New England beach
      { lat: 38, lon: -77, size: 0.14, color: '#FFFF00' }, // Mid-Atlantic beach
      { lat: 32, lon: -80, size: 0.15, color: '#FFFF00' }, // South Carolina beach
      { lat: 28, lon: -82, size: 0.14, color: '#FFFF00' }, // Florida Gulf beach
      { lat: 26, lon: -81, size: 0.14, color: '#FFFF00' }, // Florida Atlantic beach
      { lat: 34, lon: -119, size: 0.15, color: '#FFFF00' }, // California beach
      { lat: 33, lon: -117, size: 0.14, color: '#FFFF00' }, // Southern California beach
      // Caribbean beaches - isolated islands
      { lat: 22, lon: -80, size: 0.15, color: '#FFFF00' }, // Cuba beach
      { lat: 18, lon: -77, size: 0.14, color: '#FFFF00' }, // Jamaica beach
      { lat: 12, lon: -70, size: 0.15, color: '#FFFF00' }, // Caribbean island beach
      // European beaches - coastal areas
      { lat: 51, lon: 1, size: 0.14, color: '#FFFF00' }, // UK beach
      { lat: 47, lon: -2, size: 0.14, color: '#FFFF00' }, // French beach
      { lat: 41, lon: 2, size: 0.15, color: '#FFFF00' }, // Spanish beach
      { lat: 37, lon: -8, size: 0.14, color: '#FFFF00' }, // Portuguese beach
      // Mediterranean beaches
      { lat: 41, lon: 12, size: 0.15, color: '#FFFF00' }, // Italian beach
      { lat: 39, lon: 22, size: 0.14, color: '#FFFF00' }, // Greek beach
      { lat: 36, lon: 28, size: 0.14, color: '#FFFF00' }, // Greek island beach
      // African beaches - coastal areas
      { lat: 14, lon: 18, size: 0.14, color: '#FFFF00' }, // West African beach
      { lat: 6, lon: 3, size: 0.15, color: '#FFFF00' }, // West African beach
      { lat: -4, lon: 15, size: 0.14, color: '#FFFF00' }, // Central African beach
      // Asian beaches - coastal areas
      { lat: 26, lon: 119, size: 0.15, color: '#FFFF00' }, // Chinese beach
      { lat: 21, lon: 113, size: 0.14, color: '#FFFF00' }, // Chinese beach
      { lat: 13, lon: 100, size: 0.15, color: '#FFFF00' }, // Thai beach
      { lat: 1, lon: 104, size: 0.14, color: '#FFFF00' }, // Singapore beach
      // Australian/Pacific beaches
      { lat: -27, lon: 153, size: 0.15, color: '#FFFF00' }, // Australian beach
      { lat: -16, lon: 145, size: 0.14, color: '#FFFF00' }, // Australian beach
      { lat: -12, lon: 130, size: 0.15, color: '#FFFF00' }, // Australian beach
      // South American beaches - coastal areas
      { lat: -3, lon: -38, size: 0.14, color: '#FFFF00' }, // Brazilian beach
      { lat: -8, lon: -35, size: 0.15, color: '#FFFF00' }, // Brazilian beach
      { lat: -12, lon: -77, size: 0.14, color: '#FFFF00' }, // Peruvian beach
      { lat: -33, lon: -71, size: 0.14, color: '#FFFF00' }, // Chilean beach
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
      // More light blue hexagons - additional coastal and shallow water areas
      // North American coastal waters
      { lat: 40, lon: -72, size: 0.13, color: '#87CEEB' }, // New York area
      { lat: 36, lon: -76, size: 0.13, color: '#B0E0E6' }, // Virginia coast
      { lat: 32, lon: -79, size: 0.13, color: '#87CEEB' }, // South Carolina coast
      { lat: 29, lon: -81, size: 0.13, color: '#B0E0E6' }, // Florida coast
      { lat: 27, lon: -82, size: 0.12, color: '#87CEEB' }, // Florida coast
      { lat: 36, lon: -122, size: 0.13, color: '#87CEEB' }, // San Francisco Bay
      { lat: 32, lon: -117, size: 0.13, color: '#B0E0E6' }, // San Diego area
      // More Caribbean and Central American waters
      { lat: 24, lon: -82, size: 0.13, color: '#87CEEB' }, // Florida Keys
      { lat: 19, lon: -81, size: 0.13, color: '#B0E0E6' }, // Cayman Islands
      { lat: 17, lon: -88, size: 0.12, color: '#87CEEB' }, // Belize coast
      { lat: 11, lon: -85, size: 0.13, color: '#B0E0E6' }, // Central America coast
      { lat: 9, lon: -80, size: 0.12, color: '#87CEEB' }, // Panama coast
      // More South American coastal waters
      { lat: -2, lon: -45, size: 0.13, color: '#87CEEB' }, // Brazilian coast
      { lat: -6, lon: -35, size: 0.13, color: '#B0E0E6' }, // Brazilian coast
      { lat: -10, lon: -38, size: 0.12, color: '#87CEEB' }, // Brazilian coast
      { lat: -14, lon: -42, size: 0.12, color: '#B0E0E6' }, // Brazilian coast
      { lat: -23, lon: -45, size: 0.13, color: '#87CEEB' }, // Brazilian coast
      // More European coastal waters
      { lat: 52, lon: 4, size: 0.13, color: '#87CEEB' }, // Netherlands coast
      { lat: 54, lon: 8, size: 0.13, color: '#B0E0E6' }, // German coast
      { lat: 56, lon: 10, size: 0.12, color: '#87CEEB' }, // Danish coast
      { lat: 59, lon: 10, size: 0.13, color: '#B0E0E6' }, // Norwegian coast
      { lat: 43, lon: 5, size: 0.13, color: '#87CEEB' }, // French Riviera
      { lat: 41, lon: 2, size: 0.13, color: '#B0E0E6' }, // Barcelona area
      { lat: 38, lon: -9, size: 0.13, color: '#87CEEB' }, // Lisbon area
      // More Mediterranean waters
      { lat: 44, lon: 8, size: 0.13, color: '#87CEEB' }, // Italian Riviera
      { lat: 40, lon: 14, size: 0.13, color: '#B0E0E6' }, // Naples area
      { lat: 38, lon: 15, size: 0.12, color: '#87CEEB' }, // Sicily area
      { lat: 37, lon: 23, size: 0.13, color: '#B0E0E6' }, // Greek coast
      { lat: 35, lon: 24, size: 0.13, color: '#87CEEB' }, // Crete area
      // More African coastal waters
      { lat: 12, lon: 3, size: 0.13, color: '#87CEEB' }, // West African coast
      { lat: 5, lon: 4, size: 0.13, color: '#B0E0E6' }, // West African coast
      { lat: -2, lon: 10, size: 0.13, color: '#87CEEB' }, // Central African coast
      { lat: -6, lon: 12, size: 0.12, color: '#B0E0E6' }, // Central African coast
      { lat: -26, lon: 28, size: 0.13, color: '#87CEEB' }, // South African coast
      { lat: -34, lon: 18, size: 0.13, color: '#B0E0E6' }, // Cape Town area
      // More Middle East/Indian Ocean waters
      { lat: 25, lon: 54, size: 0.13, color: '#87CEEB' }, // UAE coast
      { lat: 24, lon: 54, size: 0.13, color: '#B0E0E6' }, // UAE coast
      { lat: 19, lon: 72, size: 0.13, color: '#87CEEB' }, // Mumbai area
      { lat: 13, lon: 80, size: 0.13, color: '#B0E0E6' }, // Chennai area
      { lat: 6, lon: 80, size: 0.13, color: '#87CEEB' }, // Sri Lanka
      // More Asian coastal waters
      { lat: 31, lon: 121, size: 0.14, color: '#87CEEB' }, // Shanghai area
      { lat: 35, lon: 129, size: 0.13, color: '#B0E0E6' }, // Busan area
      { lat: 35, lon: 139, size: 0.14, color: '#87CEEB' }, // Tokyo Bay
      { lat: 14, lon: 121, size: 0.13, color: '#87CEEB' }, // Manila Bay
      { lat: 1, lon: 104, size: 0.13, color: '#B0E0E6' }, // Singapore area
      // More Australian/Pacific waters
      { lat: -19, lon: 147, size: 0.13, color: '#87CEEB' }, // Australian coast
      { lat: -23, lon: 151, size: 0.13, color: '#B0E0E6' }, // Australian coast
      { lat: -28, lon: 153, size: 0.13, color: '#87CEEB' }, // Brisbane area
      { lat: -34, lon: 151, size: 0.13, color: '#B0E0E6' }, // Sydney area
      { lat: -38, lon: 145, size: 0.13, color: '#87CEEB' }, // Melbourne area
      { lat: -17, lon: 178, size: 0.13, color: '#87CEEB' }, // Fiji area
      { lat: -21, lon: -159, size: 0.13, color: '#B0E0E6' }, // Hawaii area
      // More Atlantic waters
      { lat: 25, lon: -77, size: 0.13, color: '#87CEEB' }, // Bahamas
      { lat: 18, lon: -66, size: 0.13, color: '#B0E0E6' }, // Puerto Rico
      { lat: 12, lon: -69, size: 0.13, color: '#87CEEB' }, // Aruba area
      { lat: 55, lon: -3, size: 0.13, color: '#87CEEB' }, // UK coast
      { lat: 53, lon: -3, size: 0.13, color: '#B0E0E6' }, // UK coast
      { lat: 48, lon: -4, size: 0.13, color: '#87CEEB' }, // French coast
      // Even more light blue hexagons - additional coastal areas
      // North American Great Lakes and inland waters
      { lat: 45, lon: -83, size: 0.13, color: '#87CEEB' }, // Lake Huron area
      { lat: 43, lon: -79, size: 0.13, color: '#B0E0E6' }, // Lake Ontario area
      { lat: 42, lon: -87, size: 0.13, color: '#87CEEB' }, // Lake Michigan area
      // More East Coast waters
      { lat: 44, lon: -66, size: 0.13, color: '#87CEEB' }, // Maine coast
      { lat: 41, lon: -71, size: 0.13, color: '#B0E0E6' }, // Cape Cod area
      { lat: 39, lon: -74, size: 0.13, color: '#87CEEB' }, // New Jersey coast
      // More Gulf of Mexico
      { lat: 30, lon: -87, size: 0.13, color: '#87CEEB' }, // Alabama coast
      { lat: 29, lon: -95, size: 0.13, color: '#B0E0E6' }, // Texas coast
      { lat: 27, lon: -97, size: 0.13, color: '#87CEEB' }, // Texas coast
      // More Pacific Coast
      { lat: 48, lon: -123, size: 0.13, color: '#87CEEB' }, // Washington coast
      { lat: 46, lon: -124, size: 0.13, color: '#B0E0E6' }, // Oregon coast
      { lat: 37, lon: -122, size: 0.13, color: '#87CEEB' }, // San Francisco area
      // More Caribbean
      { lat: 16, lon: -88, size: 0.13, color: '#87CEEB' }, // Belize barrier reef
      { lat: 10, lon: -84, size: 0.13, color: '#B0E0E6' }, // Costa Rica coast
      { lat: 8, lon: -80, size: 0.13, color: '#87CEEB' }, // Panama coast
      // More South American waters
      { lat: -12, lon: -77, size: 0.13, color: '#87CEEB' }, // Lima area
      { lat: -16, lon: -72, size: 0.13, color: '#B0E0E6' }, // Peruvian coast
      { lat: -33, lon: -71, size: 0.13, color: '#87CEEB' }, // Valparaiso area
      { lat: -36, lon: -73, size: 0.13, color: '#B0E0E6' }, // Chilean coast
      // More European waters
      { lat: 60, lon: 5, size: 0.13, color: '#87CEEB' }, // Norwegian coast
      { lat: 58, lon: 6, size: 0.13, color: '#B0E0E6' }, // Norwegian coast
      { lat: 55, lon: 12, size: 0.13, color: '#87CEEB' }, // Danish coast
      { lat: 57, lon: 11, size: 0.13, color: '#B0E0E6' }, // Swedish coast
      { lat: 60, lon: 25, size: 0.13, color: '#87CEEB' }, // Finnish coast
      { lat: 42, lon: 3, size: 0.13, color: '#87CEEB' }, // Balearic Sea
      { lat: 39, lon: 3, size: 0.13, color: '#B0E0E6' }, // Balearic Sea
      // More Mediterranean
      { lat: 36, lon: 5, size: 0.13, color: '#87CEEB' }, // Algerian coast
      { lat: 33, lon: 10, size: 0.13, color: '#B0E0E6' }, // Tunisian coast
      { lat: 32, lon: 34, size: 0.13, color: '#87CEEB' }, // Israeli coast
      { lat: 35, lon: 33, size: 0.13, color: '#B0E0E6' }, // Lebanese coast
      // More African waters
      { lat: 15, lon: 38, size: 0.13, color: '#87CEEB' }, // Red Sea
      { lat: 22, lon: 39, size: 0.13, color: '#B0E0E6' }, // Red Sea
      { lat: -4, lon: 39, size: 0.13, color: '#87CEEB' }, // Kenyan coast
      { lat: -6, lon: 39, size: 0.13, color: '#B0E0E6' }, // Tanzanian coast
      { lat: -26, lon: 32, size: 0.13, color: '#87CEEB' }, // Mozambique coast
      // More Middle East waters
      { lat: 26, lon: 50, size: 0.13, color: '#87CEEB' }, // Bahrain area
      { lat: 25, lon: 51, size: 0.13, color: '#B0E0E6' }, // Qatar area
      { lat: 24, lon: 54, size: 0.13, color: '#87CEEB' }, // UAE coast
      // More Indian Ocean
      { lat: 4, lon: 73, size: 0.13, color: '#87CEEB' }, // Maldives
      { lat: -4, lon: 55, size: 0.13, color: '#B0E0E6' }, // Seychelles
      { lat: -20, lon: 57, size: 0.13, color: '#87CEEB' }, // Mauritius
      // More Asian waters
      { lat: 22, lon: 114, size: 0.13, color: '#87CEEB' }, // Hong Kong area
      { lat: 22, lon: 120, size: 0.13, color: '#B0E0E6' }, // Taiwan area
      { lat: 25, lon: 121, size: 0.13, color: '#87CEEB' }, // Taiwan coast
      { lat: 13, lon: 100, size: 0.13, color: '#87CEEB' }, // Bangkok area
      { lat: 10, lon: 106, size: 0.13, color: '#B0E0E6' }, // Ho Chi Minh area
      { lat: 3, lon: 101, size: 0.13, color: '#87CEEB' }, // Kuala Lumpur area
      // More Indonesian/Philippine waters
      { lat: -6, lon: 106, size: 0.13, color: '#87CEEB' }, // Jakarta area
      { lat: -8, lon: 115, size: 0.13, color: '#B0E0E6' }, // Bali area
      { lat: 5, lon: 119, size: 0.13, color: '#87CEEB' }, // Philippines
      { lat: 14, lon: 121, size: 0.13, color: '#B0E0E6' }, // Manila area
      // More Pacific waters
      { lat: 21, lon: -157, size: 0.13, color: '#87CEEB' }, // Hawaii
      { lat: 13, lon: 144, size: 0.13, color: '#87CEEB' }, // Guam
      { lat: 7, lon: 134, size: 0.13, color: '#B0E0E6' }, // Palau
      // More Australian waters
      { lat: -12, lon: 130, size: 0.13, color: '#87CEEB' }, // Darwin area
      { lat: -32, lon: 115, size: 0.13, color: '#B0E0E6' }, // Perth area
      { lat: -31, lon: 115, size: 0.13, color: '#87CEEB' }, // Perth coast
      // More Atlantic islands
      { lat: 28, lon: -16, size: 0.13, color: '#87CEEB' }, // Canary Islands
      { lat: 32, lon: -16, size: 0.13, color: '#B0E0E6' }, // Madeira
      { lat: 38, lon: -28, size: 0.13, color: '#87CEEB' }, // Azores
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
    const beachCount = filteredContinents.filter(c => c.color.includes('FFFF00')).length;
    console.log(`Total continents: ${allContinents.length}, Filtered: ${filteredContinents.length}, Beach hexagons: ${beachCount}`);
    
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
          const isBeach = continent.color.includes('FFFF00'); // Beach color (pure yellow)
          const isWater = continent.color.includes('87CEEB') || continent.color.includes('B0E0E6'); // Light blue = water
          const isSand = continent.color.includes('F4A460') || continent.color.includes('DEB887') || 
                        continent.color.includes('D2B48C');
          
          // Determine hexagon type: beach has priority, then green, then water, then sand, then white
          const hexagonType = isBeach ? 'beach' : isGreen ? 'green' : isWater ? 'water' : isSand ? 'sand' : 'white';
          
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
