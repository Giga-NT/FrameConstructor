import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import {
  getRoofProfilePoints,
  createRoofMaterial,
  calculateTotalDimensions,
} from '../../utils/gazeboUtils';

const GazeboGables: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const {
    width,
    length,
    height,
    roofHeight,
    overhang,
    roofColor,
    roofType,
  } = params;

  const { totalWidth, totalLength } = calculateTotalDimensions(width, length, overhang);

  const shape = useMemo(() => {
    const points = getRoofProfilePoints(roofType, totalWidth, roofHeight, 32);
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.lineTo(totalWidth, 0);
    shape.lineTo(0, 0);
    shape.closePath();
    return shape;
  }, [totalWidth, roofHeight, roofType]);

  const geometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);

  const material = useMemo(
    () => createRoofMaterial(roofColor, 0.6),
    [roofColor]
  );

  return (
    <group position={[0, height, 0]}>
      {/* Передний фронтон (отрицательная Z) */}
      <mesh
        geometry={geometry}
        material={material}
        position={[-3.8, 0, -totalLength / 2]}
        rotation={[0, 0, 0]}
        receiveShadow
        castShadow
      />
      {/* Задний фронтон (положительная Z) */}
      <mesh
        geometry={geometry}
        material={material}
        position={[3.8, 0, totalLength / 2]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      />
    </group>
  );
};

export default React.memo(GazeboGables);