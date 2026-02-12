import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CanopyParams } from '../../types/types';
import Beam from '../Beams/Beam';
import { Html } from '@react-three/drei';

// Интерфейс для расчета материалов
interface MaterialCalculation {
  concrete: number; // м³
  rebar: number;    // кг
  sand: number;     // м³
  gravel: number;   // м³
  insulation: number; // м²
  waterproofing: number; // м²
}

const Foundations: React.FC<{ params: CanopyParams & {
  hasInsulation?: boolean;
  doubleRebar?: boolean;
  showMaterialInfo?: boolean;
} }> = ({ params }) => {
  // Расчет материалов для плитного фундамента
  const calculateMaterials = useMemo((): MaterialCalculation => {
    const slabWidth = params.width + params.slabExtension * 2;
    const slabLength = params.length + params.slabExtension * 2;
    const slabThickness = params.slabThickness / 1000; // convert mm to meters
    
    // Объем бетона (м³)
    const concreteVolume = slabWidth * slabLength * slabThickness;
    
    // Расчет арматуры (кг)
    const rebarLengthX = Math.ceil(slabWidth / (params.rebarSpacing / 1000)) + 1;
    const rebarLengthZ = Math.ceil(slabLength / (params.rebarSpacing / 1000)) + 1;
    const totalRebarLength = (rebarLengthX * slabLength) + (rebarLengthZ * slabWidth);
    const rebarWeight = totalRebarLength * (Math.PI * Math.pow(params.rebarDiameter / 1000 / 2, 2)) * 7850; // плотность стали 7850 кг/м³
    
    // Расчет подушки (песок + щебень)
    const sandVolume = slabWidth * slabLength * 0.2; // 20 см песка
    const gravelVolume = slabWidth * slabLength * 0.1; // 10 см щебня
    
    // Гидроизоляция и утеплитель
    const insulationArea = slabWidth * slabLength;
    const waterproofingArea = slabWidth * slabLength;
    
    return {
      concrete: parseFloat(concreteVolume.toFixed(2)),
      rebar: parseFloat(rebarWeight.toFixed(1)),
      sand: parseFloat(sandVolume.toFixed(2)),
      gravel: parseFloat(gravelVolume.toFixed(2)),
      insulation: parseFloat(insulationArea.toFixed(1)),
      waterproofing: parseFloat(waterproofingArea.toFixed(1))
    };
  }, [params]);

  // Отрисовка слоев плитного фундамента
  const renderSlabLayers = () => {
    const slabWidth = params.width + params.slabExtension * 2;
    const slabLength = params.length + params.slabExtension * 2;
    const slabThickness = params.slabThickness / 1000;
    
    // Высота каждого слоя
    const layers = {
      concrete: slabThickness,
      insulation: 0.05, // 5 см утеплителя
      waterproofing: 0.005, // 5 мм гидроизоляции
      gravel: 0.1, // 10 см щебня
      sand: 0.2, // 20 см песка
      ground: 0.5 // грунт для визуализации
    };
    
    // Позиционируем слои снизу вверх
    const baseY = -layers.ground - layers.sand - layers.gravel - layers.waterproofing - layers.insulation - layers.concrete;
    
    return (
      <group>
        {/* Грунт (основание) */}
        <mesh position={[0, baseY + layers.ground/2, 0]}>
          <boxGeometry args={[slabWidth * 1.5, layers.ground, slabLength * 1.5]} />
          <meshStandardMaterial 
            color="#5a3a1e" 
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        
        {/* Песчаная подушка */}
        <mesh position={[0, baseY + layers.ground + layers.sand/2, 0]}>
          <boxGeometry args={[slabWidth * 1.2, layers.sand, slabLength * 1.2]} />
          <meshStandardMaterial 
            color="#e0c060" 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
        
        {/* Щебеночная подготовка */}
        <mesh position={[0, baseY + layers.ground + layers.sand + layers.gravel/2, 0]}>
          <boxGeometry args={[slabWidth, layers.gravel, slabLength]} />
          <meshStandardMaterial 
            color="#888888" 
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
        
        {/* Гидроизоляция */}
        <mesh position={[0, baseY + layers.ground + layers.sand + layers.gravel + layers.waterproofing/2, 0]}>
          <boxGeometry args={[slabWidth, layers.waterproofing, slabLength]} />
          <meshStandardMaterial 
            color="#333333" 
            roughness={0.3}
            metalness={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Утеплитель (если требуется) */}
        {params.hasInsulation && (
          <mesh position={[0, baseY + layers.ground + layers.sand + layers.gravel + layers.waterproofing + layers.insulation/2, 0]}>
            <boxGeometry args={[slabWidth, layers.insulation, slabLength]} />
            <meshStandardMaterial 
              color="#f0f0f0" 
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        )}
      </group>
    );
  };

  const pillarPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const step = params.length / (params.pillarCount - 1);
    for (let i = 0; i < params.pillarCount; i++) {
      const zPos = -params.length/2 + (i * step);
      positions.push(
        new THREE.Vector3(-params.width/2, 0, zPos),
        new THREE.Vector3(params.width/2, 0, zPos)
      );
    }
    return positions;
  }, [params.width, params.length, params.pillarCount]);

  // Текстура кирпича
  const brickTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load(
      'https://threejs.org/examples/textures/brick_diffuse.jpg'
    );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);


  // Текстура окна
const windowTexture = useMemo(() => {
  const texture = new THREE.TextureLoader().load('/textures/window1-379bd309.png');
  texture.colorSpace = THREE.SRGBColorSpace; // Заменяем encoding на colorSpace
  texture.anisotropy = 4;
  return texture;
}, []);
  


// Затем обновите функцию renderWindow для использования текстуры
const renderWindow = (x: number, y: number, z: number, width: number, height: number) => {
  const wallThickness = 0.2;
  
  return (
    <group position={[x, y, z]}>
      {/* Проём в стене */}
      <mesh position={[0, 0, wallThickness/4-0.13]}>
        <boxGeometry args={[width + 0.1, height + 0.1, wallThickness]} />
        <meshStandardMaterial 
          color="#aaaaaa" 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Окно с текстурой */}
      <mesh position={[0, 0, wallThickness - 0.15]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          map={windowTexture}
          transparent={true}
          side={THREE.DoubleSide}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      
      {/* Водоотлив */}
      <mesh position={[0, -height/2 + 0.05, wallThickness - 0.1]}>
        <boxGeometry args={[width + 0.1, 0.05, 0.25]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} metalness={0.7} />
      </mesh>
      
      {/* Подоконник внутри */}
      <mesh position={[0, -height/2 + 0.05, wallThickness - 0.4]}>
        <boxGeometry args={[width + 0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
      </mesh>
      
      {/* Шторы (опционально) */}
      {params.showWindowDetails && (
        <mesh position={[0, 0, wallThickness - 0.42]}>
          <planeGeometry args={[width * 0.9, height * 0.8]} />
          <meshStandardMaterial 
            color={Math.random() > 0.5 ? "#f5f5dc" : "#fffacd"} 
            side={THREE.DoubleSide} 
            roughness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
};

  // Функция для рендера забора
  const renderFence = () => {
    if (!params.showFence) return null;

    const fencePosts = [];
    const fenceLength = 15;
    const postCount = 10;
    
    for (let i = 0; i < postCount; i++) {
      const xPos = -fenceLength/2 + (i * fenceLength/(postCount-1));
      
      // Столбы забора
      fencePosts.push(
        <mesh key={`post-${i}`} position={[xPos, 0.5, -3]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </mesh>
      );
      
      // Поперечины забора
      if (i > 0) {
        fencePosts.push(
          <mesh key={`rail-${i}`} position={[xPos - fenceLength/(postCount-1)/2, 0.8, -3]}>
            <boxGeometry args={[fenceLength/(postCount-1), 0.03, 0.03]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>,
          <mesh key={`rail-bottom-${i}`} position={[xPos - fenceLength/(postCount-1)/2, 0.2, -3]}>
            <boxGeometry args={[fenceLength/(postCount-1), 0.03, 0.03]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
        );
      }
    }
    
    return <group>{fencePosts}</group>;
  };

  // Рендер фонового дома
  const renderHouse = () => {
    if (!params.showBackgroundHouse) return null;

    return (
      <group position={[0, 0, -params.length - 5]} receiveShadow castShadow>
        {/* Основное здание с текстурой кирпича */}
        <mesh position={[0, 3, 5]} castShadow>
          <boxGeometry args={[8, 6, 6]} />
          <meshStandardMaterial 
            map={brickTexture}
            roughness={0.7} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Крыша */}
        <mesh position={[0, 6.5, 5]} rotation={[0, -3.925, 0]} castShadow>
          <coneGeometry args={[6, 1, 4.6]} />
          <meshStandardMaterial 
            color="#8b4513" 
            roughness={0.8} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Дверь */}
        <mesh position={[0, 1, 8.01]} castShadow>
          <boxGeometry args={[2, 2.5, 0.1]} />
          <meshStandardMaterial 
            color="#5a3a1e" 
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[0, 1, -2.55]} castShadow>
          <boxGeometry args={[2, 2.5, 0.1]} />
          <meshStandardMaterial 
            color="#5a3a1e" 
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        
        {/* Окна с рамами */}
        {renderWindow(-2, 4.5, 8.01, 2, 1.5)}
        {renderWindow(2, 4.5, 8.01, 2, 1.5)}
        {renderWindow(-2, 1.5, 8.01, 1.8, 1)}
        {renderWindow(2, 1.5, 8.01, 1.8, 1)}
        
        {/* Тротуар перед домом */}
        <mesh position={[0, 0, 1.5]} rotation={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[10, 0.1, 3]} />
          <meshStandardMaterial 
            color="#aaaaaa" 
            roughness={0.8} 
            metalness={0.1}
          />
        </mesh>

        {/* Забор */}
        {renderFence()}
      </group>
    );
  };

  // Рендер фонового гаража (альтернатива дому)
  const renderGarage = () => {
    if (!params.showBackgroundGarage) return null;

    return (
      <group position={[0, 0, -params.length - 5]}>
        {/* Основное здание гаража */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[6, 4, 5]} />
          <meshStandardMaterial color="#c0c0c0" roughness={0.7} />
        </mesh>
        
        {/* Крыша гаража */}
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[6.5, 0.5, 5.5]} />
          <meshStandardMaterial color="#555555" roughness={0.8} />
        </mesh>
        
        {/* Ворота гаража */}
        <mesh position={[0, 2, 2.51]}>
          <boxGeometry args={[4, 3, 0.1]} />
          <meshStandardMaterial color="#333333" roughness={0.6} metalness={0.4} />
        </mesh>
        
        {/* Асфальт перед гаражом */}
        <mesh position={[0, 0, 1.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[8, 0.1, 3]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
        </mesh>
      </group>
    );
  };

  // Упрощенная брусчатка без текстур
  const renderPaving = () => {
    if (!params.showPaving) return null;
    
    const tileSize = 0.2;
    const tileHeight = 0.05;
    const gapSize = 0.03;
    const areaWidth = params.width + 2;
    const areaLength = params.length + 2;
    const tilesX = Math.floor(areaWidth / (tileSize + gapSize));
    const tilesZ = Math.floor(areaLength / (tileSize + gapSize));
    const borderWidth = 0.15;
    const borderHeight = tileHeight + 0.05; // Бордюр выше плитки на 5см

    // Палитра цветов
    const colorPalettes = {
      red: ['#c45c5c', '#d67d7d', '#b34a4a'],
      gray: ['#aaaaaa', '#bbbbbb', '#999999'],
      yellow: ['#e0c060', '#f0d070', '#d0b050']
    };

    // Цвета материалов
    const borderColor = '#95500c';
    const gapColor = '#222222';

    // Функции генерации
    const getRandomShape = () => {
      const shapes = [
        { width: tileSize, depth: tileSize },
        { width: tileSize * 0.9, depth: tileSize * 1.1 },
        { width: tileSize * 1.1, depth: tileSize * 0.9 },
        { width: tileSize * 0.8, depth: tileSize * 0.8 },
        { width: tileSize * 1.2, depth: tileSize * 1.2 }
      ];
      return shapes[Math.floor(Math.random() * shapes.length)];
    };

    return (
      <group position={[0, -tileHeight/2 - 0.01, 0]}>
        {/* Основание */}
        <mesh position={[0, -0.015, 0]}>
          <boxGeometry args={[areaWidth, 0.03, areaLength]} />
          <meshStandardMaterial color={gapColor} roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Бордюры (3 стороны) */}
        {/* Задний бордюр */}
        <mesh position={[0, borderHeight/2 - 0.01, -areaLength/2 + borderWidth/2]}>
          <boxGeometry args={[areaWidth, borderHeight, borderWidth]} />
          <meshStandardMaterial color={borderColor} roughness={0.7} metalness={0.2} />
        </mesh>
        
        {/* Боковые бордюры */}
        <mesh position={[areaWidth/2 - borderWidth/2, borderHeight/2 - 0.01, -borderWidth/2]}>
          <boxGeometry args={[borderWidth, borderHeight, areaLength - borderWidth]} />
          <meshStandardMaterial color={borderColor} roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[-areaWidth/2 + borderWidth/2, borderHeight/2 - 0.01, -borderWidth/2]}>
          <boxGeometry args={[borderWidth, borderHeight, areaLength - borderWidth]} />
          <meshStandardMaterial color={borderColor} roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Плитки брусчатки */}
        {Array.from({ length: tilesX }).map((_, i) => (
          Array.from({ length: tilesZ }).map((_, j) => {
            const shape = getRandomShape();
            const xPos = -areaWidth/2 + borderWidth + (i * (tileSize + gapSize)) + shape.width/2;
            const zPos = -areaLength/2 + borderWidth + (j * (tileSize + gapSize)) + shape.depth/2;
            
            // Пропускаем плитки в зоне бордюров
            if (zPos < -areaLength/2 + borderWidth || 
                xPos < -areaWidth/2 + borderWidth || 
                xPos > areaWidth/2 - borderWidth) {
              return null;
            }

            const heightVariation = (Math.random() - 0.5) * 0.01;
            const rotation = (Math.random() - 0.5) * Math.PI / 12;
            const palette = colorPalettes[params.pavingColor];
            const color = palette[Math.floor(Math.random() * palette.length)];
            const roughness = 0.7 + Math.random() * 0.3;

            return (
              <mesh
                key={`paving-${i}-${j}`}
                position={[xPos, heightVariation, zPos]}
                rotation={[0, rotation, 0]}
              >
                <boxGeometry args={[shape.width, tileHeight + heightVariation, shape.depth]} />
                <meshStandardMaterial color={color} roughness={roughness} metalness={0.1} />
              </mesh>
            );
          })
        ))}
      </group>
    );
  };



  // Генерация стаканов под стойки
  const renderPillarSockets = () => {
    return pillarPositions.map((pos, i) => (
      <group key={`socket-${i}`}>
        {/* Стакан под стойку */}
        <mesh 
          position={[pos.x, -0.1, pos.z]} 
          rotation={[0, 0, 0]}
        >
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial 
            color={0xffffff}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Анкерные болты */}
        {Array.from({ length: 4 }).map((_, j) => {
          const angle = (j * Math.PI) / 2;
          const xOffset = 0.1 * Math.cos(angle);
          const zOffset = 0.1 * Math.sin(angle);
          return (
            <mesh
              key={`bolt-${i}-${j}`}
              position={[
                pos.x + xOffset,
                -0.05,
                pos.z + zOffset
              ]}
              rotation={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
              <meshStandardMaterial 
                color="#ffffff"  // Ярко-белый цвет
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    ));
  };

  // Рендер бетонной плиты
  const renderSlabFoundation = () => {
    const slabWidth = params.width + params.slabExtension * 2;
    const slabLength = params.length + params.slabExtension * 2;
    const slabThickness = params.slabThickness / 1000;

    return (
      <group>
        {/* Рендер слоев основания */}
        {renderSlabLayers()}
        
        {/* Бетонная плита */}
        <mesh position={[0, -slabThickness/2, 0]} receiveShadow>
          <boxGeometry args={[slabWidth, slabThickness, slabLength]} />
          <meshStandardMaterial 
            color={params.foundationColor}
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        {/* Арматурный каркас */}
        {Array.from({ length: Math.ceil(slabWidth / (params.rebarSpacing / 1000)) + 1 }).map((_, i) => {
          const xPos = -slabWidth/2 + i * (params.rebarSpacing / 1000);
          return Array.from({ length: Math.ceil(slabLength / (params.rebarSpacing / 1000)) + 1 }).map((_, j) => {
            const zPos = -slabLength/2 + j * (params.rebarSpacing / 1000);
            return (
              <group key={`rebar-${i}-${j}`}>
                {/* Продольная арматура */}
                <mesh 
                  position={[xPos, -slabThickness/2, zPos]}
                  rotation={[Math.PI/2, 0, 0]}
                >
                  <cylinderGeometry 
                    args={[
                      params.rebarDiameter / 1000 / 2, 
                      params.rebarDiameter / 1000 / 2, 
                      slabThickness - 0.05, 
                      8
                    ]} 
                  />
                  <meshStandardMaterial 
                    color="#888888" 
                    metalness={0.7} 
                    roughness={0.3} 
                  />
                </mesh>
                
                {/* Поперечная арматура (если требуется) */}
                {params.doubleRebar && (
                  <mesh 
                    position={[xPos, -slabThickness/2, zPos]}
                    rotation={[0, Math.PI/2, Math.PI/2]}
                  >
                    <cylinderGeometry 
                      args={[
                        params.rebarDiameter / 1000 / 2, 
                        params.rebarDiameter / 1000 / 2, 
                        slabWidth - 0.05, 
                        8
                      ]} 
                    />
                    <meshStandardMaterial 
                      color="#888888" 
                      metalness={0.7} 
                      roughness={0.3} 
                    />
                  </mesh>
                )}
              </group>
            );
          });
        })}
      </group>
    );
  };

  // Добавляем отображение расчета материалов в UI


const renderMaterialInfo = () => {
  if (params.foundationType !== 'slab' || !params.showMaterialInfo) return null;
  
  const materials = calculateMaterials;
  
  return (
    <Html>
      <div style={{
        position: 'fixed',
        top: '-320px', // Изменено с bottom на top
        right: '-500px', // Изменено с left на right
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        maxWidth: '300px',
        zIndex: 100
      }}>
        <h3>Расход материалов:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>Бетон: {materials.concrete} м³</li>
          <li>Арматура: {materials.rebar} кг (Ø{params.rebarDiameter}мм)</li>
          <li>Песок: {materials.sand} м³</li>
          <li>Щебень: {materials.gravel} м³</li>
          {params.hasInsulation && <li>Утеплитель: {materials.insulation} м²</li>}
          <li>Гидроизоляция: {materials.waterproofing} м²</li>
        </ul>
      </div>
    </Html>
  );
};

  return (
    <>
      {params.foundationType === 'slab' && renderSlabFoundation()}
      {params.foundationType === 'pillars' && (
        <>
          {pillarPositions.map((pos, i) => (
            <group key={`foundation-${i}`}>
              <mesh position={[pos.x, -0.2, pos.z]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.4]} />
                <meshStandardMaterial 
                  color={params.foundationColor}
                  roughness={0.7}
                  metalness={0.2}
                />
              </mesh>
            </group>
          ))}
        </>
      )}
      {params.foundationType === 'surface' && (
        <>
          {renderPillarSockets()}
          {renderPaving()}
        </>
      )}
      
      {renderHouse()}
      {renderGarage()}
      {renderMaterialInfo()}
    </>
  );
};

export default Foundations;