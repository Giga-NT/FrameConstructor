// ArchedRoofModel.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FrameModel from './FrameModel';
import { FrameParams, FoundationParams, WeldingParams } from '../../types/types';

interface ArchedRoofModelProps {
  frameParams: Omit<FrameParams, 'roofType'> & { roofType: 'arched' };
  foundationParams: FoundationParams;
  weldingParams: WeldingParams;
}

const ArchedRoofModel: React.FC<ArchedRoofModelProps> = ({ 
  frameParams, 
  foundationParams, 
  weldingParams 
}) => {
  return (
    <Canvas
      shadows
      camera={{ position: [15, 10, 15], fov: 60 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={1024}
      />
      <FrameModel
        frameParams={{...frameParams, roofType: frameParams.roofType}}
        foundationParams={foundationParams}
        weldingParams={weldingParams}
      />
      <OrbitControls
        enableDamping
        target={[
          frameParams.length / 2,
          frameParams.height + (frameParams.trussHeightLeft + frameParams.trussHeightRight) / 2,
          0
        ]}
      />
    </Canvas>
  );
};

export default React.memo(ArchedRoofModel);