import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';
import Modal from 'react-modal';
import { HexColorPicker } from 'react-colorful';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import ErrorBoundary from '../ErrorBoundary';
import MainControls from '../Controls/MainControls';
import ConstructionControls from '../Controls/ConstructionControls';
import TubeControls from '../Controls/TubeControls';
import AppearanceControls from '../Controls/AppearanceControls';
import FoundationControls from '../Controls/FoundationControls';
import { CanopyParams } from '../../types/types';
import Pillars from '../Beams/Pillars';
import Foundations from '../Foundations/Foundations';
import Trusses from '../Beams/Trusses';
import Lathing from '../Beams/Lathing';
import RoofCover from '../Roof/RoofCover';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';


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

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.5rem;
`;

const ControlSection = styled.div`
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #34495e;
  font-weight: 500;
  font-size: 1.1rem;
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

const PrintSection = styled.div`
  margin-bottom: 20px;
  page-break-inside: avoid;
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

const BackgroundControls = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
`;

const CustomCheckbox = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  width: 20px;
  height: 20px;
  background: ${props => props.checked ? '#3498db' : '#f8f9fa'};
  border: 2px solid ${props => props.checked ? '#3498db' : '#ccc'};
  border-radius: 4px;
  margin-right: 10px;
  transition: all 0.2s;

  &:after {
    content: ${props => props.checked ? '"✓"' : '""'};
    color: white;
    display: block;
    text-align: center;
    line-height: 18px;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #34495e;
  cursor: pointer;
  user-select: none;
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

// Компонент Ground
const Ground = ({ groundType }: { groundType: string }) => {
  const { scene } = useThree();

  useEffect(() => {
    const groundGeometry = new THREE.CircleGeometry(100, 32);
    const groundTexture = new THREE.TextureLoader().load(
      groundType === 'grass' 
        ? 'https://threejs.org/examples/textures/terrain/grasslight-big.jpg'
        : 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg'
    );
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

// Функция для расчета стоимости
const calculateCost = (params: CanopyParams) => {
  const prices = {
    metal: { material: 800, work: 500 },
    tile: { material: 1500, work: 700 },
    polycarbonate: { material: 600, work: 400 },
    tube: {
      '100x100': 1200,
      '80x80': 900,
      '60x60': 700,
      '40x20': 500
    },
    foundation: {
      pillars: { material: 2000, work: 1000 },
      slab: {
        material: 3500,
        formwork: 500,
        reinforcement: 120,
        sand: 800,
        gravel: 1000,
        insulation: 300,
        waterproofing: 200,
        work: 1500
      }
    },
    screws: { material: 10, work: 0.5 },
    frame: { work: 800 },
    painting: { material: 200, work: 100 }
  };

  const roofArea = params.width * params.length * (params.roofType === 'gable' ? 1.2 : 1);
  const frameArea = (params.width * params.height * 2) + (params.length * params.height * 2) + roofArea;
  const screwNorms = { polycarbonate: 6, metal: 8, tile: 10 };

  const roofMaterialCost = roofArea * prices[params.roofMaterial].material;
  const pillarLength = params.height * params.pillarCount * 4;
  const trussLength = params.width * params.trussCount * 2;
  const lathingLength = params.length * (params.width / params.lathingStep);
  
  const tubeCost = 
    pillarLength * prices.tube[params.pillarTubeSize] +
    trussLength * prices.tube[params.roofTubeSize] +
    trussLength * prices.tube[params.trussTubeSize] +
    lathingLength * prices.tube[params.lathingTubeSize];

  let foundationMaterialCost = 0;
  let foundationWorkCost = 0;
  let foundationDetails = '';
  
  if (params.foundationType === 'pillars') {
    foundationMaterialCost = params.pillarCount * 2 * prices.foundation.pillars.material;
    foundationWorkCost = params.pillarCount * 2 * prices.foundation.pillars.work;
    foundationDetails = `${params.pillarCount * 2} столбов`;
  } else if (params.foundationType === 'slab') {
    const slabWidth = params.width + params.slabExtension * 2;
    const slabLength = params.length + params.slabExtension * 2;
    const slabThickness = params.slabThickness / 1000;
    const slabVolume = slabWidth * slabLength * slabThickness;
    const slabArea = slabWidth * slabLength;

    const concreteCost = slabVolume * prices.foundation.slab.material;
    const rebarWeight = (slabWidth / (params.rebarSpacing / 1000)) * slabLength * 2 * 0.617;
    const rebarCost = rebarWeight * prices.foundation.slab.reinforcement;
    const sandVolume = slabWidth * slabLength * 0.2;
    const sandCost = sandVolume * prices.foundation.slab.sand;
    const gravelVolume = slabWidth * slabLength * 0.1;
    const gravelCost = gravelVolume * prices.foundation.slab.gravel;
    const formworkCost = (slabWidth + slabLength) * 2 * prices.foundation.slab.formwork;
    
    foundationMaterialCost = concreteCost + rebarCost + sandCost + gravelCost + formworkCost;
    
    const earthworkCost = slabArea * 300;
    const concreteWorkCost = slabVolume * prices.foundation.slab.work;
    
    foundationWorkCost = earthworkCost + concreteWorkCost;
    
    foundationDetails = `Плита: ${slabWidth.toFixed(1)}м × ${slabLength.toFixed(1)}м × ${slabThickness.toFixed(2)}м\nБетон: ${slabVolume.toFixed(1)}м³\nАрматура: ${rebarWeight.toFixed(0)}кг Ø${params.rebarDiameter}мм\nПесчаная подушка: ${sandVolume.toFixed(1)}м³\nЩебеночная подготовка: ${gravelVolume.toFixed(1)}м³\nОпалубка: ${((slabWidth + slabLength) * 2).toFixed(1)}м`;
  }

  const screwCount = Math.ceil(roofArea * screwNorms[params.roofMaterial]);
  const screwsMaterialCost = screwCount * prices.screws.material;
  const screwsWorkCost = screwCount * prices.screws.work;
  const roofWorkCost = roofArea * prices[params.roofMaterial].work;
  const frameWorkCost = frameArea * prices.frame.work;
  const paintingCost = frameArea * (prices.painting.material + prices.painting.work);
  const materialsCost = roofMaterialCost + tubeCost + foundationMaterialCost + screwsMaterialCost;
  const workCost = roofWorkCost + frameWorkCost + foundationWorkCost + screwsWorkCost + paintingCost;
  const totalCost = materialsCost + workCost;

  return {
    roofMaterial: {
      name: 'Материал кровли',
      cost: roofMaterialCost,
      details: `${roofArea.toFixed(1)} м² × ${prices[params.roofMaterial].material} ₽/м²`
    },
    tube: {
      name: 'Металлоконструкции',
      cost: tubeCost,
      details: `Трубы: ${pillarLength.toFixed(1)} м + ${trussLength.toFixed(1)} м + ${lathingLength.toFixed(1)} м`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationMaterialCost,
      work: foundationWorkCost,
      details: foundationDetails
    },
    screws: {
      name: 'Крепеж',
      cost: screwsMaterialCost,
      work: screwsWorkCost,
      details: `${screwCount} шт × ${prices.screws.material} ₽`
    },
    roofWork: {
      name: 'Монтаж кровли',
      cost: roofWorkCost,
      details: `${roofArea.toFixed(1)} м² × ${prices[params.roofMaterial].work} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${frameArea.toFixed(1)} м² × ${prices.frame.work} ₽/м²`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${frameArea.toFixed(1)} м² × ${prices.painting.material + prices.painting.work} ₽/м²`
    },
    totalCost,
    screwCount
  };
};

const exportToSTL = (scene: THREE.Scene) => {
  const exporter = new STLExporter();
  const result = exporter.parse(scene);
  const blob = new Blob([result], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'model.stl';
  link.click();
};

const PrintComponent = React.forwardRef<HTMLDivElement, {
  params: CanopyParams;
  costs: ReturnType<typeof calculateCost>;
  screenshot: string | null;
}>(({ params, costs, screenshot }, ref) => {
  return (
    <PrintContainer ref={ref}>
      <PrintHeader>"Giga-NT" - навесы и металлоконструкции</PrintHeader>
      
      {screenshot ? (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src={screenshot} 
            alt="3D модель" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'gray' }}>Изображение загружается...</div>
      )}

        
      <PrintSection>
        <h2>Основные параметры</h2>
        <p>Размеры: {params.width.toFixed(1)}м × {params.length.toFixed(1)}м × {(params.height + params.roofHeight).toFixed(1)}м</p>
        <p>Тип кровли: {params.roofType === 'gable' ? 'Двухскатная' : 'Односкатная'}</p>
        <p>Материал кровли: {params.roofMaterial === 'metal' ? 'Металл' : 'Поликарбонат'}</p>
        <p>Количество стоек: {params.pillarCount * 2}</p>
        <p>Количество ферм: {params.trussCount}</p>
      </PrintSection>

      <PrintSection>
        <h2>Расчет стоимости</h2>
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
              <PrintTableCell>{costs.roofMaterial.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.roofMaterial.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costs.roofMaterial.details}</PrintTableCell>
            </PrintTableRow>
            
            <PrintTableRow>
              <PrintTableCell>{costs.tube.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.tube.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{costs.tube.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.foundation.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.foundation.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costs.foundation.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{costs.foundation.details}</pre>
              </PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.screws.name}</PrintTableCell>
              <PrintTableCell>{Math.round(costs.screws.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{Math.round(costs.screws.work).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.screws.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.roofWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.roofWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.roofWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.frameWork.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.frameWork.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.frameWork.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTableRow>
              <PrintTableCell>{costs.painting.name}</PrintTableCell>
              <PrintTableCell>-</PrintTableCell>
              <PrintTableCell>{Math.round(costs.painting.cost).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell>{costs.painting.details}</PrintTableCell>
            </PrintTableRow>

            <PrintTotalRow>
              <PrintTableCell colSpan={2}>Итого материалы: {Math.round(
                costs.roofMaterial.cost + 
                costs.tube.cost + 
                costs.foundation.cost + 
                costs.screws.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
              <PrintTableCell colSpan={2}>Итого работы: {Math.round(
                costs.foundation.work + 
                costs.screws.work + 
                costs.roofWork.cost + 
                costs.frameWork.cost + 
                costs.painting.cost
              ).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
            <PrintTotalRow>
              <PrintTableCell colSpan={4}>Общая стоимость: {Math.round(costs.totalCost).toLocaleString('ru-RU')} ₽</PrintTableCell>
            </PrintTotalRow>
          </tbody>
        </PrintTable>
      </PrintSection>
    </PrintContainer>
  );
});

Modal.setAppElement('#root');

const FrameModel: React.FC = () => {
  const isMounted = useRef(false);
  const isMobile = useIsMobile();
  const { currentUser, saveProject, logout } = useAuth();
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('project');
  
  useEffect(() => {
    if (projectId && currentUser) {
      const project = currentUser.projects?.find((p: { id: string }) => p.id === projectId);
      if (project) {
        setParams(project.params);
      }
    }
  }, [projectId, currentUser]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [params, setParams] = useState<CanopyParams>({
    length: 6,
    width: 4,
    height: 3,
    roofHeight: 1,
    overhang: 0.3,
    pillarCount: 2,
    trussCount: 2,
    roofType: 'gable',
    trussType: 'simple',
    constructionType: 'truss',
    beamSize: 'medium',
    lathingStep: 0.5,
    showFoundations: true,
    materialType: 'metal',
    frameColor: '#4682B4',
    foundationColor: '#aaaaaa',
    roofMaterial: 'polycarbonate',
    roofColor: null,
    pillarTubeSize: '100x100',
    roofTubeSize: '80x80',
    trussTubeSize: '60x60',
    lathingTubeSize: '40x20',
    groundType: 'grass',
    showRidgeBeam: true,
    foundationType: 'pillars',
    slabThickness: 200,
    rebarRows: 2,
    showPaving: false,
    pavingColor: 'gray',
    slabExtension: 0.3,
    rebarDiameter: 12,
    rebarSpacing: 200,
    showBackgroundHouse: false,
    showBackgroundGarage: false,
    showFence: true,
    showWindowDetails: true,
    showScrews: false,
    screwColor: '#888888',
    metalColor: '#4682B4',
    hasInsulation: false,
    doubleRebar: false,
    showMaterialInfo: true
  });

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const costs = calculateCost(params);

  const handleExport = (format: string) => {
    if (!sceneRef.current) return;
    
    switch (format) {
      case 'stl':
        exportToSTL(sceneRef.current);
        break;
      default:
        alert('Формат не поддерживается');
    }
  };

const handlePrint = async () => {
  setIsTakingScreenshot(true);

  try {
    // Ждем завершения рендеринга Three.js
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Делаем скриншот canvas
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas не найден');
      return;
    }

    // Создаем временный canvas для гарантированного захвата
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    // Заливаем белым фоном (на случай прозрачности)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    // Конвертируем в Data URL (сжатый PNG)
    const screenshot = tempCanvas.toDataURL('image/jpeg', 0.9); // JPEG для уменьшения размера
    setScreenshot(screenshot);

    // Ждем обновления состояния React
    await new Promise(resolve => setTimeout(resolve, 500));

    // Открываем окно печати
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Копируем HTML для печати
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    // Вставляем стили и контент
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Проект навеса</title>
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
    // Рассчитываем стоимость перед сохранением
    const costs = calculateCost(params);
    
    // Создаем объект проекта с расчетами
    const projectData = {
      ...params,
      costCalculation: {
        materials: {
          roof: costs.roofMaterial.cost,
          frame: costs.tube.cost,
          foundation: costs.foundation.cost,
          fasteners: costs.screws.cost
        },
        works: {
          foundation: costs.foundation.work,
          roofInstallation: costs.roofWork.cost,
          frameAssembly: costs.frameWork.cost,
          painting: costs.painting.cost
        },
        totalMaterials: costs.roofMaterial.cost + costs.tube.cost + 
                       costs.foundation.cost + costs.screws.cost,
        totalWorks: costs.foundation.work + costs.roofWork.cost + 
                   costs.frameWork.cost + costs.painting.cost,
        totalAmount: costs.totalCost
      },
      totalAmount: costs.totalCost
    };

    await saveProject(projectName, projectData, 'canopy');
    setProjectName('');
    setSaveModalOpen(false);
    alert('Проект успешно сохранен в вашем аккаунте!');
  } catch (error) {
    console.error('Ошибка при сохранении проекта:', error);
    alert('Не удалось сохранить проект. Попробуйте снова.');
  }
};

  const handleParamChange = (name: keyof CanopyParams, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
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
          placeholder="Например: Навес для двоих авто"
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

  return (
    <Container $isMobile={isMobile}>
      <ControlsPanel $isMobile={isMobile}>
        <Title>Конструктор навеса</Title>
        
        <ControlSection>
          <SectionTitle>Основные параметры</SectionTitle>
          <MainControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Конструкция</SectionTitle>
          <ConstructionControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Размеры труб</SectionTitle>
          <TubeControls params={params} onChange={handleParamChange} />
        </ControlSection>

        <ControlSection>
          <SectionTitle>Внешний вид</SectionTitle>
          <AppearanceControls params={params} onChange={handleParamChange} />
        </ControlSection>

		<ControlSection>
		  <SectionTitle>Фундамент</SectionTitle>
		  <FoundationControls params={params} onChange={handleParamChange} />
		  <CheckboxContainer>
			<CustomCheckbox onClick={() => handleParamChange('showMaterialInfo', !params.showMaterialInfo)}>
			  <HiddenCheckbox 
				checked={params.showMaterialInfo}
				onChange={(e) => handleParamChange('showMaterialInfo', e.target.checked)}
			  />
			  <StyledCheckbox checked={params.showMaterialInfo || false} />
			  <CheckboxLabel>Показывать параметры плиты</CheckboxLabel>
			</CustomCheckbox>
		  </CheckboxContainer>
		</ControlSection>
		


        <ControlSection>
          <SectionTitle>Фон и окружение</SectionTitle>
          <BackgroundControls>
            <CheckboxContainer>
              <CustomCheckbox onClick={() => handleParamChange('showBackgroundHouse', !params.showBackgroundHouse)}>
                <HiddenCheckbox 
                  checked={params.showBackgroundHouse}
                  onChange={(e) => handleParamChange('showBackgroundHouse', e.target.checked)}
                />
                <StyledCheckbox checked={params.showBackgroundHouse} />
                <CheckboxLabel>Показать дом на фоне</CheckboxLabel>
              </CustomCheckbox>

              <CustomCheckbox onClick={() => handleParamChange('showBackgroundGarage', !params.showBackgroundGarage)}>
                <HiddenCheckbox 
                  checked={params.showBackgroundGarage}
                  onChange={(e) => handleParamChange('showBackgroundGarage', e.target.checked)}
                />
                <StyledCheckbox checked={params.showBackgroundGarage} />
                <CheckboxLabel>Показать гараж</CheckboxLabel>
              </CustomCheckbox>

              {params.showBackgroundHouse && (
                <>
                  <CustomCheckbox onClick={() => handleParamChange('showFence', !params.showFence)}>
                    <HiddenCheckbox 
                      checked={params.showFence}
                      onChange={(e) => handleParamChange('showFence', e.target.checked)}
                    />
                    <StyledCheckbox checked={params.showFence} />
                    <CheckboxLabel>Показать забор</CheckboxLabel>
                  </CustomCheckbox>
                  
                  <CustomCheckbox onClick={() => handleParamChange('showWindowDetails', !params.showWindowDetails)}>
                    <HiddenCheckbox 
                      checked={params.showWindowDetails}
                      onChange={(e) => handleParamChange('showWindowDetails', e.target.checked)}
                    />
                    <StyledCheckbox checked={params.showWindowDetails} />
                    <CheckboxLabel>Детали окон</CheckboxLabel>
                  </CustomCheckbox>
                </>
              )}
            </CheckboxContainer>
          </BackgroundControls>
        </ControlSection>
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
              fov: isMobile ? 60 : 50
            }}
            onCreated={({ scene }) => { sceneRef.current = scene }}
          >
            <Sky distance={10000} sunPosition={[10, 20, 10]} />
            <Ground groundType={params.groundType} />
            <ambientLight intensity={0.5} />
            <pointLight position={[params.width * 2, params.height * 3, params.length * 2]} intensity={1} />
            
            <Pillars params={params} />
            <Foundations params={params} />
            <Trusses params={params} />
            <Lathing params={params} />
            <RoofCover params={params} />
            
            <OrbitControls 
              minDistance={Math.max(params.width, params.length) * 0.8}
              maxDistance={Math.max(params.width, params.length) * 3}
              enablePan={!isMobile}
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
        contentLabel="Детали расчета стоимости"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            inset: 'auto',
            maxHeight: '90vh',
            width: '90%',
            maxWidth: '800px',
            overflow: 'auto',
            borderRadius: '8px',
            padding: '0',
            border: 'none'
          }
        }}
      >
        <div ref={printRef}>
          <PrintComponent 
            params={params} 
            costs={costs} 
            screenshot={screenshot}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px' }}>
          <button 
            onClick={handlePrint}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
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

export default React.memo(FrameModel);