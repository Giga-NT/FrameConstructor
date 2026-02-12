import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from './Beam';

const Pillars: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const pillarPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const step = params.length / (params.pillarCount - 1);
    for (let i = 0; i < params.pillarCount; i++) {
      const zPos = -params.length/2 + (i * step);
      positions.push(
        new THREE.Vector3(-params.width/2, 0, zPos),
        new THREE.Vector3(params.width/2, 0, zPos)
      );
    }
    return positions;
  }, [params.width, params.length, params.pillarCount]);

  const getTubeDimensions = (size: string) => {
    const dimensions = {
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 }
    }[size];
    
    return dimensions || { width: 0.1, thickness: 0.1 };
  };

  const dimensions = getTubeDimensions(params.pillarTubeSize);

  return (
    <>
      {pillarPositions.map((pos, i) => (
		<Beam
		  key={`pillar-${i}`}
		  start={pos.clone()}
		  end={new THREE.Vector3(pos.x, params.height, pos.z)}
		  dimensions={dimensions}
		  color={params.frameColor}
		/>
      ))}
    </>
  );
};

export default Pillars;