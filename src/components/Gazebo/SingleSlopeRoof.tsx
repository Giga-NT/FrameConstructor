// ArchedRoof.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';

interface ArchedRoofProps {
  params: GazeboParams;
}

const ArchedRoof: React.FC<ArchedRoofProps> = ({ params }) => {
  const { width, length, roofHeight, roofColor = '#00BFFF', materialType } = params;

  // Материал крыши
  const roofMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.7,
        metalness: materialType === 'metal' ? 0.5 : 0,
        transparent: true,
        opacity: 0.8,
      }),
    [roofColor, materialType]
  );

  // Создаем арочную геометрию через профиль
  const roofGeometry = useMemo(() => {
    const radius = (width / 2) ** 2 / (2 * roofHeight) + roofHeight / 2;
    const yOffset = radius - roofHeight;

    const arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, radius, Math.PI, 0, true); // полуокружность вниз
    arcShape.lineTo(-width / 2, 0);
    arcShape.lineTo(width / 2, 0);

    const extrudeSettings = {
      depth: length,
      steps: 1,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
    geometry.translate(0, yOffset, 0); // центрируем по Y

    // Разбиваем на сегменты для гладкой арки
    const segments = 32;
    const arcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width / 2, 0, 0),
      ...Array.from({ length: segments }, (_, i) => {
        const t = i / segments;
        return new THREE.Vector3(
          Math.cos(Math.PI * t) * (width / 2),
          Math.sin(Math.PI * t) * roofHeight,
          0
        );
      }),
      new THREE.Vector3(width / 2, 0, 0),
    ]);

    const arcPoints = arcCurve.getPoints(segments + 1);
    const arcShapeSmooth = new THREE.Shape(arcPoints.map((v) => new THREE.Vector2(v.x, v.y)));
    const smoothExtrudeSettings = {
      depth: length,
      steps: 1,
      bevelEnabled: false,
    };
    const smoothGeometry = new THREE.ExtrudeGeometry(arcShapeSmooth, smoothExtrudeSettings);
    smoothGeometry.translate(0, yOffset, 0);

    return smoothGeometry;
  }, [width, length, roofHeight]);

  return (
    <mesh
      geometry={roofGeometry}
      material={roofMaterial}
      position={[0, params.height + roofHeight / 2, 0]} // ставим на верх стен
      castShadow
      receiveShadow
    />
  );
};

export default React.memo(ArchedRoof);