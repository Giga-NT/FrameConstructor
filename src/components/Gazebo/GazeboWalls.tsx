import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';

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
    pillarBendDirection = 'outward',
  } = params;

  // Вычисляем количество стоек на основе шага (минимум 2 на стену)
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

  // Позиции четырёх углов (для расчёта перил)
  const cornerPositions: [number, number, number][] = [
    [-width / 2, 0, -length / 2],
    [ width / 2, 0, -length / 2],
    [ width / 2, 0,  length / 2],
    [-width / 2, 0,  length / 2]
  ];

  // Данные о каждом угловом столбе (для изгиба перил)
  const pillarsData = useMemo(() => {
    const bendSign = pillarBendDirection === 'inward' ? -1 : 1;
    
    return cornerPositions.map(([x, y, z], i) => {
      const dirX = x > 0 ? 1 : -1;
      const dirZ = z > 0 ? 1 : -1;
      let curve: THREE.CubicBezierCurve3 | null = null;
      
      if (pillarType === 'curved') {
		curve = new THREE.CubicBezierCurve3(
		  new THREE.Vector3(0, 0, 0),
		  new THREE.Vector3(bendSign * dirX * 0.2, height * 0.3, 0), // было bendSign * dirZ * 0.2
		  new THREE.Vector3(bendSign * dirX * 0.2, height * 0.7, 0), // было bendSign * dirZ * 0.2
		  new THREE.Vector3(0, height, 0)
		);
      }
      
      return { corner: [x, y, z] as [number, number, number], dirX, dirZ, curve };
    });
  }, [cornerPositions, pillarType, height, pillarBendDirection]);

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
    const step = length / (pillarCount - 1);
    const positions: THREE.Vector3[] = [];
    
    // Генерируем стойки только вдоль левой и правой стен (по оси Z)
    for (let i = 0; i < pillarCount; i++) {
      const zPos = -length / 2 + i * step;
      positions.push(
        new THREE.Vector3(-width / 2, 0, zPos), // левая стена
        new THREE.Vector3( width / 2, 0, zPos)  // правая стена
      );
    }

    return positions.map((pos, idx) => {
      const cx = pos.x;
      const cy = pos.y;
      const cz = pos.z;

      if (pillarType === 'curved') {
        // Определяем направление изгиба ТОЛЬКО по нормали к стене (ось X)
        const isRightWall = cx > 0;
        const outwardDir = isRightWall ? 1 : -1;
        const bendX = pillarBendDirection === 'outward' ? outwardDir : -outwardDir;
        const bendZ = 0; // НЕТ изгиба вдоль стены (ось Z)

        // Создаём кривую изгиба в плоскости X-Y (без компоненты Z)
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(bendX * 0.2, height * 0.3, 0),
          new THREE.Vector3(bendX * 0.2, height * 0.7, 0),
          new THREE.Vector3(0, height, 0)
        );

        // Количество сегментов для аппроксимации кривой (больше = плавнее)
        const segments = 200; 
        const sectionWidth = pillarDim.w;  // ширина сечения (перпендикулярно стене)
        const sectionDepth = pillarDim.d;  // глубина сечения (вдоль стены)
        const boxes = [];

        for (let i = 0; i < segments; i++) {
          const t1 = i / segments;
          const t2 = (i + 1) / segments;

          const p1 = curve.getPoint(t1);
          const p2 = curve.getPoint(t2);

          const midY = (p1.y + p2.y) / 2;
          const lenY = Math.abs(p2.y - p1.y) || 0.01; // избегаем нулевой высоты

          // Позиция сегмента в мировых координатах:
          // - X: базовая позиция стены + смещение изгиба
          // - Y: высота сегмента
          // - Z: фиксированная позиция вдоль стены (БЕЗ смещения!)
          const worldX = cx + (p1.x + p2.x) / 2;
          const worldY = midY;
          const worldZ = cz; // КРИТИЧЕСКИ ВАЖНО: нет смещения по Z!

          boxes.push(
            <mesh
              key={`curved-pillar-seg-${idx}-${i}`}
              geometry={new THREE.BoxGeometry(sectionWidth, lenY, sectionDepth)}
              material={material}
              position={[worldX, worldY, worldZ]}
              castShadow
              receiveShadow
            />
          );
        }

        return boxes;
      } else {
        // Прямая стойка
        return (
          <mesh
            key={`straight-pillar-${idx}`}
            geometry={new THREE.BoxGeometry(pillarDim.w, height, pillarDim.d)}
            material={material}
            position={[cx, cy + height / 2, cz]}
            castShadow
            receiveShadow
          />
        );
      }
    });
  }, [pillarCount, width, length, height, pillarType, pillarDim, material, pillarBendDirection]);

  // ----- ПЕРИЛА (привязываются к угловым стойкам) -----
  const railings = useMemo(() => {
    const sides = [
      { startIdx: 1, endIdx: 2 }, // правая стена
      { startIdx: 2, endIdx: 3 }, // задняя стена
      { startIdx: 3, endIdx: 0 }, // левая стена
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
          geometry={new THREE.BoxGeometry(Math.max(0.1, distance - 0.1), 0.05, 0.05)}
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
      const balusters = Array.from({ length: 5 }, (_, j) => {
        const t = (j + 0.5) / 5;
        const x = startPos.x + dx * t;
        const z = startPos.z + dz * t;
        return (
          <mesh
            key={`baluster-${sideIdx}-${j}`}
            geometry={new THREE.BoxGeometry(0.03, railingHeight - 0.05, 0.03)}
            material={material}
            position={[x, railingHeight / 2 + 0.025, z]}
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