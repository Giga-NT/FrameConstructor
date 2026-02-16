import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';

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

  const totalWidth = width + overhang * 2;
  const totalLength = length + overhang * 2;

  const getProfilePoints = () => {
    const points: THREE.Vector2[] = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * totalWidth;
      let y: number;
      if (roofType === 'arched') {
        y = roofHeight * Math.sin(Math.PI * t); // синус, как в фермах
      } else if (roofType === 'gable') {
        y = (t <= 0.5) ? 2 * t * roofHeight : 2 * (1 - t) * roofHeight;
      } else {
        y = roofHeight * t;
      }
      points.push(new THREE.Vector2(x, y));
    }
    return points;
  };

  const shape = useMemo(() => {
    const points = getProfilePoints();
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

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: roofColor,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    roughness: 0.2,
    metalness: 0.1,
  }), [roofColor]);

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