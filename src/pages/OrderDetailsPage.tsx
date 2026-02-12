// OrderDetailsPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './OrderDetailsPage.css';
import { 
  Order, 
  CostCalculation,
  CanopyParams,
  GreenhouseParams
} from '../types/types';

// Тип для состояния location
interface OrderDetailsLocationState {
  orderId: string;
}

export const OrderDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = (location.state as OrderDetailsLocationState) || {};
  const { getUserOrders, archiveOrder, restoreOrder } = useAuth();
  
  const orders = getUserOrders();
  const order = orders.find(o => o.id === orderId) as Order | undefined;

  if (!order) {
    return (
      <div className="order-details-error">
        <h2>Заказ не найден</h2>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Вернуться в личный кабинет
        </button>
      </div>
    );
  }

  const projectParams = order?.projectParams || {};
  const costCalculation = order?.costCalculation || {
    materials: { roof: 0, frame: 0, foundation: 0, fasteners: 0 },
    works: { foundation: 0, roofInstallation: 0, frameAssembly: 0, painting: 0 },
    totalMaterials: 0,
    totalWorks: 0,
    totalAmount: 0
  };

  const roofArea = ('length' in projectParams ? projectParams.length : 0) * 
                   ('width' in projectParams ? projectParams.width : 0) * 
                   (('roofType' in projectParams && projectParams.roofType === 'gable') ? 1.2 : 1);

  const getMaterialPrice = () => {
    if (order.projectType === 'canopy') {
      return ('roofMaterial' in projectParams && projectParams.roofMaterial === 'polycarbonate') ? 600 : 800;
    } else {
      return ('coverMaterial' in projectParams && projectParams.coverMaterial === 'polycarbonate') ? 600 : 1500;
    }
  };

  return (
    <div className="order-details-container">
      <h2>Детали заказа #{order.id.slice(-6)}</h2>
      
      <div className="order-grid">
        <div className="order-section">
          <h3>Основные параметры проекта</h3>
          <div className="parameters-grid">
            <div>
              <p><strong>Размеры:</strong> 
                {('length' in projectParams ? projectParams.length : '—')}м × 
                {('width' in projectParams ? projectParams.width : '—')}м × 
                {('height' in projectParams ? projectParams.height : '—')}м
              </p>
              {('roofType' in projectParams) && (
                <p><strong>Тип кровли:</strong> {projectParams.roofType === 'gable' ? 'Двухскатная' : 'Односкатная'}</p>
              )}
              {('roofMaterial' in projectParams) && (
                <p><strong>Материал кровли:</strong> {projectParams.roofMaterial === 'polycarbonate' ? 'Поликарбонат' : 'Металл'}</p>
              )}
              {('coverMaterial' in projectParams) && (
                <p><strong>Материал покрытия:</strong> {projectParams.coverMaterial === 'polycarbonate' ? 'Поликарбонат' : 'Стекло'}</p>
              )}
            </div>
            <div>
              {('pillarCount' in projectParams) && (
                <p><strong>Количество стоек:</strong> {projectParams.pillarCount || '—'}</p>
              )}
              {('trussCount' in projectParams) && (
                <p><strong>Количество ферм:</strong> {projectParams.trussCount || '—'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="order-section">
          <h3>Информация о проекте</h3>
          <div className="order-info">
            <p><strong>Название проекта:</strong> {order.projectName}</p>
            <p>Тип проекта: {
  order.projectType === 'greenhouse' ? 'Теплица' : 
  order.projectType === 'gazebo' ? 'Беседка' : 
  'Навес'
}</p>
            <p><strong>Дата заказа:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
			<p><strong>Статус:</strong> 
			  <span className={`status-${order.status}`}>
				{order.status === 'new' && 'Новый'}
				{order.status === 'processing' && 'В обработке'}
				{order.status === 'completed' && 'Завершен'}
				{order.status === 'cancelled' && 'Отменен'}
				{order.status === 'archived' && 'В архиве'}
			  </span>
			</p>
            <p><strong>Итоговая стоимость:</strong> {order.totalAmount.toLocaleString()} ₽</p>
          </div>
        </div>
      </div>

      <div className="order-section cost-section">
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
            <tr>
              <td>Материал кровли</td>
              <td>{costCalculation.materials.roof.toLocaleString()} ₽</td>
              <td>-</td>
              <td>
                {roofArea.toFixed(1)} м² × {getMaterialPrice()} ₽/м²
              </td>
            </tr>
            <tr>
              <td>Металлоконструкции</td>
              <td>{costCalculation.materials.frame.toLocaleString()} ₽</td>
              <td>-</td>
              <td>
                Трубы: {('length' in projectParams ? projectParams.length : 0) * 2}м + 
                {('width' in projectParams ? projectParams.width : 0) * 2}м
              </td>
            </tr>
            <tr>
              <td>Фундамент</td>
              <td>{costCalculation.materials.foundation.toLocaleString()} ₽</td>
              <td>{costCalculation.works.foundation.toLocaleString()} ₽</td>
              <td>{('pillarCount' in projectParams ? projectParams.pillarCount : 0)} столбов</td>
            </tr>
            <tr>
              <td>Крепеж</td>
              <td>{costCalculation.materials.fasteners.toLocaleString()} ₽</td>
              <td>-</td>
              <td>{('trussCount' in projectParams ? projectParams.trussCount : 0) * 10} шт × 50 ₽/шт</td>
            </tr>
            <tr>
              <td>Монтаж кровли</td>
              <td>-</td>
              <td>{costCalculation.works.roofInstallation.toLocaleString()} ₽</td>
              <td>{roofArea.toFixed(1)} м² × 400 ₽/м²</td>
            </tr>
            <tr>
              <td>Сборка каркаса</td>
              <td>-</td>
              <td>{costCalculation.works.frameAssembly.toLocaleString()} ₽</td>
              <td>{('pillarCount' in projectParams ? projectParams.pillarCount : 0)} стоек × 800 ₽/шт</td>
            </tr>
            <tr>
              <td>Покраска</td>
              <td>-</td>
              <td>{costCalculation.works.painting.toLocaleString()} ₽</td>
              <td>
                Площадь поверхности: {(
                  ('length' in projectParams ? projectParams.length : 0) * 
                  ('height' in projectParams ? projectParams.height : 0) * 2 + 
                  ('width' in projectParams ? projectParams.width : 0) * 
                  ('height' in projectParams ? projectParams.height : 0) * 2
                ).toFixed(1)} м²
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Итого:</strong></td>
              <td><strong>{costCalculation.totalMaterials.toLocaleString()} ₽</strong></td>
              <td><strong>{costCalculation.totalWorks.toLocaleString()} ₽</strong></td>
              <td><strong>{costCalculation.totalAmount.toLocaleString()} ₽</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="order-section">
        <h3>Контактные данные</h3>
        <div className="customer-info">
          <p><strong>ФИО:</strong> {order.customerData.name}</p>
          <p><strong>Телефон:</strong> {order.customerData.phone}</p>
          <p><strong>Email:</strong> {order.customerData.email}</p>
          <p><strong>Адрес доставки:</strong> {order.customerData.address}</p>
          {order.customerData.comments && (
            <p><strong>Комментарии:</strong> {order.customerData.comments}</p>
          )}
        </div>
      </div>

      <div className="order-actions">
        {!order.isArchived ? (
          <button 
            onClick={() => {
              archiveOrder(order.id);
              navigate('/dashboard');
            }}
            className="archive-btn"
          >
            В архив
          </button>
        ) : (
          <button 
            onClick={() => {
              restoreOrder(order.id);
              navigate('/dashboard');
            }}
            className="restore-btn"
          >
            Восстановить
          </button>
        )}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="back-btn"
        >
          Вернуться к списку заказов
        </button>
      </div>
    </div>
  );
};