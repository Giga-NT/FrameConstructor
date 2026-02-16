import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';

const GazeboPillars: React.FC<{ params: GazeboParams }> = ({ params }) => {
  // Вычисляем количество стоек на основе шага
  const pillarCount = useMemo(() => {
    return Math.max(2, Math.ceil(params.length / params.pillarSpacing) + 1);
  }, [params.length, params.pillarSpacing]);

  const pillarPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const step = params.length / (pillarCount - 1);
    for (let i = 0; i < pillarCount; i++) {
      const zPos = -params.length / 2 + i * step;
      positions.push(
        new THREE.Vector3(-params.width / 2, 0, zPos),
        new THREE.Vector3(params.width / 2, 0, zPos)
      );
    }
    return positions;
  }, [params.width, params.length, pillarCount]);

  const getTubeDimensions = (size: string) => {
    const dims: Record<string, { width: number; thickness: number }> = {
      '100x100': { width: 0.1, thickness: 0.1 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '60x60': { width: 0.06, thickness: 0.06 },
    };
    return dims[size] || { width: 0.1, thickness: 0.1 };
  };

  const dimensions = getTubeDimensions(params.pillarSize);

  return (
    <>
      {pillarPositions.map((pos, i) => (
        <Beam
          key={`pillar-${i}`}
          start={pos.clone()}
          end={new THREE.Vector3(pos.x, params.height, pos.z)}
          dimensions={dimensions}
          color={params.color}
        />
      ))}
    </>
  );
};

export default React.memo(GazeboPillars);