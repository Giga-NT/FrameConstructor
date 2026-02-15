import React, { useMemo } from 'react';
import * as THREE from 'three';

interface SingleSlopeRoofProps {
  params: {
    width: number;
    length: number;
    height: number;
    roofHeight: number;
    overhang?: number;
    roofColor?: string;
    materialType?: 'wood' | 'metal';
  };
}

const SingleSlopeRoof: React.FC<SingleSlopeRoofProps> = ({ params }) => {
  const {
    width,
    length,
    height,
    roofHeight,
    overhang = 0.5,
    roofColor = '#A0522D',
    materialType = 'wood'
  } = params;

  const roofMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.7,
      metalness: materialType === 'metal' ? 0.5 : 0.1,
      side: THREE.DoubleSide,
    }),
    [roofColor, materialType]
  );

  const slopeLength = Math.sqrt((width + overhang * 2) ** 2 + roofHeight ** 2);
  const angle = Math.atan2(roofHeight, width + overhang * 2);

  return (
    <group position={[0, height, 0]}>
      <mesh
        geometry={new THREE.BoxGeometry(slopeLength, 0.05, length + overhang * 2)}
        material={roofMaterial}
        position={[
          (width + overhang * 2) / 2,
          roofHeight / 2,
          0
        ]}
        rotation={[0, 0, -angle]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default React.memo(SingleSlopeRoof);