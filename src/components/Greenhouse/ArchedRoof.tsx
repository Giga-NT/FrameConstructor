import React, { useMemo, JSX } from 'react';
import * as THREE from 'three';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import Beam from '../Beams/Beam';

interface RoofCoverParams {
  archPoints: THREE.Vector3[];
  length: number;
  wallOffset: number;
  rafterCount: number;
  coverColor?: string;
  coverMaterial: 'polycarbonate' | 'glass' | 'film';
}

const MAX_BEAM_SPACING = 1.0; // Максимальное расстояние между элементами каркаса (1 метр)

const createRoofCoverMesh = ({
  archPoints,
  length,
  wallOffset,
  rafterCount,
  coverColor = '#87ceeb',
  coverMaterial
}: RoofCoverParams): JSX.Element => {
  const vertices: number[] = [];
  const indices: number[] = [];

  // Автоматически рассчитываем количество рамок исходя из длины теплицы
  const numFrames = Math.max(2, Math.ceil((length + 2 * wallOffset) / MAX_BEAM_SPACING) + 1);
  const stepZ = (length + 2 * wallOffset) / (numFrames - 1);

  const frames: THREE.Vector3[][] = [];
  for (let i = 0; i < numFrames; i++) {
    const z = -length / 2 - wallOffset + i * stepZ;
    const frame = archPoints.map(p => new THREE.Vector3(p.x, p.y, z));
    frames.push(frame);
  }

  for (let i = 0; i < numFrames - 1; i++) {
    const curr = frames[i];
    const next = frames[i + 1];

    for (let j = 0; j < curr.length - 1; j++) {
      const v0 = curr[j];
      const v1 = curr[j + 1];
      const v2 = next[j];
      const v3 = next[j + 1];

      const idx = vertices.length / 3;

      vertices.push(v0.x, v0.y, v0.z);
      vertices.push(v1.x, v1.y, v1.z);
      vertices.push(v2.x, v2.y, v2.z);
      vertices.push(v3.x, v3.y, v3.z);

      indices.push(idx, idx + 1, idx + 2);
      indices.push(idx + 1, idx + 3, idx + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const materialProps = {
    polycarbonate: {
      transparent: true,
      opacity: 0.7,
      roughness: 0.3,
      metalness: 0.1
    },
    glass: {
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.3
    },
    film: {
      transparent: true,
      opacity: 0.85,
      roughness: 0.5,
      metalness: 0
    }
  };

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(coverColor),
    ...materialProps[coverMaterial],
    side: THREE.DoubleSide
  });

  return <mesh key="roof-cover" geometry={geometry} material={material} />;
};

const ArchedRoof: React.FC<{ params: GreenhouseParams }> = ({ params }) => {
  const wallOffset = params.width * 0.01;

  const archPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = params.archSegments;
    const baseWidth = params.width;
    const wallHeight = params.wallHeight;
    const archHeight = params.archHeight;

    const archWidth = baseWidth * 1.03;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      const x = -archWidth / 2 + archWidth * t;
      const y = wallHeight + archHeight * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    return points;
  }, [params]);

  const frameDimensions = {
    metal: { width: 0.04, thickness: 0.04 },
    pvc: { width: 0.05, thickness: 0.05 },
    wood: { width: 0.06, thickness: 0.06 }
  }[params.frameMaterial];

  const createBottomArchBeam = useMemo(() => {
    const beams: JSX.Element[] = [];
    const zPositions = [-params.length/2 - wallOffset, params.length/2 + wallOffset];
    
    zPositions.forEach(z => {
      for (let i = 0; i < archPoints.length - 1; i++) {
        const p1 = archPoints[i];
        const p2 = archPoints[i + 1];
        
        if (Math.abs(p1.y - params.wallHeight) < 0.001 && 
            Math.abs(p2.y - params.wallHeight) < 0.001) {
          beams.push(
            <Beam
              key={`bottom-arch-beam-${z}-${i}`}
              start={new THREE.Vector3(p1.x, p1.y, z)}
              end={new THREE.Vector3(p2.x, p2.y, z)}
              dimensions={frameDimensions}
              color={params.frameColor}
            />
          );
        }
      }
    });
    
    return beams;
  }, [archPoints, params, frameDimensions, wallOffset]);

  const createBottomArchCover = useMemo(() => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const thickness = 0.01;

    const bottomPoints = archPoints.filter(p => 
      Math.abs(p.y - params.wallHeight) < 0.001
    );

    [-params.length/2 - wallOffset, params.length/2 + wallOffset].forEach((z, index) => {
      const offset = vertices.length / 3;

      bottomPoints.forEach((p, i) => {
        vertices.push(p.x, p.y, z);
        vertices.push(p.x, p.y, z + (index === 0 ? thickness : -thickness));
      });

      for (let i = 0; i < bottomPoints.length - 1; i++) {
        const base = offset + i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: params.coverColor || 0x87ceeb,
      transparent: true,
      opacity: params.coverMaterial === 'polycarbonate' ? 0.7 : 1,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.1,
    });

    return <mesh key="bottom-arch-cover" geometry={geometry} material={material} />;
  }, [archPoints, params, wallOffset]);

  const crossBeams = useMemo(() => {
    const beams: JSX.Element[] = [];
    // Автоматически рассчитываем количество стропил исходя из длины теплицы
    const rafterCount = Math.max(2, Math.ceil((params.length + 2 * wallOffset) / MAX_BEAM_SPACING) + 1);
    const step = (params.length + 2 * wallOffset) / (rafterCount - 1);

    for (let i = 0; i < rafterCount; i++) {
      const z = -params.length / 2 - wallOffset + i * step;

      for (let j = 0; j < archPoints.length - 1; j++) {
        beams.push(
          <Beam
            key={`cross-${i}-${j}`}
            start={new THREE.Vector3(archPoints[j].x, archPoints[j].y, z)}
            end={new THREE.Vector3(archPoints[j + 1].x, archPoints[j + 1].y, z)}
            dimensions={frameDimensions}
            color={params.frameColor}
          />
        );
      }
    }
    return beams;
  }, [archPoints, params, frameDimensions, wallOffset]);

  const roofCoverMesh = useMemo(() => createRoofCoverMesh({
    archPoints,
    length: params.length,
    wallOffset,
    rafterCount: Math.max(2, Math.ceil((params.length + 2 * wallOffset) / MAX_BEAM_SPACING) + 1),
    coverColor: params.coverColor,
    coverMaterial: params.coverMaterial
  }), [archPoints, params, wallOffset]);

  const createEndCapMeshes = useMemo(() => {
    const meshes: JSX.Element[] = [];

    [-params.length / 2 - wallOffset, params.length / 2 + wallOffset].forEach((z, index) => {
      const vertices: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i < archPoints.length - 1; i++) {
        const p1 = archPoints[i];
        const p2 = archPoints[i + 1];

        const offset = vertices.length / 3;

        vertices.push(
          p1.x, p1.y, z,
          p2.x, p2.y, z,
          p1.x, params.wallHeight, z,
          p2.x, params.wallHeight, z
        );

        indices.push(offset, offset + 1, offset + 2);
        indices.push(offset + 1, offset + 3, offset + 2);
      }

      if (indices.length === 0) return;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: params.coverColor || 0x87ceeb,
        transparent: true,
        opacity: params.coverMaterial === 'polycarbonate' ? 0.7 : 1,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.1,
      });

      meshes.push(<mesh key={`end-cap-${index}`} geometry={geometry} material={material} />);
    });

    return meshes;
  }, [archPoints, params, wallOffset]);

  const mainArches = useMemo(() => {
    const arches: JSX.Element[] = [];
    // Автоматически рассчитываем количество арок исходя из длины теплицы
    const numArches = Math.max(2, Math.ceil((params.length + 2 * wallOffset) / MAX_BEAM_SPACING) + 1);

    for (let i = 0; i < numArches; i++) {
      const z = -params.length / 2 - wallOffset + (i * (params.length + 2 * wallOffset) / (numArches - 1));
      const beams: JSX.Element[] = [];

      for (let j = 0; j < archPoints.length - 1; j++) {
        beams.push(
          <Beam
            key={`arch-segment-${i}-${j}`}
            start={new THREE.Vector3(archPoints[j].x, archPoints[j].y, z)}
            end={new THREE.Vector3(archPoints[j + 1].x, archPoints[j + 1].y, z)}
            dimensions={frameDimensions}
            color={params.frameColor}
          />
        );
      }

      arches.push(<React.Fragment key={`arch-${i}`}>{beams}</React.Fragment>);
    }

    return arches;
  }, [archPoints, frameDimensions, params.frameColor, params.length, wallOffset]);

  return (
    <>
      {/* Main structure */}
      {mainArches}
      {crossBeams}
      {createBottomArchBeam}
      
      {/* Covers */}
      {roofCoverMesh}
      {createEndCapMeshes}
      {createBottomArchCover}
    </>
  );
};

export default React.memo(ArchedRoof);