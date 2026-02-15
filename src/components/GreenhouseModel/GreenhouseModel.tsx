import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import { HexColorPicker } from 'react-colorful';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import ErrorBoundary from '../ErrorBoundary';
import { GreenhouseParams, initialGreenhouseParams } from '../../types/GreenhouseTypes';
import GreenhouseControls from '../Controls/GreenhouseControls';
import { useAuth } from '../../hooks/useAuth';
import ArchedRoof from '../Greenhouse/ArchedRoof';
import GableRoof from '../Greenhouse/GableRoof';
import GreenhouseWalls from '../Greenhouse/GreenhouseWalls';
import GreenhouseFoundation from '../Greenhouse/GreenhouseFoundation';

interface MaterialPrices {
  material: number;
  work: number;
}

interface Prices {
  polycarbonate: MaterialPrices;
  glass: MaterialPrices;
  film: MaterialPrices;
  tube: {
    '100x100': number;
    '80x80': number;
    '60x60': number;
    '40x20': number;
  };
  foundation: {
    wood: MaterialPrices;
    concrete: MaterialPrices;
    piles: MaterialPrices;
    none: MaterialPrices;
  };
  screws: MaterialPrices;
  frame: {
    work: number;
  };
  painting: MaterialPrices;
  doors: MaterialPrices;
}

const prices: Prices = {
  polycarbonate: { material: 600, work: 400 },
  glass: { material: 1500, work: 700 },
  film: { material: 200, work: 100 },
  tube: {
    '100x100': 1200,
    '80x80': 900,
    '60x60': 700,
    '40x20': 500
  },
  foundation: {
    wood: { material: 2000, work: 1000 },
    concrete: { material: 3500, work: 1500 },
    piles: { material: 2500, work: 1200 },
    none: { material: 0, work: 0 }
  },
  screws: { material: 10, work: 0.5 },
  frame: { work: 800 },
  painting: { material: 200, work: 100 },
  doors: { material: 5000, work: 2000 }
};


// Стилизованные компоненты с адаптацией для мобильных устройств
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

// Компонент Ground с улучшенной типизацией
const Ground = ({ groundType = 'grass' }: { groundType?: 'grass' | 'wood' | 'concrete' }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    let groundTexture: THREE.Texture;
    
    if (groundType === 'grass') {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
      );
    } else if (groundType === 'wood') {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/hardwood2_diffuse.jpg'
      );
    } else {
      groundTexture = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
      );
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

// Функция для расчета стоимости теплицы
const calculateGreenhouseCost = (params: GreenhouseParams) => {
  // Проверка существования материала в prices
  const coverMaterial = params.coverMaterial;
  if (!(coverMaterial in prices)) {
    throw new Error(`Unknown cover material: ${coverMaterial}`);
  }
  const coverPrices = prices[coverMaterial];

  // Расчет площади покрытия
  const coverArea = params.width * params.length * (params.type === 'gable' ? 1.2 : 1);
  
  // Расчет длины каркаса
  const frameLength = (params.width * 2 + params.length * 2) * params.height;
  
  // Расчет стоимости материалов
  const coverMaterialCost = coverArea * coverPrices.material;
  
  // Расчет стоимости каркаса
  const tubeSize = params.frameMaterial === 'metal' ? '40x20' : '60x60';
  const tubeCost = frameLength * prices.tube[tubeSize];
  
  // Расчет фундамента
  const foundationPerimeter = (params.length * 2) + (params.width * 2);
  const foundationType = params.foundationType;
  const foundationMaterialCost = foundationPerimeter * prices.foundation[foundationType].material;
  const foundationWorkCost = foundationPerimeter * prices.foundation[foundationType].work;
  
  // Дополнительные элементы (двери, крепеж)
  const screwCount = Math.ceil(coverArea * 8);
  const screwsMaterialCost = screwCount * prices.screws.material;
  const screwsWorkCost = screwCount * prices.screws.work;
  const doorsCost = params.hasDoors ? prices.doors.material : 0;
  const doorsWorkCost = params.hasDoors ? prices.doors.work : 0;
  
  // Монтажные работы
  const coverWorkCost = coverArea * coverPrices.work;
  const frameWorkCost = frameLength * prices.frame.work;
  const paintingCost = frameLength * (prices.painting.material + prices.painting.work);
  
  // Итоговые суммы
  const materialsCost = coverMaterialCost + tubeCost + foundationMaterialCost + screwsMaterialCost + doorsCost;
  const workCost = coverWorkCost + frameWorkCost + foundationWorkCost + screwsWorkCost + doorsWorkCost + paintingCost;
  const totalCost = materialsCost + workCost;

  return {
    coverMaterial: {
      name: 'Материал покрытия',
      cost: coverMaterialCost,

      details: `${coverArea.toFixed(1)} м² × ${coverPrices.material} ₽/м²`
    },
    frame: {
      name: 'Каркас',
      cost: tubeCost,
      details: `Трубы: ${frameLength.toFixed(1)} м × ${prices.tube[tubeSize]} ₽/м`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: `Периметр: ${foundationPerimeter.toFixed(1)} м × ${prices.foundation[params.foundationType].material} ₽/м`
    },
    additional: {
      name: 'Дополнительные элементы',
      cost: screwsMaterialCost + doorsCost,
      work: screwsWorkCost + doorsWorkCost,
      details: `Крепеж: ${screwCount} шт × ${prices.screws.material} ₽` + 
               (params.hasDoors ? `\nДвери: 1 × ${prices.doors.material} ₽` : '')
    },
    coverWork: {
      name: 'Монтаж покрытия',
      cost: coverWorkCost,
      details: `${coverArea.toFixed(1)} м² × ${prices[params.coverMaterial].work} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${frameLength.toFixed(1)} м × ${prices.frame.work} ₽/м`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${frameLength.toFixed(1)} м × ${prices.painting.material + prices.painting.work} ₽/м`
    },
    totalCost,
    frameLength,
    coverArea
  };
};

Modal.setAppElement('#root');

const GreenhouseModel: React.FC = () => {
  const isMounted = useRef(false);
  const isMobile = useIsMobile();
  const { currentUser, saveProject, logout } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');
  const initialParams = location.state?.projectParams || initialGreenhouseParams;
  
  const [params, setParams] = useState<GreenhouseParams>(initialParams);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  // Добавьте рядом с другими состояниями
  const [ventsOpen, setVentsOpen] = useState(false);
  
  const costData = calculateGreenhouseCost(params);

  useEffect(() => {
    try {
      if (params && params.width && params.length && params.height) {
        const calculatedCost = calculateGreenhouseCost(params);
        // Обновляем состояние, если нужно
      }
    } catch (error) {
      console.error('Ошибка расчета стоимости:', error);
    }
  }, [params]);

  // Загрузка проекта при наличии projectId
// В начале компонента, ПОСЛЕ вызова useAuth():
const { getUserProjects } = useAuth();

useEffect(() => {
  const loadProject = async () => {
    if (projectId && currentUser) {
      try {
        // useAuth() уже вызван выше, здесь просто используем функцию
        const projects = await getUserProjects();
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setParams(project.params);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      }
    }
  };
  
  loadProject();
}, [projectId, currentUser, getUserProjects]); // Добавьте getUserProjects в зависимости

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleParamChange = (name: keyof GreenhouseParams, value: any) => {
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
      await saveProject(projectName, params, 'greenhouse');
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
      if (!canvas) {
        console.error('Canvas не найден');
        return;
      }

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
            <title>Проект теплицы</title>
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
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
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
          placeholder="Например: Теплица для овощей"
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
            fontSize: '15px',
            transition: 'background 0.2s'
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
            transition: 'opacity 0.2s',
            opacity: !projectName.trim() ? 0.6 : 1
          }}
        >
          Сохранить
        </button>
      </div>
    </Modal>
  );

  const PrintComponent = React.forwardRef<HTMLDivElement>((_, ref) => {
    return (
      <PrintContainer ref={ref}>
        <PrintHeader>Детальный расчет стоимости теплицы</PrintHeader>
        
        {screenshot && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img 
              src={screenshot} 
              alt="3D модель теплицы"
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
          <p>Тип: {params.type === 'arched' ? 'Арочная' : 'Двухскатная'}</p>
          <p>Материал покрытия: {params.coverMaterial === 'polycarbonate' ? 'Поликарбонат' : 'Стекло'}</p>
          <p>Фундамент: {params.foundationType === 'wood' ? 'Деревянный' : 
                         params.foundationType === 'concrete' ? 'Бетонный' : 'Свайный'}</p>
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
              <PrintTableCell>{costData.coverMaterial.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.coverMaterial.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costData.coverMaterial.details}</PrintTableCell>
            </PrintTableRow>
            
            <PrintTableRow>
              <PrintTableCell>{costData.frame.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.frame.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costData.frame.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.foundation.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.foundation.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.foundation.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.foundation.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.additional.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costData.additional.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costData.additional.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costData.additional.details}</pre>
              </PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.coverWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.coverWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.coverWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.frameWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.frameWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.frameWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costData.painting.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costData.painting.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costData.painting.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTotalRow>
              <PrintTableCell colSpan={2}>Итого материалы: {Math.round(
                costData.coverMaterial.cost + 
                costData.frame.cost + 
                costData.foundation.cost + 
                costData.additional.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell colSpan={2}>Итого работы: {Math.round(
                costData.foundation.work + 
                costData.additional.work + 
                costData.coverWork.cost + 
                costData.frameWork.cost + 
                costData.painting.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
            <PrintTotalRow>
              <PrintTableCell colSpan={4}>Общая стоимость: {Math.round(costData.totalCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
          </tbody>
        </PrintTable>
      </PrintContainer>
    );
  });

  return (
    <Container $isMobile={isMobile}>
      <ControlsPanel $isMobile={isMobile}>
		<GreenhouseControls 
		  params={params} 
		  onChange={handleParamChange}
		  ventsOpen={ventsOpen}
		  setVentsOpen={setVentsOpen}
		/>
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
            onCreated={({ scene }) => { sceneRef.current = scene }}
          >
            <Sky distance={10000} sunPosition={[10, 20, 10]} />
            <Ground groundType={params.groundType} />
            <ambientLight intensity={0.5} />
            <pointLight 
              position={[params.width * 2, params.height * 3, params.length * 2]} 
              intensity={1}
              castShadow
            />
            
            {params.type === 'arched' && <ArchedRoof params={params} />}
            {params.type === 'gable' && <GableRoof params={params} />}
			<GreenhouseWalls 
			  params={params} 
			  doorsOpen={doorsOpen} 
			  setDoorsOpen={setDoorsOpen}
			  ventsOpen={ventsOpen}
			/>
            
            
            <OrbitControls
              minDistance={Math.max(params.width, params.length) * 0.8}
              maxDistance={Math.max(params.width, params.length) * 3}
              enablePan={!isMobile}
              target={[0, params.height / 2, 0]}
            />
          </Canvas>
        </ErrorBoundary>



		<div style={{
		  position: 'absolute',
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
			onClick={() => setDoorsOpen(!doorsOpen)}
			style={{
			  padding: '12px 18px',
			  backgroundColor: '#f39c12',
			  color: 'white',
			  border: 'none',
			  borderRadius: '6px',
			  cursor: 'pointer',
			  fontSize: '15px',
			  fontWeight: 500,
			  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
			}}
		  >
			{doorsOpen ? 'Закрыть двери' : 'Открыть двери'}
		  </button>

			<button 
			  onClick={() => setVentsOpen(!ventsOpen)}
			  style={{
				padding: '12px 18px',
				backgroundColor: '#9b59b6',
				color: 'white',
				border: 'none',
				borderRadius: '6px',
				cursor: 'pointer',
				fontSize: '15px',
				fontWeight: 500,
				boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
			  }}
			>
			  {ventsOpen ? 'Закрыть форточки' : 'Открыть форточки'}
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
			  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
			  marginTop: '10px'
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
			  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
			  marginTop: '10px'
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

export default React.memo(GreenhouseModel);