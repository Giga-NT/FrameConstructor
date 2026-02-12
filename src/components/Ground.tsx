// components/Ground.tsx
import React from 'react';
import { Plane } from '@react-three/drei';
import { useTexture } from '@react-three/drei';

const Ground: React.FC = () => {
  const texture = useTexture('/textures/grasslight-big.jpg'); // Путь к текстуре
  texture.wrapS = texture.wrapT = 1000; // Зацикливание
  texture.repeat.set(50, 50); // Повторение текстуры

  return (
    <Plane
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial map={texture} />
    </Plane>
  );
};

export default Ground;