import React from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../../types/types';

interface ShedRoofProps {
  params: CanopyParams;
  position: THREE.Vector3;
}

const ShedRoof: React.FC<ShedRoofProps> = ({ params, position }) => {
  const roofWidth = params.width + (params.overhang * 2);
  const points = [
    new THREE.Vector3(-roofWidth/2, 0, 0),
    new THREE.Vector3(roofWidth/2, params.roofHeight, 0)
  ];

  return (
    <group position={position}>
      {points.map((point, i) => (
        <mesh key={`shed-point-${i}`} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#0000ff" />
        </mesh>
      ))}
    </group>
  );
};

export default ShedRoof;