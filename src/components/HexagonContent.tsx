import { useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Group, TextureLoader, Vector3 } from 'three';
import camelTextureImage from '../photos/go0f_svsw_210525.jpg';
import snowTextureImage from '../photos/e59r_kvdn_230223.jpg';
import treeTextureImage from '../photos/bhys_zrk0_210722.jpg';

interface HexagonContentProps {
  hexagonType: 'green' | 'white' | 'sand';
  lat: number;
  lon: number;
}

// Tree - simple photo display
function Tree({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Group>(null);
  const treeTexture = useLoader(TextureLoader, treeTextureImage);
  const { camera } = useThree();
  
  // Make the image always face the camera (billboard effect)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  // Calculate aspect ratio from texture
  const aspectRatio = treeTexture.image ? treeTexture.image.width / treeTexture.image.height : 1;
  const width = 0.25; // Same size as camel and snow
  const height = width / aspectRatio;

  return (
    <group ref={meshRef} position={position}>
      {/* Photo plane - displays the tree image, always facing camera */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          map={treeTexture} 
          transparent={false}
          side={2} // DoubleSide so it's visible from both sides
        />
      </mesh>
    </group>
  );
}

// Snow animal - simple photo display
function SnowAnimal({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Group>(null);
  const snowTexture = useLoader(TextureLoader, snowTextureImage);
  const { camera } = useThree();
  
  // Make the image always face the camera (billboard effect)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  // Calculate aspect ratio from texture
  const aspectRatio = snowTexture.image ? snowTexture.image.width / snowTexture.image.height : 1;
  const width = 0.25; // Same size as camel
  const height = width / aspectRatio;

  return (
    <group ref={meshRef} position={position}>
      {/* Photo plane - displays the snow image, always facing camera */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          map={snowTexture} 
          transparent={false}
          side={2} // DoubleSide so it's visible from both sides
        />
      </mesh>
    </group>
  );
}

// Desert animal (camel) - simple photo display
function DesertAnimal({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Group>(null);
  const camelTexture = useLoader(TextureLoader, camelTextureImage);
  const { camera } = useThree();
  
  // Make the image always face the camera (billboard effect)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  // Calculate aspect ratio from texture
  const aspectRatio = camelTexture.image ? camelTexture.image.width / camelTexture.image.height : 1;
  const width = 0.25; // Smaller size
  const height = width / aspectRatio;

  return (
    <group ref={meshRef} position={position}>
      {/* Photo plane - displays the camel image, always facing camera */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          map={camelTexture} 
          transparent={false}
          side={2} // DoubleSide so it's visible from both sides
        />
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
        <Tree position={animalPosition} />
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

