import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam'; // если Beam используется

const GazeboWalls: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const {
    width = 3,
    length = 3,
    height = 2.5,
    pillarType = 'straight',
    pillarSize = '100x100',
    color = '#4682B4',
    railingHeight = 0.9,
    pillarSpacing = 2.0,
  } = params;

  // Вычисляем количество стоек на основе шага
  const pillarCount = useMemo(() => {
    return Math.max(2, Math.ceil(length / pillarSpacing) + 1);
  }, [length, pillarSpacing]);

  const pillarDim = useMemo(() => {
    switch (pillarSize) {
      case '100x100': return { w: 0.1, d: 0.1 };
      case '80x80':   return { w: 0.08, d: 0.08 };
      case '60x60':   return { w: 0.06, d: 0.06 };
      default:        return { w: 0.1, d: 0.1 };
    }
  }, [pillarSize]);

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 }),
    [color]
  );

  // Позиции четырёх углов (для расчёта кривых)
  const cornerPositions: [number, number, number][] = [
    [-width / 2, 0, -length / 2],
    [ width / 2, 0, -length / 2],
    [ width / 2, 0,  length / 2],
    [-width / 2, 0,  length / 2]
  ];

  // Данные о каждом угловом столбе (для изгиба)
  const pillarsData = useMemo(() => {
    return cornerPositions.map(([x, y, z], i) => {
      const dirX = x > 0 ? 1 : -1;
      const dirZ = z > 0 ? 1 : -1;
      let curve: THREE.CubicBezierCurve3 | null = null;
      if (pillarType === 'curved') {
        curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(dirX * 0.2, height * 0.3, dirZ * 0.2),
          new THREE.Vector3(dirX * 0.2, height * 0.7, dirZ * 0.2),
          new THREE.Vector3(0, height, 0) // верх строго над основанием
        );
      }
      return { corner: [x, y, z] as [number, number, number], dirX, dirZ, curve };
    });
  }, [cornerPositions, pillarType, height]);

  // Функция получения позиции столба на заданной высоте Y (для перил)
  const getPillarPositionAtY = (pillarData: typeof pillarsData[0], y: number) => {
    const [cx, , cz] = pillarData.corner;
    if (pillarType === 'straight' || !pillarData.curve) {
      return new THREE.Vector3(cx, y, cz);
    } else {
      const t = y / height;
      const localPos = pillarData.curve.getPoint(t);
      return new THREE.Vector3(cx + localPos.x, y, cz + localPos.z);
    }
  };

  // Генерация всех стоек (не только угловых)
  const pillars = useMemo(() => {
    // Позиции всех стоек вдоль левой и правой стены
    const step = length / (pillarCount - 1);
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < pillarCount; i++) {
      const zPos = -length / 2 + i * step;
      positions.push(
        new THREE.Vector3(-width / 2, 0, zPos),
        new THREE.Vector3(width / 2, 0, zPos)
      );
    }

    return positions.map((pos, idx) => {
      const [cx, cy, cz] = [pos.x, pos.y, pos.z];
      // Для изогнутых стоек нужно создать кривую для каждой позиции
      if (pillarType === 'curved') {
        const dirX = cx > 0 ? 1 : -1;
        const dirZ = cz > 0 ? 1 : -1;
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(dirX * 0.2, height * 0.3, dirZ * 0.2),
          new THREE.Vector3(dirX * 0.2, height * 0.7, dirZ * 0.2),
          new THREE.Vector3(0, height, 0)
        );
        const curvePath = new THREE.CurvePath<THREE.Vector3>();
        curvePath.add(curve);
        const geometry = new THREE.TubeGeometry(curvePath, 8, pillarDim.w / 2, 6, false);
        return (
          <mesh
            key={`curved-pillar-${idx}`}
            geometry={geometry}
            material={material}
            position={[cx, cy, cz]}
            castShadow
            receiveShadow
          />
        );
      } else {
        return (
          <mesh
            key={`straight-pillar-${idx}`}
            geometry={new THREE.BoxGeometry(pillarDim.w, height, pillarDim.d)}
            material={material}
            position={[cx, height / 2, cz]}
            castShadow
            receiveShadow
          />
        );
      }
    });
  }, [pillarCount, width, length, height, pillarType, pillarDim, material]);

  // ----- ПЕРИЛА (привязываются к угловым стойкам, как раньше) -----
  const railings = useMemo(() => {
    const sides = [
      { startIdx: 1, endIdx: 2 }, // правая
      { startIdx: 2, endIdx: 3 }, // задняя
      { startIdx: 3, endIdx: 0 }, // левая
    ];

    return sides.flatMap(({ startIdx, endIdx }, sideIdx) => {
      const startData = pillarsData[startIdx];
      const endData = pillarsData[endIdx];

      const startPos = getPillarPositionAtY(startData, railingHeight);
      const endPos = getPillarPositionAtY(endData, railingHeight);

      const dx = endPos.x - startPos.x;
      const dz = endPos.z - startPos.z;
      const distance = Math.hypot(dx, dz);
      const angle = Math.atan2(dz, dx);

      // Верхняя перекладина
      const rail = (
        <mesh
          key={`rail-${sideIdx}`}
          geometry={new THREE.BoxGeometry(distance - 0.1, 0.05, 0.05)}
          material={material}
          position={[
            (startPos.x + endPos.x) / 2,
            railingHeight,
            (startPos.z + endPos.z) / 2
          ]}
          rotation={[0, -angle, 0]}
          castShadow
        />
      );

      // Балясины (5 штук равномерно)
      const balusters = Array.from({ length: 5 }).map((_, j) => {
        const t = (j + 0.5) / 5;
        const x = startPos.x + dx * t;
        const z = startPos.z + dz * t;
        return (
          <mesh
            key={`baluster-${sideIdx}-${j}`}
            geometry={new THREE.BoxGeometry(0.03, railingHeight - 0.05, 0.03)}
            material={material}
            position={[x, railingHeight / 2, z]}
            castShadow
          />
        );
      });

      return [rail, ...balusters];
    });
  }, [pillarsData, railingHeight, material, pillarType, height]);

  return (
    <group>
      {pillars}
      {railings}
    </group>
  );
};

export default React.memo(GazeboWalls);