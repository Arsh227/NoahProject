import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Shape, ExtrudeGeometry, Matrix4, Quaternion } from 'three';
import { HexagonData } from '../utils/hexagonUtils';

interface HexagonProps {
  hexagonData: HexagonData;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (hexagonData: HexagonData) => void;
}

export default function Hexagon({
  hexagonData,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: HexagonProps) {
  const meshRef = useRef<Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);

  // Animate scale on hover/select
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isHovered || isSelected ? 1.15 : 1.0;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Create hexagon geometry using useMemo
  const geometry = useMemo(() => {
    const shape = new Shape();
    const radius = 0.02;
    
    // Create hexagon vertices in 2D plane
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
    
    return new ExtrudeGeometry(shape, { depth: 0.0005, bevelEnabled: false });
  }, []);

  // Determine color based on state
  const getColor = () => {
    if (isSelected) return '#4fc3f7';
    if (isHovered || localHovered) return '#81c784';
    return 'rgba(255, 255, 255, 0.3)';
  };

  // Calculate rotation to align hexagon with sphere surface
  const up = hexagonData.center.clone().normalize();
  const right = new Vector3(1, 0, 0).cross(up).normalize();
  if (right.length() < 0.1) {
    right.set(0, 1, 0).cross(up).normalize();
  }
  const forward = up.clone().cross(right).normalize();
  
  // Create rotation matrix
  const rotationMatrix = new Matrix4().makeBasis(right, forward, up);

  // Position hexagon slightly above sphere surface
  const position = hexagonData.center.clone().multiplyScalar(1.001);

  return (
    <mesh
      ref={meshRef}
      position={position}
      quaternion={new Quaternion().setFromRotationMatrix(rotationMatrix)}
      renderOrder={2}
      geometry={geometry}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHovered(true);
        onHover(hexagonData.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setLocalHovered(false);
        if (!isSelected) {
          onHover(null);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(hexagonData);
      }}
    >
      <meshBasicMaterial
        color={getColor()}
        transparent
        opacity={isHovered || isSelected ? 0.7 : 0.25}
        side={2} // DoubleSide
      />
    </mesh>
  );
}
