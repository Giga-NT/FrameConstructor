import React, { useMemo } from 'react';
import * as THREE from 'three';

const GazeboFoundation: React.FC<{ params: any }> = ({ params }) => {
  const { width = 3, length = 3, foundationType = 'wood', floorType = 'wood' } = params;

  const foundationMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: foundationType === 'concrete' ? '#888888' : '#996633',
      roughness: 0.9,
      metalness: 0.1
    }),
    [foundationType]
  );

  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: floorType === 'wood' ? '#D2B48C' : floorType === 'concrete' ? '#CCCCCC' : '#AAAAAA',
      roughness: 0.7,
      metalness: 0.0
    }),
    [floorType]
  );

  // Фундамент (только если не 'none')
  const foundation = useMemo(() => {
    if (foundationType === 'none') return null;
    const geometry = new THREE.BoxGeometry(width + 0.6, 0.2, length + 0.6);
    return (
      <mesh
        geometry={geometry}
        material={foundationMaterial}
        position={[0, -0.1, 0]}
        receiveShadow
      />
    );
  }, [width, length, foundationType, foundationMaterial]);

  // Пол (только если не 'none')
  const floor = useMemo(() => {
    if (floorType === 'none') return null;
    const geometry = new THREE.BoxGeometry(width, 0.1, length);
    return (
      <mesh
        geometry={geometry}
        material={floorMaterial}
        position={[0, 0.05, 0]}
        receiveShadow
      />
    );
  }, [width, length, floorType, floorMaterial]);

  return (
    <group>
      {foundation}
      {floor}
    </group>
  );
};

export default React.memo(GazeboFoundation);