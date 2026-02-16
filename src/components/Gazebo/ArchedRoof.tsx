import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';

interface ArchedRoofProps {
  params: GazeboParams;
}

const ArchedRoof: React.FC<ArchedRoofProps> = ({ params }) => {
  const {
    width,
    length,
    height,
    roofHeight,
    overhang = 0.2,
    roofColor = '#87CEEB',
    color = '#8B4513',
    materialType = 'wood',
    beamSize = '100x100',
    trussCount = 3,
    lathingStep = 0.5,
  } = params;

  // Функция перевода размера балки в метры
  const getBeamDimension = (size: string): number => {
    switch (size) {
      case '100x100': return 0.1;
      case '80x80': return 0.08;
      case '60x60': return 0.06;
      default: return 0.08;
    }
  };
  const beamDim = getBeamDimension(beamSize);
  const beamDimensions = { width: beamDim, thickness: beamDim };

  // Габариты с учётом свеса
  const totalWidth = width + overhang * 2;
  const totalLength = length + overhang * 2;

  // Функция для получения точек арки при заданном Z
  const getArchPoints = (z: number): THREE.Vector3[] => {
    const points: THREE.Vector3[] = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -totalWidth / 2 + t * totalWidth;
      // Параболическая арка (можно заменить на синусоиду)
      const y = roofHeight * (1 - Math.pow(2 * t - 1, 2)); // парабола
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  };

  // Позиции арок (ферм) вдоль оси Z
  const archPositions = useMemo(() => {
    if (trussCount < 2) return [0];
    const positions: number[] = [];
    for (let i = 0; i < trussCount; i++) {
      const z = -totalLength / 2 + (i / (trussCount - 1)) * totalLength;
      positions.push(z);
    }
    return positions;
  }, [trussCount, totalLength]);

  // Генерация арок
  const arches = useMemo(() => {
    const elements: React.ReactElement[] = [];
    archPositions.forEach((z, idx) => {
      const points = getArchPoints(z);
      for (let i = 0; i < points.length - 1; i++) {
        elements.push(
          <Beam
            key={`arch-${idx}-${i}`}
            start={points[i]}
            end={points[i + 1]}
            dimensions={beamDimensions}
            color={color}
          />
        );
      }
    });
    return elements;
  }, [archPositions, color, beamDimensions]);

  // Генерация обрешётки
  const lathing = useMemo(() => {
    if (lathingStep <= 0) return null;
    const elements: React.ReactElement[] = [];
    // Количество обрешетин вдоль ширины
    const count = Math.floor(totalWidth / lathingStep) + 1;
    for (let i = 0; i < count; i++) {
      const x = -totalWidth / 2 + i * lathingStep;
      // Берём точки на передней и задней арках
      const frontPoints = getArchPoints(-totalLength / 2);
      const backPoints = getArchPoints(totalLength / 2);

      // Интерполируем Y для данного X на передней и задней арках
      const findY = (points: THREE.Vector3[]): number => {
        for (let j = 0; j < points.length - 1; j++) {
          if (x >= points[j].x && x <= points[j + 1].x) {
            const t = (x - points[j].x) / (points[j + 1].x - points[j].x);
            return points[j].y + t * (points[j + 1].y - points[j].y);
          }
        }
        return 0;
      };

      const yStart = findY(frontPoints);
      const yEnd = findY(backPoints);

      elements.push(
        <Beam
          key={`lathing-${i}`}
          start={new THREE.Vector3(x, yStart, -totalLength / 2)}
          end={new THREE.Vector3(x, yEnd, totalLength / 2)}
          dimensions={beamDimensions}
          color={color}
          rotationOffset={Math.PI / 2} // если нужно повернуть сечение
        />
      );
    }
    return elements;
  }, [totalWidth, totalLength, lathingStep, color, beamDimensions]);

  // Поликарбонатное покрытие (экструзия по длине)
  const polycarbonateSheets = useMemo(() => {
    const segments = 16;
    const sheets: React.ReactElement[] = [];
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const x1 = -totalWidth / 2 + t1 * totalWidth;
      const x2 = -totalWidth / 2 + t2 * totalWidth;
      const y1 = roofHeight * (1 - Math.pow(2 * t1 - 1, 2));
      const y2 = roofHeight * (1 - Math.pow(2 * t2 - 1, 2));

      const shape = new THREE.Shape();
      shape.moveTo(x1, y1);
      shape.lineTo(x2, y2);
      shape.lineTo(x2, y2 - 0.01); // толщина
      shape.lineTo(x1, y1 - 0.01);
      shape.closePath();

      const extrudeSettings = {
        steps: 1,
        depth: totalLength,
        bevelEnabled: false,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.translate(0, 0, -totalLength / 2);

      sheets.push(
        <mesh key={`sheet-${i}`} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={roofColor}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      );
    }
    return sheets;
  }, [totalWidth, totalLength, roofHeight, roofColor]);

  return (
    <group position={[0, height, 0]}>
      {/* Поликарбонат */}
      {polycarbonateSheets}

      {/* Арки (фермы) */}
      {arches}

      {/* Обрешётка */}
      {lathing}
    </group>
  );
};

export default React.memo(ArchedRoof);