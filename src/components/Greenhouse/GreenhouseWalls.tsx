import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import Beam from '../Beams/Beam';

const darkenColor = (color: THREE.Color, factor: number): THREE.Color => {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.l = Math.max(0, hsl.l - factor);
  return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
};

interface GreenhouseWallsProps {
  params: GreenhouseParams;
  archPoints?: THREE.Vector3[];
  doorsOpen: boolean;
  setDoorsOpen: (open: boolean) => void;
  ventsOpen: boolean;
}

const GreenhouseWalls: React.FC<GreenhouseWallsProps> = ({ 
  params, 
  archPoints, 
  doorsOpen, 
  setDoorsOpen,
  ventsOpen
}) => {
  const SINGLE_DOOR_WIDTH = 0.8;
  const DOUBLE_DOOR_HALF_WIDTH = 0.6;
  const DOOR_HEIGHT = 1.6;
  const DOOR_THICKNESS = 0.05;
  const TRIM_WIDTH = 0.02;
  const MAX_POST_SPACING = 1.0; // Максимальное расстояние между стойками (1 метр)
  const useDoubleDoors = params.width > 3;

  const frameDimensions = {
    metal: { width: 0.04, thickness: 0.04 },
    pvc: { width: 0.05, thickness: 0.05 },
    wood: { width: 0.06, thickness: 0.06 }
  }[params.frameMaterial];

  const { frameElements, doorElements, ventElements, wallElements } = useMemo(() => {
    const frameElements: React.ReactNode[] = [];
    const doorElements: React.ReactNode[] = [];
    const ventElements: React.ReactNode[] = [];
    const wallElements: React.ReactNode[] = [];
    const wallOffset = params.width * 0.01;
    const frameCorners = [
      new THREE.Vector3(-params.width / 2 - wallOffset, 0, -params.length / 2 - wallOffset),
      new THREE.Vector3(params.width / 2 + wallOffset, 0, -params.length / 2 - wallOffset),
      new THREE.Vector3(params.width / 2 + wallOffset, 0, params.length / 2 + wallOffset),
      new THREE.Vector3(-params.width / 2 - wallOffset, 0, params.length / 2 + wallOffset)
    ];

    // Вертикальные стойки с шагом не более 1 метра
    for (let side = 0; side < 4; side++) {
      const start = frameCorners[side];
      const end = frameCorners[(side + 1) % 4];
      const sideLength = start.distanceTo(end);
      const postCount = Math.max(2, Math.ceil(sideLength / MAX_POST_SPACING) + 1);
      
      for (let i = 0; i < postCount; i++) {
        const t = i / (postCount - 1);
        const position = new THREE.Vector3().lerpVectors(start, end, t);
        const isDoorPosition = (side === 0 || side === 2) && 
                             (params.hasDoors && 
                              ((params.doorSide === 'front' && side === 0) || 
                               (params.doorSide === 'back' && side === 2) || 
                               params.doorSide === 'both') &&
                              (t > 0.4 && t < 0.6));
        
        if (!isDoorPosition) {
          frameElements.push(
            <Beam
              key={`post-${side}-${i}`}
              start={position}
              end={new THREE.Vector3(position.x, params.wallHeight, position.z)}
              dimensions={frameDimensions}
              color={params.frameColor}
            />
          );
        }
      }
    }

    // Стойки по краям дверей
    if (params.hasDoors) {
      const doorPostOffset = useDoubleDoors ? DOUBLE_DOOR_HALF_WIDTH : SINGLE_DOOR_WIDTH / 2;
      if (params.doorSide === 'front' || params.doorSide === 'both') {
        frameElements.push(
          <Beam key="door-post-front-left" start={new THREE.Vector3(-doorPostOffset, 0, -params.length / 2 - wallOffset)} end={new THREE.Vector3(-doorPostOffset, params.wallHeight, -params.length / 2 - wallOffset)} dimensions={frameDimensions} color={params.frameColor} />,
          <Beam key="door-post-front-right" start={new THREE.Vector3(doorPostOffset, 0, -params.length / 2 - wallOffset)} end={new THREE.Vector3(doorPostOffset, params.wallHeight, -params.length / 2 - wallOffset)} dimensions={frameDimensions} color={params.frameColor} />
        );
      }
      if (params.doorSide === 'back' || params.doorSide === 'both') {
        frameElements.push(
          <Beam key="door-post-back-left" start={new THREE.Vector3(-doorPostOffset, 0, params.length / 2 + wallOffset)} end={new THREE.Vector3(-doorPostOffset, params.wallHeight, params.length / 2 + wallOffset)} dimensions={frameDimensions} color={params.frameColor} />,
          <Beam key="door-post-back-right" start={new THREE.Vector3(doorPostOffset, 0, params.length / 2 + wallOffset)} end={new THREE.Vector3(doorPostOffset, params.wallHeight, params.length / 2 + wallOffset)} dimensions={frameDimensions} color={params.frameColor} />
        );
      }
    }

    // Горизонтальные балки (верхние и нижние)
    for (let i = 0; i < frameCorners.length; i++) {
      const next = (i + 1) % frameCorners.length;
      frameElements.push(
        <Beam key={`bottom-frame-${i}`} start={frameCorners[i]} end={frameCorners[next]} dimensions={frameDimensions} color={params.frameColor} />
      );
      frameElements.push(
        <Beam key={`top-frame-${i}`} start={new THREE.Vector3(frameCorners[i].x, params.wallHeight, frameCorners[i].z)} end={new THREE.Vector3(frameCorners[next].x, params.wallHeight, frameCorners[next].z)} dimensions={frameDimensions} color={params.frameColor} />
      );
    }

    // Функция создания форточки над дверью
    const createDoorVent = (position: THREE.Vector3, isBackDoor: boolean, key: string, width: number) => {
      const ventHeight = params.wallHeight - DOOR_HEIGHT;
      const ventThickness = 0.05;
      const ventColor = darkenColor(new THREE.Color(params.coverColor), 0.1);
      const trimWidth = TRIM_WIDTH;

      const ventCenterY = DOOR_HEIGHT + ventHeight / 2;

      return (
        <group key={key} position={[position.x, ventCenterY, position.z]} rotation={[0, isBackDoor ? Math.PI : 0, 0]}>
          <group
            position={ventsOpen ? [0, 0.14, -ventThickness / 2 - 0.2] : [0, 0, 0]}
            rotation={ventsOpen ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
          >
            <mesh>
              <boxGeometry args={[width, ventHeight, ventThickness]} />
              <meshStandardMaterial 
                color={ventColor.getStyle()} 
                roughness={0.8} 
                metalness={0.2}
                transparent={true}
                opacity={params.coverMaterial === 'polycarbonate' ? 0.7 : 1}
              />
            </mesh>

            <group>
              <mesh position={[0, ventHeight / 2 - trimWidth / 2, -ventThickness / 2 - 0.005]}>
                <boxGeometry args={[width - 0.01, trimWidth, trimWidth]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh position={[0, -ventHeight / 2 + trimWidth / 2, -ventThickness / 2 - 0.005]}>
                <boxGeometry args={[width - 0.01, trimWidth, trimWidth]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh position={[-width / 2 + trimWidth / 2, 0, -ventThickness / 2 - 0.005]}>
                <boxGeometry args={[trimWidth, ventHeight - 0.01, trimWidth]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh position={[width / 2 - trimWidth / 2, 0, -ventThickness / 2 - 0.005]}>
                <boxGeometry args={[trimWidth, ventHeight - 0.01, trimWidth]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
            </group>

            <mesh position={[0, ventHeight / 2 - 0.3, -ventThickness - 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.15, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>

            <mesh position={[-width / 2, ventHeight / 2, -ventThickness / 2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>
            <mesh position={[width / 2, ventHeight / 2, -ventThickness / 2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>
          </group>
        </group>
      );
    };



    // Функция создания одинарной двери с рамкой по кромке
    const createSingleDoor = (position: THREE.Vector3, isBackDoor: boolean, key: string) => {
      const doorColor = darkenColor(new THREE.Color(params.coverColor), 0.2);
      const centerX = position.x;
      const centerY = position.y;
      const centerZ = position.z;
      const openOffsetX = isBackDoor ? -0.4 : 0.4;
      const openOffsetZ = isBackDoor ? 0.4 : -0.4;
      const openRotationY = isBackDoor ? Math.PI / 2 : -Math.PI / 2;

      const doorFrameElements: React.ReactNode[] = [];
      doorFrameElements.push(
        <Beam key={`${key}-top-beam`} start={new THREE.Vector3(-SINGLE_DOOR_WIDTH/2, DOOR_HEIGHT, centerZ)} end={new THREE.Vector3(SINGLE_DOOR_WIDTH/2, DOOR_HEIGHT, centerZ)} dimensions={frameDimensions} color={params.frameColor} />,
        <Beam key={`${key}-bottom-beam`} start={new THREE.Vector3(-SINGLE_DOOR_WIDTH/2, 0, centerZ)} end={new THREE.Vector3(SINGLE_DOOR_WIDTH/2, 0, centerZ)} dimensions={frameDimensions} color={params.frameColor} />,
        <Beam key={`${key}-left-post`} start={new THREE.Vector3(-SINGLE_DOOR_WIDTH/2, 0, centerZ)} end={new THREE.Vector3(-SINGLE_DOOR_WIDTH/2, params.wallHeight, centerZ)} dimensions={frameDimensions} color={params.frameColor} />,
        <Beam key={`${key}-right-post`} start={new THREE.Vector3(SINGLE_DOOR_WIDTH/2, 0, centerZ)} end={new THREE.Vector3(SINGLE_DOOR_WIDTH/2, params.wallHeight, centerZ)} dimensions={frameDimensions} color={params.frameColor} />
      );

      const ventPosition = new THREE.Vector3(0, 0, centerZ);
      const ventElement = createDoorVent(ventPosition, isBackDoor, `${key}-vent`, SINGLE_DOOR_WIDTH);

      return (
        <>
          {doorFrameElements}
          {ventElement}
          <group 
            position={doorsOpen ? [centerX + openOffsetX, centerY, centerZ + openOffsetZ] : [centerX, centerY, centerZ]} 
            rotation={doorsOpen ? [0, openRotationY, 0] : [0, 0, 0]}
          >
            {/* Основное полотно */}
            <mesh>
              <boxGeometry args={[SINGLE_DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICKNESS]} />
              <meshStandardMaterial 
                color={doorColor.getStyle()} 
                roughness={0.8} 
                metalness={0.2}
                transparent={true}
                opacity={params.coverMaterial === 'polycarbonate' ? 0.7 : 1}
              />
            </mesh>

            {/* Рамка по кромке полотна */}
            <group>
              {/* Верхняя планка */}
              <mesh position={[0, DOOR_HEIGHT / 2 - TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
                <boxGeometry args={[SINGLE_DOOR_WIDTH - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              {/* Нижняя планка */}
              <mesh position={[0, -DOOR_HEIGHT / 2 + TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
                <boxGeometry args={[SINGLE_DOOR_WIDTH - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              {/* Левая планка */}
              <mesh position={[-SINGLE_DOOR_WIDTH / 2 + TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
                <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
              {/* Правая планка */}
              <mesh position={[SINGLE_DOOR_WIDTH / 2 - TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
                <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
                <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
              </mesh>
            </group>

            {/* Ручка и петли */}
            <mesh position={[-0.3, 0, -(DOOR_THICKNESS / 2 + 0.01)]}>
              <cylinderGeometry args={[0.015, 0.015, 0.15, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.39, -0.7, -(DOOR_THICKNESS / 2)]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>
            <mesh position={[0.39, 0, -(DOOR_THICKNESS / 2)]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>
            <mesh position={[0.39, 0.7, -(DOOR_THICKNESS / 2)]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
              <meshStandardMaterial color="darkgray" />
            </mesh>
          </group>
        </>
      );
    };

    // Функция создания двойной двери с рамкой на каждой створке
const createDoubleDoor = (position: THREE.Vector3, isBackDoor: boolean, key: string) => {
  const doorColor = darkenColor(new THREE.Color(params.coverColor), 0.2);
  const centerX = position.x-0.1;
  const centerY = position.y;
  const centerZ = position.z;
  const halfWidth = DOUBLE_DOOR_HALF_WIDTH; // 0.6 м

  // Логика открытия — такая же, как у одинарной двери
  const openOffsetX = isBackDoor ? 0.4 : 0.4;
  const openOffsetZ = isBackDoor ? 0.2 : -0.4;
  const openRotationY = isBackDoor ? Math.PI / 2 : -Math.PI / 2;

  // Элементы дверного проёма (рама)
  const doorFrameElements: React.ReactNode[] = [];
  doorFrameElements.push(
    <Beam key={`${key}-top-beam`} start={new THREE.Vector3(-halfWidth, DOOR_HEIGHT, centerZ)} end={new THREE.Vector3(halfWidth, DOOR_HEIGHT, centerZ)} dimensions={frameDimensions} color={params.frameColor} />,
  );

  // Форточка над дверью
  const ventPosition = new THREE.Vector3(0, 0, centerZ);
  const ventElement = createDoorVent(ventPosition, isBackDoor, `${key}-vent`, halfWidth * 2);

  return (
    <>
      {doorFrameElements}
      {ventElement}

      {/* ЛЕВАЯ СТВОРКА — открывается влево */}
      <group key={`${key}-left`} position={[centerX+0.1 - halfWidth, centerY, centerZ]}>
        <group
          position={doorsOpen ? [openOffsetX-0.4, 0, openOffsetZ+0.1] : [0.3, 0, 0]}
          rotation={doorsOpen ? [0, -openRotationY, 0] : [0, 0, 0]}
        >
          <mesh>
            <boxGeometry args={[halfWidth, DOOR_HEIGHT, DOOR_THICKNESS]} />
            <meshStandardMaterial 
              color={doorColor.getStyle()} 
              roughness={0.8} 
              metalness={0.2}
              transparent={true}
              opacity={params.coverMaterial === 'polycarbonate' ? 0.7 : 1}
            />
          </mesh>

          {/* Рамка по кромке */}
          <group>
            <mesh position={[0, DOOR_HEIGHT / 2 - TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[halfWidth - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, -DOOR_HEIGHT / 2 + TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[halfWidth - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[-halfWidth / 2 + TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[halfWidth / 2 - TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
          </group>

          {/* Ручка — на внутренней стороне */}
          <mesh position={[halfWidth/2 - 0.1, 0, -(DOOR_THICKNESS / 2 + 0.01)]}>
            <cylinderGeometry args={[0.015, 0.015, 0.15, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>

			// Петли — на левом краю (внешнем)
			<mesh position={[-halfWidth / 2, -0.7, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
			<mesh position={[-halfWidth / 2, 0, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
			<mesh position={[-halfWidth / 2, 0.7, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
        </group>
      </group>

      {/* ПРАВАЯ СТВОРКА — открывается вправо */}
      <group key={`${key}-right`} position={[centerX-0.2 + halfWidth, centerY, centerZ]}>
        <group
          position={doorsOpen ? [openOffsetX-0.1, 0, openOffsetZ+0.1] : [0, 0, 0]}
          rotation={doorsOpen ? [0, openRotationY, 0] : [0, 0, 0]}
        >
          <mesh>
            <boxGeometry args={[halfWidth, DOOR_HEIGHT, DOOR_THICKNESS]} />
            <meshStandardMaterial 
              color={doorColor.getStyle()} 
              roughness={0.8} 
              metalness={0.2}
              transparent={true}
              opacity={params.coverMaterial === 'polycarbonate' ? 0.7 : 1}
            />
          </mesh>

          {/* Рамка */}
          <group>
            <mesh position={[0, DOOR_HEIGHT / 2 - TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[halfWidth - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, -DOOR_HEIGHT / 2 + TRIM_WIDTH / 2, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[halfWidth - 0.01, TRIM_WIDTH, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[-halfWidth / 2 + TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[halfWidth / 2 - TRIM_WIDTH / 2, 0, -DOOR_THICKNESS / 2 - 0.005]}>
              <boxGeometry args={[TRIM_WIDTH, DOOR_HEIGHT - 0.01, TRIM_WIDTH]} />
              <meshStandardMaterial color={darkenColor(new THREE.Color(params.frameColor), 0.2)} roughness={0.5} metalness={0.3} />
            </mesh>
          </group>

          {/* Ручка */}
          <mesh position={[-halfWidth/2 + 0.1, 0, -(DOOR_THICKNESS / 2 + 0.01)]}>
            <cylinderGeometry args={[0.015, 0.015, 0.15, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>

          {/* Петли — на правом краю */}

			<mesh position={[halfWidth / 2, -0.7, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
			<mesh position={[halfWidth / 2, 0, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
			<mesh position={[halfWidth / 2, 0.7, -(DOOR_THICKNESS / 2)]}>
			  <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
			  <meshStandardMaterial color="darkgray" />
			</mesh>
        </group>
      </group>
    </>
  );
};



    // Позиции дверей
    const doorFrontPos = new THREE.Vector3(0, DOOR_HEIGHT / 2, -params.length / 2 - wallOffset - 0.01);
    const doorBackPos = new THREE.Vector3(0, DOOR_HEIGHT / 2, params.length / 2 + wallOffset - 0.01);

    if (params.hasDoors) {
      if (params.doorSide === 'front' || params.doorSide === 'both') {
        if (useDoubleDoors) {
          doorElements.push(createDoubleDoor(doorFrontPos, false, 'door-front'));
        } else {
          doorElements.push(createSingleDoor(doorFrontPos, false, 'door-front'));
        }
      }
      if (params.doorSide === 'back' || params.doorSide === 'both') {
        if (useDoubleDoors) {
          doorElements.push(createDoubleDoor(doorBackPos, true, 'door-back'));
        } else {
          doorElements.push(createSingleDoor(doorBackPos, true, 'door-back'));
        }
      }
    }

    // Создание обшивки стен
const createWallCover = () => {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: params.coverColor,
    transparent: true,
    opacity: params.coverMaterial === 'polycarbonate' ? 0.8 : 1,
    side: THREE.DoubleSide,
    roughness: 0.3,
    metalness: 0.1,
  });
  const wallSegments: React.ReactNode[] = [];
  const wallThickness = 0.01;

  for (let side = 0; side < 4; side++) {
    const isFront = side === 0;
    const isBack = side === 2;
    const isSideWall = side === 1 || side === 3;
    const hasDoorOnFront = params.hasDoors && (params.doorSide === 'front' || params.doorSide === 'both');
    const hasDoorOnBack = params.hasDoors && (params.doorSide === 'back' || params.doorSide === 'both');
    const start = frameCorners[side];
    const end = frameCorners[(side + 1) % 4];

    if (isSideWall) {
      // Боковые стенки - рисуем полностью
      const normal = new THREE.Vector3()
        .subVectors(end, start)
        .normalize()
        .cross(new THREE.Vector3(0, 1, 0))
        .multiplyScalar(wallThickness);
      
      const bl = new THREE.Vector3(start.x, 0, start.z).add(normal);
      const br = new THREE.Vector3(end.x, 0, end.z).add(normal);
      const tl = new THREE.Vector3(start.x, params.wallHeight, start.z).add(normal);
      const tr = new THREE.Vector3(end.x, params.wallHeight, end.z).add(normal);
      
      const vertices = [bl.x, bl.y, bl.z, br.x, br.y, br.z, tl.x, tl.y, tl.z, tr.x, tr.y, tr.z];
      const indices = [0, 1, 2, 1, 3, 2];
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      wallSegments.push(<mesh key={`wall-${side}`} geometry={geometry} material={wallMaterial} />);
    } else {
      // Передняя или задняя стенка
      const zPos = isFront ? -params.length/2 - wallOffset : params.length/2 + wallOffset;
      const hasDoor = (isFront && hasDoorOnFront) || (isBack && hasDoorOnBack);

      if (hasDoor) {
        // Если есть дверь - рисуем левый и правый сегменты
        const doorWidth = useDoubleDoors ? DOUBLE_DOOR_HALF_WIDTH * 2 : SINGLE_DOOR_WIDTH;

        // Левый сегмент
        const blLeft = new THREE.Vector3(-params.width/2 - wallOffset, 0, zPos);
        const brLeft = new THREE.Vector3(-doorWidth/2, 0, zPos);
        const tlLeft = new THREE.Vector3(-params.width/2 - wallOffset, params.wallHeight, zPos);
        const trLeft = new THREE.Vector3(-doorWidth/2, params.wallHeight, zPos);
        
        const leftVertices = [blLeft.x, blLeft.y, blLeft.z, brLeft.x, brLeft.y, brLeft.z, tlLeft.x, tlLeft.y, tlLeft.z, trLeft.x, trLeft.y, trLeft.z];
        const leftIndices = [0, 1, 2, 1, 3, 2];
        
        const leftGeometry = new THREE.BufferGeometry();
        leftGeometry.setAttribute('position', new THREE.Float32BufferAttribute(leftVertices, 3));
        leftGeometry.setIndex(leftIndices);
        leftGeometry.computeVertexNormals();
        wallSegments.push(<mesh key={`wall-${side}-left`} geometry={leftGeometry} material={wallMaterial} />);

        // Правый сегмент
        const blRight = new THREE.Vector3(doorWidth/2, 0, zPos);
        const brRight = new THREE.Vector3(params.width/2 + wallOffset, 0, zPos);
        const tlRight = new THREE.Vector3(doorWidth/2, params.wallHeight, zPos);
        const trRight = new THREE.Vector3(params.width/2 + wallOffset, params.wallHeight, zPos);
        
        const rightVertices = [blRight.x, blRight.y, blRight.z, brRight.x, brRight.y, brRight.z, tlRight.x, tlRight.y, tlRight.z, trRight.x, trRight.y, trRight.z];
        const rightIndices = [0, 1, 2, 1, 3, 2];
        
        const rightGeometry = new THREE.BufferGeometry();
        rightGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rightVertices, 3));
        rightGeometry.setIndex(rightIndices);
        rightGeometry.computeVertexNormals();
        wallSegments.push(<mesh key={`wall-${side}-right`} geometry={rightGeometry} material={wallMaterial} />);
      } else {
        // Если нет двери - рисуем всю стенку целиком
        const bl = new THREE.Vector3(-params.width/2 - wallOffset, 0, zPos);
        const br = new THREE.Vector3(params.width/2 + wallOffset, 0, zPos);
        const tl = new THREE.Vector3(-params.width/2 - wallOffset, params.wallHeight, zPos);
        const tr = new THREE.Vector3(params.width/2 + wallOffset, params.wallHeight, zPos);
        
        const vertices = [bl.x, bl.y, bl.z, br.x, br.y, br.z, tl.x, tl.y, tl.z, tr.x, tr.y, tr.z];
        const indices = [0, 1, 2, 1, 3, 2];
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        wallSegments.push(<mesh key={`wall-${side}`} geometry={geometry} material={wallMaterial} />);
      }
    }
  }
  return wallSegments;
};

    wallElements.push(...createWallCover());

    return { frameElements, doorElements, ventElements, wallElements };
  }, [params, doorsOpen, ventsOpen]);

  return (
    <>
      {frameElements}
      {wallElements}
      {doorElements}
      {ventElements}
    </>
  );
};

export default GreenhouseWalls;