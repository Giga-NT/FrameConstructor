import React from 'react';
import * as THREE from 'three';

interface VentProps {
  count: number;
  side: 'left' | 'right' | 'both';
  heightOffset: number; // высота от пола
  lengthOffset: number; // отступ от торца
  width: number;         // ширина форточки
  height: number;        // высота форточки
  zOffset: number;       // смещение внутрь теплицы
}

const Vent: React.FC<VentProps> = ({
  count,
  side,
  heightOffset,
  lengthOffset,
  width,
  height,
  zOffset
}) => {
  const vents: React.ReactNode[] = [];

  // Позиции по длине теплицы
  const positions = Array.from({ length: count }, (_, i) => {
    return -lengthOffset - (i * (6 - 2 * lengthOffset) / (count + 1));
  });

  const createVent = (x: number, z: number) => {
    const geometry = new THREE.BoxGeometry(width, height, 0.02);
    const material = new THREE.MeshStandardMaterial({ color: '#808080', side: THREE.DoubleSide });
    return (
      <mesh
        key={`vent-${x}-${z}`}
        position={[x, heightOffset + height / 2, z]}
        geometry={geometry}
        material={material}
      />
    );
  };

  // Функция для генерации форточек по заданным позициям
  const generateVents = (side: 'left' | 'right') => {
    const x = side === 'left' ? -3 : 3; // Ширина теплицы / 2
    positions.forEach((z) => {
      vents.push(createVent(x, z));
    });
  };

  if (side === 'left' || side === 'both') {
    generateVents('left');
  }

  if (side === 'right' || side === 'both') {
    generateVents('right');
  }

  return <>{vents}</>;
};

export default Vent;