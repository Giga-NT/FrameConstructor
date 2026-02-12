import React from 'react';
import { ControlProps } from '../../types/types';

const MainControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
      <h3>Основные параметры</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Длина навеса (м): {params.length.toFixed(1)} </label>
        <input 
          type="range" 
          min="3" 
          max="15" 
          step="0.1" 
          value={params.length} 
          onChange={(e) => onChange('length', parseFloat(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Ширина пролета (м): {params.width.toFixed(1)} </label>
        <input 
          type="range" 
          min="2" 
          max="15" 
          step="0.1" 
          value={params.width} 
          onChange={(e) => onChange('width', parseFloat(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Высота стоек (м): {params.height.toFixed(1)} </label>
        <input 
          type="range" 
          min="2" 
          max="12" 
          step="0.1" 
          value={params.height} 
          onChange={(e) => onChange('height', parseFloat(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Высота кровли (м): {params.roofHeight.toFixed(1)} </label>
        <input 
          type="range" 
          min="0.5" 
          max="3" 
          step="0.1" 
          value={params.roofHeight} 
          onChange={(e) => onChange('roofHeight', parseFloat(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Свес кровли (м): {params.overhang.toFixed(2)} </label>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.05" 
          value={params.overhang} 
          onChange={(e) => onChange('overhang', parseFloat(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default MainControls;