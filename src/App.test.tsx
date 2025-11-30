// Temporary test file to verify rendering works
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './styles/App.css';

function TestScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      <OrbitControls enableZoom={true} enableRotate={true} />
    </>
  );
}

export default function TestApp() {
  return (
    <div className="app-container">
      <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <TestScene />
      </Canvas>
      <div className="controls-hint">
        <p>Test: You should see a blue sphere</p>
      </div>
    </div>
  );
}

