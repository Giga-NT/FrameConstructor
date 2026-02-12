import * as THREE from 'three';
import React from 'react';

interface ArchedRoofProps {
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

export const createArchedRoof = (props: ArchedRoofProps): THREE.Group => {
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
    roofMaterial
  } = props;

  const group = new THREE.Group();
  const startZ = columnPositionsZ[0];
  const endZ = columnPositionsZ[columnPositionsZ.length - 1];
  
  const roofWidth = Math.abs(endZ - startZ) + leftSideOverhang + rightSideOverhang;
  const roofLength = length + frontOverhang + rearOverhang;
  const archHeight = Math.max(trussHeightLeft, trussHeightRight) * 1.5;

  const curve = new THREE.EllipseCurve(
    0, 0,
    roofLength/2, archHeight,
    0, Math.PI,
    false,
    0
  );

  const points = curve.getPoints(50);
  const shape = new THREE.Shape(points);
  shape.lineTo(roofLength, 0);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: roofWidth,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const roofMesh = new THREE.Mesh(geometry, roofMaterial);

  roofMesh.position.set(
    -frontOverhang,
    height + Math.max(trussHeightLeft, trussHeightRight) - archHeight + 0.05,
    Math.min(startZ, endZ) - (startZ < endZ ? leftSideOverhang : rightSideOverhang)
  );
  
  if (startZ > endZ) {
    roofMesh.rotation.y = Math.PI;
    roofMesh.position.x = length + rearOverhang;
  }

  group.add(roofMesh);
  return group;
};

const ArchedRoof: React.FC<ArchedRoofProps> = (props) => {
  const roofGroup = React.useMemo(() => createArchedRoof(props), [props]);
  return <primitive object={roofGroup} />;
};

export default React.memo(ArchedRoof);