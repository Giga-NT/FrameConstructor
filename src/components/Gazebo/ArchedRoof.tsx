import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

const ArchedRoof: React.FC<{ params: any }> = ({ params }) => {
  const {
    width = 3.003,
    length = 2.489,
    height = 2.127,
    roofHeight = 0.5,
    roofColor = '#87CEEB',
    frameColor = '#8B4513',
  } = params;

  // Текстура поликарбоната
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
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, [roofColor]);

  const roofMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: polycarbonateTexture,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.3,
    side: THREE.DoubleSide,
  }), [polycarbonateTexture]);

  // Создаем точки для арки
  const archPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI;
      const x = (width / 2) * Math.cos(t);
      const y = height + roofHeight * Math.sin(t);
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  }, [width, height, roofHeight]);

  // Боковые арки
  const sideArches = useMemo(() => {
    const halfLength = length / 2;
    
    return [
      <Line
        key="front-arch"
        points={archPoints}
        color={frameColor}
        lineWidth={2}
        position={[0, 0, -halfLength]}
      />,
      <Line
        key="back-arch"
        points={archPoints}
        color={frameColor}
        lineWidth={2}
        position={[0, 0, halfLength]}
      />
    ];
  }, [archPoints, length, frameColor]);

  // Продольные балки
  const longitudinalBeams = useMemo(() => {
    const beams = [];
    const halfLength = length / 2;
    
    // Центральная балка
    beams.push(
      <Line
        key="center-beam"
        points={archPoints}
        color={frameColor}
        lineWidth={2}
        position={[0, 0, 0]}
      />
    );
    
    // Боковые балки (по бокам арок)
    const sidePoints = archPoints.map(p => new THREE.Vector3(p.x, p.y, 0));
    
    beams.push(
      <Line
        key="left-beam"
        points={sidePoints}
        color={frameColor}
        lineWidth={1.5}
        position={[0, 0, -halfLength + 0.2]}
      />,
      <Line
        key="right-beam"
        points={sidePoints}
        color={frameColor}
        lineWidth={1.5}
        position={[0, 0, halfLength - 0.2]}
      />
    );
    
    return beams;
  }, [archPoints, length, frameColor]);

  // Поликарбонатные листы
  const polycarbonateSheets = useMemo(() => {
    const sheets = [];
    const segments = 16;
    const halfLength = length / 2;
    
    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;
      
      const angle1 = t1 * Math.PI;
      const angle2 = t2 * Math.PI;
      
      const x1 = -width / 2 * Math.cos(angle1);
      const y1 = height + roofHeight * Math.sin(angle1);
      const x2 = -width / 2 * Math.cos(angle2);
      const y2 = height + roofHeight * Math.sin(angle2);
      
      const shape = new THREE.Shape();
      shape.moveTo(x1, y1);
      shape.lineTo(x2, y2);
      shape.lineTo(x2, y2 - 0.01);
      shape.lineTo(x1, y1 - 0.01);
      shape.lineTo(x1, y1);
      
      const extrudeSettings = {
        depth: length,
        bevelEnabled: false
      };
      
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.translate(0, 0, -halfLength);
      
      sheets.push(
        <mesh key={`sheet-${i}`} geometry={geometry} material={roofMaterial} />
      );
    }
    
    return sheets;
  }, [width, height, length, roofHeight, roofMaterial]);

  return (
    <group>
      {sideArches}
      {longitudinalBeams}
      {polycarbonateSheets}
    </group>
  );
};

export default React.memo(ArchedRoof);