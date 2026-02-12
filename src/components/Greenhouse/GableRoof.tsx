import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GreenhouseParams } from '../../types/GreenhouseTypes';
import Beam from '../Beams/Beam';

const MAX_BEAM_SPACING = 1.0; // Максимальное расстояние между элементами каркаса (1 метр)

const GableRoof: React.FC<{ params: GreenhouseParams }> = ({ params }) => {
  const frameDimensions = {
    metal: { width: 0.04, thickness: 0.04 },
    pvc: { width: 0.05, thickness: 0.05 },
    wood: { width: 0.06, thickness: 0.06 }
  }[params.frameMaterial];

  // Размер свеса крыши (10 см с каждой стороны)
  const overhang = 0.1;
  // Толщина покрытия
  const coverThickness = 0.01;
  // Ширина коньковой планки
  const ridgePlateWidth = 0.3;
  // Толщина коньковой планки
  const ridgePlateThickness = 0.01;

  // Вычисляем высоту конька крыши
  const ridgeHeight = params.wallHeight + (params.roofAngle * params.width) / 100;
  
  // Длина ската крыши (с учетом свеса)
  const slopeLength = Math.sqrt(
    Math.pow((params.width + overhang * 2)/2, 2) + 
    Math.pow(ridgeHeight - params.wallHeight, 2)
  );

  // Угол наклона крыши
  const angleRad = Math.atan2(ridgeHeight - params.wallHeight, (params.width + overhang * 2)/2);

  // Точки для стропил (с учетом свеса)
  const roofPoints = useMemo(() => [
    new THREE.Vector3(-(params.width/2 + overhang), params.wallHeight, 0),
    new THREE.Vector3(0, ridgeHeight, 0),
    new THREE.Vector3(params.width/2 + overhang, params.wallHeight, 0)
  ], [params.width, params.wallHeight, ridgeHeight]);

  // Стропила и конек с шагом не более 1 метра
  const roofElements = useMemo(() => {
    const elements = [];
    // Автоматически рассчитываем количество стропил
    const rafterCount = Math.max(2, Math.ceil(params.length / MAX_BEAM_SPACING) + 1);
    const step = params.length / (rafterCount - 1);
    
    for (let i = 0; i < rafterCount; i++) {
      const z = -params.length/2 + i * step;

      // Левое стропило
      elements.push(
        <Beam
          key={`rafter-left-${i}`}
          start={new THREE.Vector3(roofPoints[0].x+0.05, roofPoints[0].y, z)}
          end={new THREE.Vector3(roofPoints[1].x, roofPoints[1].y, z)}
          dimensions={frameDimensions}
          color={params.frameColor}
        />
      );
      
      // Правое стропило
      elements.push(
        <Beam
          key={`rafter-right-${i}`}
          start={new THREE.Vector3(roofPoints[1].x, roofPoints[1].y, z)}
          end={new THREE.Vector3(roofPoints[2].x-0.05, roofPoints[2].y-0.02, z)}
          dimensions={frameDimensions}
          color={params.frameColor}
        />
      );
      
      // Конек (соединяем с предыдущей точкой)
      if (i > 0) {
        elements.push(
          <Beam
            key={`ridge-${i}`}
            start={new THREE.Vector3(roofPoints[1].x, roofPoints[1].y, z-step)}
            end={new THREE.Vector3(roofPoints[1].x, roofPoints[1].y, z)}
            dimensions={frameDimensions}
            color={params.frameColor}
          />
        );
      }
    }
    
    return elements;
  }, [roofPoints, params, frameDimensions]);

// Покрытие крыши — с учётом реальной длины ската
const roofCover = useMemo(() => {
  const coverOffset = 0.03; // Поднятие над стропилами

  // Реальная длина ската (с учётом свеса и наклона)
  const halfWidthWithOverhang = (params.width + overhang * 2) / 2;
  const slopeLength = Math.sqrt(
    halfWidthWithOverhang ** 2 + (ridgeHeight - params.wallHeight) ** 2
  );

  // Центр по высоте ската
  const centerY = params.wallHeight + (ridgeHeight - params.wallHeight) / 2;

  return (
    <group>
      {/* Левый скат */}
      <mesh
        position={[
          -(params.width + overhang * 2) / 4, // X: 1/4 ширины (центр левого прямоугольника)
          centerY + coverOffset,
          0
        ]}
        rotation={[0, 0, angleRad]}
      >
        <boxGeometry
          args={[
            slopeLength+0.1,        // ✅ Реальная длина ската (по наклону)
            coverThickness,     // толщина
            params.length +0.2      // длина по Z
          ]}
        />
        <meshStandardMaterial
          color={params.coverColor}
          side={THREE.DoubleSide}
          transparent={params.coverMaterial !== 'glass'}
          opacity={params.coverMaterial === 'polycarbonate' ? 0.8 : 1}
        />
      </mesh>

      {/* Правый скат */}
      <mesh
        position={[
          (params.width + overhang * 2) / 4, // X: +1/4 ширины
          centerY + coverOffset,
          0
        ]}
        rotation={[0, 0, -angleRad]}
      >
        <boxGeometry
          args={[
            slopeLength+0.1,        // ✅ Та же длина ската
            coverThickness,
            params.length+0.2
          ]}
        />
        <meshStandardMaterial
          color={params.coverColor}
          side={THREE.DoubleSide}
          transparent={params.coverMaterial !== 'glass'}
          opacity={params.coverMaterial === 'polycarbonate' ? 0.8 : 1}
        />
      </mesh>
    </group>
  );
}, [params, ridgeHeight, angleRad, coverThickness, overhang]);


// Конек крыши в виде уголка (профлист)
const roofRidge = useMemo(() => {
  // Размеры уголка
  const flangeWidth = 0.1; // ширина полки уголка
  const thickness = 0.005; // толщина металла

  // Создаем Г-образное сечение для уголка
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0, flangeWidth);
  shape.lineTo(thickness, flangeWidth);
  shape.lineTo(thickness, thickness);
  shape.lineTo(flangeWidth, thickness);
  shape.lineTo(flangeWidth, 0);
  shape.lineTo(0, 0);

  // Длина конька (полная длина теплицы)
  const fullLength = params.length+0.2;

  // Настройки экструзии для конька
  const extrudeSettings = {
    steps: 1,
    depth: fullLength, // Полная длина теплицы
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  return (
    <group>
      {/* Конек */}
      <mesh
        position={[
          0, // X — центр
          ridgeHeight + coverThickness + 0.05, // Y — чуть выше конька
          -params.length / 2-0.1 // Z — начало конька совпадает с передней торцевой стенкой
        ]}
        rotation={[0, 0, 4]} // Поворот вокруг оси X на угол наклона кровли
      >
        <primitive object={geometry} />
        <meshStandardMaterial
          color="#cccccc"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}, [params.length, ridgeHeight, coverThickness]);

  // Боковые стенки (торцы) с поликарбонатом
  const endWalls = useMemo(() => {
    const wallThickness = 0.02;
    const wallHeight = params.wallHeight;
    const wallWidth = params.width + overhang * 2;

    // Создаем форму для торцевой стенки с учетом ската крыши
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-wallWidth/2, 0);

    wallShape.lineTo(0, ridgeHeight-2);

    wallShape.lineTo(wallWidth/2, 0);
    wallShape.lineTo(-wallWidth/2, 0);

    const extrudeSettings = {
      steps: 1,
      depth: wallThickness,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);

    return (
      <group>
        {/* Передняя торцевая стенка */}
        <mesh
          position={[0, 2.02, -params.length/2-0.025]}
          rotation={[0, Math.PI/1, 0]}
        >
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial
            color={params.coverColor}
            side={THREE.DoubleSide}
            transparent={params.coverMaterial !== 'glass'}
            opacity={params.coverMaterial === 'polycarbonate' ? 0.8 : 1}
          />
        </mesh>

        {/* Задняя торцевая стенка */}
        <mesh
          position={[0, 2.02, params.length/2+0.025]}
          rotation={[0, -Math.PI/1, 0]}
        >
          <primitive object={geometry} attach="geometry" />
          <meshStandardMaterial
            color={params.coverColor}
            side={THREE.DoubleSide}
            transparent={params.coverMaterial !== 'glass'}
            opacity={params.coverMaterial === 'polycarbonate' ? 0.8 : 1}
          />
        </mesh>
      </group>
    );
  }, [params, ridgeHeight]);

  return (
    <>
      {roofElements}
      {roofCover}
      {roofRidge}
      {endWalls}
    </>
  );
};

export default GableRoof;