import React from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../../types/types';

interface GableRoofProps {
  params: CanopyParams;
  position: THREE.Vector3;
}

const GableRoof: React.FC<GableRoofProps> = ({ params, position }) => {
  const roofWidth = params.width + (params.overhang * 2);
  const points = [
    new THREE.Vector3(-roofWidth/2, 0, 0),
    new THREE.Vector3(0, params.roofHeight, 0),
    new THREE.Vector3(roofWidth/2, 0, 0)
  ];

  return (
    <group position={position}>
      {points.map((point, i) => (
        <mesh key={`gable-point-${i}`} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ))}
    </group>
  );
};

export default GableRoof;