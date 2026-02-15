import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

const ArchedRoof: React.FC<{ params: any }> = ({ params }) => {
  const {
    width = 3,
    length = 3,
    height = 2.5,
    roofHeight = 0.8,
    roofColor = '#87CEEB',
    frameColor = '#8B4513',
  } = params;

  // Текстура поликарбоната – оптимизирована
  const polycarbonateTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // уменьшено с 256 для скорости
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = roofColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
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
      roughness: 0.3,
      metalness: 0.2,
      side: THREE.DoubleSide,
    }),
    [polycarbonateTexture]
  );

  // Точки арки – уменьшено сегментов с 32 до 16
  const archPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 16; i++) {
      const t = (i / 16) * Math.PI;
      const x = (width / 2) * Math.cos(t);
      const y = roofHeight * Math.sin(t);
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  }, [width, roofHeight]);

  // Каркасные арки (передняя и задняя)
  const sideArches = useMemo(() => {
    const halfLength = length / 2;
    return [
      <Line
        key="front-arch"
        points={archPoints}
        color={frameColor}
        lineWidth={2}
        position={[0, height, -halfLength]}
      />,
      <Line
        key="back-arch"
        points={archPoints}
        color={frameColor}
        lineWidth={2}
        position={[0, height, halfLength]}
      />
    ];
  }, [archPoints, length, height, frameColor]);

  // Продольные балки (центральная + боковые)
  const longitudinalBeams = useMemo(() => {
    const halfLength = length / 2;
    const sidePoints = archPoints.map(p => new THREE.Vector3(p.x, p.y, 0));
    return (
      <>
        <Line
          key="center-beam"
          points={archPoints}
          color={frameColor}
          lineWidth={2}
          position={[0, height, 0]}
        />
        <Line
          key="left-beam"
          points={sidePoints}
          color={frameColor}
          lineWidth={1.5}
          position={[0, height, -halfLength + 0.2]}
        />
        <Line
          key="right-beam"
          points={sidePoints}
          color={frameColor}
          lineWidth={1.5}
          position={[0, height, halfLength - 0.2]}
        />
      </>
    );
  }, [archPoints, length, height, frameColor]);

  // Поликарбонатные панели
  const polycarbonateSheets = useMemo(() => {
    const sheets = [];
    const segments = 16;
    const halfLength = length / 2;

    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      const angle1 = t1 * Math.PI;
      const angle2 = t2 * Math.PI;

      const x1 = -(width / 2) * Math.cos(angle1);
      const y1 = roofHeight * Math.sin(angle1);
      const x2 = -(width / 2) * Math.cos(angle2);
      const y2 = roofHeight * Math.sin(angle2);

      const shape = new THREE.Shape();
      shape.moveTo(x1, y1);
      shape.lineTo(x2, y2);
      shape.lineTo(x2, y2 - 0.01);
      shape.lineTo(x1, y1 - 0.01);
      shape.closePath();

      const extrudeSettings = { depth: length, bevelEnabled: false };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.translate(0, height, -halfLength);

      sheets.push(
        <mesh key={`sheet-${i}`} geometry={geometry} material={roofMaterial} />
      );
    }
    return sheets;
  }, [width, length, height, roofHeight, roofMaterial]);

  return (
    <group>
      {sideArches}
      {longitudinalBeams}
      {polycarbonateSheets}
    </group>
  );
};

export default React.memo(ArchedRoof);