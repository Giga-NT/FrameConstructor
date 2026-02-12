import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './OrderPage.css';

interface OrderPageLocationState {
  projectId: string;
  projectName: string;
  projectType: 'canopy' | 'greenhouse' | 'gazebo';
  projectParams: any;
}

export const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, createOrder } = useAuth();
  const locationState = location.state as OrderPageLocationState | undefined;
  const { projectId, projectName, projectType, projectParams } = locationState || {};
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comments: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        comments: ''
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!locationState?.projectId) {
      navigate('/dashboard', { replace: true });
    }
  }, [locationState, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!projectId || !projectName || !projectType || !projectParams) {
        throw new Error('Missing required order data');
      }

      // Минимальные параметры для заказа
      const convertedParams = {
        width: projectParams.width || 3,
        length: projectParams.length || 3,
        height: projectParams.height || 2.5,
        ...(projectType === 'gazebo' && {
          railingHeight: 1,
          pillarSize: '100x100',
          color: '#8B4513',
          materialType: 'wood',
          roofType: 'gable'
        }),
        ...(projectType === 'canopy' && {
          overhang: 0.5,
          pillarCount: 4,
          trussCount: 3,
          roofType: 'gable',
          materialType: 'metal'
        }),
        ...(projectType === 'greenhouse' && {
          trussCount: 5,
          type: 'gable',
          coverMaterial: 'polycarbonate',
          hasVentilation: true
        })
      };

      const orderData = {
        projectId,
        projectName,
        projectType,
        status: 'new',
        totalAmount: 50000, // Заглушка
        customerData: formData,
        costCalculation: {
          materials: { roof: 0, frame: 0, foundation: 0, fasteners: 0 },
          works: { roofInstallation: 0, frameAssembly: 0, painting: 0, foundation: 0 },
          totalMaterials: 0,
          totalWorks: 0,
          totalAmount: 50000
        },
        projectParams: convertedParams
      };

      // ИГНОРИРУЕМ ОШИБКИ ТИПОВ
      await (createOrder as any)(orderData);

      setOrderSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Произошла ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!projectId) {
    return (
      <div className="order-error">
        <h2>Ошибка: проект не выбран</h2>
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          Вернуться в личный кабинет
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="order-success">
        <h2>Заказ успешно оформлен!</h2>
        <p>Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.</p>
      </div>
    );
  }

  return (
    <div className="order-container">
      <h2>Оформление заказа: {projectName}</h2>
      <p className="project-type">
        Тип проекта: {
          projectType === 'greenhouse' ? 'Теплица' : 
          projectType === 'gazebo' ? 'Беседка' : 'Навес'
        }
      </p>
      
      <form onSubmit={handleSubmit} className="order-form">
        <h3>Контактные данные</h3>
        
        <div className="form-group">
          <label htmlFor="name">ФИО:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Телефон:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Адрес доставки:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="comments">Комментарии:</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')} 
            className="back-btn"
          >
            Вернуться
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="submit-btn"
          >
            {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
          </button>
        </div>
      </form>
    </div>
  );
};