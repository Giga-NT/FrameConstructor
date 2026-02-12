import React from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../../types/types';

interface ArchRoofProps {
  params: CanopyParams;
  position: THREE.Vector3;
}

const ArchRoof: React.FC<ArchRoofProps> = ({ params, position }) => {
  const roofWidth = params.width + (params.overhang * 2);
  const segments = 12;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI;
    const x = -roofWidth/2 + (roofWidth * i/segments);
    const y = params.roofHeight * Math.sin(angle);
    points.push(new THREE.Vector3(x, y, 0));
  }

  return (
    <group position={position}>
      {points.map((point, i) => (
        <mesh key={`arch-point-${i}`} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#00ff00" />
        </mesh>
      ))}
    </group>
  );
};

export default ArchRoof;