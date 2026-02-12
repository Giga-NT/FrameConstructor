import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GreenhouseParams } from '../../types/GreenhouseTypes';

const GreenhouseFoundation: React.FC<{ params: GreenhouseParams }> = ({ params }) => {
  const foundation = useMemo(() => {
    if (params.foundationType === 'none') return null;

    let geometry: React.ReactElement | null = null;
    let position: [number, number, number] = [0, -0.1, 0];
    
    if (params.foundationType === 'wood') {
      geometry = (
        <boxGeometry args={[params.width + 0.2, 0.1, params.length + 0.2]} />
      );
    } else if (params.foundationType === 'concrete') {
      geometry = (
        <boxGeometry args={[params.width + 0.4, 0.2, params.length + 0.4]} />
      );
      position = [0, -0.2, 0];
    } else if (params.foundationType === 'piles') {
      const piles: React.ReactElement[] = [];
      const positions = [
        [-params.width/2, 0, -params.length/2],
        [params.width/2, 0, -params.length/2],
        [params.width/2, 0, params.length/2],
        [-params.width/2, 0, params.length/2]
      ];
      
      positions.forEach((pos, i) => {
        piles.push(
          <mesh key={`pile-${i}`} position={[pos[0], -1, pos[2]]}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        );
      });
      
      return <>{piles}</>;
    }

    if (!geometry) return null;

    return (
      <mesh position={position}>
        {geometry}
        <meshStandardMaterial 
          color={params.foundationType === 'wood' ? '#8B4513' : '#AAAAAA'} 
          roughness={0.8}
        />
      </mesh>
    );
  }, [params]);

  return <>{foundation}</>;
};

export default GreenhouseFoundation;