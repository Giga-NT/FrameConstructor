import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from './Beam';

const Lathing: React.FC<{ params: CanopyParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dimensions = {
      '40x20': { width: 0.04, thickness: 0.02 },
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 }
    }[size];
    return dimensions || { width: 0.04, thickness: 0.02 };
  };

  const trussPositions = useMemo(() => {
    const positions: number[] = [];
    const step = params.length / (params.trussCount - 1);
    for (let i = 0; i < params.trussCount; i++) {
      positions.push(-params.length/2 + (i * step));
    }
    return positions;
  }, [params.length, params.trussCount]);

  const getRoofPoints = (zPos: number): THREE.Vector3[] => {
    const roofWidth = params.width + (params.overhang * 2);
    const points: THREE.Vector3[] = [];
    
    switch(params.roofType) {
      case 'gable':
        points.push(
          new THREE.Vector3(-roofWidth/2, params.height, zPos),
          new THREE.Vector3(0, params.height + params.roofHeight, zPos),
          new THREE.Vector3(roofWidth/2, params.height, zPos)
        );
        break;
      case 'arch': {
        const segments = 12;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI;
          const x = -roofWidth/2 + (roofWidth * i/segments);
          const y = params.height + params.roofHeight * Math.sin(angle);
          points.push(new THREE.Vector3(x, y, zPos));
        }
        break;
      }
      case 'shed':
        points.push(
          new THREE.Vector3(-roofWidth/2, params.height + 0.05, zPos),
          new THREE.Vector3(roofWidth/2, params.height + params.roofHeight + 0.05, zPos)
        );
        break;
      case 'flat':
      default:
        points.push(
          new THREE.Vector3(-roofWidth/2, params.height + 0.05, zPos),
          new THREE.Vector3(roofWidth/2, params.height + 0.05, zPos)
        );
    }
    return points;
  };

  const lathingElements = useMemo(() => {
    if (params.lathingStep === 0) return null;

    const lathingDimensions = getTubeDimensions(params.lathingTubeSize);
    const lathingWidth = params.width + (params.overhang * 2);
    const lathingCount = Math.ceil(lathingWidth / params.lathingStep) + 1;
    const step = lathingWidth / (lathingCount - 1);

    return Array.from({ length: lathingCount }).map((_, i) => {
      const xPos = -params.width/2 - params.overhang + i * step;
      
      const firstTrussPoints = getRoofPoints(trussPositions[0]);
      const lastTrussPoints = getRoofPoints(trussPositions[trussPositions.length - 1]);
      
      const findYPos = (points: THREE.Vector3[]): number => {
        for (let j = 0; j < points.length - 1; j++) {
          if (xPos >= points[j].x && xPos <= points[j+1].x) {
            const t = (xPos - points[j].x) / (points[j+1].x - points[j].x);
            return points[j].y + t * (points[j+1].y - points[j].y);
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
		  rotationOffset={Math.PI/2}
		  color={params.frameColor}
		/>
      );
    });
  }, [params, trussPositions]);

  return <>{lathingElements}</>;
};

export default Lathing;