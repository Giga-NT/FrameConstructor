import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { OBJLoader, MTLLoader } from 'three-stdlib';

interface GazeboFurnitureProps {
  params: {
    width: number;          // метры
    length: number;         // метры
    benchCount: number;
    tableCount: number;
    tableLegsColor: string;
    tableTopColor: string;
    tableWidth?: number;    // для простого стола – метры, для модели – миллиметры
    tableDepth?: number;    // для простого стола – метры, для модели – миллиметры
    tableHeight?: number;   // для простого стола – метры, для модели – миллиметры
    benchLength?: number;   // метры
    benchSeatWidth?: number; // метры
    benchHeight?: number;   // метры
    tableType?: 'simple' | 'model';
    tableRotation?: 0 | 90;
  };
}

const GazeboFurniture: React.FC<GazeboFurnitureProps> = ({ params }) => {
  const {
    width = 3,
    length = 3,
    benchCount = 2,
    tableCount = 1,
    tableLegsColor = '#8B4513',
    tableTopColor = '#D2B48C',
    tableWidth,
    tableDepth,
    tableHeight,
    benchLength: customBenchLength,
    benchSeatWidth = 0.4,
    benchHeight = 0.45,
    tableType = 'simple',
    tableRotation = 0,
  } = params;

  // Материал для скамеек
  const benchMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4682B4',
    roughness: 0.7
  }), []);

  // --- Загрузка детальной модели стола ---
  const modelMaterials = useLoader(MTLLoader, '/models/table/TIMLESS-sq-220-2019-obj.mtl');
  const modelObject = useLoader(OBJLoader, '/models/table/TIMLESS-sq-220-2019-obj.obj', (loader) => {
    modelMaterials.preload();
    loader.setMaterials(modelMaterials);
  });

  useLoader.preload(MTLLoader, '/models/table/TIMLESS-sq-220-2019-obj.mtl');
  useLoader.preload(OBJLoader, '/models/table/TIMLESS-sq-220-2019-obj.obj');

  // Оригинальные размеры модели в метрах (после масштабирования 0.001)
  const MODEL_ORIG_WIDTH = 2.2;
  const MODEL_ORIG_DEPTH = 1.07;
  const MODEL_ORIG_HEIGHT = 0.75;

  // Минимальные размеры для детальной модели (в метрах)
  const MIN_MODEL_WIDTH = 2.0;
  const MIN_MODEL_DEPTH = 1.0;
  const MIN_MODEL_HEIGHT = 0.8;

  // --- Определяем базовые размеры стола (до поворота) с учётом типа ---
  let baseWidth: number, baseDepth: number, baseHeight: number;

  if (tableType === 'simple') {
    // Для простого стола размеры задаются в метрах
    baseWidth = tableWidth ?? 0.8;
    baseDepth = tableDepth ?? 0.8;
    baseHeight = tableHeight ?? 0.75;
  } else {
    // Для модели: если параметр задан, он в миллиметрах – переводим в метры
    // Если не задан, используем оригинальные размеры модели (уже в метрах)
    const widthFromParam = tableWidth !== undefined ? tableWidth / 1000 : MODEL_ORIG_WIDTH;
    const depthFromParam = tableDepth !== undefined ? tableDepth / 1000 : MODEL_ORIG_DEPTH;
    const heightFromParam = tableHeight !== undefined ? tableHeight / 1000 : MODEL_ORIG_HEIGHT;

    // Применяем минимальные ограничения
    baseWidth = Math.max(widthFromParam, MIN_MODEL_WIDTH);
    baseDepth = Math.max(depthFromParam, MIN_MODEL_DEPTH);
    baseHeight = Math.max(heightFromParam, MIN_MODEL_HEIGHT);
  }

  // Эффективные размеры после поворота
  const effectiveWidth = tableRotation === 90 ? baseDepth : baseWidth;
  const effectiveDepth = tableRotation === 90 ? baseWidth : baseDepth;
  const effectiveHeight = baseHeight;

  // --- Расчёт позиций столов вдоль оси X ---
  const tablePositions = useMemo(() => {
    const w = effectiveWidth;
    const minMargin = 0.5;
    let positionsX: number[] = [];

    if (tableCount === 1) {
      positionsX = [0];
    } else {
      const availableWidth = Math.max(0, width - 2 * minMargin);
      const totalTablesWidth = w * tableCount;
      if (totalTablesWidth > availableWidth) {
        const startX = -totalTablesWidth / 2 + w / 2;
        for (let i = 0; i < tableCount; i++) {
          positionsX.push(startX + i * w);
        }
      } else {
        const step = (availableWidth - w) / (tableCount - 1);
        const startX = -availableWidth / 2 + w / 2;
        for (let i = 0; i < tableCount; i++) {
          positionsX.push(startX + i * step);
        }
      }
    }
    return positionsX;
  }, [tableCount, width, effectiveWidth]);

  // --- Генерация столов ---
  const tables = useMemo(() => {
    if (tableType === 'simple') {
      const w = effectiveWidth;
      const d = effectiveDepth;
      const h = effectiveHeight;

      // Параметры ножек
      const legThickness = 0.06;          // толщина ножки
      const maxLegSpacing = 1.0;          // максимальный шаг между ножками
      const legOffset = 0.05;              // отступ от края (5 см)

      const calcLegPositions = (size: number): number[] => {
        const start = legOffset;
        const end = size - legOffset;
        const span = end - start;
        if (span <= 0) return [size / 2];
        const count = Math.max(2, Math.floor(span / maxLegSpacing) + 1);
        const positions: number[] = [];
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          positions.push(start + t * span);
        }
        return positions;
      };

      const xPositions = calcLegPositions(w);
      const zPositions = calcLegPositions(d);

      const legHeight = h - 0.05;
      const legY = -h + legHeight / 2;

      const legs: React.ReactElement[] = [];
      for (const x of xPositions) {
        for (const z of zPositions) {
          legs.push(
            <mesh
              key={`leg-${x}-${z}`}
              geometry={new THREE.BoxGeometry(legThickness, legHeight, legThickness)}
              material={new THREE.MeshStandardMaterial({ color: tableLegsColor, roughness: 0.7 })}
              position={[x - w/2, legY, z - d/2]}
              castShadow
            />
          );
        }
      }

      return tablePositions.map((x, idx) => (
        <group key={`simple-table-${idx}`} position={[x, h, 0]}>
          <mesh
            geometry={new THREE.BoxGeometry(w, 0.05, d)}
            material={new THREE.MeshStandardMaterial({ color: tableTopColor, roughness: 0.6 })}
            position={[0, -0.025, 0]}
            castShadow
            receiveShadow
          />
          {legs}
        </group>
      ));
    } else {
      // Детальная модель
      return tablePositions.map((x, idx) => {
        const clone = modelObject.clone();
        const scaleX = baseWidth / MODEL_ORIG_WIDTH;
        const scaleY = baseHeight / MODEL_ORIG_HEIGHT;
        const scaleZ = baseDepth / MODEL_ORIG_DEPTH;
        clone.scale.set(scaleX, scaleY, scaleZ);
        if (tableRotation === 90) {
          clone.rotation.y = Math.PI / 2;
        }
        const yOffset = baseHeight / 2;
        return (
          <primitive
            key={`model-table-${idx}`}
            object={clone}
            position={[x, yOffset, 0]}
          />
        );
      });
    }
  }, [
    tableType, tablePositions, effectiveWidth, effectiveDepth, effectiveHeight,
    tableTopColor, tableLegsColor, modelObject, tableRotation,
    baseWidth, baseDepth, baseHeight, MODEL_ORIG_WIDTH, MODEL_ORIG_DEPTH, MODEL_ORIG_HEIGHT
  ]);

  // ----- СКАМЕЙКИ -----
  const benches = useMemo(() => {
    const benchesArray: React.ReactElement[] = [];
    const benchWidth = benchSeatWidth;
    // Увеличиваем отступ от стены, чтобы скамейки не пересекались со стойками и перилами
    const benchOverhang = 0.4; // было 0.2
    const legSpacing = 1.0;
    const seatHeight = benchHeight;
    const seatThickness = 0.05;
    const legHeight = seatHeight - seatThickness;
    const legSize = 0.06;

    const createLegs = (benchLength: number) => {
      const legPositions: number[] = [];
      if (benchLength <= legSpacing) {
        legPositions.push(-benchLength / 2, benchLength / 2);
      } else {
        const legCount = Math.floor(benchLength / legSpacing) + 1;
        const actualCount = Math.max(2, legCount);
        for (let i = 0; i < actualCount; i++) {
          const t = i / (actualCount - 1);
          legPositions.push(-benchLength / 2 + t * benchLength);
        }
      }
      return legPositions;
    };

    const createBenchAlongX = (zPos: number, benchLength: number, key: string) => {
      const legPositions = createLegs(benchLength);
      return (
        <group key={key} position={[0, seatHeight, zPos]}>
          <mesh
            geometry={new THREE.BoxGeometry(benchLength, seatThickness, benchWidth)}
            material={benchMaterial}
            position={[0, 0, 0]}
            castShadow
          />
          {legPositions.map((x, i) => (
            <group key={`leg-${key}-${i}`}>
              <mesh
                geometry={new THREE.BoxGeometry(legSize, legHeight, legSize)}
                material={benchMaterial}
                position={[x, -legHeight/2 - seatThickness/2, -benchWidth/2 + legSize/2]}
                castShadow
              />
              <mesh
                geometry={new THREE.BoxGeometry(legSize, legHeight, legSize)}
                material={benchMaterial}
                position={[x, -legHeight/2 - seatThickness/2, benchWidth/2 - legSize/2]}
                castShadow
              />
            </group>
          ))}
        </group>
      );
    };

    const createBenchAlongZ = (xPos: number, benchLength: number, key: string) => {
      const legPositions = createLegs(benchLength);
      return (
        <group key={key} position={[xPos, seatHeight, 0]} rotation={[0, Math.PI/2, 0]}>
          <mesh
            geometry={new THREE.BoxGeometry(benchLength, seatThickness, benchWidth)}
            material={benchMaterial}
            position={[0, 0, 0]}
            castShadow
          />
          {legPositions.map((z, i) => (
            <group key={`leg-${key}-${i}`}>
              <mesh
                geometry={new THREE.BoxGeometry(legSize, legHeight, legSize)}
                material={benchMaterial}
                position={[z, -legHeight/2 - seatThickness/2, -benchWidth/2 + legSize/2]}
                castShadow
              />
              <mesh
                geometry={new THREE.BoxGeometry(legSize, legHeight, legSize)}
                material={benchMaterial}
                position={[z, -legHeight/2 - seatThickness/2, benchWidth/2 - legSize/2]}
                castShadow
              />
            </group>
          ))}
        </group>
      );
    };

    const getBenchLength = (axis: 'x' | 'z') => {
      if (customBenchLength !== undefined) return customBenchLength;
      return axis === 'x' ? width - benchOverhang * 2 : length - benchOverhang * 2;
    };

    if (benchCount >= 1) {
      benchesArray.push(
        createBenchAlongZ(-width/2 + benchOverhang, getBenchLength('z'), 'left')
      );
    }
    if (benchCount >= 2) {
      benchesArray.push(
        createBenchAlongZ(width/2 - benchOverhang, getBenchLength('z'), 'right')
      );
    }
    if (benchCount >= 3) {
      benchesArray.push(
        createBenchAlongX(length/2 - benchOverhang, getBenchLength('x'), 'back')
      );
    }
    if (benchCount >= 4) {
      benchesArray.push(
        createBenchAlongX(-length/2 + benchOverhang, getBenchLength('x'), 'front')
      );
    }

    return benchesArray;
  }, [width, length, benchCount, customBenchLength, benchSeatWidth, benchHeight, benchMaterial]);

  return (
    <group>
      {tables}
      {benches}
    </group>
  );
};

export default React.memo(GazeboFurniture);