import React, { useMemo } from 'react';
import * as THREE from 'three';

const GazeboFoundation: React.FC<{ params: any }> = ({ params }) => {
  const { width = 3.003, length = 2.489 } = params;

  // Материалы
  const foundationMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#999999',
    roughness: 0.9,
    metalness: 0.1
  }), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D2B48C',
    roughness: 0.7,
    metalness: 0
  }), []);

  const stepMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#777777',
    roughness: 0.8
  }), []);

  // Фундамент (500мм выступ с каждой стороны)
  const foundation = useMemo(() => {
    const geometry = new THREE.BoxGeometry(width + 1.0, 0.3, length + 1.0);
    return (
      <mesh
        geometry={geometry}
        material={foundationMaterial}
        position={[0, -0.15, 0]}
        receiveShadow
      />
    );
  }, [width, length, foundationMaterial]);

  // Пол
  const floor = useMemo(() => {
    const geometry = new THREE.BoxGeometry(width, 0.1, length);
    return (
      <mesh
        geometry={geometry}
        material={floorMaterial}
        position={[0, 0.05, 0]}
        receiveShadow
      />
    );
  }, [width, length, floorMaterial]);

  // Ступени (2 ступени по 225мм)
  const steps = useMemo(() => {
    const stepWidth = 1.5;
    return (
      <group position={[0, -0.1125, -length/2 - 0.25]}>
        <mesh
          geometry={new THREE.BoxGeometry(stepWidth, 0.225, 0.5)}
          material={stepMaterial}
          position={[0, 0.1125, 0]}
          receiveShadow
        />
        <mesh
          geometry={new THREE.BoxGeometry(stepWidth, 0.225, 0.5)}
          material={stepMaterial}
          position={[0, 0.3375, -0.3]}
          receiveShadow
        />
      </group>
    );
  }, [stepMaterial]);

  return (
    <group>
      {foundation}
      {floor}
      {steps}
    </group>
  );
};

export default React.memo(GazeboFoundation);