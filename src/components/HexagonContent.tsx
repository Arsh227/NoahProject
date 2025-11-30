import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface HexagonContentProps {
  hexagonType: 'green' | 'white' | 'sand';
  lat: number;
  lon: number;
}

// Simple 3D Tree component
function Tree({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Tree trunk */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Tree leaves */}
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Snow animal (polar bear)
function SnowAnimal({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Polar bear body */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, 0.08]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.06, 0.25, 0.08]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.06, 0.25, 0.08]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// Desert animal (camel)
function DesertAnimal({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Camel body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.15, 0.25]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      {/* Camel head */}
      <mesh position={[0, 0.15, 0.15]}>
        <boxGeometry args={[0.1, 0.1, 0.12]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      {/* Hump */}
      <mesh position={[0, 0.2, -0.05]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#CD853F" />
      </mesh>
    </group>
  );
}

export default function HexagonContent({ hexagonType }: HexagonContentProps) {
  const groupRef = useRef<Group>(null);
  const animalPosition = [0, 0.2, 0] as [number, number, number];

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {hexagonType === 'green' && (
        <>
          <Tree position={[-0.12, 0, -0.08]} />
          <Tree position={[0.12, 0, -0.08]} />
          <Tree position={[0, 0, 0.08]} />
        </>
      )}
      {hexagonType === 'white' && (
        <SnowAnimal position={animalPosition} />
      )}
      {hexagonType === 'sand' && (
        <DesertAnimal position={animalPosition} />
      )}
    </group>
  );
}

