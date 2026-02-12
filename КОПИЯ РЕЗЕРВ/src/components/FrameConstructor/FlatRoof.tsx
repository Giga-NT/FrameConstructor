import * as THREE from 'three';
import React from 'react';

interface FlatRoofProps {
  length: number;
  width: number;
  height: number;
  trussHeightLeft: number;
  trussHeightRight: number;
  frontOverhang: number;
  rearOverhang: number;
  leftSideOverhang: number;
  rightSideOverhang: number;
  columnPositionsZ: number[];
  roofMaterial: THREE.Material;
  roofThickness: number;
}

export const createFlatRoof = (props: FlatRoofProps): THREE.Group => {
  const {
    length,
    width,
    height,
    trussHeightLeft,
    trussHeightRight,
    frontOverhang,
    rearOverhang,
    leftSideOverhang,
    rightSideOverhang,
    columnPositionsZ,
    roofMaterial,
    roofThickness
  } = props;

  const group = new THREE.Group();
  const startZ = columnPositionsZ[0];
  const endZ = columnPositionsZ[columnPositionsZ.length - 1];
  const slope = (trussHeightRight - trussHeightLeft) / length;
  
  const shape = new THREE.Shape();
  const startX = -frontOverhang + 0.2;
  const endX = length + rearOverhang * 2;
  const startY = trussHeightLeft - slope * frontOverhang;
  const endY = trussHeightRight + slope * rearOverhang;
  
  shape.moveTo(startX, startY);
  shape.lineTo(endX, endY);
  shape.lineTo(endX, endY + roofThickness);
  shape.lineTo(startX, startY + roofThickness);
  shape.lineTo(startX, startY);

  const extrudeSettings = {
    steps: 1,
    depth: Math.abs(endZ - startZ) + leftSideOverhang + rightSideOverhang,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const roofMesh = new THREE.Mesh(geometry, roofMaterial);

  roofMesh.position.set(
    startX,
    height + 0.09,
    Math.min(startZ, endZ) - (startZ < endZ ? leftSideOverhang : rightSideOverhang)
  );
  
  if (startZ > endZ) {
    roofMesh.rotation.y = Math.PI;
    roofMesh.position.x = endX;
  }

  group.add(roofMesh);
  return group;
};

const FlatRoof: React.FC<FlatRoofProps> = (props) => {
  const roofGroup = React.useMemo(() => createFlatRoof(props), [props]);
  return <primitive object={roofGroup} />;
};

export default React.memo(FlatRoof);