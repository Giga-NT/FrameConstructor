import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';
import {
  getTubeDimensions,
  calculatePillarPositions,
  calculatePillarCount,
} from '../../utils/gazeboUtils';

const GazeboPillars: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const pillarCount = useMemo(
    () => calculatePillarCount(params.length, params.pillarSpacing),
    [params.length, params.pillarSpacing]
  );

  const pillarPositions = useMemo(
    () => calculatePillarPositions(params.width, params.length, params.pillarSpacing),
    [params.width, params.length, params.pillarSpacing]
  );

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