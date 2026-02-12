import React from 'react';
import { ControlProps } from '../../types/types';

const AppearanceControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
      <h3>Внешний вид</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Материал кровли: </label>
        <select 
          value={params.roofMaterial} 
          onChange={(e) => onChange('roofMaterial', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="metal">Металл</option>
          <option value="polycarbonate">Поликарбонат</option>
          <option value="tile">Черепица</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Цвет каркаса: </label>
        <input
          type="color"
          value={params.frameColor}
          onChange={(e) => onChange('frameColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Цвет фундамента: </label>
        <input
          type="color"
          value={params.foundationColor}
          onChange={(e) => onChange('foundationColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Цвет кровли: </label>
        <input
          type="color"
          value={params.roofColor || '#4682B4'}
          onChange={(e) => onChange('roofColor', e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>
    </div>
  );
};

export default AppearanceControls;