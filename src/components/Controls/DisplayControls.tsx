import React from 'react';
import { ControlProps } from '../../types/types';

const DisplayControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Отображение</h3>
      
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="showFoundations"
          checked={params.showFoundations}
          onChange={(e) => onChange('showFoundations', e.target.checked)}
          style={{ marginRight: '10px' }}
        />
        <label htmlFor="showFoundations">Показывать фундамент</label>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Материал кровли: </label>
        <select 
          value={params.roofMaterial} 
          onChange={(e) => onChange('roofMaterial', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="polycarbonate">Поликарбонат</option>
          <option value="metal">Профлист</option>
          <option value="tile">Металлочерепица</option>
        </select>
      </div>

      {params.roofMaterial !== 'tile' && (
        <div style={{ marginBottom: '15px' }}>
          <label>Цвет кровли: </label>
          <input
            type="color"
            value={params.roofColor || '#333333'}
            onChange={(e) => onChange('roofColor', e.target.value)}
            style={{ width: '100%', height: '40px' }}
          />
          <button 
            onClick={() => onChange('roofColor', null)}
            style={{ marginTop: '5px', width: '100%' }}
          >
            Использовать текстуру
          </button>
        </div>
      )}
    </div>
  );
};

export default DisplayControls;