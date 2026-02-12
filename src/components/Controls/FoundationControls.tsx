import React from 'react';
import { ControlProps } from '../../types/types';

const FoundationControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div className="control-section">
      <h3>Фундамент</h3>
      
      <div className="control-group">
        <label>Тип фундамента:</label>
        <select
          value={params.foundationType}
          onChange={(e) => onChange('foundationType', e.target.value)}
        >
          <option value="pillars">Отдельные тумбы</option>
          <option value="slab">Плита</option>
          <option value="surface">Поверхностный</option>
        </select>
      </div>

      {params.foundationType === 'slab' && (
        <>
          <div className="control-group">
            <label>Толщина плиты: {params.slabThickness} мм</label>
            <input
              type="range"
              min="100"
              max="300"
              step="10"
              value={params.slabThickness}
              onChange={(e) => onChange('slabThickness', Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Выступ плиты: {params.slabExtension} м</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={params.slabExtension}
              onChange={(e) => onChange('slabExtension', Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Рядов арматуры:</label>
            <input
              type="number"
              min="1"
              max="5"
              value={params.rebarRows}
              onChange={(e) => onChange('rebarRows', Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>Диаметр арматуры: {params.rebarDiameter} мм</label>
            <select
              value={params.rebarDiameter}
              onChange={(e) => onChange('rebarDiameter', Number(e.target.value))}
            >
              <option value="6">6 мм</option>
              <option value="8">8 мм</option>
              <option value="10">10 мм</option>
              <option value="12">12 мм</option>
              <option value="14">14 мм</option>
              <option value="16">16 мм</option>
              <option value="18">18 мм</option>
              <option value="20">20 мм</option>
            </select>
          </div>
		  <div className="control-group">
		    <label>
		    	<input
			    type="checkbox"
			    checked={params.showWindowDetails}
		    	  onChange={(e) => onChange('showWindowDetails', e.target.checked)}
			  />
			  Детали окон (шторы)
		    </label>
		  </div>

          <div className="control-group">
            <label>Шаг арматуры: {params.rebarSpacing} мм</label>
            <input
              type="range"
              min="100"
              max="500"
              step="50"
              value={params.rebarSpacing}
              onChange={(e) => onChange('rebarSpacing', Number(e.target.value))}
            />
          </div>
        </>
      )}

      {params.foundationType === 'surface' && (
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={params.showPaving}
              onChange={(e) => onChange('showPaving', e.target.checked)}
            />
            Брусчатка
          </label>

          {params.showPaving && (
            <div className="control-group">
              <label>Цвет брусчатки:</label>
              <select
                value={params.pavingColor}
                onChange={(e) => onChange('pavingColor', e.target.value)}
              >
                <option value="red">Красная</option>
                <option value="gray">Серая</option>
                <option value="yellow">Желтая</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoundationControls;