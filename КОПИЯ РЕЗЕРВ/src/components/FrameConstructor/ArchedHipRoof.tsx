// ArchedHipRoof.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface ArchedHipRoofParams {
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
  archHeight?: number;
  purlinSection: number;
  purlinSpacing: number;
  trussSection: number;
}

const createArchedHipRoof = ({
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
  roofThickness,
  archHeight = 1.5,
  purlinSection,
  purlinSpacing,
  trussSection
}: ArchedHipRoofParams) => {
  const roofGroup = new THREE.Group();
  const segments = 16;
  
  // Основная арочная кривая
  const curve = new THREE.EllipseCurve(
    0, 0,
    length / 2, archHeight,
    0, Math.PI,
    false,
    1.57
  );

  const points = curve.getPoints(segments);
  const shape = new THREE.Shape(points);

  const extrudeSettings = {
    steps: 1,
    depth: width + leftSideOverhang + rightSideOverhang,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const mesh = new THREE.Mesh(geometry, roofMaterial);

  mesh.rotation.x = Math.PI;
  mesh.rotation.z = Math.PI / 2;
  mesh.position.x = length / 2;
  mesh.position.y = height + (trussHeightLeft + trussHeightRight) / 2;
  mesh.position.z = columnPositionsZ[0] - leftSideOverhang + (width + leftSideOverhang + rightSideOverhang) / 2;

  roofGroup.add(mesh);

  // Создаем минимальные фермы для вальмовой крыши
  const createMinimalTruss = (zPosition: number) => {
    const trussGroup = new THREE.Group();
    const lowerPoints: THREE.Vector3[] = [];
    const upperPoints: THREE.Vector3[] = [];

    // Нижний пояс
    lowerPoints.push(new THREE.Vector3(0, 0, zPosition));
    lowerPoints.push(new THREE.Vector3(length, 0, zPosition));

    // Верхний пояс (арочный)
    for (let x = 0; x <= length; x += length / 4) {
      const t = x / length;
      const y = 4 * archHeight * t * (1 - t);
      upperPoints.push(new THREE.Vector3(x, y, zPosition));
    }

    // Добавляем свесы
    if (frontOverhang > 0) {
      upperPoints.unshift(new THREE.Vector3(-frontOverhang, 0, zPosition));
    }

    if (rearOverhang > 0) {
      upperPoints.push(new THREE.Vector3(length + rearOverhang, 0, zPosition));
    }

    // Создаем линии для визуализации фермы
    const createLine = (points: THREE.Vector3[]) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x000000 });
      return new THREE.Line(geometry, material);
    };

    // Нижний пояс
    trussGroup.add(createLine(lowerPoints));

    // Верхний пояс
    trussGroup.add(createLine(upperPoints));

    // Вертикальные стойки
    lowerPoints.forEach((point, i) => {
      if (i < upperPoints.length) {
        trussGroup.add(createLine([point, upperPoints[i]]));
      }
    });

    // Раскосы
    if (upperPoints.length >= 3) {
      trussGroup.add(createLine([lowerPoints[0], upperPoints[1]]));
      trussGroup.add(createLine([upperPoints[1], lowerPoints[1]]));
    }

    return trussGroup;
  };

  // Добавляем фермы по краям и в середине
  const trussPositions = [
    columnPositionsZ[0],
    columnPositionsZ[Math.floor(columnPositionsZ.length / 2)],
    columnPositionsZ[columnPositionsZ.length - 1]
  ];

  trussPositions.forEach(z => {
    const truss = createMinimalTruss(z);
    truss.position.y = height;
    roofGroup.add(truss);
  });

  // Создаем обрешетку (прогоны)
  const slope = (trussHeightRight - trussHeightLeft) / length;
  const startZ = columnPositionsZ[0];
  const endZ = columnPositionsZ[columnPositionsZ.length - 1];

  for (let x = 0; x <= length; x += purlinSpacing) {
    const y = height + trussHeightLeft + slope * x + purlinSection * 1;
    
    const purlinMesh = new THREE.Mesh(
      new THREE.BoxGeometry(purlinSection, purlinSection * 0.5, endZ - startZ),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    purlinMesh.position.set(x, y, (startZ + endZ) / 2);
    roofGroup.add(purlinMesh);
  }

  return roofGroup;
};

const ArchedHipRoof: React.FC<ArchedHipRoofParams> = (params) => {
  const roofGroup = useMemo(() => createArchedHipRoof(params), [params]);

  return <primitive object={roofGroup} />;
};

export default React.memo(ArchedHipRoof);