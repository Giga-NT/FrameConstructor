import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';
import {
  getTubeDimensions,
  calculateTrussPositions,
  getArchPoints3D,
  calculateTotalDimensions,
} from '../../utils/gazeboUtils';

const GazeboLathing: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const { totalWidth } = calculateTotalDimensions(params.width, params.length, params.overhang);

  const trussPositions = useMemo(
    () => calculateTrussPositions(params.length, params.trussCount),
    [params.length, params.trussCount]
  );

  const getRoofPoints = (zPos: number): THREE.Vector3[] => {
    return getArchPoints3D(params.roofType, totalWidth, params.roofHeight, zPos, params.height, 12);
  };

  const lathingElements = useMemo(() => {
    if (params.lathingStep === 0) return null;

    const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
    const lathingWidth = params.width + params.overhang * 2;
    const lathingCount = Math.ceil(lathingWidth / params.lathingStep) + 1;
    const step = lathingWidth / (lathingCount - 1);

    return Array.from({ length: lathingCount }).map((_, i) => {
      const xPos = -params.width / 2 - params.overhang + i * step;

      const firstTrussPoints = getRoofPoints(trussPositions[0]);
      const lastTrussPoints = getRoofPoints(trussPositions[trussPositions.length - 1]);

      const findYPos = (points: THREE.Vector3[]): number => {
        for (let j = 0; j < points.length - 1; j++) {
          if (xPos >= points[j].x && xPos <= points[j + 1].x) {
            const t = (xPos - points[j].x) / (points[j + 1].x - points[j].x);
            return points[j].y + t * (points[j + 1].y - points[j].y);
          }
        }
        return params.height;
      };

      const yStart = findYPos(firstTrussPoints);
      const yEnd = findYPos(lastTrussPoints);

      return (
        <Beam
          key={`lathing-${i}`}
          start={new THREE.Vector3(xPos, yStart, trussPositions[0])}
          end={new THREE.Vector3(xPos, yEnd, trussPositions[trussPositions.length - 1])}
          dimensions={lathingDimensions}
          rotationOffset={Math.PI / 2}
          color={params.color}
        />
      );
    });
  }, [params, trussPositions]);

  return <>{lathingElements}</>;
};

export default React.memo(GazeboLathing);