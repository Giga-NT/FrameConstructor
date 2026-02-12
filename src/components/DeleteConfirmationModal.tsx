import React from 'react';
import { Order } from '../types/types';
import './DeleteConfirmationModal.css'; // Стили вынесены в отдельный файл

interface DeleteConfirmationModalProps {
  order: Order;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  order, 
  onCancel, 
  onConfirm 
}) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Подтверждение удаления</h3>
      <p>Вы уверены, что хотите полностью удалить заказ #{order?.id.slice(-6)}?</p>
      <p>Это действие нельзя отменить.</p>
      <div className="modal-actions">
        <button 
          onClick={onCancel} 
          className="cancel-btn"
        >
          Отмена
        </button>
        <button 
          onClick={onConfirm} 
          className="delete-confirm-btn"
        >
          Удалить навсегда
        </button>
      </div>
    </div>
  </div>
);