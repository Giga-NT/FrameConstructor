import React from 'react';

const BackgroundScene: React.FC = () => {
  return (
    <>
      {/* 🏠 Домик */}
      <group position={[0, 0, -10]}>
        <mesh castShadow>
          <boxGeometry args={[8, 6, 6]} />
          <meshStandardMaterial color="#e0b78a" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[0, 6.5, 0]}>
          <coneGeometry args={[6, 3, 4]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.1} />
        </mesh>
      </group>

      {/* 🌳 Деревья */}
      {[...Array(5)].map((_, i) => (
        <group key={`tree-${i}`} position={[Math.random() * 10 - 5, 0, Math.random() * -10]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="green" />
          </mesh>
        </group>
      ))}

      {/* 🧱 Забор */}
      <group position={[0, 0, -15]}>
        {[...Array(10)].map((_, i) => (
          <mesh key={`fence-${i}`} position={[i - 5, 0.5, 0]}>
            <boxGeometry args={[0.2, 1, 2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
      </group>
    </>
  );
};

export default BackgroundScene;