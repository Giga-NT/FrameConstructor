import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TubeDimensions } from '../../types/types';

interface BeamProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dimensions: TubeDimensions;
  rotationOffset?: number;
  color: string;
}

const Beam: React.FC<BeamProps> = ({ 
  start, 
  end, 
  dimensions,
  rotationOffset = 0,
  color
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const length = start.distanceTo(end);
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction
  );

  // Обновляем цвет при изменении пропса
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(new THREE.Color(color));
      materialRef.current.needsUpdate = true;
    }
  }, [color]);

  const additionalRotation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    rotationOffset
  );
  quaternion.multiply(additionalRotation);

  return (
    <mesh
      ref={meshRef}
      position={center}
      quaternion={quaternion}
      castShadow
    >
      <boxGeometry args={[dimensions.thickness, length, dimensions.width]} />
      <meshStandardMaterial 
        ref={materialRef}
        color={new THREE.Color(color)}
        metalness={0.5}
        roughness={0.7}
      />
    </mesh>
  );
};

export default React.memo(Beam);