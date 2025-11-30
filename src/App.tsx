import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Color } from 'three';
import Earth from './components/Earth';
import ZoomView from './components/ZoomView';
import InfoPanel from './components/InfoPanel';
import './styles/App.css';

interface SelectedHexagon {
  lat: number;
  lon: number;
  type: 'green' | 'white' | 'sand';
  color: string;
}

function Scene({ 
  onHexagonClick, 
  selectedHexagon 
}: { 
  onHexagonClick: (data: SelectedHexagon) => void;
  selectedHexagon: SelectedHexagon | null;
}) {
  return (
    <>
      {/* Enhanced bright lighting */}
      <ambientLight intensity={0.8} color={new Color(0xffffff)} />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color={new Color(0x4a90e2)} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color={new Color(0xff6b6b)} />

      {/* Earth with auto-rotation - realistic Earth rotation (west to east) */}
      <Earth autoRotate={true} rotationSpeed={5.0} onHexagonClick={onHexagonClick} />

      {/* Animated stars background */}
      <Stars radius={300} depth={50} count={8000} factor={18} fade speed={2} />

      {/* Camera Controls - disabled when zoomed in */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={5}
        autoRotate={false}
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
        rotateSpeed={0.8}
        enabled={!selectedHexagon}
      />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={75} />
    </>
  );
}

function App() {
  const [selectedHexagon, setSelectedHexagon] = useState<SelectedHexagon | null>(null);

  const handleHexagonClick = (data: SelectedHexagon) => {
    setSelectedHexagon(data);
  };

  const handleCloseZoom = () => {
    setSelectedHexagon(null);
  };

  return (
    <div className="app-container">
      <Canvas 
        className="canvas-container"
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 3], fov: 75 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <Scene onHexagonClick={handleHexagonClick} selectedHexagon={selectedHexagon} />
        <ZoomView selectedHexagon={selectedHexagon} onClose={handleCloseZoom} />
      </Canvas>
      <InfoPanel hexagonData={selectedHexagon} onClose={handleCloseZoom} />
      {selectedHexagon && (
        <button 
          className="close-zoom-button"
          onClick={handleCloseZoom}
        >
          ✕ Close
        </button>
      )}
      <div className="controls-hint">
        <p>🖱️ Drag to rotate • Scroll to zoom • Click hexagons to explore</p>
      </div>
    </div>
  );
}

export default App;
