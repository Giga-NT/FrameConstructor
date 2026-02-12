import React, { useMemo } from 'react';
import * as THREE from 'three';

const GazeboFurniture: React.FC<{ params: any }> = ({ params }) => {
  const { width = 3.003, length = 2.489 } = params;

  // Материалы
  const tableMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#D2B48C',
    roughness: 0.6
  }), []);

  const benchMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B4513',
    roughness: 0.7
  }), []);

  // Стол (800x800 мм)
  const table = useMemo(() => (
    <group position={[0, 0.75, 0]}>
      <mesh
        geometry={new THREE.BoxGeometry(0.8, 0.05, 0.8)}
        material={tableMaterial}
        position={[0, 0.025, 0]}
        castShadow
      />
      {[
        [0.35, 0.35], [-0.35, 0.35], 
        [0.35, -0.35], [-0.35, -0.35]
      ].map(([x, z], i) => (
        <mesh
          key={`leg-${i}`}
          geometry={new THREE.BoxGeometry(0.06, 0.7, 0.06)}
          material={benchMaterial}
          position={[x, -0.35, z]}
          castShadow
        />
      ))}
    </group>
  ), [tableMaterial, benchMaterial]);

  // Скамейки (2 штуки)
  const benches = useMemo(() => (
    <>
      <group position={[0, 0.4, -length/2 + 0.4]}>
        <mesh
          geometry={new THREE.BoxGeometry(width - 0.6, 0.05, 0.4)}
          material={benchMaterial}
          position={[0, 0.025, 0]}
          castShadow
        />
        {[-0.4, 0.4].map((x, i) => (
          <mesh
            key={`bench-leg-1-${i}`}
            geometry={new THREE.BoxGeometry(0.06, 0.35, 0.06)}
            material={benchMaterial}
            position={[x, -0.175, 0.15]}
            castShadow
          />
        ))}
      </group>
      <group position={[0, 0.4, length/2 - 0.4]}>
        <mesh
          geometry={new THREE.BoxGeometry(width - 0.6, 0.05, 0.4)}
          material={benchMaterial}
          position={[0, 0.025, 0]}
          castShadow
        />
        {[-0.4, 0.4].map((x, i) => (
          <mesh
            key={`bench-leg-2-${i}`}
            geometry={new THREE.BoxGeometry(0.06, 0.35, 0.06)}
            material={benchMaterial}
            position={[x, -0.175, -0.15]}
            castShadow
          />
        ))}
      </group>
    </>
  ), [width, length, benchMaterial]);

  return (
    <group>
      {table}
      {benches}
    </group>
  );
};

export default React.memo(GazeboFurniture);