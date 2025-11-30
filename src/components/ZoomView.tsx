import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { latLonToVector3 } from '../utils/hexagonUtils';
import HexagonContent from './HexagonContent';

interface ZoomViewProps {
  selectedHexagon: { lat: number; lon: number; type: 'green' | 'white' | 'sand'; color: string } | null;
  onClose: () => void;
}

export default function ZoomView({ selectedHexagon }: ZoomViewProps) {
  const { camera } = useThree();
  const targetPositionRef = useRef<Vector3>(new Vector3(0, 0, 3));
  const targetLookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const isZoomingRef = useRef(false);
  const originalPositionRef = useRef<Vector3>(new Vector3(0, 0, 3));

  useEffect(() => {
    if (selectedHexagon) {
      // Calculate target position for zoom
      const hexPosition = latLonToVector3(selectedHexagon.lat, selectedHexagon.lon, 1);
      // Position camera closer to the hexagon - zoom in
      targetPositionRef.current = hexPosition.clone().multiplyScalar(1.8);
      targetLookAtRef.current = hexPosition.clone();
      isZoomingRef.current = true;
    } else {
      // Return to original position
      targetPositionRef.current = originalPositionRef.current.clone();
      targetLookAtRef.current = new Vector3(0, 0, 0);
      isZoomingRef.current = true;
    }
  }, [selectedHexagon]);

  // Smooth camera animation
  useFrame(() => {
    if (isZoomingRef.current) {
      camera.position.lerp(targetPositionRef.current, 0.08);
      const lookAt = new Vector3();
      lookAt.lerp(targetLookAtRef.current, 0.08);
      camera.lookAt(lookAt);
      
      // Check if close enough to target
      if (camera.position.distanceTo(targetPositionRef.current) < 0.05) {
        isZoomingRef.current = false;
      }
    }
  });

  if (!selectedHexagon) return null;

  const hexPosition = latLonToVector3(selectedHexagon.lat, selectedHexagon.lon, 1.002);

  return (
    <group position={hexPosition}>
      <HexagonContent
        hexagonType={selectedHexagon.type}
        lat={selectedHexagon.lat}
        lon={selectedHexagon.lon}
      />
    </group>
  );
}

