import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '../../hooks/useAuth';
import GazeboControls from '../Controls/GazeboControls';
import GableRoof from '../Gazebo/GableRoof';
import ArchedRoof from '../Gazebo/ArchedRoof';
import SingleSlopeRoof from '../Gazebo/SingleSlopeRoof';
import GazeboWalls from '../Gazebo/GazeboWalls';
import GazeboFoundation from '../Gazebo/GazeboFoundation';
import GazeboFurniture from '../Gazebo/GazeboFurniture';
// Импортируем тип и начальные параметры из единого места
import { GazeboParams, initialGazeboParams } from '../../types/gazeboTypes';



// Цены для расчета стоимости
interface MaterialPrices {
  material: number;
  work: number;
}

interface Prices {
  wood: MaterialPrices;
  metal: MaterialPrices;
  combined: MaterialPrices;
  tile: { material: number; work: number };
  concrete: MaterialPrices;
  none: MaterialPrices;     
  foundation: {
    wood: MaterialPrices;
    concrete: MaterialPrices;
    piles: MaterialPrices;
    none: MaterialPrices;
  };
  furniture: {
    bench: number;
    table: { small: number; medium: number; large: number };
  };
  roofing: {
    shingles: number;
    metal: number;
    polycarbonate: number;
  };
}

const prices: Prices = {
  wood: { material: 1500, work: 800 },
  metal: { material: 1200, work: 600 },
  combined: { material: 1800, work: 1000 },
  tile: { material: 2000, work: 1000 },
  concrete: { material: 1800, work: 700 },
  none: { material: 0, work: 0 },  
  foundation: {
    wood: { material: 2500, work: 1200 },
    concrete: { material: 3500, work: 1500 },
    piles: { material: 3000, work: 1300 },
    none: { material: 0, work: 0 }
  },
  furniture: {
    bench: 3000,
    table: { small: 5000, medium: 7000, large: 9000 }
  },
  roofing: {
    shingles: 800,
    metal: 600,
    polycarbonate: 400
  }
};

// Стилизованные компоненты
const Container = styled.div<{ $isMobile: boolean }>`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  overflow: hidden;
`;

const ControlsPanel = styled.div<{ $isMobile: boolean }>`
  width: ${({ $isMobile }) => ($isMobile ? '100%' : '380px')};
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: ${({ $isMobile }) => ($isMobile ? 'none' : '2px 0 10px rgba(0,0,0,0.1)')};
  z-index: 10;
`;

const ModelView = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  position: relative;
  min-height: ${({ $isMobile }) => ($isMobile ? '60vh' : '100vh')};
  width: 100%;
  background: #f0f2f5;
`;

const PrintContainer = styled.div`
  padding: 20px;
  background: white;
  color: black;
`;

const PrintHeader = styled.h1`
  text-align: center;
  margin-bottom: 30px;
`;

const PrintTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`;

const PrintTableHeader = styled.th`
  text-align: left;
  padding: 8px;
  border-bottom: 2px solid #333;
`;

const PrintTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f8f8;
  }
`;

const PrintTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #ddd;
`;

const PrintTotalRow = styled.tr`
  font-weight: bold;
  background-color: #e8e8e8 !important;
`;

// Хук для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Компонент Ground – используем useThree корректно
const Ground = ({ groundType }: { groundType: 'grass' | 'wood' | 'concrete' }) => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    let groundTexture: THREE.Texture;

    const textureLoader = new THREE.TextureLoader();
    if (groundType === 'grass') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
    } else if (groundType === 'wood') {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg');
    } else {
      groundTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
    }

    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);

    const groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 1.0,
      metalness: 0.0
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    return () => {
      scene.remove(ground);
    };
  }, [groundType, scene]);

  return null;
};

// Функция расчета стоимости беседки
const calculateGazeboCost = (params: GazeboParams) => {
  const perimeter = (params.width + params.length) * 2;
  let roofArea = params.width * params.length;
  if (params.roofType === 'gable') roofArea *= 1.2;
  else if (params.roofType === 'arched') roofArea *= 1.3;

  const frameMaterialCost = perimeter * params.height * prices[params.materialType].material;
  const roofMaterialCost = roofArea * prices.roofing[params.materialType === 'wood' ? 'shingles' : 'metal'];

  const foundationPerimeter = perimeter;
  const foundationMaterialCost = foundationPerimeter * prices.foundation[params.foundationType].material;
  const foundationWorkCost = foundationPerimeter * prices.foundation[params.foundationType].work;

  const floorArea = params.width * params.length;
  const floorMaterialCost = floorArea * prices[params.floorType].material;
  const floorWorkCost = floorArea * prices[params.floorType].work;

  const furnitureMaterialCost =
    params.benchCount * prices.furniture.bench +
    prices.furniture.table[params.tableSize];
  const furnitureWorkCost = furnitureMaterialCost * 0.3;

  const materialsCost =
    frameMaterialCost +
    roofMaterialCost +
    foundationMaterialCost +
    floorMaterialCost +
    (params.hasFurniture ? furnitureMaterialCost : 0);
  const workCost =
    perimeter * params.height * prices[params.materialType].work +
    foundationWorkCost +
    floorWorkCost +
    (params.hasFurniture ? furnitureWorkCost : 0);
  const totalCost = materialsCost + workCost;

  return {
    frame: {
      name: 'Каркас беседки',
      cost: frameMaterialCost,
      details: `Периметр: ${perimeter.toFixed(1)} м × Высота: ${params.height.toFixed(1)} м × ${prices[params.materialType].material} ₽/м²`
    },
    roof: {
      name: 'Крыша',
      cost: roofMaterialCost,
      details: `${roofArea.toFixed(1)} м² × ${prices.roofing[params.materialType === 'wood' ? 'shingles' : 'metal']} ₽/м²`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: `Периметр: ${foundationPerimeter.toFixed(1)} м × ${prices.foundation[params.foundationType].material} ₽/м`
    },
    floor: {
      name: 'Пол',
      cost: floorMaterialCost,
      work: floorWorkCost,
      details: `${floorArea.toFixed(1)} м² × ${prices[params.floorType].material} ₽/м²`
    },
    furniture: {
      name: 'Мебель',
      cost: furnitureMaterialCost,
      work: furnitureWorkCost,
      details: `Скамейки: ${params.benchCount} × ${prices.furniture.bench} ₽\nСтол: 1 × ${prices.furniture.table[params.tableSize]} ₽`
    },
    totalCost,
    perimeter,
    roofArea,
    floorArea
  };
};

Modal.setAppElement('#root');

const GazeboModel: React.FC = () => {
  const isMounted = useRef(false);
  const isMobile = useIsMobile();
  const { currentUser, saveProject, logout, getUserProjects } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');

  const [params, setParams] = useState<GazeboParams>(initialGazeboParams);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const costData = calculateGazeboCost(params);

  // Загрузка проекта из БД
  useEffect(() => {
    const loadProject = async () => {
      if (projectId && currentUser) {
        try {
          const projects = await getUserProjects();
          const project = projects.find(p => p.id === projectId);
          if (project) setParams(project.params);
        } catch (error) {
          console.error('Error loading project:', error);
        }
      }
    };
    loadProject();
  }, [projectId, currentUser, getUserProjects]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleParamChange = (name: keyof GazeboParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProject = async () => {
    if (!currentUser) {
      alert('Для сохранения проекта необходимо войти в систему');
      navigate('/login');
      return;
    }
    if (!projectName.trim()) {
      alert('Пожалуйста, укажите название проекта');
      return;
    }
    try {
      await saveProject(projectName, params, 'gazebo');
      setProjectName('');
      setSaveModalOpen(false);
      alert('Проект успешно сохранен в вашем аккаунте!');
    } catch (error) {
      console.error('Ошибка при сохранении проекта:', error);
      alert('Не удалось сохранить проект. Попробуйте снова.');
    }
  };

  const handlePrint = async () => {
    setIsTakingScreenshot(true);
    try {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const canvas = canvasRef.current;
      if (!canvas) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(canvas, 0, 0);

      const screenshot = tempCanvas.toDataURL('image/jpeg', 0.9);
      setScreenshot(screenshot);

      await new Promise(resolve => setTimeout(resolve, 500));

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const printContent = printRef.current?.innerHTML;
      if (!printContent) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Проект беседки</title>
            <style>
              @page { size: A4; margin: 10mm; }
              body { font-family: Arial; padding: 20px; }
              img { max-width: 100%; height: auto; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              setTimeout(() => { window.print(); window.close(); }, 500);
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  const SaveProjectModal = () => (
    <Modal
      isOpen={saveModalOpen}
      onRequestClose={() => setSaveModalOpen(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        },
        content: {
          position: 'relative',
          inset: 'auto',
          width: '400px',
          maxWidth: '90%',
          padding: '25px',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Сохранение проекта</h2>
      <div style={{ margin: '25px 0' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500 }}>
          Название проекта:
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
          placeholder="Например: Деревянная беседка 3x3"
          autoFocus
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => setSaveModalOpen(false)}
          style={{
            padding: '10px 18px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSaveProject}
          disabled={!projectName.trim()}
          style={{
            padding: '10px 18px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '15px',
            opacity: !projectName.trim() ? 0.6 : 1
          }}
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );

  const PrintComponent = forwardRef<HTMLDivElement>((_, ref) => (
    <PrintContainer ref={ref}>
      <PrintHeader>Детальный расчет стоимости беседки</PrintHeader>
      {screenshot && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img
            src={screenshot}
            alt="3D модель беседки"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}
      <div>
        <h2>Основные параметры</h2>
        <p>Размеры: {params.width.toFixed(1)}м × {params.length.toFixed(1)}м × {params.height.toFixed(1)}м</p>
        <p>Тип крыши: {
          params.roofType === 'gable' ? 'Двухскатная' :
          params.roofType === 'arched' ? 'Арочная' : 'Односкатная'
        }</p>
        <p>Материал: {
          params.materialType === 'wood' ? 'Дерево' :
          params.materialType === 'metal' ? 'Металл' : 'Комбинированный'
        }</p>
        <p>Фундамент: {
          params.foundationType === 'wood' ? 'Деревянный' :
          params.foundationType === 'concrete' ? 'Бетонный' : 'Свайный'
        }</p>
        <p>Пол: {
          params.floorType === 'wood' ? 'Деревянный' :
          params.floorType === 'tile' ? 'Плитка' : 'Бетонный'
        }</p>
        <p>Мебель: {params.benchCount} скамеек, стол {params.tableSize}</p>
      </div>
      <PrintTable>
        <thead>
          <tr>
            <PrintTableHeader>Позиция</PrintTableHeader>
            <PrintTableHeader>Материалы</PrintTableHeader>
            <PrintTableHeader>Работы</PrintTableHeader>
            <PrintTableHeader>Детали</PrintTableHeader>
          </tr>
        </thead>
        <tbody>
          <PrintTableRow>
            <PrintTableCell>{costData.frame.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.frame.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>-</PrintTableCell>
            <PrintTableCell>{costData.frame.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.roof.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.roof.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>-</PrintTableCell>
            <PrintTableCell>{costData.roof.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.foundation.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.foundation.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{Math.round(costData.foundation.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{costData.foundation.details}</PrintTableCell>
          </PrintTableRow>
          <PrintTableRow>
            <PrintTableCell>{costData.floor.name}</PrintTableCell>
            <PrintTableCell>{Math.round(costData.floor.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{Math.round(costData.floor.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
            <PrintTableCell>{costData.floor.details}</PrintTableCell>
          </PrintTableRow>
          {params.hasFurniture && (
            <PrintTableRow>
              <PrintTableCell>{costData.furniture.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.furniture.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.furniture.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costData.furniture.details}</pre>
              </PrintTableCell>
            </PrintTableRow>
          )}
          <PrintTotalRow>
            <PrintTableCell colSpan={2}>
              Итого материалы: {Math.round(
                costData.frame.cost +
                costData.roof.cost +
                costData.foundation.cost +
                costData.floor.cost +
                (params.hasFurniture ? costData.furniture.cost : 0)
              ).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
            <PrintTableCell colSpan={2}>
              Итого работы: {Math.round(
                costData.foundation.work +
                costData.floor.work +
                (params.hasFurniture ? costData.furniture.work : 0)
              ).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
          </PrintTotalRow>
          <PrintTotalRow>
            <PrintTableCell colSpan={4}>
              Общая стоимость: {Math.round(costData.totalCost).toLocaleString('ru-RU')} ₽
            </PrintTableCell>
          </PrintTotalRow>
        </tbody>
      </PrintTable>
    </PrintContainer>
  ));

  return (
    <Container $isMobile={isMobile}>
      <ControlsPanel $isMobile={isMobile}>
        <GazeboControls params={params} onChange={handleParamChange} />
      </ControlsPanel>

      <ModelView $isMobile={isMobile}>
        <ErrorBoundary>
          <Canvas
            shadows
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            camera={{
              position: [
                params.width * (isMobile ? 1.2 : 1.5),
                params.height * (isMobile ? 1.0 : 1.2),
                params.length * (isMobile ? 1.2 : 1.5)
              ],
              fov: isMobile ? 60 : 50,
              near: 0.1,
              far: 1000
            }}
            onCreated={({ scene }) => { sceneRef.current = scene; }}
          >
            <Sky distance={10000} sunPosition={[10, 20, 10]} />
            <Ground groundType={params.groundType} />
            <ambientLight intensity={0.5} />
            <pointLight
              position={[params.width * 2, params.height * 3, params.length * 2]}
              intensity={1}
              castShadow
            />

            <GazeboWalls params={params} />

            {/* Двухскатная крыша */}
            {params.roofType === 'gable' && (
              <GableRoof
                params={{
                  width: params.width,
                  length: params.length,
                  height: params.height,
                  roofHeight: params.roofHeight,
                  roofColor: params.roofColor,
                  color: params.color,                // ✅ добавлено
                  materialType: params.materialType,
                  overhang: params.overhang,          // ✅ теперь существует
                }}
              />
            )}

            {/* Арочная крыша */}
            {params.roofType === 'arched' && (
              <ArchedRoof
                params={{
                  ...params,
                  frameColor: params.color,
                  roofColor: params.roofColor
                }}
              />
            )}

            {/* Односкатная крыша */}
			{params.roofType === 'single' && (
			  <SingleSlopeRoof
				params={{
				  width: params.width,
				  length: params.length,
				  height: params.height,
				  roofHeight: params.roofHeight,
				  roofColor: params.roofColor,
				  materialType: params.materialType === 'combined' ? 'wood' : params.materialType,
				  overhang: params.overhang,
				}}
			  />
			)}
            <GazeboFoundation params={params} />
            {params.hasFurniture && <GazeboFurniture params={params} />}

            <OrbitControls
              minDistance={Math.max(params.width, params.length) * 0.8}
              maxDistance={Math.max(params.width, params.length) * 3}
              enablePan={!isMobile}
              target={[0, params.height / 2, 0]}
            />
          </Canvas>
        </ErrorBoundary>

        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 100
        }}>
          <button
            onClick={() => setIsCostModalOpen(true)}
            style={{
              padding: '12px 18px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Детальный расчет
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            style={{
              padding: '12px 18px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Сохранить проект
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 18px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            В личный кабинет
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              padding: '12px 18px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 500,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            Выйти
          </button>
        </div>
      </ModelView>

      <SaveProjectModal />

      <Modal
        isOpen={isCostModalOpen}
        onRequestClose={() => setIsCostModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          },
          content: {
            position: 'relative',
            inset: 'auto',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: '8px',
            padding: '0',
            border: 'none'
          }
        }}
      >
        <div ref={printRef}>
          <PrintComponent />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Печать
          </button>
          <button
            onClick={() => setIsCostModalOpen(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Закрыть
          </button>
        </div>
      </Modal>
    </Container>
  );
};

export default React.memo(GazeboModel);