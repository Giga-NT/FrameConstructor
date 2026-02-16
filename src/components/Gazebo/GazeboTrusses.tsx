import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes';
import Beam from '../Beams/Beam';

const GazeboTrusses: React.FC<{ params: GazeboParams }> = ({ params }) => {
  const getTubeDimensions = (size: string) => {
    const dims: Record<string, { width: number; thickness: number }> = {
      '40x40': { width: 0.04, thickness: 0.04 },
      '50x50': { width: 0.05, thickness: 0.05 },
      '60x60': { width: 0.06, thickness: 0.06 },
      '80x80': { width: 0.08, thickness: 0.08 },
      '100x100': { width: 0.1, thickness: 0.1 },
    };
    return dims[size] || { width: 0.1, thickness: 0.1 };
  };

  const getBeamDimensionsFromSize = (size: string) => getTubeDimensions(size);

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
          new THREE.Vector3(-roofWidth / 2, params.height, zPos),
          new THREE.Vector3(roofWidth / 2, params.height + params.roofHeight, zPos)
        );
        break;
      default:
        points.push(
          new THREE.Vector3(-roofWidth / 2, params.height, zPos),
          new THREE.Vector3(roofWidth / 2, params.height, zPos)
        );
    }
    return points;
  };

  const generateTrusses = useMemo(() => {
    // Для односкатной крыши с типом конструкции "beam" (просто балки)
    if (params.roofType === 'single' && params.constructionType === 'beam') {
      const beamDimensions = getBeamDimensionsFromSize(params.beamSize);
      return trussPositions.map((zPos, trussIndex) => {
        const roofPoints = getRoofPoints(zPos);
        return (
          <React.Fragment key={`truss-${trussIndex}`}>
            <Beam
              start={roofPoints[0]}
              end={roofPoints[1]}
              dimensions={beamDimensions}
              color={params.color}
            />
            <Beam
              start={new THREE.Vector3(roofPoints[0].x, params.height, zPos)}
              end={roofPoints[0]}
              dimensions={beamDimensions}
              color={params.color}
            />
            <Beam
              start={new THREE.Vector3(roofPoints[1].x, params.height, zPos)}
              end={roofPoints[1]}
              dimensions={beamDimensions}
              color={params.color}
            />
            <Beam
              start={new THREE.Vector3(roofPoints[0].x, params.height, zPos)}
              end={new THREE.Vector3(roofPoints[1].x, params.height, zPos)}
              dimensions={beamDimensions}
              color={params.color}
            />
          </React.Fragment>
        );
      });
    }

    // Для остальных случаев (фермы)
    const trussDimensions = getTubeDimensions(params.trussTubeSize);
    const roofDimensions = getTubeDimensions(params.roofTubeSize);
    const halfThickness = trussDimensions.thickness / 2;
    const segments = 8;

    return trussPositions.flatMap((zPos, trussIndex) => {
      const roofPoints = getRoofPoints(zPos);
      const roofWidth = params.width + params.overhang * 2;
      const lowerChordStart = new THREE.Vector3(-roofWidth / 2, params.height, zPos);
      const lowerChordEnd = new THREE.Vector3(roofWidth / 2, params.height, zPos);

      const elements: React.ReactElement[] = [];

      for (let i = 0; i < roofPoints.length - 1; i++) {
        elements.push(
          <Beam
            key={`roof-${trussIndex}-${i}`}
            start={roofPoints[i]}
            end={roofPoints[i + 1]}
            dimensions={roofDimensions}
            color={params.color}
          />
        );
      }

      elements.push(
        <Beam
          key={`truss-lower-${trussIndex}`}
          start={lowerChordStart}
          end={lowerChordEnd}
          dimensions={trussDimensions}
          color={params.color}
        />
      );

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const roofPointIndex = Math.min(
          Math.floor(t * (roofPoints.length - 1)),
          roofPoints.length - 2
        );
        const interpolatedRoofPoint = new THREE.Vector3().lerpVectors(
          roofPoints[roofPointIndex],
          roofPoints[roofPointIndex + 1],
          (t * (roofPoints.length - 1)) % 1
        );

        elements.push(
          <Beam
            key={`truss-vertical-${trussIndex}-${i}`}
            start={new THREE.Vector3(interpolatedRoofPoint.x, params.height, zPos)}
            end={interpolatedRoofPoint}
            dimensions={trussDimensions}
            color={params.color}
          />
        );
      }

      if (params.trussType !== 'simple') {
        const diagonalSegments = segments * 2;
        for (let i = 0; i < diagonalSegments; i++) {
          const t1 = i / diagonalSegments;
          const t2 = (i + 1) / diagonalSegments;

          const lowerStart = new THREE.Vector3().lerpVectors(
            lowerChordStart,
            lowerChordEnd,
            t1
          );
          const lowerEnd = new THREE.Vector3().lerpVectors(
            lowerChordStart,
            lowerChordEnd,
            t2
          );

          const roofStartIndex = Math.min(
            Math.floor(t1 * (roofPoints.length - 1)),
            roofPoints.length - 2
          );
          const roofEndIndex = Math.min(
            Math.floor(t2 * (roofPoints.length - 1)),
            roofPoints.length - 2
          );

          const interpolatedRoofStart = new THREE.Vector3().lerpVectors(
            roofPoints[roofStartIndex],
            roofPoints[roofStartIndex + 1],
            (t1 * (roofPoints.length - 1)) % 1
          );

          const interpolatedRoofEnd = new THREE.Vector3().lerpVectors(
            roofPoints[roofEndIndex],
            roofPoints[roofEndIndex + 1],
            (t2 * (roofPoints.length - 1)) % 1
          );

          if (params.trussType === 'reinforced' || (params.trussType === 'lattice' && i % 2 === 0)) {
            elements.push(
              <Beam
                key={`truss-diagonal-${trussIndex}-${i}`}
                start={lowerStart}
                end={interpolatedRoofEnd}
                dimensions={trussDimensions}
                rotationOffset={Math.PI / 4}
                color={params.color}
              />
            );
          }
          if (params.trussType === 'lattice' && i % 2 !== 0) {
            elements.push(
              <Beam
                key={`truss-diagonal-${trussIndex}-${i}-2`}
                start={interpolatedRoofStart}
                end={lowerEnd}
                dimensions={trussDimensions}
                rotationOffset={Math.PI / 4}
                color={params.color}
              />
            );
          }
        }
      }

      elements.push(
        <Beam
          key={`truss-end-left-${trussIndex}`}
          start={new THREE.Vector3(-roofWidth / 2 + halfThickness, params.height, zPos)}
          end={new THREE.Vector3(-roofWidth / 2 + halfThickness, roofPoints[0].y, zPos)}
          dimensions={trussDimensions}
          color={params.color}
        />
      );
      elements.push(
        <Beam
          key={`truss-end-right-${trussIndex}`}
          start={new THREE.Vector3(roofWidth / 2 - halfThickness, params.height, zPos)}
          end={new THREE.Vector3(roofWidth / 2 - halfThickness, roofPoints[roofPoints.length - 1].y, zPos)}
          dimensions={trussDimensions}
          color={params.color}
        />
      );

      if (params.trussCount > 1 && trussIndex < params.trussCount - 1) {
        const nextZPos = trussPositions[trussIndex + 1];
        const leftColumnX = -params.width / 2 + halfThickness;
        const rightColumnX = params.width / 2 - halfThickness;

        elements.push(
          <Beam
            key={`cross-beam-lower-left-${trussIndex}`}
            start={new THREE.Vector3(leftColumnX, params.height, zPos)}
            end={new THREE.Vector3(leftColumnX, params.height, nextZPos)}
            dimensions={trussDimensions}
            color={params.color}
          />
        );
        elements.push(
          <Beam
            key={`cross-beam-lower-right-${trussIndex}`}
            start={new THREE.Vector3(rightColumnX, params.height, zPos)}
            end={new THREE.Vector3(rightColumnX, params.height, nextZPos)}
            dimensions={trussDimensions}
            color={params.color}
          />
        );

        if (params.roofType === 'gable') {
          elements.push(
            <Beam
              key={`cross-beam-upper-center-${trussIndex}`}
              start={new THREE.Vector3(0, params.height + params.roofHeight, zPos)}
              end={new THREE.Vector3(0, params.height + params.roofHeight, nextZPos)}
              dimensions={trussDimensions}
              color={params.color}
            />
          );
        }
      }

      return elements;
    });
  }, [params, trussPositions]);

  return <>{generateTrusses}</>;
};

export default React.memo(GazeboTrusses);