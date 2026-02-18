import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import './UserDashboard.css';
import { Order } from '../types/types';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

interface CostItem {
  name: string;
  cost: number;
  work?: number;
  details: string;
}

interface CostCalculation {
  [key: string]: CostItem | null;
  totalCost: CostItem;
  screwCount: CostItem | null;
}

interface ProjectParams {
  width: number;
  length: number;
  height: number;
  [key: string]: any;
}

interface Project {
  id: string;
  name: string;
  type?: 'canopy' | 'greenhouse' | 'gazebo';
  createdAt: string | Date;
  params?: any;
}

interface GreenhouseCalculationParams {
  wallHeight: number;
  length: number;
  width: number;
  type: string;
  frameMaterial: string;
  coverMaterial: 'polycarbonate' | 'glass' | 'film';
  foundationType: 'wood' | 'metal' | 'concrete';
  trussCount: number;
  hasVentilation: boolean;
  hasDoors: boolean;
}

interface DeleteConfirmationModalProps {
  order: Order;
  onCancel: () => void;
  onConfirm: () => void;
}

interface Prices {
  polycarbonate: { material: number; work: number };
  glass: { material: number; work: number };
  film: { material: number; work: number };
  tube: {
    '40x20': number;
    '60x60': number;
    '80x80': number;
    '100x100': number;
  };
  foundation: {
    wood: { material: number; work: number };
    metal: { material: number; work: number };
    concrete: { material: number; work: number };
  };
  screws: { material: number; work: number };
  frame: { work: number };
  painting: { material: number; work: number };
  ventilation: { material: number; work: number };
  doors: { material: number; work: number };
}

interface GreenhouseParams {
  width: number;
  length: number;
  height: number;
  trussCount: number;
  wallHeight: number;
  type: 'arched' | 'gable';
  frameMaterial: 'metal' | 'pvc' | 'wood';
  coverMaterial: 'polycarbonate' | 'glass' | 'film';
  foundationType: 'none' | 'wood' | 'concrete' | 'piles';
  groundType: 'grass' | 'wood' | 'concrete';
  hasVentilation: boolean;
  hasDoors: boolean;
  color: string;
  frameColor: string;
  coverColor: string;
  roofColor?: string;
  wallColor?: string;
  archHeight: number;
  archSegments: number;
  roofAngle: number;
  partitionCount: number;
  shelving: boolean;
  postCount: number; 
  rafterCount: number; 
}

interface CanopyParams {
  length: number;
  width: number;
  height: number;
  roofHeight: number;
  overhang: number;
  pillarCount: number;
  trussCount: number;
  roofType: 'gable' | 'arch' | 'shed' | 'flat';
  trussType: 'simple' | 'reinforced' | 'lattice';
  constructionType: 'truss' | 'beam';
  beamSize: 'small' | 'medium' | 'large';
  lathingStep: number;
  materialType: 'metal' | 'wood' | 'plastic';
  frameColor: string;
  roofMaterial: 'polycarbonate' | 'metal' | 'tile';
  roofColor: string | null;
  groundType: 'grass' | 'concrete';
  showRidgeBeam: boolean;
  showFoundations: boolean;
  foundationType: 'pillars' | 'slab' | 'surface';
  foundationColor: string;
  slabThickness: number;
  rebarRows: number;
  showPaving: boolean;
  pavingColor: 'red' | 'gray' | 'yellow';
  slabExtension: number;
  rebarDiameter: number;
  rebarSpacing: number;
  showBackgroundHouse: boolean;
  showBackgroundGarage: boolean;
  showWindowDetails: boolean;
  showFence: boolean;
  showScrews?: boolean;
  screwColor?: string;
  metalColor?: string;
  pillarTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  roofTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  trussTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  lathingTubeSize: '100x100' | '80x80' | '60x60' | '40x20';
  hasInsulation?: boolean;
  doubleRebar?: boolean;
  showMaterialInfo?: boolean;
}

const defaultGreenhouseParams: GreenhouseParams = {
  width: 3,
  length: 6,
  height: 2.5,
  wallHeight: 2,
  type: 'arched',
  frameMaterial: 'metal',
  coverMaterial: 'polycarbonate',
  foundationType: 'wood',
  groundType: 'grass',
  hasVentilation: true,
  hasDoors: true,
  color: '#4CAF50',
  frameColor: '#555555',
  coverColor: '#A5D6A7',
  archHeight: 1,
  archSegments: 16,
  roofAngle: 30,
  trussCount: 4,
  partitionCount: 0,
  shelving: false,
  postCount: 5, 
  rafterCount: 5
};

const getDefaultCanopyParams = (): CanopyParams => ({
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
  materialType: 'metal',
  frameColor: '#4682B4',
  roofMaterial: 'polycarbonate',
  roofColor: null,
  groundType: 'grass',
  showRidgeBeam: true,
  showFoundations: true,
  foundationType: 'pillars',
  foundationColor: '#aaaaaa',
  slabThickness: 200,
  rebarRows: 2,
  showPaving: false,
  pavingColor: 'gray',
  slabExtension: 0.3,
  rebarDiameter: 12,
  rebarSpacing: 200,
  showBackgroundHouse: false,
  showBackgroundGarage: false,
  showWindowDetails: true,
  showFence: true,
  showScrews: false,
  screwColor: '#888888',
  metalColor: '#4682B4',
  pillarTubeSize: '100x100',
  roofTubeSize: '80x80',
  trussTubeSize: '60x60',
  lathingTubeSize: '40x20',
  hasInsulation: false,
  doubleRebar: false,
  showMaterialInfo: true
});

const calculateCost = (params: CanopyParams): CostCalculation => {
  return {
    roofMaterial: { name: 'Материал кровли', cost: 0, details: '' },
    tube: { name: 'Металлоконструкции', cost: 0, details: '' },
    foundation: { name: 'Фундамент', cost: 0, work: 0, details: '' },
    screws: { name: 'Крепеж', cost: 0, work: 0, details: '' },
    roofWork: { name: 'Монтаж кровли', cost: 0, details: '' },
    frameWork: { name: 'Сборка каркаса', cost: 0, details: '' },
    painting: { name: 'Покраска', cost: 0, details: '' },
    totalCost: { name: 'Итого', cost: 0, details: '' },
    screwCount: null
  };
};

const calculateGreenhouseCost = (params: GreenhouseCalculationParams | null): CostCalculation => {
  if (!params || !params.coverMaterial || !params.foundationType || !params.frameMaterial) {
    return {
      coverMaterial: { name: 'Материал покрытия', cost: 0, details: 'Не указан' },
      tube: { name: 'Металлоконструкции', cost: 0, details: 'Не указаны' },
      foundation: { name: 'Фундамент', cost: 0, work: 0, details: 'Не указан' },
      screws: { name: 'Крепеж', cost: 0, work: 0, details: 'Не указан' },
      coverWork: { name: 'Монтаж покрытия', cost: 0, details: 'Не указан' },
      frameWork: { name: 'Сборка каркаса', cost: 0, details: 'Не указан' },
      painting: { name: 'Покраска', cost: 0, details: 'Не указана' },
      totalCost: { name: 'Итого', cost: 0, details: 'Не удалось рассчитать стоимость' },
      screwCount: null
    };
  }

  const prices: Prices = {
    polycarbonate: { material: 600, work: 400 },
    glass: { material: 1500, work: 700 },
    film: { material: 200, work: 100 },
    tube: {
      '40x20': 500,
      '60x60': 700,
      '80x80': 900,
      '100x100': 1200
    },
    foundation: {
      wood: { material: 1000, work: 500 },
      metal: { material: 2000, work: 1000 },
      concrete: { material: 3000, work: 1500 }
    },
    screws: { material: 10, work: 0.5 },
    frame: { work: 600 },
    painting: { material: 150, work: 100 },
    ventilation: { material: 2000, work: 1000 },
    doors: { material: 5000, work: 2000 }
  };

  const wallArea = params.wallHeight * params.length * 2 + params.wallHeight * params.width * 2;
  const roofArea = params.width * params.length * (params.type === 'arched' ? 1.3 : 1.2);
  const frameArea = wallArea + roofArea;

  const tubeLength =
    params.wallHeight * 4 * 2 +
    params.length * 2 * 2 +
    params.width * 2 * 2 +
    params.width * params.trussCount * 2;

  const tubeCost = tubeLength * prices.tube[params.frameMaterial === 'metal' ? '40x20' : '60x60'];

  const coverMaterialCost = roofArea * prices[params.coverMaterial].material;
  const foundationCost = prices.foundation[params.foundationType].material;
  const foundationWorkCost = prices.foundation[params.foundationType].work;

  const screwCount = Math.ceil(roofArea * 8);
  const screwsMaterialCost = screwCount * prices.screws.material;
  const screwsWorkCost = screwCount * prices.screws.work;

  const coverWorkCost = roofArea * prices[params.coverMaterial].work;
  const frameWorkCost = frameArea * prices.frame.work;
  const paintingCost = frameArea * (prices.painting.material + prices.painting.work);

  const ventilationCost = params.hasVentilation ? prices.ventilation.material + prices.ventilation.work : 0;
  const doorsCost = params.hasDoors ? prices.doors.material + prices.doors.work : 0;

  const materialsCost = coverMaterialCost + tubeCost + foundationCost + screwsMaterialCost;
  const workCost = coverWorkCost + frameWorkCost + foundationWorkCost + screwsWorkCost + paintingCost + ventilationCost + doorsCost;
  const totalCost = materialsCost + workCost;

  return {
    coverMaterial: {
      name: 'Материал покрытия',
      cost: coverMaterialCost,
      details: `${roofArea.toFixed(1)} м² × ${prices[params.coverMaterial].material} ₽/м²`
    },
    tube: {
      name: 'Металлоконструкции',
      cost: tubeCost,
      details: `Трубы: ${tubeLength.toFixed(1)} м`
    },
    foundation: {
      name: 'Фундамент',
      cost: foundationCost,
      work: foundationWorkCost,
      details: `Тип: ${params.foundationType === 'wood' ? 'Деревянный' : params.foundationType === 'metal' ? 'Металлический' : 'Бетонный'}`
    },
    screws: {
      name: 'Крепеж',
      cost: screwsMaterialCost,
      work: screwsWorkCost,
      details: `${screwCount} шт × ${prices.screws.material} ₽`
    },
    coverWork: {
      name: 'Монтаж покрытия',
      cost: coverWorkCost,
      details: `${roofArea.toFixed(1)} м² × ${prices[params.coverMaterial].work} ₽/м²`
    },
    frameWork: {
      name: 'Сборка каркаса',
      cost: frameWorkCost,
      details: `${frameArea.toFixed(1)} м² × ${prices.frame.work} ₽/м²`
    },
    painting: {
      name: 'Покраска',
      cost: paintingCost,
      details: `${frameArea.toFixed(1)} м² × ${(prices.painting.material + prices.painting.work).toFixed(0)} ₽/м²`
    },
    ventilation: params.hasVentilation
      ? {
          name: 'Вентиляция',
          cost: prices.ventilation.material,
          work: prices.ventilation.work,
          details: '1 комплект'
        }
      : null,
    doors: params.hasDoors
      ? {
          name: 'Двери',
          cost: prices.doors.material,
          work: prices.doors.work,
          details: '1 комплект'
        }
      : null,
    totalCost: {
      name: 'Итого',
      cost: totalCost,
      details: 'Общая стоимость проекта'
    },
    screwCount: {
      name: 'Количество шурупов',
      cost: screwCount,
      details: 'Общее количество крепежных элементов'
    }
  };
};

const OrderDetails = ({ order }: { order: Order }) => {
  if (!order.projectParams) {
    return <div className="order-print-container">Параметры проекта не найдены</div>;
  }

  const isGreenhouse = order.projectType === 'greenhouse';
  const greenhouseParams = isGreenhouse ? order.projectParams as GreenhouseParams : null;
  const canopyParams = !isGreenhouse ? order.projectParams as CanopyParams : null;

  const calculationParams = isGreenhouse && greenhouseParams
    ? {
        wallHeight: greenhouseParams.wallHeight || 2,
        length: greenhouseParams.length || 6,
        width: greenhouseParams.width || 3,
        type: greenhouseParams.type || 'arched',
        frameMaterial: greenhouseParams.frameMaterial || 'metal',
        coverMaterial: greenhouseParams.coverMaterial || 'polycarbonate',
        foundationType:
          greenhouseParams.foundationType === 'none'
            ? 'wood'
            : greenhouseParams.foundationType === 'piles'
              ? 'concrete'
              : greenhouseParams.foundationType || 'wood',
        trussCount: greenhouseParams.trussCount || 4,
        hasVentilation: greenhouseParams.hasVentilation ?? true,
        hasDoors: greenhouseParams.hasDoors ?? true
      }
    : null;

  const costs = isGreenhouse
    ? calculateGreenhouseCost(calculationParams)
    : calculateCost(canopyParams || getDefaultCanopyParams());

  const materialsTotal = isGreenhouse
    ? ((costs.coverMaterial?.cost || 0) +
       (costs.tube?.cost || 0) +
       (costs.foundation?.cost || 0) +
       (costs.screws?.cost || 0) +
       (costs.ventilation?.cost || 0) +
       (costs.doors?.cost || 0))
    : ((costs.roofMaterial?.cost || 0) +
       (costs.tube?.cost || 0) +
       (costs.foundation?.cost || 0) +
       (costs.screws?.cost || 0));

  const workTotal = isGreenhouse
    ? ((costs.foundation?.work || 0) +
       (costs.screws?.work || 0) +
       (costs.coverWork?.cost || 0) +
       (costs.frameWork?.cost || 0) +
       (costs.painting?.cost || 0) +
       (costs.ventilation?.work || 0) +
       (costs.doors?.work || 0))
    : ((costs.foundation?.work || 0) +
       (costs.screws?.work || 0) +
       (costs.roofWork?.cost || 0) +
       (costs.frameWork?.cost || 0) +
       (costs.painting?.cost || 0));

  return (
    <div className="order-print-container">
      <h2>Оформление заказа</h2>
      <p>Тип проекта: {order.projectType === 'greenhouse' ? 'Теплица' : 'Навес'}</p>
      <h3>Основные параметры</h3>
      <p>
        Размеры: {order.projectParams?.width?.toFixed(1) || '—'}м ×{' '}
        {order.projectParams?.length?.toFixed(1) || '—'}м ×{' '}
        {order.projectParams?.height?.toFixed(1) || '—'}м
      </p>
      {isGreenhouse && greenhouseParams && (
        <>
          <p>Тип: {greenhouseParams.type === 'arched' ? 'Арочная' : 'Двухскатная'}</p>
          <p>
            Материал покрытия:{' '}
            {greenhouseParams.coverMaterial === 'polycarbonate'
              ? 'Поликарбонат'
              : greenhouseParams.coverMaterial === 'glass'
                ? 'Стекло'
                : 'Пленка'}
          </p>
        </>
      )}
      {!isGreenhouse && canopyParams && (
        <p>
          Материал кровли:{' '}
          {canopyParams.roofMaterial === 'polycarbonate' ? 'Поликарбонат' : 'Металл'}
        </p>
      )}
      <h3>Расчет стоимости</h3>
      <table className="cost-table">
        <thead>
          <tr>
            <th>Позиция</th>
            <th>Материалы</th>
            <th>Работы</th>
            <th>Детали</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(costs).map(([key, item]) => {
            if (!item || typeof item !== 'object' || !('name' in item)) return null;
            const costItem = item as CostItem;
            return (
              <tr key={key}>
                <td>{costItem.name}</td>
                <td>{Math.round(costItem.cost).toLocaleString('ru-RU')} ₽</td>
                <td>{costItem.work ? Math.round(costItem.work).toLocaleString('ru-RU') + ' ₽' : '-'}</td>
                <td>{costItem.details}</td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td colSpan={2}>
              Итого материалы: {Math.round(materialsTotal).toLocaleString('ru-RU')} ₽
            </td>
            <td colSpan={2}>
              Итого работы: {Math.round(workTotal).toLocaleString('ru-RU')} ₽
            </td>
          </tr>
          <tr className="total-row">
            <td colSpan={4}>
              Общая стоимость: {Math.round(costs.totalCost.cost).toLocaleString('ru-RU')} ₽
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const UserDashboard = () => {
  const { 
    currentUser, 
    logout, 
    saveProject, 
    getUserOrders, 
    archiveOrder, 
    restoreOrder,
    deleteOrder 
  } = useAuth();
  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'orders'>('projects');
  const [ordersTab, setOrdersTab] = useState<'active' | 'archived'>('active');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

const handleDeleteProject = async (projectId: string) => {
  if (!currentUser) return;
  if (!window.confirm('Вы уверены, что хотите удалить проект?')) return;
  
  try {
    const updatedProjects = currentUser.projects?.filter(p => p.id !== projectId) || [];
    
    // Обновляем в списке всех пользователей
    const users = JSON.parse(localStorage.getItem('giga-nt-users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex].projects = updatedProjects;
      localStorage.setItem('giga-nt-users', JSON.stringify(users));
      
      // Обновляем текущего пользователя
      const updatedUser = { ...currentUser, projects: updatedProjects };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // ПЕРЕЗАГРУЗКА СТРАНИЦЫ - просто и надежно
      window.location.reload();
    }
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
  }
};

  const handleArchiveOrder = async (orderId: string) => {
    try {
      await archiveOrder(orderId);
    } catch (error) {
      console.error('Ошибка при архивации заказа:', error);
    }
  };

  const handleRestoreOrder = async (orderId: string) => {
    try {
      await restoreOrder(orderId);
    } catch (error) {
      console.error('Ошибка при восстановлении заказа:', error);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
    }
  };

  const handleOrderProject = async (projectId: string) => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/order' } });
      return;
    }
    setOrderingId(projectId);
    try {
      const project = currentUser.projects?.find(p => p.id === projectId);
      if (project) {
        navigate('/order', {
          state: {
            projectId: project.id,
            projectName: project.name,
            projectType: project.type || 'canopy',
            projectParams: project.params || getDefaultCanopyParams()
          }
        });
      }
    } catch (error) {
      console.error('Error during order:', error);
    } finally {
      setOrderingId(null);
    }
  };

const handleOpenProject = (project: Project) => {
  if (!project.params) {
    project.params = project.type === 'greenhouse' 
      ? defaultGreenhouseParams 
      : project.type === 'gazebo'
        ? {} // Здесь нужно добавить параметры по умолчанию для беседки
        : getDefaultCanopyParams();
  }
  
  if (project.type === 'greenhouse') {
    navigate(`/greenhouse?project=${project.id}`, {
      state: { projectParams: project.params }
    });
  } else if (project.type === 'gazebo') {
    navigate(`/gazebo?project=${project.id}`, {
      state: { projectParams: project.params }
    });
  } else {
    project.type = 'canopy';
    navigate(`/frame?project=${project.id}`, {
      state: { projectParams: project.params }
    });
  }
};



  const projects: Project[] = currentUser?.projects || [];
  const orders = getUserOrders();
  const canopyProjects = projects.filter(p => !p.type || p.type === 'canopy');
  const greenhouseProjects = projects.filter(p => p.type === 'greenhouse');
  const gazeboProjects = projects.filter(p => p.type === 'gazebo');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Личный кабинет</h1>
          <p className="subtitle">Управляйте своими проектами и заказами</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Выйти
        </button>
		<button onClick={() => navigate('/admin/prices')} className="admin-btn">
		  Управление ценами
		</button>
      </header>

      <div className="user-card">
        <div className="user-avatar">
          {currentUser?.name?.charAt(0).toUpperCase() || currentUser?.email.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <h2>{currentUser?.name || 'Пользователь'}</h2>
          <p className="email">{currentUser?.email}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Мои проекты
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Мои заказы ({orders.length})
        </button>
      </div>

      <div className="dashboard-actions">
        {activeTab === 'projects' ? (
          <>
            <div className="action-cards">
              <div className="action-card" onClick={() => navigate('/frame')}>
                <div className="icon">🏗️</div>
                <h3>Конструктор навесов</h3>
                <p>Создайте новый навес или продолжите редактирование</p>
              </div>
              <div className="action-card" onClick={() => navigate('/greenhouse')}>
                <div className="icon">🌱</div>
                <h3>Конструктор теплиц</h3>
                <p>Создайте новую теплицу или продолжите редактирование</p>
              </div>
			  <div className="action-card" onClick={() => navigate('/gazebo')}>
				<div className="icon">🏡</div>
				<h3>Конструктор беседок</h3>
				<p>Создайте новую беседку или продолжите редактирование</p>
			  </div>
            </div>

            {projects.length > 0 && (
              <div className="projects-section">
                {canopyProjects.length > 0 && (
                  <div className="projects-list">
                    <h3>Мои навесы ({canopyProjects.length})</h3>
                    {canopyProjects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="project-info" onClick={() => handleOpenProject(project)}>
                          <h4>{project.name}</h4>
                          <p>Тип: Навес</p>
                          <p>Создан: {new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="project-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderProject(project.id);
                            }}
                            disabled={orderingId === project.id}
                            className="order-btn"
                          >
                            {orderingId === project.id ? 'Оформление...' : 'Заказать'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            disabled={deletingId === project.id}
                            className="delete-btn"
                          >
                            {deletingId === project.id ? 'Удаление...' : 'Удалить'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {greenhouseProjects.length > 0 && (
                  <div className="projects-list">
                    <h3>Мои теплицы ({greenhouseProjects.length})</h3>
                    {greenhouseProjects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="project-info" onClick={() => handleOpenProject(project)}>
                          <h4>{project.name}</h4>
                          <p>Тип: Теплица</p>
                          <p>Создан: {new Date(project.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="project-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderProject(project.id);
                            }}
                            disabled={orderingId === project.id}
                            className="order-btn"
                          >
                            {orderingId === project.id ? 'Оформление...' : 'Заказать'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            disabled={deletingId === project.id}
                            className="delete-btn"
                          >
                            {deletingId === project.id ? 'Удаление...' : 'Удалить'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

				{gazeboProjects.length > 0 && (
				  <div className="projects-list">
					<h3>Мои беседки ({gazeboProjects.length})</h3>
					{gazeboProjects.map((project) => (
					  <div key={project.id} className="project-card">
						<div className="project-info" onClick={() => handleOpenProject(project)}>
						  <h4>{project.name}</h4>
						  <p>Тип: Беседка</p>
						  <p>Создан: {new Date(project.createdAt).toLocaleDateString()}</p>
						</div>
						<div className="project-actions">
						  <button
							onClick={(e) => {
							  e.stopPropagation();
							  handleOrderProject(project.id);
							}}
							disabled={orderingId === project.id}
							className="order-btn"
						  >
							{orderingId === project.id ? 'Оформление...' : 'Заказать'}
						  </button>
						  <button
							onClick={(e) => {
							  e.stopPropagation();
							  handleDeleteProject(project.id);
							}}
							disabled={deletingId === project.id}
							className="delete-btn"
						  >
							{deletingId === project.id ? 'Удаление...' : 'Удалить'}
						  </button>
						</div>
					  </div>
					))}
				  </div>
				)}
          </>
        ) : (
          <div className="orders-section">
            <div className="orders-tabs">
              <button
                className={`orders-tab-btn ${ordersTab === 'active' ? 'active' : ''}`}
                onClick={() => setOrdersTab('active')}
              >
                Активные заказы
              </button>
              <button
                className={`orders-tab-btn ${ordersTab === 'archived' ? 'active' : ''}`}
                onClick={() => setOrdersTab('archived')}
              >
                Архив ({orders.filter(o => o.isArchived).length})
              </button>
            </div>

            {ordersTab === 'active' ? (
              orders.filter(o => !o.isArchived).length > 0 ? (
                <div className="orders-list">
                  {orders.filter(o => !o.isArchived).map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-info">
                        <h4>Заказ #{order.id.slice(-6)}</h4>
                        <p>Проект: {order.projectName}</p>
                        <p>Тип: {order.projectType === 'greenhouse' ? 'Теплица' : 'Навес'}</p>
                        <p>Дата: {new Date(order.orderDate).toLocaleDateString()}</p>
                        <p>Сумма: {order.totalAmount.toLocaleString()} ₽</p>
                        <p>
                          Статус:
                          <span className={`status-${order.status}`}>
                            {order.status === 'new' && 'Новый'}
                            {order.status === 'processing' && 'В обработке'}
                            {order.status === 'completed' && 'Завершен'}
                            {order.status === 'cancelled' && 'Отменен'}
                          </span>
                        </p>
                        <p>Параметры проекта: {order.projectParams ? 'Доступны' : 'Не указаны'}</p>
                      </div>
                      <div className="order-actions">
                        <button
                          onClick={() => navigate('/order-details', { state: { orderId: order.id } })}
                          className="details-btn"
                        >
                          Подробнее
                        </button>
                        <button
                          onClick={() => handleArchiveOrder(order.id)}
                          className="archive-btn"
                        >
                          В архив
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>Нет активных заказов</p>
                </div>
              )
            ) : (
              orders.filter(o => o.isArchived).length > 0 ? (
                <div className="orders-list">
                  {orders.filter(o => o.isArchived).map((order) => (
                    <div key={order.id} className="order-card archived">
                      <div className="order-info">
                        <h4>Заказ #{order.id.slice(-6)}</h4>
                        <p>Проект: {order.projectName}</p>
                        <p>Тип: {order.projectType === 'greenhouse' ? 'Теплица' : 'Навес'}</p>
                        <p>Дата: {new Date(order.orderDate).toLocaleDateString()}</p>
                        <p>Сумма: {order.totalAmount.toLocaleString()} ₽</p>
                        <p>
                          Статус:
                          <span className="status-archived">В архиве</span>
                        </p>
                        <p>Параметры проекта: {order.projectParams ? 'Доступны' : 'Не указаны'}</p>
                      </div>
                      <div className="order-actions">
                        <button
                          onClick={() => navigate('/order-details', { state: { orderId: order.id } })}
                          className="details-btn"
                        >
                          Подробнее
                        </button>
                        <button
                          onClick={() => handleRestoreOrder(order.id)}
                          className="restore-btn"
                        >
                          Восстановить
                        </button>
						<button
						  onClick={() => setOrderToDelete(order as Order)}
						  className="delete-permanently-btn"
						>
						  Удалить
						</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>Архив пуст</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
      {orderToDelete && (
  <DeleteConfirmationModal 
    order={orderToDelete}
    onCancel={() => setOrderToDelete(null)}
    onConfirm={handleDeleteOrder}
  />
)}
    </div>
  );
};