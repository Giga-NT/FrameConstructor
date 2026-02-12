import React from 'react';
import { ControlProps } from '../../types/types';

const ConstructionControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
      <h3>Конструкция</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Количество стоек: {params.pillarCount} </label>
        <input 
          type="range" 
          min="2" 
          max="30" 
          step="1" 
          value={params.pillarCount} 
          onChange={(e) => onChange('pillarCount', parseInt(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Количество ферм: {params.trussCount} </label>
        <input 
          type="range" 
          min="2" 
          max="30" 
          step="1" 
          value={params.trussCount} 
          onChange={(e) => onChange('trussCount', parseInt(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Тип кровли: </label>
        <select 
          value={params.roofType} 
          onChange={(e) => onChange('roofType', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="gable">Двухскатная</option>
          <option value="arch">Арочная</option>
          <option value="shed">Односкатная</option>
          <option value="flat">Плоская</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Тип конструкции: </label>
        <select 
          value={params.constructionType} 
          onChange={(e) => onChange('constructionType', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="truss">Фермы</option>
          <option value="beam">Балка</option>
        </select>
      </div>

      {params.constructionType === 'beam' && (
        <div style={{ marginBottom: '15px' }}>
          <label>Размер балки: </label>
          <select 
            value={params.beamSize} 
            onChange={(e) => onChange('beamSize', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="small">Маленькая (100x100)</option>
            <option value="medium">Средняя (150x150)</option>
            <option value="large">Большая (200x200)</option>
          </select>
        </div>
      )}

      {params.constructionType === 'truss' && (
        <div style={{ marginBottom: '15px' }}>
          <label>Тип фермы: </label>
          <select 
            value={params.trussType} 
            onChange={(e) => onChange('trussType', e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="simple">Простая</option>
            <option value="reinforced">Усиленная</option>
            <option value="lattice">Решетчатая</option>
          </select>
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label>Обрешетка (шаг, м): {params.lathingStep === 0 ? 'Выкл' : params.lathingStep.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={params.lathingStep}
          onChange={(e) => onChange('lathingStep', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default ConstructionControls;