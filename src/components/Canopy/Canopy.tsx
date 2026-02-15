import React from 'react';
import * as THREE from 'three';

interface CanopyProps {
  params?: any;
}

const Canopy: React.FC<CanopyProps> = ({ params = {} }) => {
  const {
    width = 5,
    length = 3,
    height = 2.5,
    frameColor = '#555555',
    roofColor = '#CCCCCC'
  } = params;

  return (
    <group>
      {/* Пол */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#8B8B8B" side={THREE.DoubleSide} />
      </mesh>

      {/* Столбы */}
      {[
        [-width/2, 0, -length/2],
        [width/2, 0, -length/2],
        [width/2, 0, length/2],
        [-width/2, 0, length/2]
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], height/2, pos[2]]}>
          <boxGeometry args={[0.1, height, 0.1]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      ))}

      {/* Крыша */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width + 0.5, 0.1, length + 0.5]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
    </group>
  );
};

export default Canopy;