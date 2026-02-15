import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GazeboParams } from '../../types/gazeboTypes'; // adjust import path if needed

interface GableRoofProps {
  params: Pick<GazeboParams, 'width' | 'length' | 'height' | 'roofHeight' | 'roofColor' | 'color' | 'materialType'> & { overhang?: number };
}

const GableRoof: React.FC<GableRoofProps> = ({ params }) => {
  const {
    width,
    length,
    height,
    roofHeight,
    overhang = 0.2,
    roofColor = '#87CEEB',
    color = '#8B4513',
    materialType = 'wood'
  } = params;

  // ----- РАЗМЕРЫ КАРКАСА -----
  const frameBeamWidth = 0.08;
  const frameBeamHeight = 0.08;
  const rafterSpacing = 0.8;

  // ----- ТЕКСТУРА ПОЛИКАРБОНАТА -----
  const polycarbonateTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = roofColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [roofColor]);

  const roofMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      map: polycarbonateTexture,
      transparent: true,
      opacity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
      side: THREE.DoubleSide,
    }),
    [polycarbonateTexture]
  );

  const frameMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: materialType === 'metal' ? 0.5 : 0.1,
    }),
    [color, materialType]
  );

  // ----- ГЕОМЕТРИЯ СКАТА -----
  const extrudeSettings = {
    steps: 1,
    depth: length + overhang * 2,
    bevelEnabled: false,
  };

  const leftGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(width / 2 + overhang, roofHeight);
    shape.lineTo(width + overhang * 2, 0);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.translate(-(width / 2 + overhang), height, -(length / 2 + overhang));
    return geo;
  }, [width, height, roofHeight, overhang, length, extrudeSettings]);

  // ----- КОНЁК -----
  const ridgeGeometry = useMemo(
    () => new THREE.BoxGeometry(0.1, 0.1, length + overhang * 2),
    [length, overhang]
  );

  // ----- ПРОДОЛЬНЫЕ БАЛКИ (ТУПЛЫ) -----
  const edgeBeams = useMemo(() => {
    const totalLength = length + overhang * 2;
    const halfWidth = width / 2 + overhang;
    return [
      {
        position: [-halfWidth, height, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        size: [frameBeamWidth, frameBeamHeight, totalLength] as [number, number, number]
      },
      {
        position: [halfWidth, height, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        size: [frameBeamWidth, frameBeamHeight, totalLength] as [number, number, number]
      },
      {
        position: [0, height + roofHeight, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        size: [frameBeamWidth, frameBeamHeight, totalLength] as [number, number, number]
      }
    ];
  }, [width, length, height, roofHeight, overhang, frameBeamWidth, frameBeamHeight]);

  // ----- ПОПЕРЕЧНЫЕ СТРОПИЛА (ТУПЛЫ) -----
  const rafters = useMemo(() => {
    const totalLength = length + overhang * 2;
    const rafterCount = Math.max(2, Math.ceil(totalLength / rafterSpacing) + 1);
    const rafterStep = totalLength / (rafterCount - 1);
    const halfWidth = width / 2 + overhang;
    const rafterLength = Math.sqrt(halfWidth ** 2 + roofHeight ** 2);
    const slopeAngle = Math.atan2(roofHeight, halfWidth);
    const rafterData: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      size: [number, number, number];
    }> = [];

    for (let i = 0; i < rafterCount; i++) {
      const z = -totalLength / 2 + i * rafterStep;
      rafterData.push({
        position: [-halfWidth / 2, height + roofHeight / 2, z],
        rotation: [0, 0, slopeAngle],
        size: [rafterLength, frameBeamHeight, frameBeamWidth]
      });
      rafterData.push({
        position: [halfWidth / 2, height + roofHeight / 2, z],
        rotation: [0, 0, -slopeAngle],
        size: [rafterLength, frameBeamHeight, frameBeamWidth]
      });
    }
    return rafterData;
  }, [width, length, height, roofHeight, overhang, rafterSpacing, frameBeamWidth, frameBeamHeight]);

  return (
    <group>
      {/* Продольные балки */}
      {edgeBeams.map((beam, idx) => (
        <mesh key={`edge-${idx}`} position={beam.position} rotation={beam.rotation} castShadow receiveShadow>
          <boxGeometry args={beam.size} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}

      {/* Поперечные стропила */}
      {rafters.map((rafter, idx) => (
        <mesh key={`rafter-${idx}`} position={rafter.position} rotation={rafter.rotation} castShadow receiveShadow>
          <boxGeometry args={rafter.size} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}

      {/* Поликарбонатный скат */}
      <mesh geometry={leftGeometry} material={roofMaterial} castShadow receiveShadow />

      {/* Конёк */}
      <mesh
        geometry={ridgeGeometry}
        material={frameMaterial}
        position={[0, height + roofHeight, 0]}
        castShadow
        receiveShadow
      />
    </group>
  );
};

export default React.memo(GableRoof);