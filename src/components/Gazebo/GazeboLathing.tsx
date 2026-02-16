import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';

const GazeboLathing: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dims: Record<string, { width: number; thickness: number }> = {
      '40x20': { width: 0.04, thickness: 0.02 },
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
    };
    return dims[size] || { width: 0.04, thickness: 0.02 };
  };

  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    const step = params.length / (params.trussCount - 1);
    for (let i = 0; i < params.trussCount; i++) {
      positions.push(-params.length / 2 + i * step);
    }
    return positions;
  }, [params.length, params.trussCount]);

  const getRoofPoints = (zPos: number): THREE.Vector3[] => {
    const roofWidth = params.width + params.overhang * 2;
    const points: THREE.Vector3[] = [];

    switch (params.roofType) {
      case 'gable':
        points.push(
          new THREE.Vector3(-roofWidth / 2, params.height, zPos),
          new THREE.Vector3(0, params.height + params.roofHeight, zPos),
          new THREE.Vector3(roofWidth / 2, params.height, zPos)
        );
        break;
      case 'arched': {
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI;
          const x = -roofWidth / 2 + (roofWidth * i) / segments;
          const y = params.height + params.roofHeight * Math.sin(angle);
          points.push(new THREE.Vector3(x, y, zPos));
        }
        break;
      }
      case 'single':
        points.push(
          new THREE.Vector3(-roofWidth / 2, params.height + 0.05, zPos),
          new THREE.Vector3(roofWidth / 2, params.height + params.roofHeight + 0.05, zPos)
        );
        break;
      default:
        points.push(
          new THREE.Vector3(-roofWidth / 2, params.height + 0.05, zPos),
          new THREE.Vector3(roofWidth / 2, params.height + 0.05, zPos)
        );
    }
    return points;
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