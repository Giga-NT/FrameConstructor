import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import {
  getRoofProfilePoints,
  createRoofMaterial,
  calculateTotalDimensions,
} from '../../utils/gazeboUtils';

interface GazeboRoofCoverProps {
  params: GazeboParams;
  offsetY?: number; // дополнительное смещение по Y (например, для приподнятия покрытия)
}

const GazeboRoofCover: React.FC<GazeboRoofCoverProps> = ({ params, offsetY = 0 }) => {
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

  const geometry = useMemo(() => {
    const widthSegments = 32;
    const lengthSegments = 32;
    const vertices: number[] = [];
    const indices: number[] = [];

    const profilePoints = getRoofProfilePoints(roofType, totalWidth, roofHeight, widthSegments);

    for (let i = 0; i <= lengthSegments; i++) {
      const z = -totalLength / 2 + (i / lengthSegments) * totalLength;
      for (let j = 0; j <= widthSegments; j++) {
        const point = profilePoints[j];
        vertices.push(point.x, point.y, z);
      }
    }

    for (let i = 0; i < lengthSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + j;
        const b = i * (widthSegments + 1) + j + 1;
        const c = (i + 1) * (widthSegments + 1) + j;
        const d = (i + 1) * (widthSegments + 1) + j + 1;

        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [totalWidth, totalLength, roofHeight, roofType]);

  const material = useMemo(
    () => createRoofMaterial(roofColor, 0.6),
    [roofColor]
  );

  return (
    <mesh geometry={geometry} material={material} position={[0, height + offsetY, 0]} receiveShadow castShadow />
  );
};

export default React.memo(GazeboRoofCover);