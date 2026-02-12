import React from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';

interface GableRoofProps {
  params: GazeboParams;
}

const GableRoof: React.FC<GableRoofProps> = ({ params }) => {
  const roofWidth = params.width;
  const roofLength = params.length;
  const roofHeight = params.roofHeight;
  const overhang = 0.2;

  // Материал крыши
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: params.roofColor || '#A0522D',
    roughness: 0.7,
    metalness: params.materialType === 'metal' ? 0.5 : 0,
  });

  // Создаем геометрию двухскатной крыши
  const roofShape = new THREE.Shape();
  roofShape.moveTo(0, 0);
  roofShape.lineTo(roofWidth + overhang * 2, 0);
  roofShape.lineTo(roofWidth / 2 + overhang, roofHeight);
  roofShape.lineTo(-overhang, 0);

  const extrudeSettings = {
    steps: 1,
    depth: roofLength + overhang * 2,
    bevelEnabled: false,
  };

  const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
  roofGeometry.rotateX(Math.PI / 2);
  roofGeometry.translate(
    roofWidth / 2,
    params.height + roofHeight / 2,
    -roofLength / 2 - overhang
  );

  return (
    <mesh geometry={roofGeometry} material={roofMaterial} castShadow receiveShadow>
      {/* Вторая половина крыши */}
      <mesh 
        geometry={roofGeometry.clone().rotateY(Math.PI)} 
        material={roofMaterial} 
        castShadow 
        receiveShadow 
      />
    </mesh>
  );
};

export default GableRoof;