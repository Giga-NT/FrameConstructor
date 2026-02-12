import React, { useMemo } from 'react';
import * as THREE from 'three';

const GazeboWalls: React.FC<{ params: any }> = ({ params }) => {
  const {
    width = 3.003,
    length = 2.489,
    height = 2.127,
    pillarType = 'straight',
    pillarSize = '100x100',
    color = '#8B4513',
    railingHeight = 0.7
  } = params;

  const pillarDimensions = useMemo(() => {
    switch (pillarSize) {
      case '100x100':
        return { width: 0.1, depth: 0.1 };
      case '80x80':
        return { width: 0.08, depth: 0.08 };
      case '60x60':
        return { width: 0.06, depth: 0.06 };
      default:
        return { width: 0.1, depth: 0.1 };
    }
  }, [pillarSize]);

  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7,
    metalness: 0.1,
  }), [color]);

  // Угловые столбы
  const pillars = useMemo(() => {
    const corners = [
      { pos: [-width / 2, -length / 2], dir: [-1, -1] },
      { pos: [width / 2, -length / 2], dir: [1, -1] },
      { pos: [width / 2, length / 2], dir: [1, 1] },
      { pos: [-width / 2, length / 2], dir: [-1, 1] }
    ];

    return corners.map(({ pos: [x, z], dir: [dirX, dirZ] }, i) => {
      if (pillarType === 'curved') {
        const curve = new THREE.CubicBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(dirX * 0.2, height * 0.3, dirZ * 0.2),
          new THREE.Vector3(dirX * 0.5, height * 0.7, dirZ * 0.5),
          new THREE.Vector3(dirX * 0.3, height, dirZ * 0.3)
        );

        const curvePath = new THREE.CurvePath<THREE.Vector3>();
        curvePath.add(curve);
        
        const geometry = new THREE.TubeGeometry(
          curvePath,
          32,
          pillarDimensions.width / 2,
          8,
          false
        );

        return (
          <mesh
            key={`curved-pillar-${i}`}
            geometry={geometry}
            material={woodMaterial}
            position={[x, 0, z]}
            castShadow
          />
        );
      } else {
        return (
          <mesh
            key={`straight-pillar-${i}`}
            geometry={new THREE.BoxGeometry(
              pillarDimensions.width,
              height,
              pillarDimensions.depth
            )}
            material={woodMaterial}
            position={[x, height / 2, z]}
            castShadow
          />
        );
      }
    });
  }, [width, length, height, pillarType, pillarDimensions, woodMaterial]);

  // Перила
  const railings = useMemo(() => {
    const sides = [
      { start: [width / 2, -length / 2], end: [width / 2, length / 2] },
      { start: [width / 2, length / 2], end: [-width / 2, length / 2] },
      { start: [-width / 2, length / 2], end: [-width / 2, -length / 2] },
    ];

    return sides.flatMap(({ start, end }, i) => {
      const [x1, z1] = start;
      const [x2, z2] = end;
      const dx = x2 - x1;
      const dz = z2 - z1;
      const angle = Math.atan2(dz, dx);
      const sideLength = Math.sqrt(dx * dx + dz * dz);

      const rail = (
        <mesh
          key={`rail-${i}`}
          geometry={new THREE.BoxGeometry(sideLength - 0.1, 0.05, 0.05)}
          material={woodMaterial}
          position={[(x1 + x2) / 2, railingHeight, (z1 + z2) / 2]}
          rotation={[0, -angle, 0]}
          castShadow
        />
      );

      const balusters = Array.from({ length: 5 }).map((_, j) => {
        const t = (j + 0.5) / 5;
        return (
          <mesh
            key={`baluster-${i}-${j}`}
            geometry={new THREE.BoxGeometry(0.03, railingHeight - 0.05, 0.03)}
            material={woodMaterial}
            position={[x1 + dx * t, (railingHeight - 0.05) / 2, z1 + dz * t]}
            castShadow
          />
        );
      });

      return [rail, ...balusters];
    });
  }, [width, length, woodMaterial, railingHeight]);

  return (
    <group>
      {pillars}
      {railings}
    </group>
  );
};

export default React.memo(GazeboWalls);