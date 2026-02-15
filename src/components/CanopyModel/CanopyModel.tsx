import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import Canopy from '../Canopy/Canopy';

const CanopyModel = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [10, 10, 20], fov: 50 }}
        style={{ background: '#87CEEB' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow
          shadow-mapSize={2048}
        />
        
        <Canopy params={{}} />
        
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#3f3f3f"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
        />
        
        <Environment preset="city" />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default CanopyModel;